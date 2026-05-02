from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from services import provider_service
from services.ai_service import get_ai_response

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    providers_used: int

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    providers = await provider_service.get_all_providers(db, limit=50)
    provider_data = [p.to_dict() for p in providers]
    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    reply = await get_ai_response(
        message=request.message,
        providers=provider_data,
        conversation_history=history,
    )
    return ChatResponse(reply=reply, providers_used=len(provider_data))
