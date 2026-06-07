import time
import logging
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import AgentShieldError

logger = logging.getLogger("agentshield")

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        path = request.url.path
        method = request.method
        request_id = getattr(request.state, "request_id", "unknown")
        
        logger.info(f"[{request_id}] START {method} {path}")
        
        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            logger.info(f"[{request_id}] COMPLETED {method} {path} - Status: {response.status_code} in {duration:.2f}ms")
            return response
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(f"[{request_id}] FAILED {method} {path} - Error: {str(e)} in {duration:.2f}ms")
            raise

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except AgentShieldError as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "detail": exc.detail,
                    "error": exc.detail,
                    "error_code": exc.error_code,
                    "request_id": request_id
                }
            )
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.exception(f"[{request_id}] Unhandled error occurred: {str(exc)}")
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "An unexpected server error occurred.",
                    "error": "An unexpected server error occurred.",
                    "error_code": "INTERNAL_SERVER_ERROR",
                    "request_id": request_id
                }
            )

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

def setup_cors(app: FastAPI, origins: list[str]) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(ExceptionHandlerMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestIdMiddleware)

