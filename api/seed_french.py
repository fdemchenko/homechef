"""Add a few French dishes, in Ukrainian: python seed_french.py

Safe to re-run: it skips any recipe whose slug is already there, and only
downloads a photo that is missing from media/.

The photos come from Wikimedia Commons under free licences; PHOTO_CREDITS.md
in media/ records who took them and under which licence.
"""

import urllib.request
from pathlib import Path

from sqlalchemy import select

import models
from db import Base, SessionLocal, engine

MEDIA_DIR = Path(__file__).parent / "media"
USER_AGENT = "HomeChef-seed/1.0 (local dev)"

RECIPES = [
    {
        "slug": "ratatouille",
        "difficulty": 2,
        "title": "Рататуй",
        "description": "Літнє овочеве рагу з Провансу: баклажани, кабачки й перець у томатному соусі.",
        "ingredients": (
            "1 баклажан\n"
            "2 кабачки\n"
            "2 солодкі перці\n"
            "4 помідори\n"
            "1 цибулина\n"
            "3 зубчики часнику\n"
            "4 ст. л. оливкової олії\n"
            "Гілочка чебрецю\n"
            "Сіль і перець"
        ),
        "steps": (
            "Наріж овочі кружальцями завтовшки пів сантиметра.\n"
            "Підсмаж цибулю з часником, додай помідори й туши 15 хвилин до густого соусу.\n"
            "Вилий соус у форму, а зверху виклади овочі внапуск по колу.\n"
            "Полий оливковою олією, посоли, приперчи, поклади чебрець.\n"
            "Запікай 45 хвилин при 180 °C під фольгою, потім ще 15 хвилин без неї."
        ),
        "photo": "ratatouille.jpg",
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ratatouille.jpg/1280px-Ratatouille.jpg",
    },
    {
        "slug": "quiche-lorraine",
        "difficulty": 3,
        "title": "Кіш Лорен",
        "description": "Відкритий пиріг із Лотарингії: пісочне тісто, копчений бекон і вершкова заливка.",
        "ingredients": (
            "250 г борошна\n"
            "125 г холодного вершкового масла\n"
            "1 яйце в тісто\n"
            "200 г копченого бекону\n"
            "200 мл вершків 30%\n"
            "100 мл молока\n"
            "3 яйця в заливку\n"
            "100 г сиру грюєр\n"
            "Сіль, перець, мускатний горіх"
        ),
        "steps": (
            "Розітри борошно з маслом у крихту, додай яйце і 2 ст. л. крижаної води, замісь тісто й поклади в холодильник на 30 хвилин.\n"
            "Розкачай тісто, виклади у форму 26 см і випікай наосліп 15 хвилин при 180 °C.\n"
            "Обсмаж бекон до хрусткого й розклади по основі разом із тертим сиром.\n"
            "Збий яйця з вершками та молоком, приправ сіллю, перцем і мускатним горіхом.\n"
            "Залий начинку й випікай 35 хвилин при 180 °C, поки середина не схопиться.\n"
            "Дай пирогу постояти 10 хвилин, перш ніж різати."
        ),
        "photo": "quiche-lorraine.jpg",
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Quiche_lorraine_01.JPG/1280px-Quiche_lorraine_01.JPG",
    },
    {
        "slug": "creme-brulee",
        "difficulty": 3,
        "title": "Крем-брюле",
        "description": "Ванільний вершковий крем під тонкою карамельною шкоринкою, яку ламаєш ложкою.",
        "ingredients": (
            "500 мл вершків 33%\n"
            "6 жовтків\n"
            "80 г цукру в крем\n"
            "1 стручок ванілі\n"
            "4 ст. л. цукру на карамель"
        ),
        "steps": (
            "Прогрій вершки зі стручком ванілі, не доводячи до кипіння, і дай настоятися 15 хвилин.\n"
            "Розітри жовтки з цукром до світлої маси — збивати в піну не треба.\n"
            "Тонкою цівкою влий теплі вершки, помішуючи, і проціди суміш.\n"
            "Розлий у формочки й запікай на водяній бані 40 хвилин при 150 °C: крем має злегка тремтіти в центрі.\n"
            "Охолоди щонайменше 4 години в холодильнику.\n"
            "Посип цукром і карамелізуй пальником або під грилем до хрусткої шкоринки."
        ),
        "photo": "creme-brulee.jpg",
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Cr%C3%A8me_br%C3%BBl%C3%A9e_with_flame_2025.jpg/1280px-Cr%C3%A8me_br%C3%BBl%C3%A9e_with_flame_2025.jpg",
    },
]


def fetch_photo(name: str, url: str) -> None:
    """Download the photo once; a file that is already there is left alone."""
    target = MEDIA_DIR / name
    if target.exists():
        return
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        target.write_bytes(response.read())
    print(f"Downloaded {name}")


def main() -> None:
    MEDIA_DIR.mkdir(exist_ok=True)
    Base.metadata.create_all(engine)
    added = 0
    with SessionLocal() as db:
        for data in RECIPES:
            recipe = dict(data)
            url = recipe.pop("photo_url")
            if db.scalar(select(models.Recipe).where(models.Recipe.slug == recipe["slug"])):
                print(f"{recipe['slug']}: already there, skipping.")
                continue
            fetch_photo(recipe["photo"], url)
            db.add(models.Recipe(**recipe))
            added += 1
        db.commit()
    print(f"Added {added} recipes.")


if __name__ == "__main__":
    main()
