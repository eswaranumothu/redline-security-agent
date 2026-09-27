from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    try:
        return AuthService.login(
            db,
            request.email,
            request.password
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


@router.post(
    "/register",
    response_model=LoginResponse
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    try:
        return AuthService.register(
            db,
            request.username,
            request.password,
            request.confirm_password
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )