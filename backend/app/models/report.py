import enum
from sqlalchemy import String, Enum, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class ReportType(str, enum.Enum):
    SCAN_SUMMARY = "scan_summary"
    THREAT_ASSESSMENT = "threat_assessment"
    COMPLIANCE = "compliance"
    AGENT_ANALYSIS = "agent_analysis"

class GeneratedBy(str, enum.Enum):
    MANUAL = "manual"
    AGENT = "agent"

class Report(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reports"

    user_id: Mapped[Uuid] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    report_type: Mapped[ReportType] = mapped_column(Enum(ReportType), nullable=False)
    generated_by: Mapped[GeneratedBy] = mapped_column(Enum(GeneratedBy), default=GeneratedBy.MANUAL, nullable=False)
    metadata_: Mapped[dict] = mapped_column(JSON, name="metadata", nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
