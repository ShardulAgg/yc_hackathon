"""
Test complete upload flow:
1. Upload stitched video to Wavespeed
2. Upload Wavespeed URL to social platforms via UploadPost
"""

import os
from pathlib import Path
from agents.post_production import upload_to_wavespeed
from upload_post import UploadPostClient


def test_complete_upload():
    # Path to the final stitched video
    video_path = "/app/output/final/final_stitched_video.mp4"

    print("="*60)
    print("STEP 1: Upload to Wavespeed")
    print("="*60)
    print(f"Video path: {video_path}")

    try:
        wavespeed_result = upload_to_wavespeed(video_path)
        print(f"✓ Uploaded to Wavespeed successfully!")
        print(f"Response: {wavespeed_result}")

        # Extract video URL from Wavespeed response
        if isinstance(wavespeed_result, dict):
            video_url = wavespeed_result.get('data', {}).get('download_url')
        else:
            video_url = str(wavespeed_result)

        if not video_url:
            print(f"❌ Could not extract URL from Wavespeed response")
            return

        print(f"\n✓ Video URL: {video_url}")
    except Exception as e:
        print(f"❌ Error uploading to Wavespeed: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("STEP 2: Upload to Social Platforms")
    print("="*60)

    # Get API key from environment
    api_key = os.getenv("UPLOAD_POST_API_KEY")
    if not api_key:
        print("❌ UPLOAD_POST_API_KEY not found in environment variables")
        print("⚠️  Skipping social platform upload")
        return

    print(f"✓ API key found")

    # Upload to social platforms
    try:
        client = UploadPostClient(api_key=api_key)

        title = "Test Interview Video"
        description = "Testing the complete upload flow from Wavespeed to social platforms"
        user = "test_user"

        print(f"\nUploading to social platforms:")
        print(f"  Video URL: {video_url}")
        print(f"  Title: {title}")
        print(f"  Description: {description}")

        response = client.upload_video(
            video_path=video_url,
            title=title,
            user=user,
            platforms=["instagram"],
            description=description
        )

        print(f"\n✓ Upload to social platforms completed!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ Error uploading to social platforms: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*60)
    print("✅ COMPLETE UPLOAD FLOW SUCCESS!")
    print("="*60)


if __name__ == "__main__":
    test_complete_upload()
