# Spec Delta

## Purpose

One-click switching between fixed audio device pairs (Profiles). Each click applies the next Profile to the system defaults, and the panel icon shows which Profile is active.

## ADDED Requirements

### Requirement: Fixed profile set

The applet SHALL define two Profiles: `desktop` and `headphones`. Each Profile SHALL pair one Output device and one Input device, and SHALL match devices by a substring of the device name.

#### Scenario: Desktop profile matches the monitor and webcam

- **WHEN** the applet matches the `desktop` Profile
- **THEN** the output match selects the HDMI output and the input match selects the Brio webcam

#### Scenario: Headphones profile matches the headset

- **WHEN** the applet matches the `headphones` Profile
- **THEN** both matches select the JBL Quantum TWS devices

### Requirement: One-click profile switching

The applet SHALL apply the next available Profile on each left click. Applying a Profile sets its Output device as the default sink and its Input device as the default source.

#### Scenario: Click applies the next profile

- **WHEN** the active profile is `desktop` and the user clicks the applet
- **THEN** the applet applies `headphones`: the headset output and the headset input become the defaults

#### Scenario: Cycling wraps around

- **WHEN** the active profile is `headphones` and the user clicks the applet
- **THEN** the applet applies `desktop`

#### Scenario: Playing streams move with the switch

- **WHEN** the user applies a Profile while audio is playing on the previous output
- **THEN** the audio plays on the new Output device

### Requirement: Active profile detection

The Active profile SHALL be the Profile whose Output device matches the current default sink. The applet SHALL track default device changes made outside the applet.

#### Scenario: External default change updates the active profile

- **WHEN** another application sets the headset output as the default sink
- **THEN** the applet shows `headphones` as the Active profile

#### Scenario: No profile matches

- **WHEN** the default sink does not match any Profile
- **THEN** the applet shows a generic icon, and the next click applies the first Profile

### Requirement: Panel icon reflects the active profile

The panel icon SHALL represent the Active profile, using the icon defined by that Profile.

#### Scenario: Icon at startup

- **WHEN** the applet starts and the default sink is the monitor output
- **THEN** the panel icon is the `desktop` icon

#### Scenario: Icon after a switch

- **WHEN** the applet applies the `headphones` Profile
- **THEN** the panel icon becomes the `headphones` icon

### Requirement: Unavailable profiles are skipped

A Profile SHALL be unavailable when its Output device or its Input device is not present. A click SHALL skip unavailable Profiles and SHALL change nothing when no Profile is available.

#### Scenario: Headset unplugged

- **WHEN** the headset is absent and the active profile is `desktop`
- **THEN** a click changes no devices

#### Scenario: No profile available

- **WHEN** no Profile has both devices present and the user clicks
- **THEN** the applet changes nothing

### Requirement: Tooltip shows the active profile

The applet tooltip SHALL show the Active profile name and the short names of its Output device and Input device. An identical short name SHALL appear once. Short names come from the device description without its type suffix.

#### Scenario: Tooltip content

- **WHEN** the active profile is `headphones`
- **THEN** the tooltip is `headphones: JBL Quantum TWS`

#### Scenario: Tooltip with different devices

- **WHEN** the active profile is `desktop`
- **THEN** the tooltip is `desktop: Navi 31 HDMI/DP Audio + Brio 100`
