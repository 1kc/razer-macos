# razer-macos

Open source color effects manager for Razer peripherals on macOS. First of its kind available on the latest macOS (10.15 Catalina).

Official drivers (Synapse 2) supports only up to macOS 10.14 Mojave. Currently, there are no plans by Razer to support macOS with the new Synapse 3.
See [source](https://support.razer.com/articles/1543762911).

## Usage

Ensure xcode command line tools are installed,

Building the drivers:

    make

TODO

## Implementation

Drivers are ported from the [openrazer](https://github.com/openrazer/openrazer) project for Linux.
The goal is to support all devices from openrazer on macOS.


## Device support

Currently tested working for:

* Razer Huntsman
* Razer Deathadder 2013 TODO

Adding new devices is relatively simple. See [wiki](https://github.com/1kc/razer-macos/wiki).


## Credits

Builds on work done by these projects:

* [openrazer](https://github.com/openrazer/openrazer)
* [osx-razer-blade](https://github.com/kprinssu/osx-razer-blade)
* [osx-razer-led](https://github.com/dylanparker/osx-razer-led)
