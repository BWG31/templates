#!/bin/bash
# This command copies the Makefile template to the current directory

INSTALL_DIR="$HOME/.config/makefile_template"

if [ -e "$INSTALL_DIR/Makefile" ]; then
  cp "$INSTALL_DIR/Makefile" .
  echo "Makefile template copied to current directory."
else
  echo "Makefile template not found in $INSTALL_DIR."
fi
