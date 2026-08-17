import os
from pathlib import Path

from dotenv import load_dotenv


# backend/ directory
BASE_DIR = Path(__file__).resolve().parent

# Load variables from backend/.env
load_dotenv(BASE_DIR / ".env")


MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "").strip()


if not MONGO_URL:
    raise RuntimeError(
        "MONGO_URL is missing. Add MONGO_URL to backend/.env"
    )

if not DB_NAME:
    raise RuntimeError(
        "DB_NAME is missing. Add DB_NAME to backend/.env"
    )