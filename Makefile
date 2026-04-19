MSG ?= Update site content
DEPLOY_MSG ?= Deploy updates

.PHONY: deploy build serve new clean

deploy: build
	cd public && git add . && \
		(git diff --cached --quiet || git commit -m "$(DEPLOY_MSG)") && \
		git push upstream gh-pages
	git add . && \
		(git diff --cached --quiet || git commit -m "$(MSG)") && \
		git push origin master

build:
	hugo

serve:
	hugo server

new:
	@test -n "$(NAME)" || (echo "usage: make new NAME=<post-name>" && exit 1)
	hugo new posts/$(NAME).md

clean:
	rm -rf public/*
