from fastapi import APIRouter
from app.api.v1.endpoints import auth, prompts, urls, trust, threats, reports, agents, dashboard, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["Prompt Scanner"])
api_router.include_router(urls.router, prefix="/urls", tags=["URL Scanner"])
api_router.include_router(trust.router, prefix="/trust", tags=["Trust Score"])
api_router.include_router(threats.router, prefix="/threats", tags=["Threat Monitoring"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agent Swarm"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations"])
