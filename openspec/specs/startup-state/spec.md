# startup-state Specification

## Purpose

Defines the audio state the applet applies when the login session starts: the desktop Profile at 50% volume, once per session.

## Requirements

### Requirement: Startup state at login

The applet SHALL apply the Startup state once per login session: the `desktop` Profile as default sink and source, and 50% volume on its Output device, unmuted.

#### Scenario: Session starts with the desktop profile

- **WHEN** the login session starts and the `desktop` devices are present
- **THEN** the monitor output and the webcam input are the defaults, and the monitor output volume is 50% and unmuted

#### Scenario: The applet applies the state only once

- **WHEN** the applet reloads during the same login session
- **THEN** it does not change the default devices or the volume again

### Requirement: Startup availability window

The applet SHALL wait up to 30 seconds for the `desktop` devices to appear. When the `desktop` Profile is unavailable, the applet SHALL change nothing and SHALL NOT apply the state later in the session.

#### Scenario: Devices appear late

- **WHEN** the session starts and the `desktop` devices appear within 30 seconds
- **THEN** the applet applies the Startup state

#### Scenario: Desktop profile unavailable

- **WHEN** the `desktop` Profile is still unavailable after 30 seconds
- **THEN** the applet changes no default devices and no volume, and it does not apply the state later in the session
