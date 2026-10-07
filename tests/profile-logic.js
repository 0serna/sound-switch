// Run from the repository root: cjs tests/profile-logic.js
const GLib = imports.gi.GLib;
const System = imports.system;

imports.searchPath.unshift(GLib.get_current_dir());
const Profiles = imports.profiles;

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
    if (actual === expected) {
        passed++;
        print(`PASS ${label}`);
    } else {
        failed++;
        print(`FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function device(name, description) {
    return { name: name, description: description };
}

const HDMI = device(
    "alsa_output.pci-0000_03_00.1.hdmi-stereo-extra1",
    "Navi 31 HDMI/DP Audio Digital Stereo (HDMI 2)"
);
const JBL_SINK = device(
    "alsa_output.usb-Harman_International_Inc_JBL_Quantum_TWS_0000000000000000-00.analog-stereo",
    "JBL Quantum TWS Analog Stereo"
);
const BRIO = device(
    "alsa_input.usb-046d_Brio_100_2438AP22ZK98-02.mono-fallback",
    "Brio 100 Mono"
);
const JBL_SOURCE = device(
    "alsa_input.usb-Harman_International_Inc_JBL_Quantum_TWS_0000000000000000-00.mono-fallback",
    "JBL Quantum TWS Mono"
);
const UNKNOWN = device("alsa_output.platform-dummy", "Dummy Output");

const ALL_SINKS = [HDMI, JBL_SINK];
const ALL_SOURCES = [BRIO, JBL_SOURCE];
const PROFILES = Profiles.PROFILES;

// Matching
check("match by name substring", Profiles.findDevice(ALL_SINKS, "hdmi"), HDMI);
check("match case-insensitive", Profiles.findDevice(ALL_SINKS, "jbl_quantum_tws"), JBL_SINK);
check("match by description", Profiles.findDevice(ALL_SOURCES, "Brio 100 Mono"), BRIO);
check("no match returns null", Profiles.findDevice(ALL_SINKS, "nonexistent"), null);

const CVC_LIKE = {
    get_name: () => "alsa_output.usb-Harman_International_Inc_JBL_Quantum_TWS_0000000000000000-00.analog-stereo",
    get_description: () => "JBL Quantum TWS Analog Stereo"
};
check("match cvc-like accessors", Profiles.findDevice([CVC_LIKE], "JBL_Quantum_TWS"), CVC_LIKE);

// Short names for tooltips
check("short name strips Analog Stereo", Profiles.shortDeviceName(JBL_SINK), "JBL Quantum TWS");
check("short name strips Mono", Profiles.shortDeviceName(BRIO), "Brio 100");
check("short name strips Digital Stereo and HDMI", Profiles.shortDeviceName(HDMI), "Navi 31 HDMI/DP Audio");
check("short name keeps descriptions without suffix", Profiles.shortDeviceName(UNKNOWN), "Dummy Output");
check("short name for cvc-like accessors", Profiles.shortDeviceName(CVC_LIKE), "JBL Quantum TWS");

// Active profile detection
check("active desktop by HDMI", Profiles.activeProfileIndex(PROFILES, HDMI), 0);
check("active headphones by JBL", Profiles.activeProfileIndex(PROFILES, JBL_SINK), 1);
check("active unknown returns -1", Profiles.activeProfileIndex(PROFILES, UNKNOWN), -1);

// Availability
check("desktop available", Profiles.profileAvailable(PROFILES[0], ALL_SINKS, ALL_SOURCES), true);
check("desktop unavailable without Brio", Profiles.profileAvailable(PROFILES[0], ALL_SINKS, [JBL_SOURCE]), false);
check("headphones unavailable without JBL sink", Profiles.profileAvailable(PROFILES[1], [HDMI], ALL_SOURCES), false);

// Next available profile
check("desktop -> headphones", Profiles.nextAvailableProfileIndex(PROFILES, 0, ALL_SINKS, ALL_SOURCES), 1);
check("headphones -> desktop (wrap)", Profiles.nextAvailableProfileIndex(PROFILES, 1, ALL_SINKS, ALL_SOURCES), 0);
check("no active -> first profile", Profiles.nextAvailableProfileIndex(PROFILES, -1, ALL_SINKS, ALL_SOURCES), 0);
check("only active available -> none", Profiles.nextAvailableProfileIndex(PROFILES, 0, ALL_SINKS, [BRIO]), -1);
check("skip unavailable desktop", Profiles.nextAvailableProfileIndex(PROFILES, -1, [JBL_SINK], ALL_SOURCES), 1);
check("no profile available", Profiles.nextAvailableProfileIndex(PROFILES, -1, [HDMI], [JBL_SOURCE]), -1);

print(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
    System.exit(1);
}
