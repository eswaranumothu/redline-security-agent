from fastapi import Depends, HTTPException, status

from app.core.roles import UserRole
from app.dependencies.auth import get_current_user


def require_admin(
    current_user=Depends(get_current_user),
):
    # All features accessible by any logged in user
    return current_user


def require_admin_or_auditor(
    current_user=Depends(get_current_user),
):
    # All features accessible by any logged in user
    return current_user