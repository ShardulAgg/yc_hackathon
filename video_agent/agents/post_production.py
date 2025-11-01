import subprocess
import base64
import requests
from pathlib import Path
from typing import Dict, List


def download_video(url: str, output_path: Path) -> str:
    """Download video from URL to local file"""
    print(f"  Downloading: {url}")
    response = requests.get(url)
    response.raise_for_status()

    with open(output_path, 'wb') as f:
        f.write(response.content)

    print(f"  ✓ Saved to: {output_path}")
    return str(output_path)


def stitch_videos_with_ffmpeg(video_paths: List[str], output_path: Path) -> str:
    """
    Stitch videos together with 9:16 ratio and black bars using ffmpeg

    Args:
        video_paths: List of local video file paths
        output_path: Path for the final stitched video

    Returns:
        Path to stitched video
    """
    print(f"\nStitching {len(video_paths)} videos together...")

    # Create a file list for ffmpeg concat
    concat_file = output_path.parent / "concat_list.txt"
    with open(concat_file, 'w') as f:
        for video_path in video_paths:
            f.write(f"file '{video_path}'\n")

    # FFmpeg command to:
    # 1. Concatenate videos
    # 2. Scale to fit 9:16 ratio (1080x1920)
    # 3. Add black bars (pad) to maintain aspect ratio
    ffmpeg_command = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_file),
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
        '-c:a', 'copy',
        '-y',  # Overwrite output file
        str(output_path)
    ]

    print(f"  Running ffmpeg...")
    result = subprocess.run(ffmpeg_command, capture_output=True, text=True)

    if result.returncode != 0:
        raise Exception(f"FFmpeg error: {result.stderr}")

    print(f"  ✓ Stitched video saved to: {output_path}")

    # Clean up concat file
    concat_file.unlink()

    return str(output_path)


def video_to_base64(video_path: str) -> str:
    """Convert video file to base64 string"""
    print(f"\nConverting video to base64...")
    with open(video_path, 'rb') as f:
        video_bytes = f.read()
        base64_str = base64.b64encode(video_bytes).decode('utf-8')
    print(f"  ✓ Converted to base64 ({len(base64_str)} characters)")
    return base64_str


def run_post_production(production_output: Dict) -> Dict:
    """
    Main post-production function to download, stitch, and encode video

    Args:
        production_output: Output from production containing video_files

    Returns:
        Dict with final video in base64 format
    """
    video_files = production_output["video_files"]

    # Create output directory
    output_dir = Path(__file__).parent.parent / "output" / "final"
    output_dir.mkdir(parents=True, exist_ok=True)

    download_dir = output_dir / "downloads"
    download_dir.mkdir(exist_ok=True)

    print("\n" + "="*60)
    print("POST-PRODUCTION: Download and Stitch Videos")
    print("="*60)

    # Download all videos
    downloaded_paths = []
    for idx, video_file in enumerate(video_files):
        video_url = video_file["video_url"]
        filename = f"{idx:02d}_{video_file['speaker'].replace(' ', '_')}.mp4"
        download_path = download_dir / filename

        print(f"\n[{idx + 1}/{len(video_files)}] {video_file['speaker']}")
        downloaded_path = download_video(video_url, download_path)
        downloaded_paths.append(downloaded_path)

    # Stitch videos together
    final_video_path = output_dir / "final_stitched_video.mp4"
    stitched_path = stitch_videos_with_ffmpeg(downloaded_paths, final_video_path)

    # Convert to base64
    video_base64 = video_to_base64(stitched_path)

    return {
        "video_base64": video_base64,
        "video_path": stitched_path,
        "num_clips": len(video_files),
        "script": production_output["script"],
        "creator": production_output["creator"],
        "interviewee": production_output["interviewee"]
    }
