from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    services = Column(JSON, nullable=True, default=list)
    pricing = Column(JSON, nullable=True, default=dict)
    description = Column(Text, nullable=True)
    source_url = Column(String(500), nullable=True)
    rating = Column(String(10), nullable=True)
    years_in_business = Column(String(20), nullable=True)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "services": self.services or [],
            "pricing": self.pricing or {},
            "description": self.description,
            "source_url": self.source_url,
            "rating": self.rating,
            "years_in_business": self.years_in_business,
            "scraped_at": self.scraped_at.isoformat() if self.scraped_at else None,
        }
