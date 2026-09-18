# HomeChef

My recipes, with photos, public reviews and star ratings.

- **api/**: FastAPI + SQLAlchemy + MySQL
- **web/**: React + Vite + TypeScript + Tailwind

Reading recipes and leaving a review are public. Creating, editing and deleting
recipes, uploading photos and removing spam reviews need the admin token.

## Running it

```bash
make setup     # once: venv, pip install, npm install, api/.env
make seed      # once: three sample recipes
make dev       # every day: MySQL + API + frontend, Ctrl-C stops it all
```

Then open http://localhost:5173.

`make` on its own lists every target:

| Target | What it does |
|---|---|
| `make setup` | Python venv, npm install, and `api/.env` with a fresh token |
| `make seed` | Three sample recipes, only if the database is empty |
| `make dev` | MySQL, API and frontend together; Ctrl-C stops both servers |
| `make api` | API only, with reload, on :8000 |
| `make web` | Frontend only, on :5173 |
| `make db` | MySQL only, waits until it is actually accepting connections |
| `make token` | Print the admin token |
| `make build` | Type-check and build the frontend |
| `make stop` | Stop MySQL, keeping your data |
| `make clean` | Remove venv, node_modules and build output |
| `make reset-db` | Drop the database **and its data**, then start fresh |

### On your network

`make dev` binds both servers to `0.0.0.0`, so anything on your Wi-Fi can open
the site. The startup banner prints the address to share:

```
  this machine   http://localhost:5173
  on the network http://192.168.0.106:5173
```

Visiting by IP always works. Visiting by hostname works for this machine's own
name (`vite.config.ts` lists it in `server.allowedHosts`); any other name is
refused, which is Vite's protection against DNS rebinding.

To keep a session private, put the servers back on localhost:

```bash
make dev API_HOST=127.0.0.1 WEB_HOST=127.0.0.1
```

**Before you share the address, know what you are exposing.** There is no HTTPS,
so the admin token travels the network in clear text and anyone on the same
Wi-Fi could read it and gain full admin rights. The API and its `/docs` page are
exposed on port 8000 too. This is fine for showing a friend on your home
network; it is not fine on café Wi-Fi, and it is not a way to put the site on
the internet.

`make setup` is safe to re-run: it skips the venv and `node_modules` if they
exist, and never overwrites an `api/.env` you already have.

## Logging in as admin

Open http://localhost:5173/admin/login and paste the `ADMIN_TOKEN` from
`api/.env`. The token is kept in the browser's localStorage, so you stay logged
in across reloads; **Log out** in the header clears it.

From **Admin** you can:

- **New recipe**: title, description, ingredients and steps (one per line),
  and a photo, all in one form.
- **Edit**: change any field, replace the photo, and delete spam reviews.
- **Delete**: removes the recipe, its reviews and its photo file.

The API docs at http://localhost:8000/docs still work if you prefer them: click
**Authorize** and paste the same token.

## Endpoints

| Method | Path | Who |
|---|---|---|
| GET | `/api/recipes` | anyone |
| GET | `/api/recipes/{slug}` | anyone |
| POST | `/api/recipes/{slug}/reviews` | anyone |
| POST | `/api/recipes` | admin |
| PUT | `/api/recipes/{slug}` | admin |
| DELETE | `/api/recipes/{slug}` | admin |
| POST | `/api/recipes/{slug}/photo` | admin |
| DELETE | `/api/reviews/{id}` | admin |
| GET | `/api/admin/check` | admin |

## Notes

- The theme follows your system by default; the header toggle overrides it and
  remembers the choice in `localStorage`. A small script in `index.html` applies
  it before first paint so the page never flashes the wrong colours.
- Tables are created on startup; there are no migrations yet. If you change a
  model, drop the table or add Alembic.
- Photos are files in `api/media/`, served at `/media/...`. The database stores
  only the filename. One photo per recipe for now.
- Admin auth is one shared token, not a user table. Anyone holding it is the
  admin, so over plain HTTP on a real network it is only as safe as the network.
- `api/.env` holds the database URL and the admin token, and is gitignored.
  `api/.env.example` shows the shape.
- Before putting this on the internet: add spam protection to the review form
  (a captcha and a rate limit) and a `status` column so reviews wait for your
  approval.
