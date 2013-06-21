
NAME=createlink
EXTDIR=extension
VERSION=$(shell plutil -convert json -r -o  -  ./extension/manifest.json | "grep" '"version"' | "egrep" -o '\w(\.\w)+')
DIRNAME=$(shell pwd)
SRC=extension

CRXMAKE_DIR=./crxmake
TMPFILELIST=/tmp/filelist

$(NAME)-$(VERSION).zip: $(SRC)
	find "$(SRC)" | sed 's/$(SRC)/./' > $(TMPFILELIST)
	cd $(SRC); cat $(TMPFILELIST) | zip $(DIRNAME)/$@ -@

clean:
	rm $(NAME).crx $(NAME).zip
