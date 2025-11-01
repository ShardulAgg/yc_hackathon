from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
from pathlib import Path
import sys
import os
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
    video_url: str
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
    Full pipeline: script generation → video generation → stitching → upload to Wavespeed
    Returns a video URL instead of base64
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

        # Step 3: Post-production (download, stitch, upload to Wavespeed)
        post_production_result = run_post_production(production_result)

        # Step 4: Upload to social platforms via UploadPost
        print("\n" + "="*60)
        print("STEP 4: UPLOAD TO SOCIAL PLATFORMS")
        print("="*60)

        upload_post_result = None
        try:
            # Use local video file path (Upload-Post doesn't accept video URLs)
            local_video_path = post_production_result["video_path"]

            # Get API key for UploadPost
            upload_post_api_key = os.getenv("UPLOAD_POST_API_KEY")
            if upload_post_api_key:
                client = UploadPostClient(api_key=upload_post_api_key)

                # Create title and description from context
                title = f"Interview with {request.founder_name} from {request.company_name}"
                description = f"{request.founder_name}, {request.founder_role} at {request.company_name}, discusses {request.use_case}"

                upload_post_result = client.upload_video(
                    video_path=local_video_path,
                    title=title,
                    user="test",
                    platforms=["instagram"],
                    description=description
                )
                print(f"✓ Uploaded to Instagram: {upload_post_result}")
            else:
                print("⚠️  UPLOAD_POST_API_KEY not found - skipping social platform upload")
        except Exception as e:
            print(f"⚠️  Error uploading to social platforms: {e}")
            import traceback
            traceback.print_exc()

        return {
            "status": "success",
            "video_url": post_production_result["video_url"],
            "video_path": post_production_result["video_path"],
            "num_clips": post_production_result["num_clips"],
            "script": post_production_result["script"],
            "creator": post_production_result["creator"],
            "interviewee": post_production_result["interviewee"],
            "upload_post_result": upload_post_result
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
    api_key = os.getenv("UPLOAD_POST_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="UPLOAD_POST_API_KEY not configured")

    client = UploadPostClient(api_key=api_key)
    response = client.upload_video(
        video_path=request.video_url,
        title=request.title,
        user="test",
        platforms=["instagram"],
        description=request.description
    )
    return response
