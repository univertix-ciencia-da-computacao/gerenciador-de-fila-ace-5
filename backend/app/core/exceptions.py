class AppException(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int = 400,
        code: str = "APP_ERROR",
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


class ConfigurationError(AppException):
    def __init__(self, message: str = "Configuração inválida ou incompleta.") -> None:
        super().__init__(message, status_code=503, code="CONFIGURATION_ERROR")


class ExternalServiceError(AppException):
    def __init__(self, message: str = "Falha ao acessar serviço externo.") -> None:
        super().__init__(message, status_code=502, code="EXTERNAL_SERVICE_ERROR")


class FeatureNotImplementedError(AppException):
    def __init__(
        self,
        message: str = "Funcionalidade prevista, mas ainda não implementada.",
    ) -> None:
        super().__init__(message, status_code=501, code="NOT_IMPLEMENTED")
