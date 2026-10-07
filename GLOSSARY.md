# Sound Switch

Cinnamon panel applet that alternates audio Output device and Input device pairs, called Profiles, with one click on the panel icon.

## Language

**Profile**:
A named pair of one Output device and one Input device, plus the panel icon that represents it. This product defines two: `desktop` and `headphones`.
_Avoid_: Mode, preset, scene, combo

**Output device**:
The sink that plays system audio. Cinnamon UI calls it "Output". PulseAudio calls it sink.
_Avoid_: Speaker, card, port

**Input device**:
The source that captures system audio. Cinnamon UI calls it "Input". PulseAudio calls it source.
_Avoid_: Microphone, mic, card

**Active profile**:
The Profile whose Output device is the current default sink. The panel icon shows the Active profile.
_Avoid_: Current profile, selected profile

**Switch**:
Apply a Profile: set its Output device as the default sink and its Input device as the default source. Streams follow the new default sink because WirePlumber has `follow = true`.
_Avoid_: Change, toggle, rotate

**Applet**:
The panel applet instance with UUID `sound-switch@oserna` and display name "Sound Switch".
_Avoid_: Spice, extension
