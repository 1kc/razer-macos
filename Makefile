TARGET := osx-razer-led
SRC := src
OBJ := obj

SOURCES := $(wildcard $(SRC)/*.c)
OBJECTS := $(patsubst $(SRC)/%.c, $(OBJ)/%.o, $(SOURCES))

all: $(TARGET)

clean:
	rm -f $(OBJECTS) $(TARGET)

$(TARGET): $(OBJECTS)
	gcc -framework CoreFoundation -framework IOKit -o $@ $^
 
$(OBJ)/%.o: $(SRC)/%.c | $(OBJ)
	$(CC) -I$(SRC) -c $< -o $@

$(OBJ):
	mkdir -p $@
