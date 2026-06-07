import re
from typing import Dict, Any, List

class DataLeakageService:
    def __init__(self):
        # Precise compiled regex patterns for secret structures
        self.patterns = {
            "AWS_ACCESS_KEY": re.compile(r'\b(AKIA|ASCA|AGPA|AIDA)[0-9A-Z]{16}\b'),
            "AWS_SECRET_KEY": re.compile(r'\b[A-Za-z0-9+/]{40}\b'),
            "OPENAI_API_KEY": re.compile(r'\bsk-[a-zA-Z0-9]{48,}\b'),
            "STRIPE_API_KEY": re.compile(r'\bsk_(test|live)_[0-9a-zA-Z]{24,}\b'),
            "GITHUB_PAT": re.compile(r'\bgh[pso]_[a-zA-Z0-9]{36,}\b'),
            "GOOGLE_OAUTH_TOKEN": re.compile(r'\bya29\.[a-zA-Z0-9_-]{50,}\b'),
            "JWT_TOKEN": re.compile(r'\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b'),
            "PEM_PRIVATE_KEY": re.compile(r'-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----[A-Za-z0-9+/\s=]+-----END (?:RSA |EC |DSA )?PRIVATE KEY-----', re.MULTILINE),
            "DATABASE_CONNECTION": re.compile(r'\b(?:postgresql|mysql|mongodb|redis|mssql)://[A-Za-z0-9_.-]+:[^@]+@[A-Za-z0-9_.-]+:\d+/[A-Za-z0-9_.-]+\b'),
            "US_SSN": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
            "EMAIL_ADDRESS": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'),
            "PHONE_NUMBER": re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'),
            "CREDIT_CARD": re.compile(r'\b(?:\d[ -]*?){13,19}\b') # Matches sequences of 13 to 19 digits (with optional spaces/dashes)
        }

    def _luhn_checksum(self, card_number: str) -> bool:
        """
        Validates card numbers using the standard Luhn Algorithm.
        """
        digits = [int(c) for c in card_number if c.isdigit()]
        if not digits or len(digits) < 13 or len(digits) > 19:
            return False
        
        # Double every second digit starting from the rightmost
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        
        checksum = sum(odd_digits)
        for d in even_digits:
            doubled = d * 2
            checksum += doubled if doubled < 10 else doubled - 9
            
        return checksum % 10 == 0

    def scan(self, content: str) -> Dict[str, Any]:
        leaks_found: List[Dict[str, Any]] = []
        masked_text = content
        risk_score = 0.0

        for name, regex in self.patterns.items():
            matches = list(regex.finditer(content))
            for match in matches:
                matched_val = match.group(0)
                
                # Double-check credit cards using Luhn algorithm to prevent false positives
                if name == "CREDIT_CARD":
                    clean_card = "".join(c for c in matched_val if c.isdigit())
                    if not self._luhn_checksum(clean_card):
                        continue # False positive card sequence, skip
                        
                # Add to leaks
                leaks_found.append({
                    "type": name,
                    "matched_text": matched_val[:4] + "..." + matched_val[-4:] if len(matched_val) > 8 else matched_val[0] + "...",
                    "start": match.start(),
                    "end": match.end()
                })
                
                # Adjust risk score based on leak type gravity
                if name in ["PEM_PRIVATE_KEY", "DATABASE_CONNECTION"]:
                    risk_score += 45.0
                elif name in ["AWS_ACCESS_KEY", "AWS_SECRET_KEY", "OPENAI_API_KEY", "STRIPE_API_KEY", "GITHUB_PAT", "GOOGLE_OAUTH_TOKEN", "JWT_TOKEN", "US_SSN"]:
                    risk_score += 35.0
                elif name == "CREDIT_CARD":
                    risk_score += 40.0
                elif name == "EMAIL_ADDRESS":
                    risk_score += 5.0
                elif name == "PHONE_NUMBER":
                    risk_score += 3.0
                    
                # Mask out secret inside the text
                masked_val = f"[REDACTED:{name}]"
                masked_text = masked_text.replace(matched_val, masked_val)

        # Cap risk score
        risk_score = min(100.0, risk_score)
        
        # Alert level
        if risk_score >= 60.0:
            alert_level = "critical"
        elif risk_score >= 10.0:
            alert_level = "warning"
        else:
            alert_level = "none"

        return {
            "leaks_found": leaks_found,
            "masked_text": masked_text,
            "risk_score": risk_score,
            "alert_level": alert_level
        }
