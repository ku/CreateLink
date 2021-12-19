
NAME=createlink
VERSION=$(shell plutil -convert json -r -o  -  ./extension/manifest.json | "grep" '"version"' | "egrep" -o '\w(\.\w+)+')
CWD=$(shell pwd)
SRC="extension/js/popup.js"
EXT_DIRNAME=extension
EXT_DIR=$(CWD)/$(EXT_DIRNAME)

BUILD_DIR=$(CWD)/.build
TMPFILELIST=$(BUILD_DIR)/filelist

$(NAME)-$(VERSION).zip: $(SRC)
	'rm' $(BUILD_DIR)/$@
	mkdir -p $(BUILD_DIR)
	find "$(EXT_DIRNAME)" | sed 's/$(EXT_DIRNAME)/./' | grep -v .js.map > $(TMPFILELIST)
	cd $(EXT_DIR); cat $(TMPFILELIST) | zip -q $(BUILD_DIR)/$@ -@

$(SRC):
	./node_modules/.bin/webpack --mode=production

watch:
	./node_modules/.bin/webpack -w --mode=development

clean:
	rm -rf .build/
