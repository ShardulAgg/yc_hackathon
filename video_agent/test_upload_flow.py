"""
Test the complete upload flow:
1. Upload stitched video to Wavespeed
2. Use the Wavespeed URL to upload to Instagram via /upload-video endpoint
"""

import requests
import os
from pathlib import Path
from dotenv import load_dotenv
from agents.post_production import upload_to_wavespeed

# Load environment variables
load_dotenv()

def test_upload_flow():
    # Path to the final stitched video
    video_path = Path(__file__).parent / "output" / "final" / "final_stitched_video.mp4"

    if not video_path.exists():
        print(f"❌ Video not found at: {video_path}")
        return

    print("="*60)
    print("STEP 1: Upload to Wavespeed")
    print("="*60)

    # Upload to Wavespeed
    try:
        wavespeed_result = upload_to_wavespeed(str(video_path))
        print(f"✓ Uploaded to Wavespeed successfully!")
        print(f"Response: {wavespeed_result}")

        # Extract URL from result (adjust based on actual response structure)
        if isinstance(wavespeed_result, dict):
            video_url = wavespeed_result.get('url') or wavespeed_result.get('data', {}).get('url')
        else:
            video_url = str(wavespeed_result)

        print(f"Video URL: {video_url}")
    except Exception as e:
        print(f"❌ Error uploading to Wavespeed: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("STEP 2: Upload to Instagram via API")
    print("="*60)

    # Call the upload-video endpoint
    api_url = "http://localhost:8000/api/upload-video"
    payload = {
        "video_url": video_url,
        "title": "Test Video Upload",
        "description": "Testing the complete upload flow from Wavespeed to Instagram"
    }

    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()

        print(f"✓ Upload to Instagram initiated successfully!")
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error calling upload-video API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("✅ UPLOAD FLOW COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    test_upload_flow()
