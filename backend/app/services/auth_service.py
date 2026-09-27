from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.roles import UserRole
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, hash_password, create_access_token


class AuthService:

    @staticmethod
    def login(db: Session, email: str, password: str):
        # Normalize email/username
        clean_email = email.strip()
        user = UserRepository.get_by_email(db, clean_email)

        if not user:
            raise ValueError("Invalid username or password")

        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid username or password")

        if not user.is_active:
            raise ValueError("User account is disabled")

        # Update last_login timestamp
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        token = create_access_token(
            {
                "sub": user.email,
                "role": user.role,
                "user_id": user.id,
                "full_name": user.full_name,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "must_change_password": user.must_change_password,
            },
        }

    @staticmethod
    def register(db: Session, username: str, password: str, confirm_password: str):
        clean_username = username.strip()
        if not clean_username:
            raise ValueError("Username cannot be empty")

        if password != confirm_password:
            raise ValueError("Passwords do not match")

        if len(password) < 4:
            raise ValueError("Password must be at least 4 characters long")

        existing = UserRepository.get_by_email(db, clean_username)
        if existing:
            raise ValueError("Username is already registered")

        # Create user with ADMIN role so all features are accessible
        user = User(
            full_name=clean_username,
            email=clean_username,
            password_hash=hash_password(password),
            role=UserRole.ADMIN.value,
            is_active=True,
            must_change_password=False,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Log user in immediately
        return AuthService.login(db, clean_username, password)