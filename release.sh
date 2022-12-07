#!/bin/bash

if [[ -z $APPLE_ID]]
then
  export APPLE_ID=""
  export APPLE_ID_PASSWORD=""
  export APPLE_ID_SET="TRUE"
fi

yarn clean
rm -rf ./node_modules ./dist

yarn

yarn dist

if [[ -z $APPLE_ID ]]
then
  codesign -s - --deep --force ./dist/mac-universal/Razer\ macOS.app
fi

if [[ -z $APPLE_ID_SET]]
then;
else
  unset APPLE_ID
  unset APPLE_ID_PASSWORD
  unset APPLE_ID_SET
fi
