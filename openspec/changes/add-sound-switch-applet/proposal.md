# Proposal

## Why

Switching between the desktop audio devices and the headset currently takes several clicks in the system Sound settings. The user alternates between two fixed pairs (monitor + webcam, headset output + headset input) and wants a single panel click.

## What Changes

- New Cinnamon panel applet `sound-switch@oserna` with a panel icon.
- Left click applies the next Profile: sets the default output device and the default input device.
- The panel icon reflects the Active profile (`desktop` / `headphones`).
- Profiles are constants in `profiles.js`: name, output substring, input substring, icon.
- A Profile with a missing device is unavailable. The click skips to the next available Profile.
- Project scaffolding follows `ddc-brightness`: `metadata.json`, `Makefile`, `manage-panel.py`, `README.md`.

## Capabilities

### New Capabilities

- `profile-switching`: one-click switching between audio device pairs (Profiles), with an icon that reflects the Active profile.

### Modified Capabilities

None.

## Impact

- New repository content only. No existing code changes.
- Depends on Cinnamon's `Cvc` typelib (ADR-0001) and on WirePlumber `follow = true` for stream migration.
- No build step: `cjs`/GJS runs the applet. `make install` symlinks the repo into `~/.local/share/cinnamon/applets/`.
