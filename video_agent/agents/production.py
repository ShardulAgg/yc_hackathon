import replicate
import os
from pathlib import Path
from typing import Dict, List


# Voice mappings - using ElevenLabs v3 supported voices
INTERVIEWER_VOICE = "Aria"  # Female voice for interviewer
INTERVIEWEE_VOICE = "Grimblewood"  # Male voice for interviewee


def generate_audio_for_dialogue(speaker: str, text: str, is_interviewer: bool, output_dir: Path, index: int) -> str:
    """
    Generate audio for a single dialogue line using ElevenLabs v3

    Args:
        speaker: Speaker name
        text: Dialogue text
        is_interviewer: True if speaker is interviewer, False if interviewee
        output_dir: Directory to save audio files
        index: Index of the dialogue line

    Returns:
        Path to generated audio file
    """
    voice = INTERVIEWER_VOICE if is_interviewer else INTERVIEWEE_VOICE

    output = replicate.run(
        "elevenlabs/v3",
        input={
            "voice": voice,
            "prompt": text
        }
    )

    # Create filename
    filename = f"{index:02d}_{speaker.replace(' ', '_')}_{voice}.mp3"
    file_path = output_dir / filename

    # Write audio to file
    with open(file_path, "wb") as file:
        file.write(output.read())

    return str(file_path)


def run_production(pre_production_output: Dict) -> Dict:
    """
    Main production function to generate audio from script

    Args:
        pre_production_output: Output from pre_production containing script, creator, interviewee

    Returns:
        Dict with audio files, script, and metadata
    """
    script = pre_production_output["script"]
    creator = pre_production_output["creator"]
    interviewee = pre_production_output["interviewee"]

    # Create output directory for audio files
    output_dir = Path(__file__).parent.parent / "output" / "audio"
    output_dir.mkdir(parents=True, exist_ok=True)

    audio_files = []

    # Generate audio for each dialogue line
    for idx, dialogue in enumerate(script):
        speaker = dialogue["speaker"]
        text = dialogue["text"]

        # Check if this is the interviewer or interviewee
        is_interviewer = speaker == creator["creator_name"]

        print(f"Generating audio for {speaker} ({INTERVIEWER_VOICE if is_interviewer else INTERVIEWEE_VOICE}): {text[:50]}...")

        audio_path = generate_audio_for_dialogue(
            speaker=speaker,
            text=text,
            is_interviewer=is_interviewer,
            output_dir=output_dir,
            index=idx
        )

        audio_files.append({
            "index": idx,
            "speaker": speaker,
            "voice": INTERVIEWER_VOICE if is_interviewer else INTERVIEWEE_VOICE,
            "text": text,
            "audio_path": audio_path
        })

        print(f"✓ Audio saved to: {audio_path}")

    return {
        "audio_files": audio_files,
        "script": script,
        "creator": creator,
        "interviewee": interviewee,
        "output_directory": str(output_dir)
    }
