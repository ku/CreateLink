
NAME=createlink
EXTDIR=extension

CRXMAKE_DIR=./crxmake
SRC=extension/*.*

$(NAME).zip: $(SRC)
	zip -jr $@ $(SRC)

clean:
	rm $(NAME).crx $(NAME).zip
