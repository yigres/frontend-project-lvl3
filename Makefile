develop:
	npx cross-env NODE_ENV=development webpack serve --progress
	
install:
	npm ci

build:
	rm -rf dist
	npx cross-env NODE_ENV=production webpack --progress
	
lint:
	npx eslint .

test:
	npm test -s