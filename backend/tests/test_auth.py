"""
Authentication endpoint tests — AgentShield AI
===============================================
Tests cover registration, login, token refresh, and current-user retrieval.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestUserRegistration:
    """Tests for POST /api/v1/auth/register"""

    async def test_register_user(self, client: AsyncClient):
        """Successful registration returns 201 with user data."""
        payload = {
            "email": "newuser@example.com",
            "password": "SecurePassword123!",
            "full_name": "New User",
            "company": "TestCorp",
        }
        response = await client.post("/api/v1/auth/register", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert "id" in data
        # Password should NEVER be returned
        assert "password" not in data
        assert "hashed_password" not in data

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: dict):
        """Registering with an existing email returns 409 Conflict."""
        payload = {
            "email": test_user["email"],
            "password": "AnotherPassword123!",
            "full_name": "Duplicate User",
        }
        response = await client.post("/api/v1/auth/register", json=payload)

        assert response.status_code == 409
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_weak_password(self, client: AsyncClient):
        """Registration with a weak password returns 422."""
        payload = {
            "email": "weakpass@example.com",
            "password": "123",
            "full_name": "Weak Password",
        }
        response = await client.post("/api/v1/auth/register", json=payload)

        assert response.status_code == 422

    async def test_register_invalid_email(self, client: AsyncClient):
        """Registration with an invalid email format returns 422."""
        payload = {
            "email": "not-an-email",
            "password": "SecurePassword123!",
            "full_name": "Invalid Email",
        }
        response = await client.post("/api/v1/auth/register", json=payload)

        assert response.status_code == 422


@pytest.mark.asyncio
class TestUserLogin:
    """Tests for POST /api/v1/auth/login"""

    async def test_login_valid_credentials(self, client: AsyncClient, test_user: dict):
        """Successful login returns 200 with access and refresh tokens."""
        payload = {
            "email": test_user["email"],
            "password": test_user["password"],
        }
        response = await client.post("/api/v1/auth/login", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client: AsyncClient, test_user: dict):
        """Login with wrong password returns 401 Unauthorized."""
        payload = {
            "email": test_user["email"],
            "password": "WrongPassword999!",
        }
        response = await client.post("/api/v1/auth/login", json=payload)

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Login with a non-existent email returns 401."""
        payload = {
            "email": "ghost@nowhere.com",
            "password": "GhostPassword123!",
        }
        response = await client.post("/api/v1/auth/login", json=payload)

        assert response.status_code == 401


@pytest.mark.asyncio
class TestCurrentUser:
    """Tests for GET /api/v1/auth/me"""

    async def test_get_current_user(self, client: AsyncClient, test_user: dict):
        """Authenticated request to /me returns the current user's profile."""
        response = await client.get("/api/v1/auth/me", headers=test_user["headers"])

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["full_name"] == "Test User"

    async def test_get_current_user_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request to /me returns 401."""
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401

    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Request with an invalid JWT returns 401."""
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = await client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 401


@pytest.mark.asyncio
class TestTokenRefresh:
    """Tests for POST /api/v1/auth/refresh"""

    async def test_refresh_token(self, client: AsyncClient, test_user: dict):
        """Valid refresh token returns a new access token."""
        # First, login to get a refresh token
        login_payload = {
            "email": test_user["email"],
            "password": test_user["password"],
        }
        login_response = await client.post("/api/v1/auth/login", json=login_payload)
        assert login_response.status_code == 200

        refresh_token = login_response.json()["refresh_token"]

        # Use the refresh token to get a new access token
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Invalid refresh token returns 401."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid.refresh.token"},
        )

        assert response.status_code == 401
