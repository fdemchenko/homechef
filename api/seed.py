"""Fill an empty database with a few recipes: python seed.py"""

from sqlalchemy import select

import models
from db import Base, SessionLocal, engine

RECIPES = [
    {
        "slug": "borshch",
        "difficulty": 3,
        "title": "Borshch",
        "description": "Beetroot soup that tastes better the next day.",
        "ingredients": "1 beetroot\n2 potatoes\n1 carrot\n1 onion\n200 g cabbage\n2 l broth\nSour cream",
        "steps": "Simmer the broth with diced potatoes.\nFry onion, carrot and grated beetroot.\nAdd cabbage, then the fried vegetables.\nCook 10 more minutes and rest overnight.",
    },
    {
        "slug": "carbonara",
        "difficulty": 2,
        "title": "Carbonara",
        "description": "Four ingredients, no cream, done in fifteen minutes.",
        "ingredients": "200 g spaghetti\n100 g guanciale\n2 egg yolks\n50 g pecorino\nBlack pepper",
        "steps": "Boil the pasta, keep a cup of the water.\nCrisp the guanciale.\nWhisk yolks with pecorino.\nToss off the heat, loosening with pasta water.",
    },
    {
        "slug": "syrniki",
        "difficulty": 2,
        "title": "Syrniki",
        "description": "Cottage cheese pancakes for a slow morning.",
        "ingredients": "500 g cottage cheese\n1 egg\n3 tbsp flour\n2 tbsp sugar\nPinch of salt",
        "steps": "Mash everything into a soft dough.\nShape into pucks and flour them.\nFry on medium until golden on both sides.\nServe with sour cream and jam.",
    },
]


def main() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(models.Recipe)):
            print("Database already has recipes, nothing to do.")
            return
        db.add_all(models.Recipe(**data) for data in RECIPES)
        db.commit()
        print(f"Added {len(RECIPES)} recipes.")


if __name__ == "__main__":
    main()
