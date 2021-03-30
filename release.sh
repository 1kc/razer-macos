#!/bin/sh

APPLE_USER=""
APPLE_PASS=""
APPID=`jq -r .build.appId package.json`
VERSION=`jq -r .version package.json`

yarn clean
rm -rf ./node_modules ./dist

yarn

sed -ie "s/'--force'/'--force',/" ./node_modules/app-builder-lib/electron-osx-sign/sign.js

sed -ie "/force/a\\
\ \ \ \ \ \ \ \ '--deep'"  ./node_modules/app-builder-lib/electron-osx-sign/sign.js


yarn dist


echo 'notarizing app'

APP=`xcrun altool --notarize-app --primary-bundle-id com.electron.razer-macos --username "$APPLE_USER" --password "$APPLE_PASS" --file "dist/Razer macOS-${VERSION}-universal.dmg" | grep RequestUUID | cut -c 15-`


printf "To check status, run \nxcrun altool --notarization-info "$APP" --username "$APPLE_USER" --password "$APPLE_PASS"\n"

printf "If notarization succeeds, run \nxcrun stapler staple 'dist/Razer macOS-${VERSION}-universal.dmg'\n"
