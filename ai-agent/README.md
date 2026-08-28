# 🤖 ProjectGuide-AI — AI Agent & LLM Services

This directory is designated for the AI agent pipelines, prompt engineering workflows, and LangChain/Gemini/OpenAI service wrappers.

---

## 🎯 Core Agent Capabilities

1. **Project Feasibility & Scope Analysis**:
   - Takes: Student idea description + student skill ratings + estimated duration in days.
   - Evaluates: Technical scope vs. timeline vs. current team capability.
   - Returns: Feasibility score (0–100%), risk factors, and recommended tech stack.

2. **Dynamic Milestone Roadmap Generation**:
   - Divides duration into structured phases (e.g. 3 phases for <=15 days, 5 phases for <=30 days, 8 phases for standard semester projects).
   - Generates deliverables, technical checklist, and expected weekly outputs.

3. **Contextual Mentor Chat Agent**:
   - Answers questions regarding architecture, libraries, debugging, and best practices with awareness of the student's active project idea and skills.

---

## 📄 Prompt Pipeline Templates

### Blueprint Generator Prompt
```text
System: You are an expert Academic Project Mentor in Computer Science and Engineering.
User Input:
- Idea: {idea_description}
- Domain: {domain}
- Duration (Days): {duration_days}
- Student Skills: {student_skills}
- Team Size: {team_size}

Task:
Generate a structured JSON output with:
1. "feasibility": integer 0-100
2. "techStack": list of recommended tools
3. "milestones": array of phases with "week", "title", "desc"
4. "keyRisks": list of potential bottlenecks
```
