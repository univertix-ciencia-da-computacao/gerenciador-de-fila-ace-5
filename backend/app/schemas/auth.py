from pydantic import BaseModel, Field


class StaffUser(BaseModel):
    id: str
    email: str


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=1, max_length=200)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: StaffUser
