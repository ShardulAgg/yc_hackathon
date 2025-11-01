"""
Test the /api/upload-video endpoint directly
"""
import requests
import json

API_URL = "http://localhost:8000/api/upload-video"

# Use the Wavespeed video URL from previous test
payload = {
    "video_url": "https://d1q70pf5vjeyhc.cloudfront.net/media/e883817d5e664497976dab0ea3e2e988/videos/1762038386545372346_9eHXaozz.mp4",
    "title": "Test Interview Video",
    "description": "Testing the upload-video endpoint directly"
}

print("="*60)
print("Testing /api/upload-video endpoint")
print("="*60)
print(f"\nSending request to: {API_URL}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(API_URL, json=payload, timeout=120)

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("\n" + "="*60)
        print("✓ SUCCESS!")
        print("="*60)
        print(f"Response: {json.dumps(result, indent=2)}")
    else:
        print(f"\n✗ Error: {response.status_code}")
        print(f"Response: {response.text}")

except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
