from sqlalchemy import String, Integer, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class TrustScore(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trust_scores"

    user_id: Mapped[Uuid] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id: Mapped[str] = mapped_column(String(255), nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    factors: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    user = relationship("User", back_populates="trust_scores")
