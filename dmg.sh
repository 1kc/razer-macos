#!/bin/sh

xcrun stapler staple 'dist/mac/Razer macOS.app' && xcrun stapler staple 'dist/mac-arm64/Razer macOS.app'

rm -rf ./dist/Razer*

ln -sf /Applications dist/mac/

ln -sf /Applications dist/mac-arm64

mv dist/mac-arm64 dist/razer-mac-arm64

mv dist/mac dist/razer-mac-x64

hdiutil create /tmp/razer-mac-arm64.dmg -ov -volname "razer-mac-arm64" -fs HFS+ -srcfolder ./dist/razer-mac-arm64

hdiutil create /tmp/razer-mac-x64.dmg -ov -volname "razer-mac-x64" -fs HFS+ -srcfolder ./dist/razer-mac-x64

hdiutil convert /tmp/razer-mac-arm64.dmg -format UDZO -o dist/razer-mac-arm64.dmg

hdiutil convert /tmp/razer-mac-x64.dmg -format UDZO -o dist/razer-mac-x64.dmg

rm -rf /tmp/razer*
