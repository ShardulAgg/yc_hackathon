import sys
import json
from agents.pre_production import run_pre_production

# Sample context
interviewee_context = {
    "company_name": "TechVision AI",
    "use_case": "AI-powered video analytics for content creators",
    "founder_name": "Alex Chen",
    "founder_role": "CEO & Co-founder",
    "interesting_context": "Former ML engineer at Google, built recommendation systems for YouTube"
}

print("Testing pre_production with sample data...")
print(f"\nInput Context:")
print(json.dumps(interviewee_context, indent=2))
print(f"\nUsing creator_id: 0")

try:
    result = run_pre_production(interviewee_context, creator_index=0)
    print("\n" + "="*60)
    print("PRE-PRODUCTION OUTPUT:")
    print("="*60)
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
