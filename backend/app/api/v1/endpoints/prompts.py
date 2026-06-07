import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.prompt import PromptScanRequest, PromptScanResponse, PromptHistoryResponse
from app.services.prompt_analysis import PromptAnalysisService
from app.repositories.prompt import PromptRepository
from app.repositories.threat import ThreatRepository
from app.models.user import User
from app.models.prompt import Severity

router = APIRouter()

@router.post("/scan", response_model=PromptScanResponse, status_code=status.HTTP_200_OK)
async def scan_prompt(
    data: PromptScanRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    # Run analysis
    analysis_service = PromptAnalysisService()
    result = analysis_service.analyze(data.content)
    
    # Save prompt to database
    prompt_repo = PromptRepository(session)
    prompt = await prompt_repo.create(
        user_id=current_user.id,
        content=data.content,
        threat_score=result["threat_score"],
        severity=result["severity"],
        analysis_result=result
    )
    
    # Save individual threats details
    threat_repo = ThreatRepository(session)
    patterns_mapped = []
    for p in result.get("detected_patterns", []):
        pattern_name = p.get("name") or p.get("pattern_name")
        await threat_repo.create(
            prompt_id=prompt.id,
            threat_type=pattern_name,
            confidence=0.9, # Rule confidence
            category=p.get("category", "GENERAL"),
            risk_level=p.get("severity", Severity.LOW),
            details={"matched_text": p.get("matched_text", ""), "description": p.get("description", "")}
        )
        patterns_mapped.append({
            "pattern_name": pattern_name,
            "matched_text": p.get("matched_text", ""),
            "severity": p.get("severity", Severity.LOW),
            "description": p.get("description", "")
        })

    # Trigger real-time WebSocket broadcast if a high threat score is flagged
    if prompt.threat_score > 30:
        from app.api.v1.endpoints.threats import broadcast_threat_alert
        try:
            await broadcast_threat_alert({
                "id": str(prompt.id),
                "content": prompt.content[:100] + "...",
                "threat_score": prompt.threat_score,
                "severity": prompt.severity.value,
                "created_at": prompt.created_at.isoformat()
            })
        except Exception as e:
            pass # Fail silently so scanner transaction isn't broken by broadcast glitches

    return PromptScanResponse(
        id=prompt.id,
        content=prompt.content,
        threat_score=prompt.threat_score,
        severity=prompt.severity,
        detected_patterns=patterns_mapped,
        explanation=result["explanation"],
        recommended_action=result["recommended_action"],
        created_at=prompt.created_at
    )

@router.post("/analyze", response_model=dict, status_code=status.HTTP_200_OK)
async def analyze_prompt(
    data: PromptScanRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    # Run analysis
    analysis_service = PromptAnalysisService()
    result = analysis_service.analyze(data.content)
    
    # Save prompt to database
    prompt_repo = PromptRepository(session)
    prompt = await prompt_repo.create(
        user_id=current_user.id,
        content=data.content,
        threat_score=result["threat_score"],
        severity=result["severity"],
        analysis_result=result
    )
    
    # Save individual threats details
    threat_repo = ThreatRepository(session)
    threats_list = []
    for p in result.get("detected_patterns", []):
        pattern_name = p.get("name") or p.get("pattern_name")
        await threat_repo.create(
            prompt_id=prompt.id,
            threat_type=pattern_name,
            confidence=0.9, # Rule confidence
            category=p.get("category", "GENERAL"),
            risk_level=p.get("severity", Severity.LOW),
            details={"matched_text": p.get("matched_text", ""), "description": p.get("description", "")}
        )
        threats_list.append({
            "threat_type": pattern_name,
            "confidence": 0.9,
            "category": p.get("category", "GENERAL"),
            "details": {"matched_text": p.get("matched_text", ""), "description": p.get("description", "")}
        })

    # Trigger real-time WebSocket broadcast if a high threat score is flagged
    if prompt.threat_score > 30:
        from app.api.v1.endpoints.threats import broadcast_threat_alert
        try:
            await broadcast_threat_alert({
                "id": str(prompt.id),
                "content": prompt.content[:100] + "...",
                "threat_score": prompt.threat_score,
                "severity": prompt.severity.value,
                "created_at": prompt.created_at.isoformat()
            })
        except Exception as e:
            pass

    risk_score = result["threat_score"] / 100.0
    risk_level = result["severity"].value if hasattr(result["severity"], "value") else result["severity"]
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "is_blocked": risk_score >= 0.7,
        "threats": threats_list
    }

@router.get("/history", response_model=PromptHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    prompt_repo = PromptRepository(session)
    skip = (page - 1) * per_page
    
    items = await prompt_repo.get_user_prompts(current_user.id, skip=skip, limit=per_page)
    total = await prompt_repo.count(user_id=current_user.id)
    
    # Adapt to response schema
    scan_responses = []
    for item in items:
        # Re-aggregate detected patterns from database
        detected = item.analysis_result.get("detected_patterns", [])
        detected_mapped = []
        for p in detected:
            detected_mapped.append({
                "pattern_name": p.get("name") or p.get("pattern_name"),
                "matched_text": p.get("matched_text", ""),
                "severity": p.get("severity", "low"),
                "description": p.get("description", "")
            })
        scan_responses.append(
            PromptScanResponse(
                id=item.id,
                content=item.content,
                threat_score=item.threat_score,
                severity=item.severity,
                detected_patterns=detected_mapped,
                explanation=item.analysis_result.get("explanation", ""),
                recommended_action=item.analysis_result.get("recommended_action", ""),
                created_at=item.created_at
            )
        )
        
    return PromptHistoryResponse(
        items=scan_responses,
        total=total,
        page=page,
        per_page=per_page
    )
