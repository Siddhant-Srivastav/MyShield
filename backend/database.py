from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URL, DB_NAME


# Create one MongoDB client for the application process.
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,
)

# Select the configured database.
db = client[DB_NAME]
# Users collection
users_collection=db["users"]


async def check_database_connection() -> None:
    """
    Verify that MongoDB is reachable.
    """
    await client.admin.command("ping")


async def close_database() -> None:
    """
    Close the MongoDB client cleanly.
    """
    client.close()