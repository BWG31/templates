#!/bin/bash

# Define variables
INSTALL_DIR="$HOME/.config/templates"
MK_DIR="mk_templates"
CPP_DIR="cpp_templates"
SCRIPTS_DIR="scripts"
COMMAND_SCRIPT="template.sh"
COMMAND_NAME="template"
SHELL_CONFIG_FILE="$HOME/.workwork_config"
SCRIPT_ALIAS="alias $COMMAND_NAME=\"$INSTALL_DIR/$COMMAND_SCRIPT\""

mkdir -p "$INSTALL_DIR"

cp -R $MK_DIR $INSTALL_DIR/
cp -R $CPP_DIR $INSTALL_DIR/
cp -R $SCRIPTS_DIR $INSTALL_DIR/

# Create the executable command
if [ -e "$COMMAND_SCRIPT" ]; then
	echo "Creating executable command..."
	cp "$COMMAND_SCRIPT" "$INSTALL_DIR/"
	chmod +x "$INSTALL_DIR/$COMMAND_SCRIPT"
else
	echo "Command script '$COMMAND_SCRIPT' not found."
	exit 1
fi

# Add $BIN_DIR to PATH if not already included
if ! grep "$SCRIPT_ALIAS" $SHELL_CONFIG_FILE &> /dev/null; then
	echo "Adding $COMMAND_NAME alias to $SHELL_CONFIG_FILE"
	echo "" >> $SHELL_CONFIG_FILE
	echo $SCRIPT_ALIAS >> $SHELL_CONFIG_FILE
	source $SHELL_CONFIG_FILE
fi

echo "Installation complete. Command available: $COMMAND_NAME"
