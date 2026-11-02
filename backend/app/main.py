
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.resources import router as resources_router

app = FastAPI(
    title="CampusShare API",
    description="Campus Resource Sharing System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resources_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to CampusShare API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "CampusShare"
    }
