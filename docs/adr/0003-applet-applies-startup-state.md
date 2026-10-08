# Applet applies the startup state at login

The applet applies the Startup state — the `desktop` Profile at 50% output volume, unmuted — once per login session. It waits up to 30 seconds for the `desktop` devices to appear and then gives up without changing anything. A marker in `$XDG_RUNTIME_DIR` records that the session already handled the state, so applet reloads and Cinnamon restarts do not repeat it. The `set-default-volume` systemd user service in the dotfiles repository is retired.

## Considered options

- **Keep the systemd user service**: rejected. Two owners for audio defaults: the service sets the volume, the applet sets the devices. The service cannot switch Profiles, and it duplicates logic the applet already has.
- **Keep the service for volume only**: rejected. Split ownership; the applet already starts at login with the devices loaded.
- **Trigger the service from the applet**: rejected. Adds indirection and a systemd dependency for behavior the applet can run directly.

## Consequences

- Outside Cinnamon, the Startup state does not apply. The old service was desktop-environment agnostic.
- The dotfiles repository loses `systemd/user/set-default-volume.service` and its script; the enabled symlink is removed.
- `STARTUP_STATE` lives in `profiles.js` as constants. Changing the login Profile or volume edits the constants.
- The applet tracks device arrival within the startup window. Devices that appear later do not trigger the state.
