import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "ai_mentor_platform")

client = None
db = None

def get_database():
    global client, db
    if db is None:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
    return db

def check_db_connection():
    """Utility to test whether the MongoDB connection is alive."""
    try:
        current_db = get_database()
        # Ping the server to check connectivity
        current_db.command("ping")
        return {"connected": True, "database": DB_NAME, "message": "MongoDB Atlas connected successfully!"}
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        return {"connected": False, "database": DB_NAME, "error": str(e), "message": "Failed to connect to MongoDB Atlas. Check your MONGO_URI in .env"}
    except Exception as e:
        return {"connected": False, "database": DB_NAME, "error": str(e), "message": "Unexpected error connecting to MongoDB"}

# Collections helper getters
def get_students_collection():
    return get_database()["students"]

def get_project_ideas_collection():
    return get_database()["project_ideas"]
