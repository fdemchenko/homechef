import os
import secrets

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
scheme = HTTPBearer(description="Paste the ADMIN_TOKEN from api/.env")


def require_admin(creds: HTTPAuthorizationCredentials = Depends(scheme)) -> None:
    """Guards the write endpoints only you should reach. Reviews stay public."""
    if not ADMIN_TOKEN:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "ADMIN_TOKEN is not set in api/.env",
        )
    if not secrets.compare_digest(creds.credentials, ADMIN_TOKEN):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad admin token")
