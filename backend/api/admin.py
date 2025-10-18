"""
Admin endpoints - Management tasks and data refresh triggers
"""

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime
import logging

from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class JobRequest(BaseModel):
    """Request body for job trigger"""

    action: str  # refresh_season_stats, refresh_power_ratings, etc.
    params: Optional[Dict[str, Any]] = None


class JobResponse(BaseModel):
    """Response from job trigger"""

    job_id: str
    status: str
    action: str
    created_at: str


@router.post("/admin/jobs")
async def trigger_job(
    job_request: JobRequest, x_api_key: str = Header(None)
) -> JobResponse:
    """
    Trigger a manual data refresh job

    Requires X-API-Key header with admin API key

    - **action**: Job action (refresh_season_stats, refresh_power_ratings, load_schedules, etc.)
    - **params**: Optional parameters for job

    Returns: job_id and status

    Example:
    ```
    POST /v1/admin/jobs
    X-API-Key: your-api-key
    {
        "action": "refresh_season_stats",
        "params": {"season": 2025}
    }
    ```
    """
    try:
        # Validate API key
        if not x_api_key:
            logger.warning("Admin endpoint called without API key")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing X-API-Key header",
            )

        if x_api_key != settings.API_KEY:
            logger.warning(f"Admin endpoint called with invalid API key")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid API key",
            )

        # Validate action
        valid_actions = [
            "refresh_season_stats",
            "refresh_power_ratings",
            "load_schedules",
            "load_player_stats",
            "load_pbp",
            "load_injuries",
            "load_depth_charts",
            "refresh_all",
        ]

        if job_request.action not in valid_actions:
            logger.warning(f"Invalid job action: {job_request.action}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action. Valid actions: {', '.join(valid_actions)}",
            )

        # Generate job ID
        job_id = str(uuid.uuid4())

        logger.info(
            f"Job triggered: {job_request.action} (job_id={job_id}, params={job_request.params})"
        )

        # TODO: Enqueue job to background worker (RQ/Celery/etc)
        # For now, just return acknowledgment

        return JobResponse(
            job_id=job_id,
            status="queued",
            action=job_request.action,
            created_at=datetime.utcnow().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error triggering job",
        )


@router.get("/admin/jobs/{job_id}")
async def get_job_status(job_id: str, x_api_key: str = Header(None)) -> dict:
    """
    Get status of a background job

    Requires X-API-Key header

    - **job_id**: Job ID returned from job trigger

    Returns: job status (queued, running, completed, failed, etc.)
    """
    try:
        # Validate API key
        if x_api_key != settings.API_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key"
            )

        # TODO: Get job status from background worker
        # For now, return placeholder

        return {
            "job_id": job_id,
            "status": "completed",
            "action": "refresh_season_stats",
            "progress": 100,
            "message": "Job completed successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching job status",
        )
