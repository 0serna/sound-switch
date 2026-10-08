# Sound Switch

This Cinnamon panel applet is `sound-switch@oserna`. It switches audio Output device and Input device pairs, called Profiles, with one click on the panel icon.

## Inventory

| Path | Role |
|---|---|
| `applet.js` | Cinnamon `IconApplet`: `Cvc` lifecycle, signals, icon, tooltip, click handler |
| `profiles.js` | Profile constants and pure matching/selection logic |
| `metadata.json` | Xlet metadata: UUID, Cinnamon 6.0-6.6 |
| `Makefile` | Symlink into `~/.local/share/cinnamon/applets/`, DBus reload/restart |
| `manage-panel.py` | Enable/disable via `org.cinnamon enabled-applets` |
| `tests/profile-logic.js` | `cjs` tests for the Profile logic |
| `GLOSSARY.md` | Domain terms: Profile, Output device, Input device, Active profile, Switch, Startup state |

## Profiles

`profiles.js` defines two Profiles:

| Profile | Output match | Input match | Icon |
|---|---|---|---|
| `desktop` | `hdmi` | `Brio` | `video-display-symbolic` |
| `headphones` | `JBL_Quantum_TWS` | `JBL_Quantum_TWS` | `xsi-audio-headset-symbolic` |

Matching is case-insensitive against the device name and the description. A click applies the next available Profile. A Profile is unavailable when one of its devices is missing. The panel icon shows the Active profile, detected from the default output.

Switching uses `Cvc.MixerControl.set_default_sink()` and `set_default_source()`. Playing streams follow the new default because WirePlumber has `follow = true`. Without that policy, streams stay on the old output.

## Startup state

At every login the applet applies the Startup state once per session: the `desktop` Profile, with its output at 50% volume, unmuted. If the `desktop` devices do not appear within 30 seconds, the applet changes nothing.

A marker in `$XDG_RUNTIME_DIR` scopes the state to one login session, so `make reload` and Cinnamon restarts do not repeat it. The old `set-default-volume` systemd user service is retired; the applet is the only owner of the login volume. The state applies only inside Cinnamon.

## Layout

```
.
├── applet.js               # Cinnamon entry, main()
├── profiles.js             # Profile constants and pure logic
├── metadata.json           # UUID sound-switch@oserna
├── Makefile                # install, enable, reload, uninstall
├── manage-panel.py         # gsettings panel list
├── tests/profile-logic.js  # cjs tests
└── GLOSSARY.md             # vocabulary
```

## Setup

Cinnamon 6.0+ with `Cvc-1.0.typelib` (ships with Cinnamon).

```bash
make enable    # symlink + add to panel1 right
make status    # symlink and GSettings
make reload    # hot-reload via DBus
```

Other targets: `install` which only creates the symlink, `disable`, `restart`, `uninstall`.

## Tests

```bash
cjs tests/profile-logic.js
```

The command exits non-zero when a case fails.
