# ============================================================
# AgentShield AI — Makefile
# ============================================================

.PHONY: dev down backend frontend migrate makemigrations test logs clean shell dbshell lint format help

# Default target
.DEFAULT_GOAL := help

# ── Development ──────────────────────────────────────────────

dev: ## Start all services with live-reload
	docker-compose up --build

down: ## Stop all services
	docker-compose down

backend: ## Start backend + deps only (postgres, redis)
	docker-compose up backend postgres redis

frontend: ## Start frontend only
	docker-compose up frontend

# ── Database ─────────────────────────────────────────────────

migrate: ## Run all pending Alembic migrations
	docker-compose exec backend alembic upgrade head

makemigrations: ## Create a new migration (usage: make makemigrations msg="add users table")
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

# ── Testing ──────────────────────────────────────────────────

test: ## Run backend test suite
	docker-compose exec backend pytest -v --tb=short

test-cov: ## Run tests with coverage report
	docker-compose exec backend pytest -v --cov=app --cov-report=term-missing

# ── Logs & Shells ────────────────────────────────────────────

logs: ## Tail logs from all services
	docker-compose logs -f

logs-backend: ## Tail backend logs only
	docker-compose logs -f backend

shell: ## Open a bash shell in the backend container
	docker-compose exec backend bash

dbshell: ## Open psql shell in the postgres container
	docker-compose exec postgres psql -U agentshield -d agentshield

redis-cli: ## Open redis-cli in the redis container
	docker-compose exec redis redis-cli

# ── Code Quality ─────────────────────────────────────────────

lint: ## Run ruff linter on backend code
	docker-compose exec backend ruff check app/

format: ## Auto-format backend code with ruff
	docker-compose exec backend ruff format app/

# ── Cleanup ──────────────────────────────────────────────────

clean: ## Stop services, remove volumes and orphan containers
	docker-compose down -v --remove-orphans

prune: ## Full Docker cleanup (images, containers, volumes)
	docker system prune -af --volumes

# ── Help ─────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "  AgentShield AI — Available Commands"
	@echo "  ──────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
