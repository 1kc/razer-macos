<p align="center">
  <img src="resources/hero.png" alt="keyboard demo pic" />
  <p align="center">Open source color effects manager for Razer devices on macOS</p>
</p>

<p align="center">
  <img src="screenshots/dark.png">
</p>

- **Supporting Razer devices** Keyboards, mice, mouse mats, eGPUs and blade laptops
- **Custom color picking** Choose your own colors for static, reactive and starlight effects
- **Persistent color settings** Color effects are saved to onboard memory
- **Works on the latest macOS** Including Intel and Apple Silicon. There are no plans from Razer to further support macOS ([source](https://support.razer.com/articles/1543762911))

## Download

[Latest release](https://github.com/1kc/razer-macos/releases)

## Installation

Install by drag and drop to Applications.
If you get a security warning when opening the app, you need to go to your Mac's "System Preferences", "Security and Privacy", "General" and click "Open" at the bottom to allow Razer macOS to run.

Please see FAQ section below if color changes are not working, otherwise open a new issue.

## Device support

- ⌨️ Keyboard
- 🖱️ Mouse
- 📜 Mouse mat
- 🌈 e-GPU
- 🎧 Headphones
- 💻 Blade laptop

For a complete list of supported keyboards, please see [openrazer](https://openrazer.github.io).

Confirmed working for:

Keyboards:

- Razer BlackWidow 2019
- Razer BlackWidow Elite
- Razer Ornata Chroma
- Razer Huntsman
- Razer Huntsman Elite
- Razer Huntsman TE
- Razer Cynosa V2
- Razer Ornata V2

Mice:

- Razer Deathadder Elite
- Razer DeathAdder V2
- Death Adder V2 Pro (wired and wireless)
- Razer Razer Lancehead Wireless
- Razer Viper Ultimate Wireless
- Razer Basilisk Ultimate
- Razer Basilisk V2
- Razer Abyssus V2 (under older mouse effects)
- Razer Razer DeathAdder 2013 (under older mouse effects)

Mouse mats:

- Razer Goliathus Extended
- Razer Firefly V2

Laptops:

- Razer Blade Advanced 2018

Headphones:

- Razer Kraken V2

Please feel free to open pull requests for new devices you have tested.

## Roadmap

- Add speed control for light effects
- Add brightness control for mouse

## FAQ

Q: Selecting a colour setting has no effect on my keyboard.

A: It is possible that a wrong on-board keyboard profile has been selected. Change to a different profile and try again. See your device manual for specific instructions on how to switch profiles.

Q: Menu says "No device found".

A: Use the "Refresh Device List" option.

## Developer usage

Ensure xcode command line tools are installed and if building for arm64, a valid Developer ID Application certificate as only notarized apps will run by default. In order to run unsigned and/or unnotarized apps on Apple Silicon, you will need to boot into 1TR (One True Recovery) and run `bputil -n` to downgrade security to permissive.

Install node package dependencies:

    yarn

Run development server:

    yarn dev

During development, every time the driver code has been updated, a rebuild is required:

    yarn rebuild

For building a signed distribution ready app and dmg:

    Edit release.sh to include your Apple Developer ID username and app specific password.

    `./release.sh`

    The script will display instructions to check notarization status as well as instructions to staple the notarization ticket once approved by Apple.

    Once approved by Apple, run `./dmg.sh` to generate a dmg.

## Implementation

Project includes both hardware drivers and user interface.

Drivers are ported from the [openrazer](https://github.com/openrazer/openrazer) project for Linux.
The goal is to support all devices from openrazer on macOS.

An Electron macOS menu bar app is used for the user interface.
The C driver is exposed as a native Node.js addon using node-addon-api, which gets invoked by Electron at runtime to send packets to devices.

Adding support for new peripherals types requires porting from the openrazer project. See [wiki](https://github.com/1kc/razer-macos/wiki).

## Credits

Builds on work done by these amazing projects:

- [openrazer](https://github.com/openrazer/openrazer)
- [osx-razer-blade](https://github.com/kprinssu/osx-razer-blade)
- [osx-razer-led](https://github.com/dylanparker/osx-razer-led)
