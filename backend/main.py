from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from database import init_db
from routes.providers import router as providers_router
from routes.chat import router as chat_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Funeral Intelligence Platform API...")
    await init_db()
    logger.info("Database initialized.")
    yield
    logger.info("Shutting down.")

app = FastAPI(
    title="Funeral Intelligence Platform API",
    description="AI-powered funeral service provider search and intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(providers_router, tags=["Providers"])
app.include_router(chat_router, tags=["AI Chat"])

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "platform": "Funeral Intelligence Platform",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
