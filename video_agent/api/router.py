from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from agents.pre_production import run_pre_production
from agents.production import run_production
from agents.post_production import run_post_production
from upload_post import UploadPostClient

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
    Full pipeline: script generation → video generation → stitching → base64 encoding
    """
    try:
        # Validate creator_id
        creators = load_creators()
        if request.creator_id < 0 or request.creator_id >= len(creators):
            raise HTTPException(status_code=400, detail=f"Invalid creator_id. Must be between 0 and {len(creators)-1}")

        # Prepare context
        interviewee_context = {
            "company_name": request.company_name,
            "use_case": request.use_case,
            "founder_name": request.founder_name,
            "founder_role": request.founder_role,
            "interesting_context": request.interesting_context
        }

        # Step 1: Pre-production (script generation)
        print("\n" + "="*60)
        print("STEP 1: PRE-PRODUCTION")
        print("="*60)
        pre_production_result = run_pre_production(interviewee_context, creator_index=request.creator_id)

        # Step 2: Production (video generation)
        print("\n" + "="*60)
        print("STEP 2: PRODUCTION")
        print("="*60)
        production_result = run_production(pre_production_result)

        # Step 3: Post-production (download, stitch, encode)
        post_production_result = run_post_production(production_result)

        return {
            "status": "success",
            "video_base64": post_production_result["video_base64"],
            "video_path": post_production_result["video_path"],
            "num_clips": post_production_result["num_clips"],
            "script": post_production_result["script"],
            "creator": post_production_result["creator"],
            "interviewee": post_production_result["interviewee"]
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


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
    response = await push_content(
        video_path=request.video_path,
        title=request.title,
        description=request.description
    )
    return response
