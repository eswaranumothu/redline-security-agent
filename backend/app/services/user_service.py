from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.exceptions.user_exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    InvalidPasswordException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    ChangePasswordRequest,
)


class UserService:

    @staticmethod
    def get_user(
        db: Session,
        user_id: int
    ):
        user = UserRepository.get_by_id(
            db,
            user_id
        )

        if not user:
            raise UserNotFoundException(
                "User not found."
            )

        return user

    @staticmethod
    def create_user(
        db: Session,
        request: UserCreate
    ):
        existing_user = UserRepository.get_by_email(
            db,
            request.email
        )

        if existing_user:
            raise UserAlreadyExistsException(
                "A user with this email already exists."
            )

        user = User(
            full_name=request.full_name,
            email=request.email,
            password_hash=hash_password(request.password),
            role=request.role.value,
            is_active=True,
            must_change_password=True,
        )

        return UserRepository.create(
            db,
            user
        )

    @staticmethod
    def list_users(
        db: Session
    ):
        return UserRepository.list_all(db)

    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        request: UserUpdate,
    ):
        user = UserRepository.get_by_id(
            db,
            user_id
        )

        if not user:
            raise UserNotFoundException(
                "User not found."
            )

        if request.full_name is not None:
            user.full_name = request.full_name

        if request.role is not None:
            user.role = request.role.value

        if request.is_active is not None:
            user.is_active = request.is_active

        return UserRepository.update(
            db,
            user
        )

    @staticmethod
    def change_password(
        db: Session,
        current_user: User,
        request: ChangePasswordRequest,
    ):
        if not verify_password(
            request.current_password,
            current_user.password_hash,
        ):
            raise InvalidPasswordException(
                "Current password is incorrect."
            )

        current_user.password_hash = hash_password(
            request.new_password
        )

        current_user.must_change_password = False

        return UserRepository.update(
            db,
            current_user
        )

    @staticmethod
    def delete_user(
        db: Session,
        user_id: int,
    ):
        user = UserRepository.get_by_id(
            db,
            user_id
        )

        if not user:
            raise UserNotFoundException(
                "User not found."
            )

        # Soft Delete
        user.is_active = False

        return UserRepository.update(
            db,
            user
        )