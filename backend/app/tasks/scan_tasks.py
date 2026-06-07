import asyncio
from typing import Dict, Any
from app.tasks.celery_app import celery_app
from app.db.session import async_session_maker
from app.services.prompt_analysis import PromptAnalysisService
from app.services.url_analysis import UrlAnalysisService
from app.agents.graph import run_swarm

def get_or_create_event_loop():
    try:
        return asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop

@celery_app.task(name="async_prompt_scan")
def async_prompt_scan(content: str) -> Dict[str, Any]:
    """
    Executes prompt scanning and pattern analysis asynchronously.
    """
    loop = get_or_create_event_loop()
    service = PromptAnalysisService()
    return loop.run_until_complete(asyncio.to_thread(service.analyze, content))

@celery_app.task(name="async_url_scan")
def async_url_scan(url: str) -> Dict[str, Any]:
    """
    Executes URL reputation scans asynchronously.
    """
    loop = get_or_create_event_loop()
    service = UrlAnalysisService()
    return loop.run_until_complete(asyncio.to_thread(service.analyze, url))

@celery_app.task(name="async_swarm_analysis")
def async_swarm_analysis(content: str, analysis_type: str = "comprehensive") -> Dict[str, Any]:
    """
    Runs the multi-agent security swarm in background Celery worker.
    """
    loop = get_or_create_event_loop()
    
    async def run():
        async with async_session_maker() as session:
            return await run_swarm(content, analysis_type, session)
            
    return loop.run_until_complete(run())
