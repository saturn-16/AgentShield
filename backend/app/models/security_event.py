import enum
from sqlalchemy import String, Enum, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class EventSeverity(str, enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SecurityEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "security_events"

    user_id: Mapped[Uuid] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[EventSeverity] = mapped_column(Enum(EventSeverity), default=EventSeverity.INFO, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column(JSON, name="metadata", nullable=False)

    # Relationships
    user = relationship("User", back_populates="security_events")
