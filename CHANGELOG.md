# Changelog

All notable changes to this fork are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## About this fork

This is a downstream fork of [1kc/razer-macos](https://github.com/1kc/razer-macos),
taken at `v0.4.10`. Upstream has had no commits to `master` since 2022-09-22 and is
not accepting changes, so this fork is maintained independently.

A separate, unrelated fork ([JCKodel/razer-macos](https://github.com/JCKodel/razer-macos))
published a `0.5.0` from the same `v0.4.10` base in December 2022. That release is a
sibling lineage, not an ancestor of this one, and none of its changes are included here.
**Version `0.5.0` is deliberately skipped** so that two different codebases never share a
version number.

## [Unreleased]

### Changed

- Migrated the build from `electron-webpack` to `electron-vite`. `electron-webpack` was
  archived in 2021 and deadlocks on current Node, which made the project unbuildable on this
  machine; `electron-vite` builds it in under a second. This also removes the `node-gyp`
  failure against Python 3.12+, which no longer ships `distutils`.
- Electron 11 to 44, React 16 to 18 (`ReactDOM.render` to `createRoot`), electron-builder 23
  to 26.
- The renderer no longer uses `nodeIntegration`, which electron-vite does not support. IPC now
  goes through a preload script exposing only `send`, `sendSync` and `on` over
  `contextBridge`, so `contextIsolation` is enabled for the first time. Renderer call sites are
  unchanged: the renderer build aliases `electron` to a small bridge module.
- Replaced the abandoned `iohook` (which pinned the project to Electron 85 prebuilds) with
  `uiohook-napi`, used only by the keyboard ripple effect.
- Replaced webpack-specific APIs that have no Vite equivalent: `require.context` for the 147
  device definitions is now `import.meta.glob`, the `__static` global is now an `?asset`
  import, and `ELECTRON_WEBPACK_WDS_PORT` is now `ELECTRON_RENDERER_URL`.

### Fixed

- Tray icon rendering solid black instead of inverting for the menu bar. macOS only infers a
  template image when the filename ends in `Template`, and the bundler content-hashes asset
  filenames, which broke that convention. The template flag is now set explicitly via
  `nativeImage.setTemplateImage`, so it no longer depends on the filename.

### Removed

- `node-forge`, `dot-prop` and `source-map-support`, none of which were referenced anywhere in
  `src/`. `node-forge` at the pinned version carried known advisories, so dropping it removes
  that surface rather than bumping it.
- `electron-builder-notarize`. There is no Developer ID certificate available, so there is
  nothing to notarize.

### Added

- Menu bar battery readout: the charge of the attached mouse is shown next to the tray icon,
  with a lightning bolt while charging. Only devices that actually report a battery are polled,
  at 30 second intervals, and the readout is also refreshed whenever devices are re-enumerated
  so it appears immediately at startup rather than on the next tick.
- electron-builder `publish` configuration pointing at this fork, so a build emits an
  `app-update.yml` that refers here. Previously `publish` was unset, and the distributed
  0.5.0 binary carried an `app-update.yml` pointing at an unrelated repository.
- macOS `zip` build target alongside `dmg`. electron-updater cannot apply an update from a
  `dmg`, so the zip is required for the publish configuration to be usable.
- Device support carried in from `librazermacos`, updated from `325c96a` to `556f186`: Razer
  Cobra, Naga X, Laptop Stand Chroma, and the Basilisk V3 X Hyperspeed, V3 35K, V3 Pro and
  V3 Pro 35K variants. Every change there adds a new `case` to an existing switch, so devices
  already supported are unaffected.

Note that automatic updates additionally require the application to be signed with a Developer
ID certificate. Until that is in place, this configuration enables publishing build artifacts
to a release, not silent self-update.

## [0.6.0] - 2026-08-25

First tagged release of this fork.

### Added

- Battery level indicator for the Razer Mouse Dock. The dock is lit as a red-to-green
  gradient reflecting the charge of the attached mouse, since the dock has no battery
  telemetry of its own. Selecting any other lighting effect turns the indicator off.
- The indicator setting persists across restarts (`batteryModeActive`) and resumes
  automatically on launch.

### Fixed

- Crash (`EXC_BAD_ACCESS` / `SIGSEGV`) when the battery indicator wrote to a Mouse Dock
  whose USB handle had already been released, for example across sleep and wake, USB
  re-enumeration, or application teardown. The faulting path was:

  ```
  IOUSBLib  IOUSBDeviceClass::deviceGetDeviceProduct + 20
  addon     razer_mouse_dock_attr_write_mode_static + 100
  addon     MouseDockSetModeStatic(Napi::CallbackInfo const&) + 264
  ```

  `getDockTargetDevice()` re-resolved the live dock on every tick but fell back to the
  captured device object when the dock was absent from `activeRazerDevices`. That is
  precisely the case in which the handle is gone, so the fallback reintroduced the stale
  reference it was meant to avoid. It now returns `null` and the tick is skipped.

  Note that the surrounding `try`/`catch` could not have caught this. A use after free
  inside the native addon is a segmentation fault, not a JavaScript exception.

### Changed

- Battery indicator poll interval reduced from 15 seconds to 120 seconds, defined once as
  `BATTERY_POLL_MS` so the two interval call sites cannot drift apart. Battery level
  changes over hours, so the indicator is unaffected, and each tick makes a synchronous
  native USB call, so this also limits exposure to a stale handle.

[0.6.0]: https://github.com/uefigs139/razer-macos/releases/tag/v0.6.0
