# Design

## Context

- Cinnamon 6.6 on Mint 22.3, PipeWire 1.0.5 with WirePlumber 0.4.17. The WirePlumber policy has `follow = true`, so playing streams move when the default device changes.
- Cinnamon ships `Cvc-1.0.typelib`. Verified on this machine: `imports.gi.Cvc` works under `cjs` and lists the two sinks and two sources.
- Devices: outputs `HDMI / Navi 31` and `JBL Quantum TWS`; inputs `Brio 100` and `JBL Quantum TWS`.
- `ddc-brightness` provides the repository layout: `applet.js`, `metadata.json`, `Makefile`, `manage-panel.py`, `GLOSSARY.md`.
- Motivation and scope: see proposal.md - Why.

## Goals / Non-Goals

**Goals:**

- One left click applies the next available Profile: default sink and default source in one action.
- The panel icon always reflects the Active profile, detected from the current default sink.
- No menus and no configuration files.

**Non-Goals:**

- Volume, mute, or per-application stream routing.
- PulseAudio card profiles and Bluetooth management.
- Settings UI, JSON config, or desktop notifications.
- Desktop environments other than Cinnamon.

## Decisions

### Cvc instead of a subprocess

`Cvc.MixerControl` enumerates devices, switches defaults with `set_default_sink()` and `set_default_source()`, and pushes signals for device and default changes. A subprocess (`pactl`, `wpctl`) would need one process per action and polling for state. See ADR-0001.

### Profiles as constants in profiles.js

Two constants with `name`, `output`, `input`, and `icon`, plus the pure matching and selection logic. `applet.js` holds only the Cinnamon and Cvc integration: imports, signals, icon, and click handler. The split keeps the logic testable with `cjs` outside Cinnamon. No menus and no files. See ADR-0002.

`profiles.js` exports with `var` and `function` declarations, so both Cinnamon's `require('./profiles')` and a plain `cjs` `imports.profiles` load it.

### Active profile detected by the output device

The applet matches the default sink against each Profile output. The input may belong to another Profile (mixed state) without changing the displayed profile. Rationale: the output defines the mode the user perceives, and the next click normalizes both devices. Alternative: require both devices to match, rejected because a mixed state would show a generic icon for no user benefit.

### Click resolution and availability

```text
on_applet_clicked:
  active = index of the Profile whose output matches the default sink   # -1 when none
  for step in 1..PROFILES.length:
    next = (active + step) % PROFILES.length
    if profileAvailable(next):
      applyProfile(next)
      return
  # no available Profile: do nothing
```

- `profileAvailable`: the Profile output and input devices are both present.
- `applyProfile`: find the sink and source by substring, then call `set_default_sink()` and `set_default_source()`.
- The icon and tooltip update from Cvc signals (`active-output-update`, `active-input-update`), not from the click handler. This keeps the applet correct when devices change outside the applet.

### Device matching

Case-insensitive substring match on the Cvc device `name` first, then on `description`. Cvc names are stable for the same hardware, for example `alsa_output.usb-Harman_...JBL_Quantum_TWS...`.

### Icons and tooltip

- Icon from the Profile constant: `video-display-symbolic` for `desktop`, `xsi-audio-headset-symbolic` for `headphones`. Generic fallback `xsi-audio-volume-high-symbolic` when no Profile matches.
- Tooltip: Profile name plus short device names (PulseAudio description minus `Analog Stereo`, `Digital Stereo`, `Mono`, and `Stereo` suffixes). An identical name is not repeated.

### Lifecycle

- `state-changed` → READY: read initial defaults, set icon and tooltip. Keep the actor hidden until READY, like the native sound applet.
- Connect `active-output-update` and `active-input-update` to refresh icon and tooltip.
- Connect `output-added`/`output-removed`/`input-added`/`input-removed` to re-evaluate availability.
- `on_applet_removed_from_panel`: disconnect handlers and call `control.close()`.

### Repository scaffolding

Copy `ddc-brightness`: `metadata.json` (UUID `sound-switch@oserna`, Cinnamon 6.0-6.6), `Makefile` (install, enable, disable, reload, restart, uninstall, status), `manage-panel.py`, `README.md`.

## Risks / Trade-offs

- [Device names change with other hardware] → Constants are easy to edit; README documents the fields.
- [A user config disables WirePlumber `follow`] → Playing streams stay on the old sink. The README documents the dependency. Cvc has no stream move API; a future change could add explicit moves through `pactl`.
- [Cvc missing or different on another Cinnamon version] → Target Cinnamon 6.0+; Cvc ships with Cinnamon.
- [Applet shows a generic icon before Cvc is READY] → Hide the actor until READY.

## Migration Plan

New repository, no migration. `make enable` installs the symlink and adds the applet to the panel. Rollback: `make uninstall`.
