.DEFAULT_GOAL := help
.PHONY: help install dev typecheck lint build clean cf-preview cf-typegen cf-deploy

help:
	@echo "Targets:"
	@echo "  install        install deps"
	@echo "  dev            run the Next.js dev server (:3000)"
	@echo "  typecheck      next typegen + tsc --noEmit"
	@echo "  lint           lint the app"
	@echo "  build          production build the app"
	@echo "  clean          remove generated build artifacts"
	@echo "  cf-preview     build + locally preview on the Cloudflare Workers runtime, no account needed"
	@echo "  cf-typegen     generate Cloudflare binding types"
	@echo "  cf-deploy      deploy to Cloudflare — requires login, run manually only"

install:
	npm install

dev:
	npm run dev

typecheck:
	npx next typegen && npx tsc --noEmit

lint:
	npm run lint

build:
	npm run build

clean:
	rm -rf node_modules .next .open-next .wrangler tsconfig.tsbuildinfo

cf-preview:
	npm run preview

cf-typegen:
	npm run cf-typegen

# Deploys to a live Cloudflare account. Requires `wrangler login` and explicit
# human confirmation — do not run this as part of an automated setup.
cf-deploy:
	npm run deploy
