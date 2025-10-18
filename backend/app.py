"""
FastAPI NFL Betting Backend
Main application entry point with all route registrations
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from core.config import settings

# Import route modules
from api import schedules, teams, games, scoreboard, pbp, players, power, injuries, depth, inventory, admin

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    # Startup
    logger.info("=" * 80)
    logger.info("🚀 FastAPI NFL Backend starting...")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Season: {settings.CURRENT_SEASON}")
    logger.info(f"   Supabase: {settings.SUPABASE_URL}")
    logger.info(f"   Redis: {settings.REDIS_URL}")
    logger.info("=" * 80)
    yield
    # Shutdown
    logger.info("=" * 80)
    logger.info("🛑 FastAPI NFL Backend shutting down...")
    logger.info("=" * 80)


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="REST API for NFL betting data - Schedules, Teams, Players, Stats, Power Ratings, etc.",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Health Check Endpoint
# ============================================================================
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint - always returns 200 OK"""
    return {
        "status": "ok",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ============================================================================
# API Routes (v1 prefix)
# ============================================================================

# Schedules
app.include_router(
    schedules.router,
    prefix="/v1",
    tags=["schedules"],
)

# Teams
app.include_router(
    teams.router,
    prefix="/v1",
    tags=["teams"],
)

# Games
app.include_router(
    games.router,
    prefix="/v1",
    tags=["games"],
)

# Scoreboard (Live)
app.include_router(
    scoreboard.router,
    prefix="/v1",
    tags=["scoreboard"],
)

# Play-by-Play
app.include_router(
    pbp.router,
    prefix="/v1",
    tags=["pbp"],
)

# Players
app.include_router(
    players.router,
    prefix="/v1",
    tags=["players"],
)

# Power Ratings
app.include_router(
    power.router,
    prefix="/v1",
    tags=["power-ratings"],
)

# Injuries
app.include_router(
    injuries.router,
    prefix="/v1",
    tags=["injuries"],
)

# Depth Charts
app.include_router(
    depth.router,
    prefix="/v1",
    tags=["depth-charts"],
)

# Data Inventory
app.include_router(
    inventory.router,
    prefix="/v1",
    tags=["inventory"],
)

# Admin (Manual Jobs)
app.include_router(
    admin.router,
    prefix="/v1",
    tags=["admin"],
)


# ============================================================================
# Root endpoint
# ============================================================================
@app.get("/")
async def root():
    """Root endpoint - redirect to documentation"""
    return {
        "message": "NFL Betting API",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "api": "/v1/",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
