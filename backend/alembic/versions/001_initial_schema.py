"""Initial schema — all core AgentShield tables

Revision ID: 001
Revises: None
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all core tables for AgentShield AI."""

    # ── users ────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("role", sa.String(50), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("api_key", sa.String(255), nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_api_key", "users", ["api_key"], unique=True)

    # ── prompts ──────────────────────────────────────────────
    op.create_table(
        "prompts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sanitized_content", sa.Text(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("risk_level", sa.String(20), nullable=False, server_default="low"),
        sa.Column("is_blocked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("analysis_details", postgresql.JSONB(), nullable=True),
        sa.Column("model_target", sa.String(100), nullable=True),
        sa.Column("source_ip", sa.String(45), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_prompts_user_id", "prompts", ["user_id"])
    op.create_index("ix_prompts_risk_level", "prompts", ["risk_level"])
    op.create_index("ix_prompts_created_at", "prompts", ["created_at"])

    # ── threats ──────────────────────────────────────────────
    op.create_table(
        "threats",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("prompt_id", sa.Integer(), sa.ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("threat_type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("matched_pattern", sa.Text(), nullable=True),
        sa.Column("mitigation", sa.Text(), nullable=True),
        sa.Column("mitre_tactic", sa.String(100), nullable=True),
        sa.Column("mitre_technique", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_threats_prompt_id", "threats", ["prompt_id"])
    op.create_index("ix_threats_threat_type", "threats", ["threat_type"])
    op.create_index("ix_threats_severity", "threats", ["severity"])

    # ── url_scans ────────────────────────────────────────────
    op.create_table(
        "url_scans",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("domain", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("risk_level", sa.String(20), nullable=False, server_default="low"),
        sa.Column("is_malicious", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("ssl_valid", sa.Boolean(), nullable=True),
        sa.Column("domain_age_days", sa.Integer(), nullable=True),
        sa.Column("redirect_chain", postgresql.JSONB(), nullable=True),
        sa.Column("scan_results", postgresql.JSONB(), nullable=True),
        sa.Column("screenshot_url", sa.Text(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_url_scans_user_id", "url_scans", ["user_id"])
    op.create_index("ix_url_scans_domain", "url_scans", ["domain"])
    op.create_index("ix_url_scans_risk_level", "url_scans", ["risk_level"])

    # ── security_events ──────────────────────────────────────
    op.create_table(
        "security_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("source_ip", sa.String(45), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_security_events_user_id", "security_events", ["user_id"])
    op.create_index("ix_security_events_event_type", "security_events", ["event_type"])
    op.create_index("ix_security_events_severity", "security_events", ["severity"])
    op.create_index("ix_security_events_created_at", "security_events", ["created_at"])
    op.create_index("ix_security_events_is_resolved", "security_events", ["is_resolved"])

    # ── trust_scores ─────────────────────────────────────────
    op.create_table(
        "trust_scores",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_identifier", sa.String(255), nullable=False),
        sa.Column("overall_score", sa.Float(), nullable=False, server_default=sa.text("50.0")),
        sa.Column("behavior_score", sa.Float(), nullable=False, server_default=sa.text("50.0")),
        sa.Column("compliance_score", sa.Float(), nullable=False, server_default=sa.text("50.0")),
        sa.Column("reliability_score", sa.Float(), nullable=False, server_default=sa.text("50.0")),
        sa.Column("history", postgresql.JSONB(), nullable=True),
        sa.Column("last_evaluated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("evaluation_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_trust_scores_user_id", "trust_scores", ["user_id"])
    op.create_index("ix_trust_scores_agent_identifier", "trust_scores", ["agent_identifier"])
    op.create_index("ix_trust_scores_overall_score", "trust_scores", ["overall_score"])

    # ── agent_actions ────────────────────────────────────────
    op.create_table(
        "agent_actions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_identifier", sa.String(255), nullable=False),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("action_description", sa.Text(), nullable=True),
        sa.Column("input_data", postgresql.JSONB(), nullable=True),
        sa.Column("output_data", postgresql.JSONB(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=True),
        sa.Column("approved_by", sa.String(100), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("parent_action_id", sa.Integer(), sa.ForeignKey("agent_actions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_agent_actions_user_id", "agent_actions", ["user_id"])
    op.create_index("ix_agent_actions_agent_identifier", "agent_actions", ["agent_identifier"])
    op.create_index("ix_agent_actions_action_type", "agent_actions", ["action_type"])
    op.create_index("ix_agent_actions_status", "agent_actions", ["status"])
    op.create_index("ix_agent_actions_created_at", "agent_actions", ["created_at"])

    # ── reports ──────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("report_type", sa.String(50), nullable=False),
        sa.Column("format", sa.String(20), nullable=False, server_default="pdf"),
        sa.Column("content", postgresql.JSONB(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("date_range_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("date_range_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_prompts_analyzed", sa.Integer(), nullable=True),
        sa.Column("total_threats_detected", sa.Integer(), nullable=True),
        sa.Column("total_urls_scanned", sa.Integer(), nullable=True),
        sa.Column("risk_distribution", postgresql.JSONB(), nullable=True),
        sa.Column("file_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="generating"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_reports_user_id", "reports", ["user_id"])
    op.create_index("ix_reports_report_type", "reports", ["report_type"])
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])


def downgrade() -> None:
    """Drop all core tables in reverse dependency order."""
    op.drop_table("reports")
    op.drop_table("agent_actions")
    op.drop_table("trust_scores")
    op.drop_table("security_events")
    op.drop_table("url_scans")
    op.drop_table("threats")
    op.drop_table("prompts")
    op.drop_table("users")
