
NAME=createlink
EXTDIR=extension

$(NAME).crx:
	crxmake --pack-extension=$(EXTDIR) --extension-output=$(NAME).crx \
		--key-output=/dev/null

zip:
	zip -jr $(NAME).zip $(EXTDIR)

clean:
	rm $(NAME).crx $(NAME).zip
