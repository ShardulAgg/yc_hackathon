import sys
import json
from agents.pre_production import run_pre_production
from agents.production import run_production

# Sample context
interviewee_context = {
    "company_name": "TechVision AI",
    "use_case": "AI-powered video analytics for content creators",
    "founder_name": "Alex Chen",
    "founder_role": "CEO & Co-founder",
    "interesting_context": "Former ML engineer at Google, built recommendation systems for YouTube"
}

print("="*60)
print("STEP 1: PRE-PRODUCTION (Script Generation)")
print("="*60)

try:
    pre_production_result = run_pre_production(interviewee_context, creator_index=0)
    print("\n✓ Script generated successfully!")
    print(f"Number of dialogue lines: {len(pre_production_result['script'])}")
    print(f"Creator: {pre_production_result['creator']['creator_name']}")
    print(f"Interviewee: {pre_production_result['interviewee']['name']}")

    print("\n" + "="*60)
    print("STEP 2: PRODUCTION (Audio Generation)")
    print("="*60)

    production_result = run_production(pre_production_result)

    print("\n✓ Audio generation completed!")
    print(f"Total audio files generated: {len(production_result['audio_files'])}")
    print(f"Output directory: {production_result['output_directory']}")

    print("\n" + "="*60)
    print("PRODUCTION OUTPUT:")
    print("="*60)
    print(json.dumps(production_result, indent=2))

except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
