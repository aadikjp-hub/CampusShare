
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes import images
from app.routes.resources import router as resources_router


app = FastAPI(
    title="CampusShare API",
    description="Campus Resource Sharing System",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://campus-share-sigma-blush.vercel.app",
        "https://campus-share-git-main-aadityarajs-projects-8d59cfa1.vercel.app",
        "https://campus-share-o19dxyqc9-aadityarajs-projects-8d59cfa1.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(images.router)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to CampusShare API",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "CampusShare"
    }
