from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from gridfs import GridFSBucket
from io import BytesIO

from app.database import db

router = APIRouter(prefix="/images", tags=["Images"])

bucket = GridFSBucket(db)

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed"
        )

    image_data = await file.read()

    if len(image_data) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5 MB"
        )

    try:
        image_id = bucket.upload_from_stream(
            file.filename,
            BytesIO(image_data),
            metadata={
                "content_type": file.content_type
            }
        )

        return {
            "image_id": str(image_id),
            "message": "Image uploaded successfully"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Image upload failed: {str(error)}"
        )


@router.get("/{image_id}")
def get_image(image_id: str):
    try:
        file_id = ObjectId(image_id)
        image = bucket.open_download_stream(file_id)

        content_type = image.metadata.get(
            "content_type",
            "image/jpeg"
        )

        return StreamingResponse(
            image,
            media_type=content_type
        )

    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )