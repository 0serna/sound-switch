# Design

## Context

- Cinnamon 6.6 on Mint 22.3, PipeWire 1.0.5 with WirePlumber 0.4.17.
- The retired `set-default-volume` systemd user service ran at login, waited up to 30 seconds for a default sink, then set it to 50% volume, unmuted. See ADR-0003.
- Cvc volume scale: `MixerControl.get_vol_max_norm()` returns 65536 (`PA_VOLUME_NORM`). The Cinnamon sound applet uses the same scale: `stream.volume = value * control.get_vol_max_norm()` then `stream.push_volume()`. Verified on this machine: the HDMI sink reported `volume = 32760` when `wpctl` showed 0.50.
- The applet hides its actor until Cvc is READY and refreshes on device signals. See `applet.js`.
- Motivation and scope: see proposal.md - Why.

## Goals / Non-Goals

**Goals:**

- Every login session starts with the `desktop` Profile at 50% volume, unmuted.
- One owner for audio defaults: the applet. The systemd service is removed.
- The startup flow is testable where it is pure, and observable through Cvc.

**Non-Goals:**

- Changing the volume on a click. A click keeps switching devices only.
- Applying the Startup state outside Cinnamon.
- Configurable startup Profile or volume; they are constants.
- Reapplying the state when devices appear later in the session.

## Decisions

### Startup state as constants in profiles.js

```js
var STARTUP_STATE = { profile: "desktop", volume: 0.5 };
```

`findProfileByName(profiles, name)` returns the matching Profile or `null`. Pure and testable with `cjs`. Changing the login Profile or volume edits the constants, like the Profiles themselves (ADR-0002).

### Startup flow in applet.js

```text
on Cvc READY:
  if marker exists: startupDone = true; return
  windowEnds = now + 30s
  start 30s timer
  tryApplyStartupState()

on output-added / input-added:
  tryApplyStartupState()

tryApplyStartupState:
  if startupDone: return
  if now > windowEnds: closeWindow(); return
  profile = findProfileByName(PROFILES, STARTUP_STATE.profile)
  if not profileAvailable(profile, sinks, sources): return   # wait for more signals
  apply defaults, volume and unmute on the sink
  startupDone = true
  cancel timer; writeMarker()

closeWindow:                # the 30s timer fires, or a late signal arrives
  startupDone = true
  writeMarker()
```

- The timer closes the window even when no device signal arrives, so a later reload in the same session does not retry.
- The marker is written on success and on window close. A failed attempt does not retry in the same session, per the spec.
- Devices that appear after the window do not trigger the state: `startupDone` is already set.

### Re-entrancy guard

Cvc emits `active-input-update` synchronously from `set_default_source()`, and `active-output-update` when the default sink changes. The signal handlers call `_refresh()`, which calls `tryApplyStartupState()`. The flow sets `startupDone` before the calls that emit, so the signals cannot re-enter it.

### Session marker

`$XDG_RUNTIME_DIR/sound-switch-startup-handled`, through `GLib.get_user_runtime_dir()`. The runtime directory is cleared at logout, so the marker scopes the state to one login session. `GLib.file_test` reads it; `GLib.file_set_contents` writes it.

### Volume and mute through Cvc

After `set_default_sink(sink)` and `set_default_source(source)`:

```js
sink.volume = control.get_vol_max_norm() * STARTUP_STATE.volume;  // 0.5 -> 32768
sink.push_volume();
if (sink.is_muted) sink.change_is_muted(false);
```

Same API the Cinnamon sound applet uses, so the volume matches what the system UI reports.

### Retire the systemd service

- `systemctl --user disable set-default-volume.service`, then remove the two symlinks in `~/.config/systemd/user/`.
- Dotfiles repository: delete `systemd/user/set-default-volume.service` and `systemd/user/set-default-volume.sh`, remove both entries from `dotfiles.json`, and run `npm run link` to confirm the linker no longer creates them.
- Git history keeps the old files for rollback.

## Risks / Trade-offs

- [Monitor off at login] → the `desktop` Profile is unavailable; the applet changes nothing. A later click still switches. This matches the chosen behavior.
- [Applet reload during the 30s window] → the new instance starts a fresh window. The window is short and the case is rare.
- [Marker lost when the runtime directory is cleared] → the state could apply again on a later applet start in the same session. The runtime directory only clears at logout.
- [Other sessions] → the Startup state does not apply. The retired service was desktop-environment agnostic (ADR-0003).

## Migration Plan

1. Install and reload the applet with the startup flow.
2. Disable the unit and remove the symlinks.
3. Remove the files and `dotfiles.json` entries from the dotfiles repository.
4. Rollback: restore the unit files from dotfiles git history and re-enable. The applet would set the volume too; the duplicate is harmless.
