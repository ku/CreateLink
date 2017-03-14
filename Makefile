
NAME=createlink
EXTDIR=extension
VERSION=$(shell plutil -convert json -r -o  -  ./extension/manifest.json | "grep" '"version"' | "egrep" -o '\w(\.\w+)+')
DIRNAME=$(shell pwd)
SRC="extension/js/popup.js"
EXTENSIONDIR=extension

CRXMAKE_DIR=./crxmake
TMPFILELIST=/tmp/filelist

$(NAME)-$(VERSION).zip: $(SRC)
	./node_modules/.bin/jasmine || exit
	find "$(EXTENSIONDIR)" | sed 's/$(EXTENSIONDIR)/./' > $(TMPFILELIST)
	cd $(EXTENSIONDIR); cat $(TMPFILELIST) | zip -q $(DIRNAME)/$@ -@

$(SRC):
	./node_modules/.bin/webpack

test:
	./node_modules/.bin/jasmine

watch:
	./node_modules/.bin/webpack -w

clean:
	rm $(NAME).crx $(NAME).zip
