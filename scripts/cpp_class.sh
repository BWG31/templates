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

if [ -e "$CPP_TEMPLATES_DIR" ]; then
	if [ ! -e "$INC_DIR" ]; then
		mkdir $INC_DIR
	fi
	if [ ! -e "$SRC_DIR" ]; then
		mkdir $SRC_DIR
	fi
	cp $HDR_TEMPLATE $TARGET_HDR
	cp $SRC_TEMPLATE $TARGET_SRC
	sed -i s/Nameplaceholder/$CLASSNAME/g $TARGET_HDR
	CLASSNAME=$(echo "$CLASSNAME" | awk '{print toupper($0)}')
	sed -i s/NAMEPLACEHOLDER/$CLASSNAME/g $TARGET_HDR
	
else
  echo "Can't find cpp templates in : $CPP_TEMPLATES_DIR"
fi
