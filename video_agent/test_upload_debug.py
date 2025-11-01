"""
Debug Upload-Post API call to see the exact error
"""
import os
import requests

api_key = os.getenv("UPLOAD_POST_API_KEY")

# Mimic what the upload_post library does
url = "https://api.upload-post.com/api/upload"
headers = {
    "Authorization": f"Bearer {api_key}"
}

# Test payload
data = {
    "title": "Test Interview Video",
    "user": "test",
    "platforms": ["instagram"],
    "description": "Testing the upload flow"
}

files = {
    "video": ("video.mp4", "https://d1q70pf5vjeyhc.cloudfront.net/media/e883817d5e664497976dab0ea3e2e988/videos/1762038386545372346_9eHXaozz.mp4")
}

print("="*60)
print("Debug Upload-Post API Call")
print("="*60)
print(f"URL: {url}")
print(f"Headers: Authorization: Bearer {api_key[:10]}...")
print(f"Data: {data}")
print()

try:
    # Try with multipart form data
    response = requests.post(url, headers=headers, data=data)

    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
