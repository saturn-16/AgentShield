from fastapi import HTTPException, status

class AgentShieldError(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code

class AuthenticationError(AgentShieldError):
    def __init__(self, detail: str = "Authentication failed", error_code: str = "AUTHENTICATION_FAILED"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, error_code)

class AuthorizationError(AgentShieldError):
    def __init__(self, detail: str = "Not authorized to access this resource", error_code: str = "AUTHORIZATION_FAILED"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, error_code)

class NotFoundError(AgentShieldError):
    def __init__(self, detail: str = "Resource not found", error_code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, error_code)

class ValidationError(AgentShieldError):
    def __init__(self, detail: str = "Validation failed", error_code: str = "VALIDATION_FAILED"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail, error_code)

class ThreatAnalysisError(AgentShieldError):
    def __init__(self, detail: str = "Threat analysis service encountered an error", error_code: str = "THREAT_ANALYSIS_FAILED"):
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, detail, error_code)

class RateLimitError(AgentShieldError):
    def __init__(self, detail: str = "Too many requests. Please try again later.", error_code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, detail, error_code)

class ConflictError(AgentShieldError):
    def __init__(self, detail: str = "Resource already exists", error_code: str = "RESOURCE_CONFLICT"):
        super().__init__(status.HTTP_409_CONFLICT, detail, error_code)
