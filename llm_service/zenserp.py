import os
import requests
from dotenv import load_dotenv

load_dotenv()

ZENSERP_API_KEY = os.environ.get("ZENSERP_API_KEY")

def search_web_context(query: str) -> str:
    """Use Zenserp to search Google for scam reports about a URL or phone number."""
    if not ZENSERP_API_KEY:
        return ""
    
    headers = {
        "apikey": ZENSERP_API_KEY
    }
    
    # Pre-append scam keywords to pull up relevant warnings if any exist.
    # Keep query short enough so it doesn't fail.
    short_query = (query[:50] + '..') if len(query) > 50 else query
    search_query = f'"{short_query}" scam OR phishing OR fraud'
    
    params = (
        ("q", search_query),
        ("hl", "en"),
        ("gl", "US"),
        ("num", "3"), # Top 3 results
    )
    
    try:
        response = requests.get('https://app.zenserp.com/api/v2/search', headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        snippets = []
        for result in data.get("organic", []):
            if "snippet" in result:
                snippets.append(result["snippet"])
                
        return " | ".join(snippets)
    except Exception as e:
        print(f"Zenserp Error: {e}")
        return ""
