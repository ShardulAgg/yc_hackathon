import replicate
import os
from pathlib import Path
from typing import Dict, List


# Image paths for creator and interviewee (relative to project root)
CREATOR_IMAGE_PATH = Path(__file__).parent / "creators_media" / "creator.png"
INTERVIEWEE_IMAGE_PATH = Path(__file__).parent / "interviewee_media" / "interviewee.png"


def generate_video_for_dialogue(speaker: str, text: str, is_interviewer: bool, output_dir: Path, index: int) -> str:
    """
    Generate video for a single dialogue line using Veo-3.1-fast

    Args:
        speaker: Speaker name
        text: Dialogue text
        is_interviewer: True if speaker is interviewer, False if interviewee
        output_dir: Directory to save video files
        index: Index of the dialogue line

    Returns:
        URL to generated video file
    """
    # Select image based on speaker
    image_path = CREATOR_IMAGE_PATH if is_interviewer else INTERVIEWEE_IMAGE_PATH

    # Create prompt
    prompt = f'Speaker is saying "{text}"'

    print(f"  Image: {image_path}")
    print(f"  Prompt: {prompt[:80]}...")

    # Open image file for Replicate
    with open(image_path, "rb") as image_file:
        # Generate video with Veo-3.1-fast
        output = replicate.run(
            "google/veo-3.1-fast",
            input={
                "image": image_file,
                "prompt": prompt,
                "resolution": "720p"
            }
        )

    # Veo returns a URL string directly
    return output


def run_production(pre_production_output: Dict) -> Dict:
    """
    Main production function to generate videos from script

    Args:
        pre_production_output: Output from pre_production containing script, creator, interviewee

    Returns:
        Dict with video files, script, and metadata
    """
    script = pre_production_output["script"]
    creator = pre_production_output["creator"]
    interviewee = pre_production_output["interviewee"]

    # Create output directory for videos
    output_dir = Path(__file__).parent.parent / "output" / "videos"
    output_dir.mkdir(parents=True, exist_ok=True)

    video_files = []

    # Generate video for each dialogue line
    for idx, dialogue in enumerate(script):
        speaker = dialogue["speaker"]
        text = dialogue["text"]

        # Check if this is the interviewer or interviewee
        is_interviewer = speaker == creator["creator_name"]

        print(f"\nGenerating video {idx + 1}/{len(script)} for {speaker}:")
        print(f"  Text: {text[:80]}...")

        video_url = generate_video_for_dialogue(
            speaker=speaker,
            text=text,
            is_interviewer=is_interviewer,
            output_dir=output_dir,
            index=idx
        )

        video_files.append({
            "index": idx,
            "speaker": speaker,
            "text": text,
            "video_url": video_url
        })

        print(f"✓ Video generated: {video_url}")

    return {
        "video_files": video_files,
        "script": script,
        "creator": creator,
        "interviewee": interviewee,
        "output_directory": str(output_dir)
    }
