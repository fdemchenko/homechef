import re
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import or_, select, text
from sqlalchemy.orm import Session, selectinload

import models
import schemas
from auth import require_admin
from db import Base, engine, get_db

MEDIA_DIR = Path(__file__).parent / "media"
ALLOWED_IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def add_missing_columns() -> None:
    """create_all() makes missing tables but never alters an existing one.

    So columns added after a table exists need this nudge. Idempotent, and
    it keeps the recipes you already have.
    """
    with engine.begin() as conn:
        present = {
            row[0]
            for row in conn.execute(
                text(
                    "SELECT COLUMN_NAME FROM information_schema.COLUMNS "
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'recipes'"
                )
            )
        }
        if "difficulty" not in present:
            conn.execute(
                text("ALTER TABLE recipes ADD COLUMN difficulty INT NOT NULL DEFAULT 3")
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    MEDIA_DIR.mkdir(exist_ok=True)
    Base.metadata.create_all(engine)
    add_missing_columns()
    yield


app = FastAPI(title="Coocker API", lifespan=lifespan)

# The Vite dev server proxies /api and /media, so this is only a safety net
# for when you open the frontend without the proxy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


def make_slug(db: Session, title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "recipe"
    slug, n = base, 2
    while db.scalar(select(models.Recipe).where(models.Recipe.slug == slug)):
        slug, n = f"{base}-{n}", n + 1
    return slug


def get_recipe(db: Session, slug: str) -> models.Recipe:
    recipe = db.scalar(select(models.Recipe).where(models.Recipe.slug == slug))
    if not recipe:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such recipe")
    return recipe


# ---------- public ----------

def like_pattern(term: str) -> str:
    """Treat %, _ and \\ as plain characters someone typed, not wildcards."""
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


@app.get("/api/recipes", response_model=list[schemas.RecipeOut])
def list_recipes(q: str | None = None, db: Session = Depends(get_db)):
    stmt = select(models.Recipe).options(
        selectinload(models.Recipe.reviews)  # ratings without an N+1
    )

    if q and q.strip():
        pattern = like_pattern(q.strip())
        # The column collation is case- and accent-insensitive, so this works
        # for Cyrillic and Latin alike.
        stmt = stmt.where(
            or_(
                models.Recipe.title.like(pattern),
                models.Recipe.description.like(pattern),
                models.Recipe.ingredients.like(pattern),
            )
        )

    stmt = stmt.order_by(models.Recipe.created_at.desc())
    return db.scalars(stmt).all()


@app.get("/api/recipes/{slug}", response_model=schemas.RecipeDetail)
def read_recipe(slug: str, db: Session = Depends(get_db)):
    return get_recipe(db, slug)


@app.post("/api/recipes/{slug}/reviews", response_model=schemas.ReviewOut, status_code=201)
def add_review(slug: str, payload: schemas.ReviewIn, db: Session = Depends(get_db)):
    recipe = get_recipe(db, slug)
    review = models.Review(recipe_id=recipe.id, **payload.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


# ---------- admin ----------

@app.get("/api/admin/check", status_code=204, dependencies=[Depends(require_admin)])
def check_admin():
    """Lets the login form tell a good token from a bad one."""


@app.post(
    "/api/recipes",
    response_model=schemas.RecipeDetail,
    status_code=201,
    dependencies=[Depends(require_admin)],
)
def create_recipe(payload: schemas.RecipeIn, db: Session = Depends(get_db)):
    recipe = models.Recipe(slug=make_slug(db, payload.title), **payload.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@app.put(
    "/api/recipes/{slug}",
    response_model=schemas.RecipeDetail,
    dependencies=[Depends(require_admin)],
)
def update_recipe(slug: str, payload: schemas.RecipeIn, db: Session = Depends(get_db)):
    recipe = get_recipe(db, slug)
    for field, value in payload.model_dump().items():
        setattr(recipe, field, value)
    db.commit()
    db.refresh(recipe)
    return recipe


@app.delete("/api/recipes/{slug}", status_code=204, dependencies=[Depends(require_admin)])
def delete_recipe(slug: str, db: Session = Depends(get_db)):
    recipe = get_recipe(db, slug)
    if recipe.photo:
        (MEDIA_DIR / recipe.photo).unlink(missing_ok=True)
    db.delete(recipe)
    db.commit()


@app.post(
    "/api/recipes/{slug}/photo",
    response_model=schemas.RecipeDetail,
    dependencies=[Depends(require_admin)],
)
def upload_photo(slug: str, file: UploadFile, db: Session = Depends(get_db)):
    recipe = get_recipe(db, slug)
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Use one of: {', '.join(sorted(ALLOWED_IMAGES))}",
        )

    name = f"{recipe.slug}-{uuid.uuid4().hex[:8]}{ext}"
    (MEDIA_DIR / name).write_bytes(file.file.read())
    if recipe.photo:
        (MEDIA_DIR / recipe.photo).unlink(missing_ok=True)  # drop the replaced one

    recipe.photo = name
    db.commit()
    db.refresh(recipe)
    return recipe


@app.delete("/api/reviews/{review_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_review(review_id: int, db: Session = Depends(get_db)):
    """Your moderation escape hatch for spam."""
    review = db.get(models.Review, review_id)
    if not review:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such review")
    db.delete(review)
    db.commit()
