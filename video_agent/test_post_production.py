from agents.post_production import stitch_videos_with_ffmpeg, video_to_base64
from pathlib import Path

# Use existing local video files (container paths)
video_files = [
    "/app/output/final/downloads/00_Samantha_Hayes.mp4",
    "/app/output/final/downloads/01_Alex_Chen.mp4",
    "/app/output/final/downloads/02_Samantha_Hayes.mp4",
    "/app/output/final/downloads/03_Alex_Chen.mp4",
    "/app/output/final/downloads/04_Samantha_Hayes.mp4"
]

print("Testing POST-PRODUCTION with local videos...")
print(f"Number of video clips: {len(video_files)}")

# Check if files exist
for vf in video_files:
    if Path(vf).exists():
        print(f"  ✓ Found: {vf}")
    else:
        print(f"  ✗ Missing: {vf}")

try:
    # Test stitching
    output_dir = Path("/app/output/final")
    output_path = output_dir / "test_stitched.mp4"

    print("\nStitching videos with ffmpeg...")
    stitched_path = stitch_videos_with_ffmpeg(video_files, output_path)

    print("\nConverting to base64...")
    video_base64 = video_to_base64(stitched_path)

    print("\n" + "="*60)
    print("✓ POST-PRODUCTION SUCCESS!")
    print("="*60)
    print(f"Final video path: {stitched_path}")
    print(f"Base64 length: {len(video_base64)} characters")

except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
