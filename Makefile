.PHONY: help setup env db seed api web dev build stop clean reset-db token

VENV    := .venv
PY      := $(VENV)/bin/python
PIP     := $(VENV)/bin/pip
UVICORN := $(VENV)/bin/uvicorn

# 0.0.0.0 = reachable from other machines on your network.
# Override for a private session:  make dev API_HOST=127.0.0.1 WEB_HOST=127.0.0.1
API_HOST ?= 0.0.0.0
WEB_HOST ?= 0.0.0.0
LAN_IP    = $(shell hostname -I 2>/dev/null | awk '{print $$1}')

help: ## Show this help
	@echo "Coocker - my recipes, your reviews"
	@echo
	@grep -hE '^[a-z-]+:.*##' $(MAKEFILE_LIST) \
		| sed 's/:.*##/|/' \
		| awk -F'|' '{printf "  make %-10s %s\n", $$1, $$2}'
	@echo
	@echo "First time:  make setup && make seed"
	@echo "Every day:   make dev"

# ---------- one-time setup ----------

setup: env $(VENV) web/node_modules ## Install Python and npm dependencies

env: ## Create api/.env with a fresh admin token, if it is missing
	@test -f api/.env || { \
		sed "s|^ADMIN_TOKEN=.*|ADMIN_TOKEN=$$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')|" \
			api/.env.example > api/.env; \
		echo "Created api/.env, see 'make token'"; \
	}

$(VENV):
	python3 -m venv $(VENV)
	$(PIP) install -q -r api/requirements.txt

web/node_modules: web/package.json
	cd web && npm install
	@touch web/node_modules

# ---------- running ----------

db: ## Start MySQL in Docker and wait until it is ready
	@docker compose up -d
	@printf 'Waiting for MySQL'
	@for i in $$(seq 1 60); do \
		if docker compose ps db 2>/dev/null | grep -q healthy; then \
			echo " ready."; exit 0; \
		fi; \
		printf '.'; sleep 1; \
	done; \
	echo " gave up after 60s."; exit 1

seed: setup db ## Put three sample recipes into an empty database
	cd api && ../$(PY) seed.py

api: setup db ## API only, with reload, on :8000
	cd api && ../$(UVICORN) main:app --reload --host $(API_HOST) --port 8000

web: setup ## Frontend only, on :5173
	cd web && npm run dev -- --host $(WEB_HOST)

dev: setup db ## Everything at once: MySQL, API and frontend (Ctrl-C stops both)
	@echo
	@echo "  this machine   http://localhost:5173"
	@echo "  on the network http://$(LAN_IP):5173"
	@echo "  admin          http://$(LAN_IP):5173/admin/login   (make token)"
	@echo "  api docs       http://$(LAN_IP):8000/docs"
	@echo
	@trap 'kill 0' EXIT INT TERM; \
	( cd api && ../$(UVICORN) main:app --reload --host $(API_HOST) --port 8000 ) & \
	( cd web && npm run dev -- --host $(WEB_HOST) ) & \
	wait

build: setup ## Type-check and build the frontend for production
	cd web && npm run build

# ---------- housekeeping ----------

db-cli: db ## Open a MySQL shell on the database
	docker compose exec db mysql -ucoocker -pcoocker --default-character-set=utf8mb4 coocker

token: ## Print the admin token
	@grep ADMIN_TOKEN api/.env | cut -d= -f2

stop: ## Stop MySQL (your data is kept)
	docker compose down

clean: ## Remove venv, node_modules and build output
	rm -rf $(VENV) web/node_modules web/dist api/__pycache__

reset-db: ## Delete the database AND its data, then start fresh
	docker compose down -v
	$(MAKE) db
