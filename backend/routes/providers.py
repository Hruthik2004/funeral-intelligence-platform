from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, HttpUrl
from database import get_db
from services import provider_service
from scraper.funeral_scraper import scrape_funeral_home
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ScrapeRequest(BaseModel):
    url: str

class ScrapeResponse(BaseModel):
    success: bool
    message: str
    provider: dict = None
    already_exists: bool = False

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_provider(request: ScrapeRequest, db: AsyncSession = Depends(get_db)):
    url = str(request.url).strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    existing = await provider_service.provider_exists_by_url(db, url)
    if existing:
        return ScrapeResponse(
            success=True,
            message="Provider already exists in the database.",
            provider=existing.to_dict(),
            already_exists=True,
        )
    try:
        data = scrape_funeral_home(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Scraping error for {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")
    try:
        provider = await provider_service.create_provider(db, data)
        return ScrapeResponse(
            success=True,
            message=f"Successfully scraped and saved '{provider.name}'",
            provider=provider.to_dict(),
        )
    except Exception as e:
        logger.error(f"DB save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save provider to database.")

@router.get("/providers")
async def get_providers(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    providers = await provider_service.get_all_providers(db, limit=limit, offset=offset)
    total = await provider_service.get_provider_count(db)
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "providers": [p.to_dict() for p in providers],
    }

@router.get("/search")
async def search_providers(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    providers = await provider_service.search_providers(db, q.strip(), limit=limit)
    return {
        "query": q,
        "results": len(providers),
        "providers": [p.to_dict() for p in providers],
    }

@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str, db: AsyncSession = Depends(get_db)):
    provider = await provider_service.get_provider_by_id(db, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")
    return provider.to_dict()
