from agents.feasibility_agent import check_feasibility
from agents.scope_agent import analyze_scope
from agents.technology_agent import recommend_technology
from agents.timeline_agent import create_timeline
from agents.risk_agent import identify_risks


def print_result(title, result):

    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

    for key, value in result.items():

        print(f"\n{key.upper()}:")

        if isinstance(value, list):

            for item in value:
                print(f"  - {item}")

        elif isinstance(value, dict):

            for sub_key, sub_value in value.items():
                print(f"  {sub_key}: {sub_value}")

        else:
            print(f"  {value}")


def run_project_analysis(project):

    feasibility = check_feasibility(project)
    scope = analyze_scope(project)
    technology = recommend_technology(project)
    timeline = create_timeline(project)
    risks = identify_risks(project)

    print_result("1. FEASIBILITY AGENT", feasibility)
    print_result("2. SCOPE AGENT", scope)
    print_result("3. TECHNOLOGY AGENT", technology)
    print_result("4. TIMELINE AGENT", timeline)
    print_result("5. RISK AGENT", risks)


if __name__ == "__main__":

    print("\n==========================================")
    print("       PROJECTGUIDE-AI")
    print("       AI AGENT DEVELOPER MODULE")
    print("==========================================")

    project = input("\nEnter your project idea: ")

    if project.strip():

        run_project_analysis(project)

    else:

        print("Please enter a project idea.")
