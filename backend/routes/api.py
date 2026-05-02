import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import (
    ScrapeRequest, ScrapeResponse, ProviderResponse,
    ChatRequest, ChatResponse, SearchResponse, HealthResponse,
)
from services import (
    scrape_provider, create_provider, get_all_providers,
    search_providers, get_provider_by_id, delete_provider,
    get_providers_as_dicts, get_ai_response,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"
    return HealthResponse(status="ok", database=db_status)


@router.post("/scrape", response_model=ScrapeResponse, tags=["Scraper"])
async def scrape_endpoint(request: ScrapeRequest, db: AsyncSession = Depends(get_db)):
    """
    Scrape a funeral provider website and store the extracted data.
    """
    url = str(request.url).strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        scraped_data = scrape_provider(url)
        errors = scraped_data.pop("errors", [])

        if not scraped_data.get("name"):
            raise HTTPException(status_code=422, detail="Could not extract provider name from the URL.")

        provider = await create_provider(db, scraped_data)

        return ScrapeResponse(
            success=True,
            message=f"Successfully scraped and saved '{provider.name}'",
            provider=ProviderResponse(**provider.to_dict()),
            errors=errors,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scrape error for {url}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@router.get("/providers", response_model=list[ProviderResponse], tags=["Providers"])
async def get_providers(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve all funeral providers from the database.
    """
    providers = await get_all_providers(db, limit=limit, offset=offset)
    return [ProviderResponse(**p.to_dict()) for p in providers]


@router.get("/search", response_model=SearchResponse, tags=["Providers"])
async def search_endpoint(
    q: str = Query(..., min_length=1, description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    """
    Search funeral providers by name, address, services, or phone.
    """
    providers = await search_providers(db, q)
    results = [ProviderResponse(**p.to_dict()) for p in providers]
    return SearchResponse(results=results, total=len(results), query=q)


@router.get("/providers/{provider_id}", response_model=ProviderResponse, tags=["Providers"])
async def get_provider(provider_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a specific provider by ID.
    """
    try:
        provider = await get_provider_by_id(db, provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID format.")
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")
    return ProviderResponse(**provider.to_dict())


@router.delete("/providers/{provider_id}", tags=["Providers"])
async def delete_provider_endpoint(provider_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete a provider from the database.
    """
    deleted = await delete_provider(db, provider_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Provider not found.")
    return {"success": True, "message": "Provider deleted successfully."}


@router.post("/chat", response_model=ChatResponse, tags=["AI Chat"])
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Send a message to the AI assistant. The assistant uses live provider data as context.
    """
    session_id = request.session_id or str(uuid.uuid4())

    try:
        providers = await get_providers_as_dicts(db)
        reply = await get_ai_response(
            message=request.message,
            providers=providers,
        )
        return ChatResponse(
            reply=reply,
            session_id=session_id,
            providers_referenced=len(providers),
        )
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/stats", tags=["System"])
async def get_stats(db: AsyncSession = Depends(get_db)):
    """
    Get platform statistics.
    """
    providers = await get_all_providers(db, limit=1000)
    total_with_phone = sum(1 for p in providers if p.phone)
    total_with_services = sum(1 for p in providers if p.services)
    total_with_pricing = sum(1 for p in providers if p.pricing)

    return {
        "total_providers": len(providers),
        "providers_with_phone": total_with_phone,
        "providers_with_services": total_with_services,
        "providers_with_pricing": total_with_pricing,
    }
