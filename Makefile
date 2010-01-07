
NAME=createlink
EXTDIR=extension

$(NAME).crx:
	crxmake --pack-extension=$(EXTDIR) --extension-output=$(NAME).crx \
		--key-output=/dev/null

zip: clipboard.dll
	zip -jr $(NAME).zip $(EXTDIR) clipboard.dll

clean:
	rm $(NAME).crx $(NAME).zip
