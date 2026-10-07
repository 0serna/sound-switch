// Profile constants and pure selection logic.
//
// Loaded two ways:
// - Cinnamon: require('./profiles') from applet.js
// - Tests: imports.profiles after adding this directory to imports.searchPath
//
// Exports use var and function declarations so both loaders see them.

var PROFILES = [
    {
        name: "desktop",
        output: "hdmi",
        input: "Brio",
        icon: "video-display-symbolic"
    },
    {
        name: "headphones",
        output: "JBL_Quantum_TWS",
        input: "JBL_Quantum_TWS",
        icon: "xsi-audio-headset-symbolic"
    }
];

var GENERIC_ICON = "xsi-audio-volume-high-symbolic";

function deviceName(device) {
    if (!device) return "";
    if (typeof device.get_name === "function") return device.get_name() || "";
    return device.name || "";
}

function deviceDescription(device) {
    if (!device) return "";
    if (typeof device.get_description === "function") return device.get_description() || "";
    return device.description || "";
}

var DESCRIPTION_SUFFIX_PATTERN = /\s+(Analog|Digital|Mono|Stereo)\b.*$/i;

function shortDeviceName(device) {
    return deviceDescription(device).replace(DESCRIPTION_SUFFIX_PATTERN, "");
}

function deviceMatches(device, substring) {
    if (!device || !substring) return false;
    let needle = substring.toLowerCase();
    return deviceName(device).toLowerCase().indexOf(needle) !== -1 ||
           deviceDescription(device).toLowerCase().indexOf(needle) !== -1;
}

function findDevice(devices, substring) {
    for (let i = 0; i < devices.length; i++) {
        if (deviceMatches(devices[i], substring)) return devices[i];
    }
    return null;
}

function activeProfileIndex(profiles, defaultSink) {
    for (let i = 0; i < profiles.length; i++) {
        if (deviceMatches(defaultSink, profiles[i].output)) return i;
    }
    return -1;
}

function profileAvailable(profile, sinks, sources) {
    return findDevice(sinks, profile.output) !== null &&
           findDevice(sources, profile.input) !== null;
}

function nextAvailableProfileIndex(profiles, activeIndex, sinks, sources) {
    let count = profiles.length;
    for (let step = 1; step <= count; step++) {
        let index = (activeIndex + step) % count;
        if (index === activeIndex) continue;
        if (profileAvailable(profiles[index], sinks, sources)) return index;
    }
    return -1;
}
