from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from models.provider import Provider
from typing import List, Optional, Dict, Any
import uuid

async def create_provider(db: AsyncSession, data: Dict[str, Any]) -> Provider:
    provider = Provider(**data)
    db.add(provider)
    await db.flush()
    await db.refresh(provider)
    return provider

async def get_all_providers(db: AsyncSession, limit: int = 100, offset: int = 0) -> List[Provider]:
    result = await db.execute(
        select(Provider)
        .order_by(Provider.scraped_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()

async def search_providers(db: AsyncSession, query: str, limit: int = 50) -> List[Provider]:
    q = f"%{query.lower()}%"
    result = await db.execute(
        select(Provider).where(
            or_(
                func.lower(Provider.name).like(q),
                func.lower(Provider.city).like(q),
                func.lower(Provider.state).like(q),
                func.lower(Provider.address).like(q),
                func.lower(Provider.description).like(q),
                func.cast(Provider.services, func.text()).contains(query),
            )
        ).order_by(Provider.scraped_at.desc()).limit(limit)
    )
    return result.scalars().all()

async def get_provider_by_id(db: AsyncSession, provider_id: str) -> Optional[Provider]:
    result = await db.execute(
        select(Provider).where(Provider.id == uuid.UUID(provider_id))
    )
    return result.scalar_one_or_none()

async def get_provider_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Provider.id)))
    return result.scalar()

async def provider_exists_by_url(db: AsyncSession, url: str) -> Optional[Provider]:
    result = await db.execute(
        select(Provider).where(Provider.source_url == url)
    )
    return result.scalar_one_or_none()
