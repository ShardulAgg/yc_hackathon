from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import json
from pathlib import Path

router = APIRouter()


# Request/Response Models
class GenerateRequest(BaseModel):
    company_name: str
    use_case: str
    founder_name: str
    founder_role: str
    interesting_context: str
    creator_id: int


class UploadVideoRequest(BaseModel):
    video_path: str
    title: str
    description: str


class CreatorResponse(BaseModel):
    id: int
    name: str
    image: str


# Helper function to load creators
def load_creators():
    creators_path = Path(__file__).parent.parent / "agents" / "creators.json"
    with open(creators_path, 'r') as f:
        return json.load(f)


@router.post("/generate")
async def generate_video(request: GenerateRequest):
    """
    Generate a video from interviewee context and creator
    """
    # Validate creator_id
    creators = load_creators()
    if request.creator_id < 0 or request.creator_id >= len(creators):
        raise HTTPException(status_code=400, detail=f"Invalid creator_id. Must be between 0 and {len(creators)-1}")

    # Return demo.mp4 file
    demo_path = Path(__file__).parent.parent / "demo.mp4"

    if not demo_path.exists():
        raise HTTPException(status_code=404, detail="Demo video file not found")

    return FileResponse(
        path=str(demo_path),
        media_type="video/mp4",
        filename="generated_video.mp4"
    )


@router.get("/creators", response_model=List[CreatorResponse])
async def get_creators():
    """
    Get all creators with id, name, and image
    """
    creators = load_creators()
    return [
        {
            "id": idx,
            "name": creator["creator_name"],
            "image": creator["creator_image"]
        }
        for idx, creator in enumerate(creators)
    ]


@router.post("/upload-video")
async def upload_video(request: UploadVideoRequest):
    """
    Upload video to Instagram through the creator's account
    Note: This is a placeholder implementation
    """
    # TODO: Implement actual Instagram upload functionality
    # For now, return a success response
    return {
        "message": f"Video '{request.title}' uploaded successfully to Instagram",
        "success": True
    }
