import enum
from sqlalchemy import String, Enum, Float, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.prompt import Severity

class Threat(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "threats"

    prompt_id: Mapped[Uuid] = mapped_column(ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False, index=True)
    threat_type: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_level: Mapped[Severity] = mapped_column(Enum(Severity), default=Severity.LOW, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    prompt = relationship("Prompt", back_populates="threats")
