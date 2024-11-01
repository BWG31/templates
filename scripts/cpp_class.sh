#!/bin/bash
# This command creates a new C++ class (.cpp & .hpp files) to the current directory
# The necessary 'inc' & 'src' directories are created if not present

read -a CLASSNAME -p "Class Name: "

CPP_TEMPLATES_DIR="$HOME/.config/templates/cpp_templates"
HDR_TEMPLATE="$CPP_TEMPLATES_DIR/class_header.hpp"
SRC_TEMPLATE="$CPP_TEMPLATES_DIR/class_source.cpp"
INC_DIR="inc"
SRC_DIR="src"
TARGET_HDR="$INC_DIR/$CLASSNAME.hpp"
TARGET_SRC="$SRC_DIR/$CLASSNAME.cpp"

function generate_template() {
	cp $1 $2
	if [[ "$(uname)" = "Darwin" ]]; then
		sed -i '' s/Nameplaceholder/$3/g $2
		NAME_UPPER=$(echo "$3" | awk '{print toupper($0)}')
		sed -i '' s/NAMEPLACEHOLDER/$NAME_UPPER/g $2
	else
		sed -i s/Nameplaceholder/$3/g $2
		NAME_UPPER=$(echo "$3" | awk '{print toupper($0)}')
		sed -i s/NAMEPLACEHOLDER/$NAME_UPPER/g $2
	fi
}

if [[ -e "$CPP_TEMPLATES_DIR" ]]; then
	mkdir -p $INC_DIR $SRC_DIR
	generate_template $HDR_TEMPLATE $TARGET_HDR $CLASSNAME
	generate_template $SRC_TEMPLATE $TARGET_SRC $CLASSNAME
	echo "Class files created: $TARGET_HDR, $TARGET_SRC"
else
  echo "Error: Cannot find C++ templates in : $CPP_TEMPLATES_DIR"
fi
