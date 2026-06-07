import re
import math
from urllib.parse import urlparse
from typing import Dict, Any, List
from app.models.url_scan import Classification

class UrlAnalysisService:
    def __init__(self):
        # Known high-risk TLDs
        self.suspicious_tlds = {
            ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work",
            ".click", ".link", ".info", ".biz", ".date", ".party", ".science"
        }
        
        # Suspicious keywords commonly used in phishing
        self.phishing_keywords = {
            "login", "verify", "account", "secure", "update", "bank", "paypal",
            "confirm", "signin", "password", "wallet", "crypto", "signin", "support",
            "billing", "oauth", "auth", "claim", "prize", "winner", "free", "alert",
            "urgent", "reset", "legit"
        }
        
        # Whitelisted safe domains
        self.whitelisted_domains = {
            "google.com", "github.com", "microsoft.com", "apple.com", "amazon.com",
            "openai.com", "facebook.com", "linkedin.com", "twitter.com", "netflix.com",
            "youtube.com", "wikipedia.org", "yahoo.com", "zoom.us", "slack.com"
        }
        
        # Common URL shorteners
        self.shorteners = {
            "bit.ly", "goo.gl", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly", "adf.ly"
        }

    def _calculate_entropy(self, text: str) -> float:
        """
        Calculates Shannon Entropy of a string to detect randomized/obfuscated names.
        """
        if not text:
            return 0.0
        entropy = 0.0
        length = len(text)
        frequencies = {}
        for char in text:
            frequencies[char] = frequencies.get(char, 0) + 1
        for count in frequencies.values():
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 2)

    def _check_homograph_attack(self, domain: str) -> bool:
        """
        Detects mixed-script or homograph attacks (e.g., Cyrillic characters that look like Latin).
        """
        # If it starts with xn-- (Punycode representation), it is an IDN which is highly suspicious
        if domain.startswith("xn--"):
            return True
            
        # Detect mixing of different character scripts
        has_latin = bool(re.search(r'[a-zA-Z]', domain))
        has_cyrillic = bool(re.search(r'[\u0400-\u04FF]', domain))
        has_greek = bool(re.search(r'[\u0370-\u03FF]', domain))
        
        # If there's script mixing, mark it as highly suspicious
        if sum([has_latin, has_cyrillic, has_greek]) >= 2:
            return True
            
        # Check for visual similarity tricks, like rn looking like m, or 1 vs l
        # These are usually checked contextually or by lookalikes
        return False

    def analyze(self, url: str) -> Dict[str, Any]:
        parsed = urlparse(url)
        
        # Check for data URI scheme
        if parsed.scheme == "data":
            return {
                "classification": Classification.MALICIOUS,
                "reputation_score": 0.0,
                "domain": "data-uri",
                "domain_age_days": 0,
                "indicators": [
                    {
                        "name": "Data URI Scheme Detection",
                        "value": "Failed (Unsafe scheme)",
                        "risk_contribution": "-100.0"
                    }
                ]
            }

        # Handle cases where protocol is omitted
        if not parsed.scheme:
            parsed = urlparse(f"http://{url}")
            
        # Check for embedded credentials
        has_credentials = False
        if parsed.username or parsed.password or (parsed.netloc and "@" in parsed.netloc):
            has_credentials = True

        domain = parsed.hostname.lower() if parsed.hostname else parsed.netloc.lower()
        if not domain:
            domain = parsed.path.lower()
            
        # Port stripping
        if ":" in domain:
            domain = domain.split(":")[0]

        indicators: List[Dict[str, str]] = []
        reputation_score = 100.0
        
        # 1. Whitelist Check
        # Match base domains (e.g. docs.google.com matches google.com)
        is_whitelisted = False
        for wd in self.whitelisted_domains:
            if domain == wd or domain.endswith(f".{wd}"):
                is_whitelisted = True
                break
                
        if is_whitelisted:
            return {
                "classification": Classification.SAFE,
                "reputation_score": 100.0,
                "domain": domain,
                "domain_age_days": 4250, # Simulated mature age
                "indicators": [
                    {
                        "name": "Whitelisted Domain",
                        "value": "Passed",
                        "risk_contribution": "0.0"
                    }
                ]
            }

        # 2. Credentials Check
        if has_credentials:
            reputation_score -= 50.0
            indicators.append({
                "name": "Embedded Credentials in URL",
                "value": "Failed (Highly suspicious phishing/exfiltration vector)",
                "risk_contribution": "-50.0"
            })

        # 3. IP Address Domain Check
        is_ip = bool(re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', domain))
        if is_ip:
            reputation_score -= 40.0
            indicators.append({
                "name": "IP-Based Hostname",
                "value": "Failed",
                "risk_contribution": "-40.0"
            })

        # 4. TLD Check
        tld_match = re.search(r'\.[a-z]{2,15}$', domain)
        if tld_match:
            tld = tld_match.group(0)
            if tld in self.suspicious_tlds:
                reputation_score -= 40.0
                indicators.append({
                    "name": "Untrusted TLD",
                    "value": f"Failed ({tld})",
                    "risk_contribution": "-40.0"
                })

        # 5. Keyword Check in URL
        matched_keywords = []
        full_url_lower = url.lower()
        for kw in self.phishing_keywords:
            if kw in full_url_lower:
                matched_keywords.append(kw)
                
        if matched_keywords:
            penalty = min(len(matched_keywords) * 15.0, 45.0)
            reputation_score -= penalty
            indicators.append({
                "name": "Phishing Keywords Detected",
                "value": f"Failed (Found: {', '.join(matched_keywords)})",
                "risk_contribution": f"-{penalty}"
            })

        # 6. Homograph Attack Check
        if self._check_homograph_attack(domain):
            reputation_score -= 35.0
            indicators.append({
                "name": "Homograph Spoofing Attack",
                "value": "Failed (Script Mixing / Visual Spoof)",
                "risk_contribution": "-35.0"
            })

        # 7. Domain Entropy Check
        domain_entropy = self._calculate_entropy(domain)
        if domain_entropy > 4.2:
            reputation_score -= 15.0
            indicators.append({
                "name": "High Domain Name Entropy",
                "value": f"Failed (Entropy: {domain_entropy})",
                "risk_contribution": "-15.0"
            })

        # 8. Excess Subdomains Check
        subdomains = domain.split(".")
        if len(subdomains) > 4:
            reputation_score -= 15.0
            indicators.append({
                "name": "Excessive Subdomains",
                "value": f"Failed (Subdomains count: {len(subdomains)-2})",
                "risk_contribution": "-15.0"
            })

        # 9. URL Shortener Check
        if domain in self.shorteners:
            reputation_score -= 20.0
            indicators.append({
                "name": "URL Shortener Service",
                "value": "Failed (Obfuscated destination)",
                "risk_contribution": "-20.0"
            })

        # Final Score clamp
        reputation_score = max(0.0, min(100.0, reputation_score))
        
        # Classification
        if reputation_score >= 75.0:
            classification = Classification.SAFE
        elif reputation_score >= 45.0:
            classification = Classification.SUSPICIOUS
        else:
            classification = Classification.MALICIOUS

        # Simulated WHOIS domain age based on reputation
        simulated_age = int(reputation_score * 12.5) if classification == Classification.SAFE else int(reputation_score * 1.5)

        return {
            "classification": classification,
            "reputation_score": reputation_score,
            "domain": domain,
            "domain_age_days": simulated_age,
            "indicators": indicators or [{
                "name": "Clean URL Assessment",
                "value": "Passed",
                "risk_contribution": "0.0"
            }]
        }
