# Proposal

## Why

Every login starts with the last used audio devices, and a `set-default-volume` systemd user service in the dotfiles repository sets the default sink volume to 50%. The user wants every login to start with the `desktop` Profile at 50% volume, and the applet is the natural owner: it already runs at login and knows the Profiles.

## What Changes

- The applet applies the Startup state once per login session: the `desktop` Profile as default sink and source, plus 50% output volume, unmuted.
- The applet waits up to 30 seconds for the `desktop` devices to appear, then gives up without changing anything.
- A marker in `$XDG_RUNTIME_DIR` prevents a second application in the same session, so applet reloads and Cinnamon restarts do not repeat it.
- The `set-default-volume` systemd user service is retired from the dotfiles repository.
- `profiles.js` gains the `STARTUP_STATE` constants and a pure Profile lookup; `applet.js` gains the startup flow.
- README documents the startup behavior and the service removal.

## Capabilities

### New Capabilities

- `startup-state`: the Profile and volume the applet applies when the login session starts, including the availability window and the once-per-session rule.

### Modified Capabilities

None. Click switching, icon, and tooltip behavior do not change.

## Impact

- `applet.js`: startup apply on READY and on device arrival; volume and mute through Cvc.
- `profiles.js` and `tests/profile-logic.js`: new constants and pure helpers with test cases.
- `README.md`: startup behavior and retired service.
- Dotfiles repository: remove `systemd/user/set-default-volume.service` and `systemd/user/set-default-volume.sh` plus their `dotfiles.json` entries; disable the unit and remove the symlinks.
- No changes to click behavior, icon, tooltip, or panel management.
- The Startup state applies only inside Cinnamon. Other sessions keep the system default, unlike the retired service.
