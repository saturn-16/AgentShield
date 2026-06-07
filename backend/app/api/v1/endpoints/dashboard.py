from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.dashboard import DashboardResponse, DashboardStats, ScanActivityPoint, ThreatDistItem
from app.repositories.prompt import PromptRepository
from app.repositories.url_scan import UrlScanRepository
from app.repositories.trust import TrustScoreRepository
from app.repositories.threat import ThreatRepository
from app.models.user import User
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    prompt_repo = PromptRepository(session)
    url_repo = UrlScanRepository(session)
    trust_repo = TrustScoreRepository(session)
    threat_repo = ThreatRepository(session)

    # 1. Total Scans count
    total_prompts = await prompt_repo.count(user_id=current_user.id)
    total_urls = await url_repo.count(user_id=current_user.id)
    total_scans = total_prompts + total_urls

    # 2. Average Trust Score
    latest_trust = await trust_repo.get_latest(current_user.id)
    avg_trust = latest_trust.score if latest_trust else 100

    # 3. Threats detected count
    from sqlalchemy import select, func
    from app.models.prompt import Prompt
    
    threat_query = select(func.count()).select_from(Prompt).where(Prompt.user_id == current_user.id).where(Prompt.threat_score > 30)
    threat_res = await session.execute(threat_query)
    threats_detected = threat_res.scalar() or 0

    # 4. Scans today & Threats today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    scans_today_prompts = await prompt_repo.count(user_id=current_user.id, created_at=today_start)
    scans_today_urls = await url_repo.count(user_id=current_user.id, created_at=today_start)
    scans_today = scans_today_prompts + scans_today_urls

    threat_today_query = select(func.count()).select_from(Prompt).where(Prompt.user_id == current_user.id).where(Prompt.created_at >= today_start).where(Prompt.threat_score > 30)
    threat_today_res = await session.execute(threat_today_query)
    threats_today = threat_today_res.scalar() or 0

    stats = DashboardStats(
        total_scans=total_scans,
        threats_detected=threats_detected,
        average_trust_score=avg_trust,
        active_agents=4, # Hardcoded constant for the security swarm
        scans_today=scans_today,
        threats_today=threats_today
    )

    # 5. Scan Activity (7-day timeline timeline)
    activity = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # Query counts inside this time window
        p_query = select(func.count()).select_from(Prompt).where(Prompt.user_id == current_user.id).where(Prompt.created_at >= day_start).where(Prompt.created_at < day_end)
        p_res = await session.execute(p_query)
        p_count = p_res.scalar() or 0

        from app.models.url_scan import UrlScan
        u_query = select(func.count()).select_from(UrlScan).where(UrlScan.user_id == current_user.id).where(UrlScan.created_at >= day_start).where(UrlScan.created_at < day_end)
        u_res = await session.execute(u_query)
        u_count = u_res.scalar() or 0

        activity.append(
            ScanActivityPoint(
                date=day_start.strftime("%b %d"),
                prompt_scans=p_count,
                url_scans=u_count
            )
        )

    # 6. Threat distribution
    raw_dist = await threat_repo.get_threat_distribution(days=30)
    threat_distribution = [
        ThreatDistItem(
            category=item["category"],
            count=item["count"],
            percentage=item["percentage"]
        ) for item in raw_dist
    ]

    # If distribution is empty, populate standard default categories for neat visual initialization
    if not threat_distribution:
        threat_distribution = [
            ThreatDistItem(category="Prompt Injection", count=0, percentage=0.0),
            ThreatDistItem(category="Jailbreak Bypass", count=0, percentage=0.0),
            ThreatDistItem(category="Data Leakage", count=0, percentage=0.0),
            ThreatDistItem(category="Malicious URL", count=0, percentage=0.0)
        ]

    # 7. Recent threats list
    recent_prompts = await prompt_repo.get_multi(
        skip=0, 
        limit=5, 
        user_id=current_user.id, 
        order_by=Prompt.created_at.desc()
    )
    
    recent_threats_list = []
    for rp in recent_prompts:
        if rp.threat_score > 30:
            patterns = rp.analysis_result.get("detected_patterns", [])
            p_name = "Prompt Anomaly"
            if patterns and isinstance(patterns, list) and len(patterns) > 0:
                p_name = patterns[0].get("name") or patterns[0].get("pattern_name") or "Prompt Anomaly"
                
            recent_threats_list.append({
                "id": str(rp.id),
                "type": p_name,
                "threat_score": rp.threat_score,
                "severity": rp.severity.value,
                "created_at": rp.created_at.isoformat()
            })

    return DashboardResponse(
        stats=stats,
        scan_activity=activity,
        threat_distribution=threat_distribution,
        recent_threats=recent_threats_list
    )
