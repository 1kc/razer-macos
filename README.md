
<p align="center">
  <img src="resources/hero.png" alt="keyboard demo pic" />
  <p align="center">Open source color effects manager for Razer keyboards on macOS 10.15 Catalina.</p>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/1kc/razer-macos/master/screenshots/dark.png">
</p>

Official drivers (Synapse 2) supports only up to macOS 10.14 Mojave. Currently, there are no plans from Razer to support macOS with Synapse 3 - see [source](https://support.razer.com/articles/1543762911).

## Download
[Latest release](https://github.com/1kc/razer-macos/releases)

## Device support

All Razer keybords are supported, with other peripherals being added in the future.
For a complete list of supported keyboards see here [openrazer](https://openrazer.github.io).

Confirmed working for:

* Razer BlackWidow Elite
* Razer Ornata Chroma
* Razer Huntsman
* Razer Huntsman Elite
* Razer Huntsman TE

## FAQ

Q: Selecting a colour setting has no effect on my keyboard

A: It is possible that a wrong on-board keyboard profile has been selected. Change to a different profile and try again.

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
