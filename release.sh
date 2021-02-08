#!/bin/sh

APPLE_USER=""
APPLE_PASS=""
APPID=`cat package.json | grep appId | cut -c 15- | rev | cut -c 3- | rev`


yarn clean
rm -rf ./node_modules ./dist

yarn

sed -ie "s/'--force'/'--force',/" ./node_modules/app-builder-lib/electron-osx-sign/sign.js

sed -ie "/force/a\\
\ \ \ \ \ \ \ \ '--deep'"  ./node_modules/app-builder-lib/electron-osx-sign/sign.js


yarn dist


echo 'zipping app bundles'
ditto -c -k --keepParent 'dist/mac-arm64/Razer macOS.app' 'dist/RazermacOS-arm64.app.zip'
ditto -c -k --keepParent 'dist/mac/Razer macOS.app' 'dist/RazermacOS-x64.app.zip'


echo 'notarizing x64 app'

xcrun altool --notarize-app --primary-bundle-id com.electron.razer-macos --username "$APPLE_USER" --password "$APPLE_PASS" --file 'dist/RazermacOS-x64.app.zip' \
  | grep RequestUUID | cut -c 15- > /tmp/buildid1

echo "To check status, run xcrun altool --notarization-info `cat /tmp/buildid1` --username "$APPLE_USER" --password "$APPLE_PASS""

echo 'notarizing arm64 app'

xcrun altool --notarize-app --primary-bundle-id com.electron.razer-macos --username "$APPLE_USER" --password "$APPLE_PASS" --file 'dist/RazermacOS-arm64.app.zip' \
  | grep RequestUUID | cut -c 15- > /tmp/buildid2

echo "To check status, run xcrun altool --notarization-info `cat /tmp/buildid2` --username "$APPLE_USER" --password "$APPLE_PASS""

echo "If notarization succeeds, run xcrun stapler staple 'dist/mac/Razer macOS.app' && xcrun stapler staple 'dist/mac-arm64/Razer macOS.app'"
