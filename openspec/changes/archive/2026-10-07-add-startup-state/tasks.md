# Tasks

## 1. Startup state constants

- [x] 1.1 Add `STARTUP_STATE = { profile: "desktop", volume: 0.5 }` and `findProfileByName(profiles, name)` to `profiles.js`; add cases to `tests/profile-logic.js` (found, not found, the startup Profile exists in `PROFILES`); verify `cjs tests/profile-logic.js` passes

## 2. Applet startup flow

- [x] 2.1 In `applet.js`, apply the Startup state: on Cvc READY start a 30 s window and attempt; on `output-added`/`input-added` attempt again; when the startup Profile is available, set the defaults, set the sink volume to `get_vol_max_norm() * 0.5`, unmute, cancel the timer, and write the session marker; when the timer fires or the deadline passes, write the marker and stop; treat a missing startup Profile as unavailable; remove the timer in `on_applet_removed_from_panel`
- [x] 2.2 Verify the success path with `Eval`, `pactl`, and `wpctl`: delete the marker, reload, and confirm `desktop` is the default pair with volume 0.50 and unmuted; reload again and confirm nothing changes; check `~/.xsession-errors` for errors
- [x] 2.3 Verify the failure path: temporarily point `STARTUP_STATE.profile` at a name that matches no Profile, delete the marker, reload, wait 30 s, and confirm no device or volume change and the marker written; revert the constant and reload

## 3. Retire the systemd service

- [x] 3.1 `systemctl --user disable set-default-volume.service` and remove the `set-default-volume.service` and `set-default-volume.sh` symlinks from `~/.config/systemd/user/`; verify `systemctl --user is-enabled` reports disabled and the unit file is gone
- [x] 3.2 In the dotfiles repository, delete `dotfiles/systemd/user/set-default-volume.service` and `dotfiles/systemd/user/set-default-volume.sh`, remove both `dotfiles.json` entries, and run `npm run link`; verify the linker does not recreate the symlinks

## 4. Documentation

- [x] 4.1 Update `README.md`: document the Startup state (desktop at 50%, once per login session, 30 s window) and the retired systemd service

## 5. Final verification

- [x] 5.1 Run `cjs tests/profile-logic.js` and `openspec validate add-startup-state --strict`; confirm the panel icon, tooltip, and click behavior are unchanged
