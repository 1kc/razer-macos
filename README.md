
<p align="center">
  <img src="resources/hero.png" alt="keyboard demo pic" />
  <p align="center">Open source color effects manager for Razer keyboards and Razer Blades on macOS</p>
</p>

<p align="center">
  <img src="screenshots/dark.png">
</p>


* __Custom color picker__ for static, reactive and starlight effects
* __Hardware based color controls__ Colors are saved to onboard memory
* __Supporting the latest macOS__ Official drivers (Synapse 2) supports only up to macOS 10.14 Mojave. There are no also plans from Razer to support macOS with Synapse 3 ([source](https://support.razer.com/articles/1543762911))

## Download
[Latest release](https://github.com/1kc/razer-macos/releases)

## Device support

All Razer keybords and blades are supported, with other peripherals being added in the future.
For a complete list of supported keyboards please see [openrazer](https://openrazer.github.io).

Confirmed working for:

Keyboards:

* Razer BlackWidow Elite
* Razer Ornata Chroma
* Razer Huntsman
* Razer Huntsman Elite
* Razer Huntsman TE

Razer Blades:

* Razer Blade Advanced 2018

## FAQ

Q: Selecting a colour setting has no effect on my keyboard

A: It is possible that a wrong on-board keyboard profile has been selected. Change to a different profile and try again.

Q: Menu says "No device found".

A: Plug your Razer device in and click "Refresh in the menu".

## Developer usage

Ensure xcode command line tools are installed,

Install node package dependencies:

    yarn

Run development server:

    yarn dev

During development, every time the driver code has been updated, a rebuild is required:

    yarn rebuild

For building a distribution ready app and dmg:

    yarn dist


## Implementation

Project includes both hardware drivers and frontend UI.

Drivers are ported from the [openrazer](https://github.com/openrazer/openrazer) project for Linux.
The goal is to support all devices from openrazer on macOS.

An Electron macOS menu bar app is used for the front-end. 
The C driver is exposed as a native Node.js addon using node-addon-api, which gets called by Electron.

Adding support for new peripherals types should be relatively simple. See [wiki](https://github.com/1kc/razer-macos/wiki).

## Credits

Builds on work done by these projects:

* [openrazer](https://github.com/openrazer/openrazer)
* [osx-razer-blade](https://github.com/kprinssu/osx-razer-blade)
* [osx-razer-led](https://github.com/dylanparker/osx-razer-led)
