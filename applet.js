const Applet = imports.ui.applet;
const Cvc = imports.gi.Cvc;
const GLib = imports.gi.GLib;

const Profiles = require('./profiles');

const STARTUP_WINDOW_SECONDS = 30;

class SoundSwitchApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this._signalIds = [];
        this._startupWindowStarted = false;
        this._startupDone = false;
        this._startupWindowEnds = 0;
        this._startupTimer = 0;
        this._control = new Cvc.MixerControl({ name: 'Sound Switch' });

        this._connect('state-changed', () => this._onStateChanged());
        this._connect('active-output-update', () => this._refresh());
        this._connect('active-input-update', () => this._refresh());
        this._connect('output-added', () => this._refresh());
        this._connect('output-removed', () => this._refresh());
        this._connect('input-added', () => this._refresh());
        this._connect('input-removed', () => this._refresh());

        this.actor.hide();
        this._control.open();
    }

    _connect(signal, handler) {
        this._signalIds.push(this._control.connect(signal, handler));
    }

    _onStateChanged() {
        if (this._control.get_state() === Cvc.MixerControlState.READY) {
            this._refresh();
            this.actor.show();
            this._startStartupWindow();
        } else {
            this.actor.hide();
        }
    }

    _refresh() {
        let sinks = this._control.get_sinks();
        let sources = this._control.get_sources();
        let index = Profiles.activeProfileIndex(Profiles.PROFILES, this._control.get_default_sink());

        let icon = index >= 0 ? Profiles.PROFILES[index].icon : Profiles.GENERIC_ICON;
        this.set_applet_icon_symbolic_name(icon);
        this.set_applet_tooltip(this._tooltipText(index, sinks, sources));

        this._tryApplyStartupState();
    }

    _tooltipText(index, sinks, sources) {
        if (index < 0) return 'Sound Switch';
        let profile = Profiles.PROFILES[index];
        let sink = Profiles.findDevice(sinks, profile.output);
        let source = Profiles.findDevice(sources, profile.input);
        let output = sink ? Profiles.shortDeviceName(sink) : 'output unavailable';
        let input = source ? Profiles.shortDeviceName(source) : 'input unavailable';
        let devices = output === input ? output : `${output} + ${input}`;
        return `${profile.name}: ${devices}`;
    }

    _startStartupWindow() {
        if (this._startupWindowStarted) return;
        this._startupWindowStarted = true;

        if (this._startupHandled()) {
            this._startupDone = true;
            return;
        }

        this._startupWindowEnds = Date.now() + STARTUP_WINDOW_SECONDS * 1000;
        this._startupTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, STARTUP_WINDOW_SECONDS, () => {
            this._startupTimer = 0;
            this._closeStartupWindow();
            return GLib.SOURCE_REMOVE;
        });

        this._tryApplyStartupState();
    }

    _tryApplyStartupState() {
        if (this._startupDone || !this._startupWindowStarted) return;

        if (Date.now() > this._startupWindowEnds) {
            this._closeStartupWindow();
            return;
        }

        let profile = Profiles.findProfileByName(Profiles.PROFILES, Profiles.STARTUP_STATE.profile);
        let sinks = this._control.get_sinks();
        let sources = this._control.get_sources();
        if (!profile || !Profiles.profileAvailable(profile, sinks, sources)) return;

        let sink = Profiles.findDevice(sinks, profile.output);
        let source = Profiles.findDevice(sources, profile.input);
        // Cvc emits signals during the calls below; mark done so they cannot re-enter.
        this._startupDone = true;
        this._control.set_default_sink(sink);
        this._control.set_default_source(source);

        sink.volume = this._control.get_vol_max_norm() * Profiles.STARTUP_STATE.volume;
        sink.push_volume();
        if (sink.is_muted) sink.change_is_muted(false);

        this._closeStartupWindow();
    }

    _closeStartupWindow() {
        this._startupDone = true;
        if (this._startupTimer) {
            GLib.source_remove(this._startupTimer);
            this._startupTimer = 0;
        }
        this._writeStartupMarker();
    }

    _startupMarkerPath() {
        let runtimeDir = GLib.get_user_runtime_dir();
        if (!runtimeDir) return null;
        return GLib.build_filenamev([runtimeDir, 'sound-switch-startup-handled']);
    }

    _startupHandled() {
        let path = this._startupMarkerPath();
        return path !== null && GLib.file_test(path, GLib.FileTest.EXISTS);
    }

    _writeStartupMarker() {
        let path = this._startupMarkerPath();
        if (path !== null) GLib.file_set_contents(path, '');
    }

    on_applet_clicked(event) {
        let sinks = this._control.get_sinks();
        let sources = this._control.get_sources();
        let active = Profiles.activeProfileIndex(Profiles.PROFILES, this._control.get_default_sink());
        let next = Profiles.nextAvailableProfileIndex(Profiles.PROFILES, active, sinks, sources);
        if (next < 0) return;

        let profile = Profiles.PROFILES[next];
        let sink = Profiles.findDevice(sinks, profile.output);
        let source = Profiles.findDevice(sources, profile.input);
        if (sink) this._control.set_default_sink(sink);
        if (source) this._control.set_default_source(source);
    }

    on_applet_removed_from_panel() {
        if (this._startupTimer) {
            GLib.source_remove(this._startupTimer);
            this._startupTimer = 0;
        }
        for (let id of this._signalIds) this._control.disconnect(id);
        this._signalIds = [];
        this._control.close();
        this._control = null;
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new SoundSwitchApplet(metadata, orientation, panel_height, instance_id);
}
