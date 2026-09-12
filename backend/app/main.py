from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    ai,
    analytics,
    auth,
    budgets,
    categories,
    goals,
    recurring,
    reports,
    transactions,
)
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Import all models here so Base.metadata is aware of every table before
# create_all runs. Order doesn't matter for SQLAlchemy's metadata registry,
# but each module must be imported at least once.
from app.models import budget, category, goal, recurring as recurring_model, transaction, user  # noqa: F401

app = FastAPI(title="FinTrack API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # SQLite dev convenience: create tables if they don't exist.
    # Replaced by Alembic migrations once the schema stabilizes.
    Base.metadata.create_all(bind=engine)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": ".".join(str(loc) for loc in err["loc"][1:]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": errors})


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(recurring.router)
app.include_router(ai.router)
app.include_router(reports.router)
