from fastapi import APIRouter
from pydantic import BaseModel, Field
import re
from ml_models.predictor import predict_ml_score
from llm_service.zenserp import search_web_context

router = APIRouter()

class AnalysisRequest(BaseModel):
    text: str
    input_type: str = Field(..., description="url, email, sms, or text")

class AnalysisResponse(BaseModel):
    status: str
    ml_score: float
    confidence_score: float
    reasoning: str

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_phishing(req: AnalysisRequest):
    # Get ML Score
    ml_score = predict_ml_score(req.text, req.input_type)
    
    # Fetch Web Context via Zenserp
    web_context = search_web_context(req.text)
    
    # Advanced Heuristic Context rules
    text_lower = req.text.lower()
    heuristic_risk = 0.1
    reasons = []
    
    # 1. Suspicious keywords
    sus_keywords = ["login", "urgent", "verify", "password", "bank", "account", "suspended", "locked", "secure", "validate", "banned", "compromised", "unauthorized"]
    if any(w in text_lower for w in sus_keywords):
        heuristic_risk = max(heuristic_risk, 0.75)
        reasons.append("Contains sensitive urgency/action keywords.")
        
    # 2. URL/Obfuscation checks
    if req.input_type == 'url' or 'http' in text_lower:
        if '@' in text_lower.replace('mailto:', ''):
            heuristic_risk = max(heuristic_risk, 0.95)
            reasons.append("Detected '@' symbol in URL structure (credential spoofing).")
            
        if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', text_lower):
            heuristic_risk = max(heuristic_risk, 0.9)
            reasons.append("Uses an IP address instead of a domain name.")
            
        if any(ext in text_lower for ext in ['.xyz', '.cc', '.pw', '.buzz', '.tk', '.cn', '.top', '.info']):
            heuristic_risk = max(heuristic_risk, 0.8)
            reasons.append("Uses a high-risk Top-Level Domain (TLD).")
            
        if len(req.text) > 75:
            heuristic_risk = max(heuristic_risk, 0.65)
            reasons.append("Unusually long URL (often hides malicious subdomains).")

    # 3. Email Spoofing / Impersonation Checks
    if req.input_type == 'email' or ('@' in text_lower and 'http' not in text_lower):
        if text_lower.count('@') > 1:
            heuristic_risk = max(heuristic_risk, 0.95)
            reasons.append("Multiple '@' symbols detected in email format (structural obfuscation).")
            
        parts = text_lower.split('@')
        if len(parts) >= 2:
            local_part = parts[0]
            domain = parts[-1]
            
            free_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "mail.com", "protonmail.com"]
            brands = ["google", "paypal", "apple", "microsoft", "amazon", "netflix", "facebook", "chase", "bank", "instagram"]
            typos = ["gogle", "googel", "paypaI", "paypel", "appIe", "amazn", "microsof", "facebok", "intagram"]
            support_words = ["support", "service", "helpdesk", "admin", "billing", "security", "update", "verify", "alert", "noreply", "no-reply", "desk"]
            
            if sum(c.isdigit() for c in local_part) > 6:
                heuristic_risk = max(heuristic_risk, 0.65)
                reasons.append("High number of digits in email prefix (often auto-generated).")
                
            if domain in free_providers:
                if any(b in local_part for b in brands) or any(t in local_part for t in typos):
                    heuristic_risk = max(heuristic_risk, 0.95)
                    reasons.append(f"Brand impersonation using a free email provider ({domain}).")
                elif any(w in local_part for w in support_words):
                    heuristic_risk = max(heuristic_risk, 0.90)
                    reasons.append(f"Suspicious corporate keyword used with a free email provider ({domain}).")
            else:
                if any(b in domain for b in brands) and any(w in domain for w in support_words) and "-" in domain:
                    heuristic_risk = max(heuristic_risk, 0.90)
                    reasons.append("Suspicious domain format maliciously mimicking an official brand.")
                elif domain.count('.') > 2:
                    heuristic_risk = max(heuristic_risk, 0.8)
                    reasons.append("Excessive subdomains detected (common in phishing attacks).")

    # 4. Zenserp Web Context
    if web_context:
        reasons.append("Zenserp returned external context linking the payload directly to a possible scam/phishing thread.")
        heuristic_risk = max(heuristic_risk, 0.95)
        
    # Compile Log
    if not reasons:
        reasoning = "Threat analysis based on ML structural checking. No major heuristic threats detected."
    else:
        reasoning = "Threat analysis identified severe heuristic risks: " + " ".join(reasons)
        
    # Hybrid calculation ignoring LLMs
    confidence_score = (ml_score * 0.4) + (heuristic_risk * 0.6)
    
    # Final Output Status
    if confidence_score > 0.65:
        status = "PHISHING 🚨"
    elif confidence_score > 0.35:
        status = "SUSPICIOUS ⚠️"
    else:
        status = "SAFE ✅"
        
    return AnalysisResponse(
        status=status,
        ml_score=ml_score,
        confidence_score=confidence_score,
        reasoning=reasoning
    )
