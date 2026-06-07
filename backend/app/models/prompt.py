import enum
from sqlalchemy import String, Enum, Integer, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Prompt(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "prompts"

    user_id: Mapped[Uuid] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    threat_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    severity: Mapped[Severity] = mapped_column(Enum(Severity), default=Severity.LOW, nullable=False)
    analysis_result: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    user = relationship("User", back_populates="prompts")
    threats = relationship("Threat", back_populates="prompt", cascade="all, delete-orphan")
