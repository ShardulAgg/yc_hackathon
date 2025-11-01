"""
Standalone test for uploading video:
1. Upload stitched video to Wavespeed
2. Use UploadPostClient directly to upload to Instagram
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from agents.post_production import upload_to_wavespeed
from upload_post import UploadPostClient

# Load environment variables
load_dotenv()

def test_upload_standalone():
    # Path to the final stitched video
    video_path = Path(__file__).parent / "output" / "final" / "final_stitched_video.mp4"

    if not video_path.exists():
        print(f"❌ Video not found at: {video_path}")
        return

    print("="*60)
    print("STEP 1: Upload to Wavespeed")
    print("="*60)
    print(f"Video path: {video_path}")
    print(f"Video size: {video_path.stat().st_size / (1024*1024):.2f} MB")

    # Upload to Wavespeed
    try:
        wavespeed_result = upload_to_wavespeed(str(video_path))
        print(f"✓ Uploaded to Wavespeed successfully!")
        print(f"Response type: {type(wavespeed_result)}")
        print(f"Response: {wavespeed_result}")

        # Extract URL from result (adjust based on actual response structure)
        if isinstance(wavespeed_result, dict):
            video_url = (
                wavespeed_result.get('url') or
                wavespeed_result.get('data', {}).get('url') or
                wavespeed_result.get('media_url') or
                wavespeed_result.get('file_url')
            )
        else:
            video_url = str(wavespeed_result)

        if not video_url:
            print(f"⚠️  Could not extract URL from Wavespeed response")
            print(f"Full response: {wavespeed_result}")
            return

        print(f"\n✓ Video URL: {video_url}")
    except Exception as e:
        print(f"❌ Error uploading to Wavespeed: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("STEP 2: Upload to Instagram via UploadPostClient")
    print("="*60)

    # Get API key from environment
    api_key = os.getenv("UPLOAD_POST_API_KEY")
    if not api_key:
        print("❌ UPLOAD_POST_API_KEY not found in environment variables")
        return

    print(f"✓ API key found: {api_key[:10]}...")

    # Upload to Instagram using UploadPostClient
    try:
        client = UploadPostClient(api_key=api_key)

        print(f"\nCalling push_content with:")
        print(f"  video_url: {video_url}")
        print(f"  title: Test Video Upload")
        print(f"  user: test")
        print(f"  description: Testing upload flow")

        response = client.push_content(
            video_path=video_url,  # Using video_url as video_path
            title="Test Video Upload",
            user="test",
            description="Testing the complete upload flow from Wavespeed to Instagram"
        )

        print(f"\n✓ Upload to Instagram completed!")
        print(f"Response type: {type(response)}")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ Error uploading to Instagram: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("✅ UPLOAD FLOW COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    test_upload_standalone()
