const Applet = imports.ui.applet;
const Cvc = imports.gi.Cvc;

const Profiles = require('./profiles');

class SoundSwitchApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this._signalIds = [];
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
        for (let id of this._signalIds) this._control.disconnect(id);
        this._signalIds = [];
        this._control.close();
        this._control = null;
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new SoundSwitchApplet(metadata, orientation, panel_height, instance_id);
}
