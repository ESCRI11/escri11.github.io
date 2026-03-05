.PHONY: build serve

build:
	python3 build_script.py

serve: build
	python3 -m http.server 8000

all: build
