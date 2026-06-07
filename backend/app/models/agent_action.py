import enum
from sqlalchemy import String, Enum, Integer, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin

class AgentType(str, enum.Enum):
    SENTINEL = "sentinel"
    ANALYZER = "analyzer"
    VALIDATOR = "validator"
    REPORTER = "reporter"

class ActionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentAction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agent_actions"

    agent_type: Mapped[AgentType] = mapped_column(Enum(AgentType), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    input_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    output_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    status: Mapped[ActionStatus] = mapped_column(Enum(ActionStatus), default=ActionStatus.PENDING, nullable=False)
    reasoning_trace: Mapped[str] = mapped_column(Text, nullable=True)
    execution_time_ms: Mapped[int] = mapped_column(Integer, nullable=True)
    parent_action_id: Mapped[Uuid] = mapped_column(ForeignKey("agent_actions.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    parent = relationship("AgentAction", remote_side="AgentAction.id", backref="sub_actions")
