from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str


class LoginUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    must_change_password: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: LoginUserResponse
