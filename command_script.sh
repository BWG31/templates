#!/bin/bash
# This command copies the Makefile template to the current directory

INSTALL_DIR="$HOME/.config/makefile_templates"
TARGET="Makefile"

if [ -e "$INSTALL_DIR" ]; then
	SELECTED=$(ls ${INSTALL_DIR} | fzf)
	if [[ -n "$SELECTED" ]]; then
		touch $TARGET
		cat $INSTALL_DIR/$SELECTED > $TARGET
		echo "New Makefile template created"
	fi
else
  echo "Can't find makefile templates in : $INSTALL_DIR"
fi
