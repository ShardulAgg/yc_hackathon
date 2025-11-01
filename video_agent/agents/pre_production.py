import json
import random
import os
from pathlib import Path
import replicate


def load_creators():
    """Load creator profiles from creators.json"""
    creators_path = Path(__file__).parent / "creators.json"
    with open(creators_path, 'r') as f:
        return json.load(f)


def select_random_creator(creators):
    """Randomly select a creator from the list"""
    return random.choice(creators)


def generate_script(interviewee_context: dict, creator: dict) -> dict:
    """
    Generate a 30-second interview script using Gemini 2.5 Flash

    Args:
        interviewee_context: Dict with company_name, use_case, founder_name, founder_role, interesting_context
        creator: Dict with creator_name, creator_bio, creator_account, creator_image

    Returns:
        Dict with script and metadata
    """

    # Build the prompt for Gemini
    prompt = f"""You are writing a script for a 30-second roadside interview for social media.

INTERVIEWER:
Name: {creator['creator_name']}
Bio: {creator['creator_bio']}

INTERVIEWEE:
Name: {interviewee_context['founder_name']}
Role: {interviewee_context['founder_role']}
Company: {interviewee_context['company_name']}
Use Case: {interviewee_context['use_case']}
Context: {interviewee_context['interesting_context']}

Generate a natural, engaging 2-3 back-and-forth dialogue between {creator['creator_name']} and {interviewee_context['founder_name']}.
The interview should:
- Be conversational and authentic (roadside interview style)
- Highlight the startup's value proposition
- Keep it under 30 seconds when spoken
- Be energetic and social media friendly

Format the output as a JSON array with this structure:
[
  {{"speaker": "interviewer_name", "text": "dialogue text"}},
  {{"speaker": "founder_name", "text": "dialogue text"}}
]

Only return the JSON array, nothing else."""

    # Call Gemini via Replicate
    output_text = ""
    for event in replicate.stream(
        "google/gemini-2.5-flash",
        input={"prompt": prompt}
    ):
        output_text += str(event)

    # Parse the script from output
    # Remove any markdown code blocks if present
    cleaned_output = output_text.strip()
    if cleaned_output.startswith("```"):
        # Remove markdown code block markers
        lines = cleaned_output.split('\n')
        cleaned_output = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_output
        cleaned_output = cleaned_output.replace("```json", "").replace("```", "").strip()

    script = json.loads(cleaned_output)

    return {
        "script": script,
        "creator": creator,
        "interviewee": {
            "name": interviewee_context['founder_name'],
            "role": interviewee_context['founder_role'],
            "company": interviewee_context['company_name']
        }
    }


def run_pre_production(interviewee_context: dict, creator_index: int = None) -> dict:
    """
    Main pre-production function to generate interview script

    Args:
        interviewee_context: Founder/company context
        creator_index: Optional index to select specific creator (0-4), random if None

    Returns:
        Generated script with metadata
    """
    creators = load_creators()

    if creator_index is not None:
        creator = creators[creator_index]
    else:
        creator = select_random_creator(creators)

    return generate_script(interviewee_context, creator)
