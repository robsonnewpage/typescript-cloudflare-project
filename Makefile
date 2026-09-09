.DEFAULT_GOAL := help
.PHONY: help install dev typecheck lint build clean cf-preview cf-typegen cf-deploy

help:
	@echo "Targets:"
	@echo "  install        install deps in frontend/"
	@echo "  dev            run the frontend dev server (:3000)"
	@echo "  typecheck      next typegen + tsc --noEmit in frontend/"
	@echo "  lint           lint the frontend"
	@echo "  build          production build the frontend"
	@echo "  clean          remove generated build artifacts in frontend/"
	@echo "  cf-preview     build + locally preview on the Cloudflare Workers runtime, no account needed"
	@echo "  cf-typegen     generate Cloudflare binding types"
	@echo "  cf-deploy      deploy to Cloudflare — requires login, run manually only"

install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev

typecheck:
	cd frontend && npx next typegen && npx tsc --noEmit

lint:
	cd frontend && npm run lint

build:
	cd frontend && npm run build

clean:
	rm -rf frontend/node_modules frontend/.next frontend/.open-next frontend/.wrangler frontend/tsconfig.tsbuildinfo

cf-preview:
	cd frontend && npm run preview

cf-typegen:
	cd frontend && npm run cf-typegen

# Deploys to a live Cloudflare account. Requires `wrangler login` and explicit
# human confirmation — do not run this as part of an automated setup.
cf-deploy:
	cd frontend && npm run deploy
