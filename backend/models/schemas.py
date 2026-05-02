from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class AddressSchema(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    full: Optional[str] = None


class PricingSchema(BaseModel):
    basic_service: Optional[str] = None
    cremation: Optional[str] = None
    burial: Optional[str] = None
    viewing: Optional[str] = None
    other: Optional[Dict[str, str]] = None


class ProviderResponse(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    services: List[str] = []
    pricing: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    source_url: str
    scraped_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ScrapeRequest(BaseModel):
    url: str = Field(..., description="URL of the funeral provider website to scrape")

    class Config:
        json_schema_extra = {
            "example": {"url": "https://example-funeral-home.com"}
        }


class ScrapeResponse(BaseModel):
    success: bool
    message: str
    provider: Optional[ProviderResponse] = None
    errors: List[str] = []


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(default=None)

    class Config:
        json_schema_extra = {
            "example": {
                "message": "What funeral homes are available in Dallas?",
                "session_id": "user-session-abc123",
            }
        }


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    providers_referenced: int = 0


class SearchResponse(BaseModel):
    results: List[ProviderResponse]
    total: int
    query: str


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str = "1.0.0"
