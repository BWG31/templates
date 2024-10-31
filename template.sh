#!/bin/bash
# This command copies the Makefile template to the current directory

SCRIPT_DIR="$HOME/.config/templates/scripts"

if [ -e "$SCRIPT_DIR" ]; then
	SELECTED=$(ls ${SCRIPT_DIR} | fzf)
	if [[ -n "$SELECTED" ]]; then
		bash $SCRIPT_DIR/$SELECTED
	fi
else
  echo "Could not find script directory : $SCRIPT_DIR"
fi
