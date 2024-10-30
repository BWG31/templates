#!/bin/bash

# Define variables
INSTALL_DIR="$HOME/.config/makefile_templates"
BIN_DIR="$HOME/.config/bin"
COMMAND_SCRIPT="command_script.sh"
COMMAND_NAME="new_makefile"
SHELL_CONFIG_FILE="$HOME/.workwork_config"

mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

cp	 templates/* $INSTALL_DIR/

# Create the executable command
if [ -e "$COMMAND_SCRIPT" ]; then
	echo "Creating executable command..."
	cp "$COMMAND_SCRIPT" "$BIN_DIR/$COMMAND_NAME"
	chmod +x "$BIN_DIR/$COMMAND_NAME"
else
	echo "Command script '$COMMAND_SCRIPT' not found."
	exit 1
fi

# Make the command executable
chmod +x "$BIN_DIR/$COMMAND_NAME"

# Add $BIN_DIR to PATH if not already included
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
	echo "Adding $BIN_DIR to PATH..."
	echo 'export PATH="$PATH:$HOME/.config/bin"' >> $SHELL_CONFIG_FILE
	export PATH="$PATH:$HOME/.config/bin"
fi

echo "Installation complete. Command available: $COMMAND_NAME"
