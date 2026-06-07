from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from app.repositories.prompt import PromptRepository
from app.repositories.url_scan import UrlScanRepository
from app.repositories.trust import TrustScoreRepository
from app.models.trust_score import TrustScore
from app.models.prompt import Severity

class TrustScoringService:
    def __init__(self):
        pass

    async def calculate(self, user_id: UUID, session: AsyncSession) -> Dict[str, Any]:
        prompt_repo = PromptRepository(session)
        url_repo = UrlScanRepository(session)
        trust_repo = TrustScoreRepository(session)

        # 1. Prompt Safety Factor (avg prompt cleanliness, last 50 prompts)
        prompts = await prompt_repo.get_user_prompts(user_id, limit=50)
        if prompts:
            prompt_safety = sum(100 - p.threat_score for p in prompts) / len(prompts)
        else:
            prompt_safety = 100.0 # Clean slate for new accounts

        # 2. URL Safety Factor (avg reputation score, last 50 url scans)
        urls = await url_repo.get_user_scans(user_id, limit=50)
        if urls:
            url_safety = sum(u.reputation_score for u in urls) / len(urls)
        else:
            url_safety = 100.0 # Clean slate

        # 3. Leakage Risk Factor (100 - penalty based on frequency of data leak alerts in prompt logs)
        leakage_count = sum(
            1 for p in prompts 
            if p.analysis_result.get("leaks_found") and len(p.analysis_result.get("leaks_found")) > 0
        )
        # 15 points penalty per leakage, up to 100 max penalty
        leakage_risk = max(0.0, 100.0 - (leakage_count * 15.0))

        # 4. Behavioral Risk Factor (high/critical alerts presence)
        critical_count = sum(1 for p in prompts if p.severity == Severity.CRITICAL)
        high_count = sum(1 for p in prompts if p.severity == Severity.HIGH)
        
        behavioral_risk = max(0.0, 100.0 - (critical_count * 25.0) - (high_count * 10.0))

        # Weighted calculation
        # prompt_safety (35%), url_safety (25%), leakage_risk (25%), behavioral_risk (15%)
        composite_score = int(
            (0.35 * prompt_safety) +
            (0.25 * url_safety) +
            (0.25 * leakage_risk) +
            (0.15 * behavioral_risk)
        )
        
        # Clamp composite score
        composite_score = max(0, min(100, composite_score))

        # Classification
        if composite_score >= 80:
            classification = "excellent"
        elif composite_score >= 60:
            classification = "good"
        elif composite_score >= 40:
            classification = "moderate"
        elif composite_score >= 20:
            classification = "poor"
        else:
            classification = "critical"

        factors = {
            "prompt_safety": round(prompt_safety, 1),
            "url_safety": round(url_safety, 1),
            "leakage_risk": round(leakage_risk, 1),
            "behavioral_risk": round(behavioral_risk, 1)
        }

        # Save to DB
        trust_record = await trust_repo.create(
            user_id=user_id,
            score=composite_score,
            factors=factors
        )

        # Get trend (last 30 trust score calculations)
        trend_records = await trust_repo.get_trend(user_id, days=30)
        trend = [
            {"score": t.score, "created_at": t.created_at} 
            for t in trend_records[-30:]
        ]
        
        # If trend is empty, bootstrap with current
        if not trend:
            trend = [{"score": composite_score, "created_at": datetime.now(timezone.utc)}]

        return {
            "id": trust_record.id,
            "score": composite_score,
            "factors": factors,
            "risk_classification": classification,
            "trend": trend,
            "created_at": trust_record.created_at
        }
