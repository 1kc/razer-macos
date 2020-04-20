
<p align="center">
  <a href="https://github.com/1kc/razer-macos/releases">
    <img src="https://assets.razerzone.com/eeimages/support/products/1501/1501-blackwidow2019.png" width="256" height="256" alt="keyboard demo pic" />
  </a>
  <h1 align="center">Razer macOS</h1>
  <p align="center">Open source color effects manager for Razer peripherals on macOS. First of its kind available on the <b> latest macOS</b> (10.15 Catalina).</p>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/1kc/razer-macos/master/screenshots/dark.png">
</p>

Official drivers (Synapse 2) supports only up to macOS 10.14 Mojave. Currently, there are no plans by Razer to support macOS with the new Synapse 3 - see [source](https://support.razer.com/articles/1543762911). All keyboards supported by the [openrazer](http://openrazer.github.io) project should work. 


## Usage

Ensure xcode command line tools are installed,

Install node package dependencies:

    yarn

Run development server:

    yarn dev

During development, every time the driver code has been updated, a rebuild is required:

    yarn rebuild


## Implementation

Drivers are ported from the [openrazer](https://github.com/openrazer/openrazer) project for Linux.
The goal is to support all devices from openrazer on macOS.

An Electron macOS menu bar app is used for the front-end. 
The C driver is exposed as a native Node.js addon using node-addon-api, which gets called by Electron.

## Device support

Currently only Razer keyboard support has been added.

Tested working for:

* Razer Ornata Chroma
* Razer Huntsman
* Razer Huntsman Elite

Adding new peripherals types should be relatively simple. See [wiki](https://github.com/1kc/razer-macos/wiki).

## FAQ

Q: Selecting a colour setting has no effect on my keyboard
A: It is possible that the wrong on-board keyboard profile has been selected. Change to a different profile and try again.

## TODO

* Pack src/assets with webpack for the production build
* Finish adding different colour effects

## Credits

Builds on work done by these projects:

* [openrazer](https://github.com/openrazer/openrazer)
* [osx-razer-blade](https://github.com/kprinssu/osx-razer-blade)
* [osx-razer-led](https://github.com/dylanparker/osx-razer-led)
