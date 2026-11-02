
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from backend/.env
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is missing from the .env file")

# Connect to MongoDB Atlas
client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000
)

# Select database
db = client["campusshare"]

# Test connection
def test_connection():
    try:
        client.admin.command("ping")
        print("MongoDB connected successfully!")
    except Exception as error:
        print("MongoDB connection failed:", error)
