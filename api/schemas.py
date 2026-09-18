from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class UtcModel(BaseModel):
    """MySQL hands back naive datetimes; we stored them as UTC, so say so.

    Without this the browser reads '2026-09-16T19:24:44' as local time and
    shows the wrong hour.
    """

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", check_fields=False)
    def _as_utc(self, value: datetime) -> str:
        aware = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return aware.isoformat()


class ReviewIn(BaseModel):
    author: str = Field(min_length=1, max_length=60)
    rating: int = Field(ge=1, le=5)
    text: str = Field(default="", max_length=2000)


class ReviewOut(UtcModel):
    id: int
    author: str
    rating: int
    text: str
    created_at: datetime


class RecipeIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    ingredients: str = ""  # one per line
    steps: str = ""  # one per line
    difficulty: int = Field(default=3, ge=1, le=5)


class RecipeOut(UtcModel):
    id: int
    slug: str
    title: str
    description: str
    photo: str | None
    difficulty: int
    created_at: datetime
    rating_avg: float
    rating_count: int


class RecipeDetail(RecipeOut):
    ingredients: str
    steps: str
    reviews: list[ReviewOut]
