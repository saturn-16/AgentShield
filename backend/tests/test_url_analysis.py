"""
URL Analysis endpoint tests — AgentShield AI
=============================================
Tests cover URL threat detection categories:
- Safe/trusted domains
- Suspicious domains with red-flag keywords
- Malicious IP-based URLs with phishing indicators
- Known safe domain allowlisting
- Suspicious TLD detection
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestSafeURL:
    """Tests for URLs that should be classified as safe."""

    async def test_safe_url(self, client: AsyncClient, test_user: dict):
        """A well-known safe URL (google.com) returns low risk."""
        payload = {"url": "https://www.google.com"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "low"
        assert data["risk_score"] < 0.3
        assert data["is_malicious"] is False

    async def test_safe_url_github(self, client: AsyncClient, test_user: dict):
        """GitHub URL is classified as safe."""
        payload = {"url": "https://github.com/microsoft/vscode"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "low"
        assert data["is_malicious"] is False

    async def test_safe_url_microsoft(self, client: AsyncClient, test_user: dict):
        """Microsoft domain URL is classified as safe."""
        payload = {"url": "https://learn.microsoft.com/en-us/azure/"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "low"
        assert data["is_malicious"] is False


@pytest.mark.asyncio
class TestSuspiciousURL:
    """Tests for URLs with suspicious characteristics."""

    async def test_suspicious_url(self, client: AsyncClient, test_user: dict):
        """Unknown domain with suspicious keywords is flagged as suspicious."""
        payload = {"url": "https://free-crypto-reward-claim.xyz/login-verify"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ("medium", "high", "critical")
        assert data["risk_score"] >= 0.4

    async def test_suspicious_url_with_login_mimicry(self, client: AsyncClient, test_user: dict):
        """URL mimicking a login page of a known brand is flagged."""
        payload = {"url": "https://microsoft-account-verify.tk/signin"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ("medium", "high", "critical")
        assert data["risk_score"] >= 0.5

    async def test_suspicious_subdomain_abuse(self, client: AsyncClient, test_user: dict):
        """Excessive subdomain depth can indicate phishing."""
        payload = {"url": "https://secure.login.account.microsoft.phish-domain.com/auth"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] >= 0.3


@pytest.mark.asyncio
class TestMaliciousURL:
    """Tests for clearly malicious URLs."""

    async def test_malicious_url(self, client: AsyncClient, test_user: dict):
        """IP-based URL with phishing indicators is flagged as malicious."""
        payload = {"url": "http://192.168.1.100:8080/banking/login.php?redirect=true"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ("high", "critical")
        assert data["risk_score"] >= 0.7
        assert data["is_malicious"] is True

    async def test_malicious_data_uri(self, client: AsyncClient, test_user: dict):
        """Data URI scheme used for phishing is flagged."""
        payload = {"url": "data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4="}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ("high", "critical")
        assert data["is_malicious"] is True

    async def test_malicious_url_with_credentials(self, client: AsyncClient, test_user: dict):
        """URL containing embedded credentials is flagged."""
        payload = {"url": "https://admin:password@evil-site.com/steal-data"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] >= 0.6


@pytest.mark.asyncio
class TestKnownSafeDomain:
    """Tests for allowlisted / known-safe domains."""

    async def test_known_safe_domain(self, client: AsyncClient, test_user: dict):
        """Well-known safe domains should be fast-tracked as safe."""
        safe_domains = [
            "https://www.google.com/search?q=test",
            "https://stackoverflow.com/questions/tagged/python",
            "https://docs.python.org/3/library/asyncio.html",
        ]
        for url in safe_domains:
            payload = {"url": url}
            response = await client.post(
                "/api/v1/urls/scan",
                json=payload,
                headers=test_user["headers"],
            )

            assert response.status_code == 200
            data = response.json()
            assert data["risk_level"] == "low", f"Expected 'low' for {url}, got {data['risk_level']}"
            assert data["is_malicious"] is False


@pytest.mark.asyncio
class TestSuspiciousTLD:
    """Tests for URLs with suspicious top-level domains."""

    async def test_suspicious_tld(self, client: AsyncClient, test_user: dict):
        """Domains with suspicious TLDs (.tk, .ml, .ga, .cf) get higher risk scores."""
        suspicious_urls = [
            "https://free-prize-winner.tk/claim",
            "https://secure-login-update.ml/verify",
            "https://account-alert.ga/confirm",
            "https://urgent-security.cf/reset",
        ]
        for url in suspicious_urls:
            payload = {"url": url}
            response = await client.post(
                "/api/v1/urls/scan",
                json=payload,
                headers=test_user["headers"],
            )

            assert response.status_code == 200
            data = response.json()
            assert data["risk_score"] >= 0.4, (
                f"Expected risk_score >= 0.4 for {url}, got {data['risk_score']}"
            )

    async def test_suspicious_tld_with_https(self, client: AsyncClient, test_user: dict):
        """HTTPS on a suspicious TLD should not override TLD risk."""
        payload = {"url": "https://totally-legit-bank.tk/secure-login"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 200
        data = response.json()
        # HTTPS alone should not make a suspicious TLD safe
        assert data["risk_score"] >= 0.3


@pytest.mark.asyncio
class TestURLAnalysisAuth:
    """Tests for authentication on the URL analysis endpoint."""

    async def test_scan_unauthenticated(self, client: AsyncClient):
        """URL scan without auth returns 401."""
        payload = {"url": "https://example.com"}
        response = await client.post("/api/v1/urls/scan", json=payload)

        assert response.status_code == 401

    async def test_scan_invalid_url(self, client: AsyncClient, test_user: dict):
        """Malformed URL returns 422 validation error."""
        payload = {"url": "not-a-valid-url"}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 422

    async def test_scan_empty_url(self, client: AsyncClient, test_user: dict):
        """Empty URL returns 422 validation error."""
        payload = {"url": ""}
        response = await client.post(
            "/api/v1/urls/scan",
            json=payload,
            headers=test_user["headers"],
        )

        assert response.status_code == 422
