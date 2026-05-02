from openai import AsyncOpenAI
from config import settings
from typing import List, Dict, Any
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are an expert AI assistant for the Funeral Intelligence Platform (FIP).
Your role is to help users find, compare, and understand funeral service providers.

Guidelines:
- Be compassionate, respectful, and professional at all times
- Use only the provided provider database for factual claims about specific businesses
- When recommending providers, base it strictly on the data provided
- If asked about pricing, mention that prices vary and users should contact providers directly
- Help users understand what services are available and how to compare providers
- If no providers match a query, suggest what to search for
- Keep responses concise but helpful (2-4 paragraphs max)
- Format lists clearly with bullet points when listing multiple providers"""

def format_providers_context(providers: List[Dict[str, Any]]) -> str:
    if not providers:
        return "No providers currently in the database."
    lines = [f"DATABASE CONTAINS {len(providers)} FUNERAL SERVICE PROVIDERS:\n"]
    for i, p in enumerate(providers[:30], 1):
        services_str = ", ".join(p.get("services", [])[:5]) if p.get("services") else "Not specified"
        pricing_info = ""
        if p.get("pricing") and p["pricing"].get("mentioned_prices"):
            pricing_info = f" | Pricing mentions: {', '.join(p['pricing']['mentioned_prices'][:2])}"
        lines.append(
            f"{i}. {p['name']}"
            f"\n   Location: {p.get('city', 'N/A')}, {p.get('state', 'N/A')}"
            f"\n   Phone: {p.get('phone', 'N/A')}"
            f"\n   Address: {p.get('address', 'N/A')}"
            f"\n   Services: {services_str}{pricing_info}"
            f"\n   Website: {p.get('website', p.get('source_url', 'N/A'))}"
        )
        if p.get("description"):
            lines.append(f"   About: {p['description'][:150]}...")
        lines.append("")
    return "\n".join(lines)

async def get_ai_response(
    message: str,
    providers: List[Dict[str, Any]],
    conversation_history: List[Dict[str, str]] = None,
) -> str:
    context = format_providers_context(providers)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if conversation_history:
        messages.extend(conversation_history[-6:])
    messages.append({
        "role": "user",
        "content": f"PROVIDER DATABASE:\n{context}\n\nUSER QUESTION: {message}"
    })
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"I'm sorry, I encountered an issue processing your request: {str(e)}"
