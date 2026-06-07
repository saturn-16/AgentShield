from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from app.models.security_event import SecurityEvent, EventSeverity
from app.repositories.base import BaseRepository

class ThreatMonitorService:
    def __init__(self):
        pass

    async def get_events(
        self,
        user_id: UUID,
        severity_filter: Optional[str],
        event_type_filter: Optional[str],
        skip: int,
        limit: int,
        session: AsyncSession
    ) -> List[SecurityEvent]:
        query = select(SecurityEvent).where(SecurityEvent.user_id == user_id)
        
        if severity_filter and severity_filter.lower() != "all":
            query = query.where(SecurityEvent.severity == EventSeverity(severity_filter.lower()))
            
        if event_type_filter and event_type_filter.lower() != "all":
            query = query.where(SecurityEvent.event_type == event_type_filter)
            
        query = query.order_by(desc(SecurityEvent.created_at)).offset(skip).limit(limit)
        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_stats(
        self,
        user_id: UUID,
        days: int,
        session: AsyncSession
    ) -> Dict[str, Any]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Event type counts
        type_query = (
            select(SecurityEvent.event_type, func.count(SecurityEvent.id))
            .where(SecurityEvent.user_id == user_id)
            .where(SecurityEvent.created_at >= cutoff)
            .group_by(SecurityEvent.event_type)
        )
        type_res = await session.execute(type_query)
        type_counts = {row[0]: row[1] for row in type_res.all()}
        
        # Severity counts
        severity_query = (
            select(SecurityEvent.severity, func.count(SecurityEvent.id))
            .where(SecurityEvent.user_id == user_id)
            .where(SecurityEvent.created_at >= cutoff)
            .group_by(SecurityEvent.severity)
        )
        severity_res = await session.execute(severity_query)
        severity_counts = {row[0].value: row[1] for row in severity_res.all()}
        
        return {
            "timeframe_days": days,
            "event_counts_by_type": type_counts,
            "event_counts_by_severity": severity_counts,
            "total_events": sum(type_counts.values())
        }

    async def create_event(
        self,
        user_id: UUID,
        event_type: str,
        severity: EventSeverity,
        source: str,
        description: str,
        metadata_: dict,
        session: AsyncSession
    ) -> SecurityEvent:
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            source=source,
            description=description,
            metadata_=metadata_
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event
