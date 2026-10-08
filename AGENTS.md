## Repository Structure

```text
.
├── docs/
│   └── adr/              # architecture decision records
├── openspec/
│   ├── specs/            # current capability specs
│   └── changes/          # active and archived change proposals
└── tests/                # cjs tests for the Profile logic
```

## Repository Commands

- `make install`: create the applet symlink in `~/.local/share/cinnamon/applets/`.
- `make enable`: install the symlink and add the applet to the panel.
- `make disable`: remove the applet from the panel.
- `make reload`: hot-reload the applet via DBus.
- `make restart`: restart Cinnamon.
- `make status`: show the symlink and panel state.
- `make uninstall`: disable the applet and remove the symlink.
- `cjs tests/profile-logic.js`: run the Profile logic tests.
