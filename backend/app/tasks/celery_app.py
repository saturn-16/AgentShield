import os
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "agentshield_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_BROKER_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Automatically autodiscover tasks
celery_app.autodiscover_tasks(["app.tasks"])
