from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin
from app.exceptions.user_exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    InvalidPasswordException,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
)
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "",
    response_model=UserResponse
)
def create_user(
    request: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return UserService.create_user(
            db,
            request
        )

    except UserAlreadyExistsException as e:
        raise HTTPException(
            status_code=409,
            detail=str(e)
        )


@router.get(
    "",
    response_model=list[UserResponse]
)
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return UserService.list_users(db)


@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return UserService.get_user(
            db,
            user_id
        )

    except UserNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    request: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return UserService.update_user(
            db,
            user_id,
            request
        )

    except UserNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.patch("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        UserService.change_password(
            db,
            current_user,
            request,
        )

        return {
            "message": "Password changed successfully."
        }

    except InvalidPasswordException as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        UserService.delete_user(
            db,
            user_id,
        )

        return {
            "message": "User deactivated successfully."
        }

    except UserNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )