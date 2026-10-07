# Profiles as constants and one-click cycling

The applet defines Profiles as constants in `profiles.js` and alternates them on left click. There are no menus and no configuration file. This matches the personal scope (two fixed devices) and the `ddc-brightness` style. Changing devices means editing the constants. Each Profile carries its name, output substring, input substring, and panel icon. The Active profile is the Profile whose output matches the default sink. With no match, the applet shows a generic icon and the next click selects the first Profile.

## Considered options

- **JSON config file**: rejected for v1 because the two Profiles are fixed. A file adds reading, watching, and validation code without changing behavior.
- **Menu to save the current pair**: rejected because one click must switch without intermediate UI.
- **Auto-pairing by sound card**: rejected because the desktop pair (HDMI + webcam) does not share a card, so the heuristic needs a fragile fallback.

## Consequences

- Device matching uses substrings of PulseAudio device names. A hardware change edits the constants.
- Missing devices make a Profile unavailable. The click skips to the next available Profile.
- `applet.js` keeps only Cinnamon and Cvc integration. `profiles.js` stays pure and testable with `cjs`.
