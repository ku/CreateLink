
NAME=createlink
EXTDIR=extension
VERSION=$(shell plutil -convert json -r -o  -  ./extension/manifest.json | "grep" '"version"' | "egrep" -o '\d(\.\d)+')

CRXMAKE_DIR=./crxmake
SRC=extension/*.*

$(NAME)-$(VERSION).zip: $(SRC)
	zip -jr $@ $(SRC)

clean:
	rm $(NAME).crx $(NAME).zip
