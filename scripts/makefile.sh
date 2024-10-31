#!/bin/bash
# This command copies the Makefile template to the current directory

MK_TEMPLATES_DIR="$HOME/.config/templates/mk_templates"
TARGET="Makefile"

if [ -e "$MK_TEMPLATES_DIR" ]; then
	SELECTED=$(ls ${MK_TEMPLATES_DIR} | fzf)
	if [[ -n "$SELECTED" ]]; then
		touch $TARGET
		cat $MK_TEMPLATES_DIR/$SELECTED > $TARGET
		echo "New Makefile template created"
	fi
else
  echo "Can't find makefile templates in : $MK_TEMPLATES_DIR"
fi
