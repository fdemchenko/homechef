from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    # MySQL needs an explicit length on every VARCHAR, so columns are sized here.
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")
    ingredients: Mapped[str] = mapped_column(Text, default="")  # one per line
    steps: Mapped[str] = mapped_column(Text, default="")  # one per line
    photo: Mapped[str | None] = mapped_column(String(255), default=None)  # file in media/
    difficulty: Mapped[int] = mapped_column(default=3)  # 1..5, validated by the schema
    created_at: Mapped[datetime] = mapped_column(default=now)

    reviews: Mapped[list["Review"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="Review.created_at.desc()",
    )

    @property
    def rating_count(self) -> int:
        return len(self.reviews)

    @property
    def rating_avg(self) -> float:
        if not self.reviews:
            return 0.0
        return round(sum(r.rating for r in self.reviews) / len(self.reviews), 1)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
    author: Mapped[str] = mapped_column(String(60))
    rating: Mapped[int]  # 1..5, validated by the schema
    text: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=now)

    recipe: Mapped["Recipe"] = relationship(back_populates="reviews")
