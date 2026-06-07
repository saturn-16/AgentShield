import enum
from sqlalchemy import String, Enum, Integer, Float, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class Classification(str, enum.Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"

class UrlScan(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "url_scans"

    user_id: Mapped[Uuid] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    domain_age_days: Mapped[int] = mapped_column(Integer, nullable=True)
    reputation_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    classification: Mapped[Classification] = mapped_column(Enum(Classification), default=Classification.SAFE, nullable=False)
    indicators: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    user = relationship("User", back_populates="url_scans")
