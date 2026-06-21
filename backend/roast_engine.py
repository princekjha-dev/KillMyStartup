import asyncio
import json
import logging
import httpx
from typing import Dict, List, Optional, Tuple
from backend.config import settings

logger = logging.getLogger("uvicorn.error")

VECTORS_INFO = {
    "market_reality": {
        "name": "Market Reality Check",
        "description": "Challenges TAM/SAM claims with cited reasoning.",
        "prompt": (
            "You are an elite, cynical market researcher and VC partner. Your goal is to destroy claims of high Total Addressable Market (TAM) / Serviceable Addressable Market (SAM).\n"
            "Challenge market size assertions with cited reasoning. If no data exists, say so explicitly — never fabricate numbers.\n"
            "Anti-Hallucination Rules:\n"
            "1. Never invent market size numbers. If you do not have data, say 'I cannot verify this figure.'\n"
            "2. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "3. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN].\n"
            "4. You are a critic, not a liar. Brutal != fabricated.\n"
            "5. If the user's input is too vague to analyze honestly, say so — do not pad."
        )
    },
    "competition_assassin": {
        "name": "Competition Assassin",
        "description": "Identifies real Indian and global competitors.",
        "prompt": (
            "You are a corporate intelligence analyst specializing in startup competitive landscaping. Your goal is to destroy the 'we have no competition' myth. Name real competitors (both Indian and global).\n"
            "Anti-Hallucination Rules:\n"
            "1. Never name a competitor you cannot describe with at least 2 verifiable facts.\n"
            "2. Flags if you cannot verify a competitor's existence.\n"
            "3. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "4. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN].\n"
            "5. You are a critic, not a liar. Brutal != fabricated."
        )
    },
    "execution_guillotine": {
        "name": "Execution Guillotine",
        "description": "Details missing requirements like capital, technical moats, and distribution.",
        "prompt": (
            "You are a grizzled COO who has shut down 10 failed startups. Your goal is to list what the founder needs but probably does not have: capital, regulatory approvals, technical moats, distribution relationships.\n"
            "Challenge their execution capability.\n"
            "Anti-Hallucination Rules:\n"
            "1. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "2. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN].\n"
            "3. Keep it focused on operational execution."
        )
    },
    "unit_economics": {
        "name": "Unit Economics Destroyer",
        "description": "Breaks down business model issues at scale.",
        "prompt": (
            "You are a forensic startup accountant and unit economics pure-tester. Break down why the business model might not work at scale. Use the founder's own numbers against them.\n"
            "Address margins, CAC, LTV, transaction costs, and logistics.\n"
            "Anti-Hallucination Rules:\n"
            "1. Never invent financial metrics or numbers. If no data exists, say 'I cannot verify this figure.'\n"
            "2. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "3. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN]."
        )
    },
    "timing_attack": {
        "name": "Timing Attack",
        "description": "Proves why this timing is fatal (too early, too late, or already failed).",
        "prompt": (
            "You are a veteran tech futurist and historian. Your goal is to prove why this timing is fatal. Is it too early? Too late? Has this already been tried and killed?\n"
            "Anti-Hallucination Rules:\n"
            "1. Never invent failed startups. If you name a failed startup, specify the year and reason it failed with high accuracy.\n"
            "2. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "3. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN]."
        )
    },
    "regulatory_minefield": {
        "name": "Regulatory Minefield",
        "description": "Identifies India-specific legal and policy hurdles.",
        "prompt": (
            "You are a top corporate compliance lawyer in India. Identify the massive regulatory hurdles that could kill this startup idea (RBI, SEBI, FSSAI, MeitY, data localisation, GST/TDS, gaming, or AI regulations).\n"
            "Anti-Hallucination Rules:\n"
            "1. Never claim a regulation exists unless you can name the specific act, section, or regulatory circular.\n"
            "2. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "3. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN]."
        )
    },
    "reliance_tata_threat": {
        "name": "Reliance/Tata Threat",
        "description": "Evaluates conglomerate copying risk.",
        "prompt": (
            "You are a strategist inside a major Indian conglomerate (Reliance Industries/Jio, Tata Group, Adani, Birla). Determine if a conglomerate could clone this startup in 6 months with 10x the resources, and why they would easily crush or squeeze it.\n"
            "Anti-Hallucination Rules:\n"
            "1. Use real conglomerate assets (e.g., Reliance Retail, Tata Neu, Jio Platforms) to back your threats.\n"
            "2. If you are uncertain, say 'This is my analysis, not verified data.'\n"
            "3. Prefix all factual claims with confidence level: [HIGH] [MEDIUM] [UNCERTAIN]."
        )
    }
}

async def call_vector_llm(
    client: httpx.AsyncClient,
    vector_id: str,
    vector_info: dict,
    user_payload: str,
    api_key: str
) -> dict:
    """
    Calls OpenRouter for a single vector. Wraps user input in delimiters and parses JSON response.
    """
    system_prompt = (
        f"{vector_info['prompt']}\n\n"
        "You MUST respond in JSON format matching this exact schema:\n"
        "{\n"
        "  \"analysis\": \"String - detailed critique and analysis matching the anti-hallucination rules.\",\n"
        "  \"confidence\": \"String - Must be exactly 'HIGH', 'MEDIUM', or 'UNCERTAIN'\",\n"
        "  \"survival_points\": Integer - A value from 0 to 10 evaluating how strong/resilient the idea is against this vector,\n"
        "  \"survived\": Boolean - True if the idea successfully defended/withstood this vector (typically survival_points >= 6), False otherwise,\n"
        "  \"killer_quote\": \"String - A brutal, extremely punchy, one-sentence roast quote.\"\n"
        "}\n"
        "Make sure to return valid, parsable JSON."
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://killmystartupidea.com", # Required for OpenRouter analytics
        "X-Title": "Kill My Startup Idea"
    }

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_payload}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3 # Low temperature for analytical consistency
    }

    try:
        response = await client.post(
            f"{settings.OPENROUTER_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30.0
        )

        if response.status_code != 200:
            logger.error(f"OpenRouter API call failed for vector {vector_id} with status {response.status_code}: {response.text}")
            return create_error_vector(vector_info["name"], f"LLM service returned status code {response.status_code}")

        res_json = response.json()
        content = res_json["choices"][0]["message"]["content"]
        
        # Parse the JSON string
        result = json.loads(content)
        
        # Validate schema elements
        return {
            "name": vector_info["name"],
            "description": vector_info["description"],
            "analysis": result.get("analysis", "Critique unavailable."),
            "confidence": result.get("confidence", "UNCERTAIN"),
            "survival_points": int(result.get("survival_points", 0)),
            "survived": bool(result.get("survived", False)),
            "killer_quote": result.get("killer_quote", "Your idea did not impress the engine.")
        }

    except Exception as e:
        logger.error(f"Exception during LLM call for vector {vector_id}: {str(e)}")
        return create_error_vector(vector_info["name"], f"Internal processing error: {str(e)}")

def create_error_vector(name: str, message: str) -> dict:
    return {
        "name": name,
        "description": "",
        "analysis": f"[UNCERTAIN] Analysis failed. {message}",
        "confidence": "UNCERTAIN",
        "survival_points": 0,
        "survived": False,
        "killer_quote": "This vector exploded due to a technical error."
    }

async def generate_true_conditions(
    client: httpx.AsyncClient,
    startup_name: str,
    user_payload: str,
    vectors_results: dict,
    api_key: str
) -> List[str]:
    """
    If score is low, generate constructive but speculative assumptions that would make this idea work.
    """
    # Compile critiques for context
    critiques = ""
    for k, v in vectors_results.items():
        critiques += f"- {v['name']}: {v['killer_quote']} (Points: {v['survival_points']}/10)\n"

    system_prompt = (
        "You are a constructive startup strategist. Review the startup idea and its brutal criticisms, "
        "and generate a list of 4-6 critical underlying assumptions that would NEED to hold true for this "
        "startup to actually succeed. Frame them as 'This could work IF...'.\n"
        "Keep them highly specific to the business, realistic, and constructive without being dishonest.\n"
        "Clearly label them as speculative, not factual.\n"
        "You MUST respond in JSON format matching this exact schema:\n"
        "{\n"
        "  \"assumptions\": [\"String\", \"String\", ...]\n"
        "}\n"
    )

    prompt = (
        f"Startup: {startup_name}\n"
        f"Critiques:\n{critiques}\n"
        f"User Pitch Details:\n{user_payload}"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://killmystartupidea.com",
        "X-Title": "Kill My Startup Idea"
    }

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.5
    }

    try:
        response = await client.post(
            f"{settings.OPENROUTER_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=20.0
        )
        if response.status_code == 200:
            res_json = response.json()
            content = res_json["choices"][0]["message"]["content"]
            result = json.loads(content)
            return result.get("assumptions", [])
    except Exception as e:
        logger.error(f"Error generating What Would Need To Be True: {e}")
    
    # Fallback default assumptions
    return [
        "This could work IF customer acquisition costs are 10x lower than market average.",
        "This could work IF key regulatory approvals are secured in the first 90 days.",
        "This could work IF a clear technical moat is developed to prevent cloning by incumbents."
    ]

async def execute_roast(
    startup_name: str,
    description: str,
    target_market: Optional[str] = None,
    revenue_model: Optional[str] = None,
    founding_team: Optional[str] = None,
    stage: Optional[str] = None,
    pdf_text: Optional[str] = None,
    custom_api_key: Optional[str] = None
) -> Tuple[int, dict, List[str]]:
    """
    Executes the 7 vectors in parallel. Returns (survival_score, vectors_results, true_conditions).
    """
    api_key = custom_api_key or settings.OPENROUTER_API_KEY
    if not api_key:
        raise ValueError("OpenRouter API key is not configured.")

    # Wrap inputs inside strict user_input tag to prevent prompt injection
    sanitized_desc = description.replace("<user_input>", "").replace("</user_input>", "")
    user_payload = (
        "<user_input>\n"
        f"Startup Name: {startup_name}\n"
        f"Stage: {stage or 'N/A'}\n"
        f"Target Market: {target_market or 'N/A'}\n"
        f"Revenue Model: {revenue_model or 'N/A'}\n"
        f"Founding Team: {founding_team or 'N/A'}\n"
        f"Description: {sanitized_desc}\n"
    )
    if pdf_text:
        user_payload += f"Pitch Deck Extracted Text: {pdf_text}\n"
    user_payload += "</user_input>"

    async with httpx.AsyncClient() as client:
        # Create asynchronous tasks for all 7 vectors
        tasks = []
        vector_keys = list(VECTORS_INFO.keys())
        for k in vector_keys:
            tasks.append(call_vector_llm(client, k, VECTORS_INFO[k], user_payload, api_key))
        
        # Execute LLM calls in parallel
        results = await asyncio.gather(*tasks)
        
        # Compile vector results
        vectors_results = {}
        survived_count = 0
        
        for idx, key in enumerate(vector_keys):
            vec_res = results[idx]
            vectors_results[key] = vec_res
            if vec_res.get("survived", False):
                survived_count += 1
                
        # Calculate survival score from vectors only: 0 to 100 based on survived vectors out of 7
        survival_score = int((survived_count / 7.0) * 100)
        
        # Generate constructive assumptions if score is low (< 40)
        true_conditions = []
        if survival_score < 40:
            true_conditions = await generate_true_conditions(client, startup_name, user_payload, vectors_results, api_key)
            
        return survival_score, vectors_results, true_conditions
