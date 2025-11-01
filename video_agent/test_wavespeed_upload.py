from agents.post_production import upload_to_wavespeed

# Use the existing stitched video
video_path = "/app/output/final/final_stitched_video.mp4"

print("="*60)
print("Testing Wavespeed Upload")
print("="*60)
print(f"Video path: {video_path}")

try:
    print("\nUploading to Wavespeed...")
    result = upload_to_wavespeed(video_path)

    print("\n" + "="*60)
    print("✓ SUCCESS!")
    print("="*60)
    print(f"Wavespeed response:")
    print(result)

except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
