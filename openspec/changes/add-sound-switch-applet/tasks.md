# Tasks

## 1. Scaffolding

- [x] 1.1 Create `metadata.json` with UUID `sound-switch@oserna`, display name "Sound Switch", and Cinnamon 6.0-6.6; verify `python3 -m json.tool metadata.json` parses it
- [x] 1.2 Create `Makefile` and `manage-panel.py` from the `ddc-brightness` copies with the new UUID; verify `make install` creates the symlink and `make status` reports it
- [x] 1.3 Write `README.md` with inventory, setup, usage, the Profile constants, and the WirePlumber `follow = true` dependency; verify every documented command runs as written

## 2. Profile Logic

- [x] 2.1 Create `profiles.js` with the `desktop` and `headphones` constants and pure helpers for matching, Active profile detection, availability, and next-index selection; verify a `cjs` snippet loads it via `imports.profiles` and prints the two Profiles
- [x] 2.2 Create `tests/profile-logic.js` with fake device lists covering matching, wrap-around, skip-unavailable, and no-match cases; verify it fails on a wrong expected value and passes otherwise

## 3. Applet

- [x] 3.1 Create `applet.js`: `Cvc.MixerControl` lifecycle, `active-output-update`/`active-input-update` signals for icon and tooltip, `on_applet_clicked` through `profiles.js`, hidden actor until READY, cleanup in `on_applet_removed_from_panel`; verify `make enable` followed by `make reload` shows the icon in the panel with no errors in `~/.xsession-errors`
- [x] 3.2 Shorten the tooltip to the profile name plus short device names, without repeating an identical name; verify `cjs tests/profile-logic.js` passes and both tooltips read `desktop: Navi 31 HDMI/DP Audio + Brio 100` and `headphones: JBL Quantum TWS` via `Eval`

## 4. Integration Checks

- [x] 4.1 Verify one click from `desktop` switches both defaults to the headset pair, and the icon changes to the headset icon; use `pactl get-default-sink` and `pactl get-default-source` before and after
- [x] 4.2 Verify a second click returns to `desktop` with the monitor icon
- [x] 4.3 Verify an external default change (system Sound settings) updates the Active profile icon without a click
- [x] 4.4 Verify a missing device: unplug the headset dongle, click, and confirm no device change and no error; replug and confirm the switch works again
- [x] 4.5 Verify playing audio follows the switch: start playback, click, and confirm the sound continues on the new Output device

## Workflow follow-up

- Archive the change after the integration checks pass.
- Verify the archived specs and the resulting main spec.
