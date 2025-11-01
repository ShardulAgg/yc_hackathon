import requests
import json

# API endpoint
API_URL = "http://localhost:8000/api/generate"

# Sample request
payload = {
    "company_name": "TechVision AI",
    "use_case": "AI-powered video analytics for content creators",
    "founder_name": "Alex Chen",
    "founder_role": "CEO & Co-founder",
    "interesting_context": "Former ML engineer at Google, built recommendation systems for YouTube",
    "creator_id": 0
}

print("="*60)
print("Testing /api/generate endpoint")
print("="*60)
print(f"\nSending request to: {API_URL}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(API_URL, json=payload, timeout=600)  # 10 min timeout

    if response.status_code == 200:
        result = response.json()
        print("\n" + "="*60)
        print("✓ SUCCESS!")
        print("="*60)
        print(f"Status: {result['status']}")
        print(f"Number of clips: {result['num_clips']}")
        print(f"Video path: {result['video_path']}")
        print(f"Base64 length: {len(result['video_base64'])} characters")
        print(f"\nScript ({len(result['script'])} lines):")
        for idx, line in enumerate(result['script']):
            print(f"  {idx + 1}. {line['speaker']}: {line['text'][:60]}...")

        print(f"\nCreator: {result['creator']['creator_name']}")
        print(f"Interviewee: {result['interviewee']['name']} ({result['interviewee']['role']})")

    else:
        print(f"\n✗ Error: {response.status_code}")
        print(response.text)

except requests.exceptions.Timeout:
    print("\n✗ Request timed out (10 minutes)")
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
