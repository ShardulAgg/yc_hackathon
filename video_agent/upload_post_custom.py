import requests
from typing import Optional


class UploadPostClient:
    """Client for uploading content to social platforms via UploadPost API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.uploadpost.com/v1"  # Adjust if needed

    async def push_content(
        self,
        video_path: str,
        title: str,
        user: str,
        description: str,
        platform: Optional[str] = "instagram"
    ) -> dict:
        """
        Push content to social media platform

        Args:
            video_path: URL or path to the video
            title: Title of the post
            user: User identifier
            description: Post description/caption
            platform: Social media platform (default: instagram)

        Returns:
            Response from the API
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "video_url": video_path,
            "title": title,
            "user": user,
            "description": description,
            "platform": platform
        }

        # Note: Adjust the endpoint and payload structure based on actual UploadPost API docs
        response = requests.post(
            f"{self.base_url}/upload",
            headers=headers,
            json=payload
        )

        response.raise_for_status()
        return response.json()
