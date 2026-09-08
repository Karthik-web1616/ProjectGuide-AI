"""
CrewAI Feasibility Agent
Uses Groq LLM (Llama 3.3 70B) to analyze student project ideas
and produce structured feasibility reports.
"""

import json
import os
import re
import traceback

from crewai import Agent, Crew, Task
from dotenv import load_dotenv

from agents.file_extractor import extract_text_from_files

load_dotenv()


# Patch CrewAI's prompt-caching marker for Groq compatibility
# (Groq rejects unexpected 'cache_breakpoint' in message payloads)
try:
    import crewai.llms.cache

    crewai.llms.cache.mark_cache_breakpoint = lambda message: message
except Exception:
    pass


def _get_llm():
    """Create the Groq-backed LLM for CrewAI using native LLM class."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")

    from crewai import LLM

    model_name = os.getenv("GROQ_MODEL", "groq/qwen/qwen3.8-27b")
    return LLM(
        model=model_name,
        api_key=api_key,
        temperature=0.3,
    )


def _parse_json_from_text(text: str) -> dict:
    """
    Extract and parse JSON from LLM output text.
    Handles cases where the LLM wraps JSON in markdown code blocks.
    """
    # Try direct JSON parse first
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    # Try extracting from markdown code blocks
    patterns = [
        r"```json\s*\n?(.*?)\n?\s*```",
        r"```\s*\n?(.*?)\n?\s*```",
        r"\{[\s\S]*\}",
    ]
    for pattern in patterns:
        match = re.search(pattern, str(text), re.DOTALL)
        if match:
            try:
                candidate = match.group(1) if match.lastindex else match.group(0)
                return json.loads(candidate)
            except (json.JSONDecodeError, TypeError, IndexError):
                continue

    return {}


def _build_fallback_report(idea_data: dict) -> dict:
    """
    Generate a basic heuristic feasibility report as fallback
    when the AI agent call fails.
    """
    domain = (idea_data.get("domain") or "web").lower()
    days = int(idea_data.get("durationDays") or 30)
    weeks = max(4, round(days / 7))
    team_size = int(idea_data.get("teamSize") or 3)

    technical = 85 if domain in ("aiml", "blockchain", "iot") else 90
    timeline = 90 if weeks >= 6 else 80 if weeks >= 4 else 72
    resource = 82 if domain == "iot" else 88
    skill_match = 82

    overall = round(
        (technical * 0.35) + (timeline * 0.25) + (resource * 0.20) + (skill_match * 0.20)
    )

    verdict = (
        "Highly Feasible"
        if overall >= 88
        else "Feasible with Guidance"
        if overall >= 78
        else "Needs Scope Reduction"
    )

    return {
        "overallScore": overall,
        "verdict": verdict,
        "metrics": {
            "technical": technical,
            "timeline": timeline,
            "resource": resource,
            "skillMatch": skill_match,
        },
        "strengths": [
            f"Project aligns with current {domain.upper()} academic research trends.",
            f"Team of {team_size} allows parallel development across components.",
            "Abundant open-source tools and community resources available.",
        ],
        "bottlenecks": [
            "Integration testing between system components needs early validation."
            if weeks >= 6
            else "Compressed timeline requires strict sprint adherence.",
            "Clear scope definition needed to prevent feature creep.",
        ],
        "filesAnalyzed": [],
        "aiGenerated": False,
    }


def run_feasibility_agent(
    idea_data: dict,
    student_skills: dict = None,
    uploaded_files: list = None,
) -> dict:
    """
    Main entry point: runs the CrewAI feasibility agent.

    Args:
        idea_data: dict with keys title, desc, domain, teamSize, durationDays, etc.
        student_skills: dict mapping skill names to proficiency levels (1-5)
        uploaded_files: list of dicts with name, contentBase64, contentType

    Returns:
        dict: Structured feasibility report matching frontend schema.
    """
    student_skills = student_skills or {}
    uploaded_files = uploaded_files or []

    # --- Step 1: Extract text from uploaded files ---
    file_context = extract_text_from_files(uploaded_files)
    files_analyzed = [f.get("name", "unknown") for f in uploaded_files if f.get("contentBase64")]

    # --- Step 2: Build the CrewAI agent ---
    try:
        llm = _get_llm()
    except Exception as e:
        print(f"[FEASIBILITY AGENT] LLM init failed: {e}")
        return _build_fallback_report(idea_data)

    feasibility_agent = Agent(
        role="Senior Academic Project Feasibility Analyst",
        goal=(
            "Evaluate the technical viability, timeline adequacy, resource availability, "
            "and skill-match of student academic project ideas. Provide rigorous, "
            "actionable feasibility scores and recommendations."
        ),
        backstory=(
            "You are an expert academic mentor and project evaluator with 15+ years of "
            "experience guiding Computer Science & Engineering capstone projects. You have "
            "supervised hundreds of student teams across domains like AI/ML, Web Development, "
            "IoT, Blockchain, and Data Science. You analyze project descriptions, uploaded "
            "reference documents, student skill profiles, and timeline constraints to produce "
            "precise feasibility assessments that help students succeed."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False,
    )

    # --- Step 3: Build the task ---
    title = idea_data.get("title", "Untitled Project")
    desc = idea_data.get("desc", "No description provided")
    domain = idea_data.get("domain", "web")
    team_size = idea_data.get("teamSize", "3")
    duration_days = idea_data.get("durationDays", 30)
    tech_ideas = idea_data.get("techIdeas", "")
    features = idea_data.get("features", [])

    skills_text = (
        ", ".join(f"{k}: {v}/5" for k, v in student_skills.items())
        if student_skills
        else "Not provided"
    )

    features_text = (
        "\n".join(f"  - {f}" for f in features) if features else "Not specified"
    )

    file_section = (
        f"\n\nUPLOADED REFERENCE DOCUMENTS (extracted text):\n{file_context}"
        if file_context
        else "\n\nNo reference documents uploaded."
    )

    task_description = f"""
Analyze the following student academic project idea for feasibility.

PROJECT DETAILS:
- Title: {title}
- Description: {desc}
- Domain: {domain}
- Team Size: {team_size} members
- Duration: {duration_days} days ({round(int(duration_days) / 7)} weeks approx.)
- Proposed Technologies: {tech_ideas if tech_ideas else 'Not specified'}
- Key Features:
{features_text}

STUDENT SKILL PROFILE:
{skills_text}
{file_section}

INSTRUCTIONS:
You MUST respond with ONLY a valid JSON object (no extra text, no markdown) with exactly this structure:
{{
  "overallScore": <integer 0-100>,
  "verdict": "<one of: 'Highly Feasible', 'Feasible with Guidance', 'Needs Scope Reduction'>",
  "metrics": {{
    "technical": <integer 0-100>,
    "timeline": <integer 0-100>,
    "resource": <integer 0-100>,
    "skillMatch": <integer 0-100>
  }},
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "bottlenecks": ["<bottleneck 1>", "<bottleneck 2>"]
}}

SCORING GUIDELINES:
- technical: How complex is the project technically? Higher = more feasible (simpler/well-supported).
- timeline: Is the duration adequate for the scope? Higher = sufficient time.
- resource: Are tools, datasets, APIs, hardware available? Higher = readily available.
- skillMatch: Do the student's skills match the project requirements? Higher = strong match.
- overallScore: Weighted average — technical(35%) + timeline(25%) + resource(20%) + skillMatch(20%).
- verdict: "Highly Feasible" if overall >= 85, "Feasible with Guidance" if >= 70, else "Needs Scope Reduction".

Be specific and contextual in strengths and bottlenecks — reference the actual project details, 
domain challenges, and any insights from uploaded documents.
"""

    feasibility_task = Task(
        description=task_description,
        expected_output="A valid JSON object containing the feasibility report with overallScore, verdict, metrics, strengths, and bottlenecks.",
        agent=feasibility_agent,
    )

    # --- Step 4: Run the Crew ---
    try:
        crew = Crew(
            agents=[feasibility_agent],
            tasks=[feasibility_task],
            verbose=False,
        )

        result = crew.kickoff()

        # Parse the result
        result_text = str(result)
        parsed = _parse_json_from_text(result_text)

        if parsed and "overallScore" in parsed:
            # Ensure all expected fields exist
            report = {
                "overallScore": int(parsed.get("overallScore", 80)),
                "verdict": parsed.get("verdict", "Feasible with Guidance"),
                "metrics": {
                    "technical": int(parsed.get("metrics", {}).get("technical", 80)),
                    "timeline": int(parsed.get("metrics", {}).get("timeline", 80)),
                    "resource": int(parsed.get("metrics", {}).get("resource", 80)),
                    "skillMatch": int(parsed.get("metrics", {}).get("skillMatch", 80)),
                },
                "strengths": parsed.get("strengths", []),
                "bottlenecks": parsed.get("bottlenecks", []),
                "filesAnalyzed": files_analyzed,
                "aiGenerated": True,
            }
            return report
        else:
            print(f"[FEASIBILITY AGENT] Could not parse LLM output: {result_text[:500]}")
            fallback = _build_fallback_report(idea_data)
            fallback["filesAnalyzed"] = files_analyzed
            return fallback

    except Exception as e:
        print(f"[FEASIBILITY AGENT] Crew execution failed: {e}")
        traceback.print_exc()
        fallback = _build_fallback_report(idea_data)
        fallback["filesAnalyzed"] = files_analyzed
        return fallback
