from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router as api_router

app = FastAPI(title="Video Agent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api", tags=["api"])


@app.get("/")
async def root():
    return {"message": "Welcome to Video Agent API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
