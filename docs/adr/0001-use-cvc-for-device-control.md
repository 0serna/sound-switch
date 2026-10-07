# Use Cvc for audio device control

The applet enumerates and switches audio devices through `Cvc.MixerControl` (libgnome-volume-control), the same library the Cinnamon sound applet uses. Cvc is present on Cinnamon systems as `Cvc-1.0.typelib`, exposes `set_default_sink()` and `set_default_source()`, and pushes signals for device and default changes. This avoids spawning `pactl` per action and parsing its output. Verified on Mint 22.3 with Cinnamon 6.6.9: `imports.gi.Cvc` works under `cjs`, and it lists the two sinks and two sources of this machine.

## Considered options

- **`pactl` subprocess**: rejected because every action spawns a process, device state needs polling or `pactl subscribe` parsing, and the native applet already proves the Cvc path.
- **`wpctl` subprocess**: rejected for the same reasons, plus it is PipeWire-only while Cvc works on both PulseAudio and PipeWire.

## Consequences

- The applet depends on Cinnamon's Cvc typelib. This product targets Cinnamon only.
- Device objects are live Cvc proxies. The applet must handle added and removed signals.
