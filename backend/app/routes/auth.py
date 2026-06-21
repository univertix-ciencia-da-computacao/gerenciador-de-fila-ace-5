from fastapi import APIRouter, Depends

from app.core.exceptions import AuthenticationError
from app.schemas.auth import LoginRequest, LoginResponse, StaffUser
from app.schemas.common import APIResponse
from app.services.supabase_service import SupabaseService, get_supabase_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=APIResponse, summary="Autenticar operador")
async def login(
    payload: LoginRequest,
    supabase_service: SupabaseService = Depends(get_supabase_service),
) -> APIResponse:
    client = supabase_service.get_client()
    try:
        result = client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise AuthenticationError("Email ou senha inválidos.") from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if session is None or user is None:
        raise AuthenticationError("Email ou senha inválidos.")

    login_response = LoginResponse(
        access_token=session.access_token,
        user=StaffUser(id=str(user.id), email=str(user.email or payload.email)),
    )
    return APIResponse(
        message="Autenticação realizada com sucesso.",
        data=login_response.model_dump(),
    )
