.PHONY: build serve og

build:
	python3 build_script.py

serve: build
	python3 -m http.server 8000

# Social card. Needs Pillow + a mono TTF; re-run when the tagline changes.
og:
	python3 tools/make_og.py

all: build
