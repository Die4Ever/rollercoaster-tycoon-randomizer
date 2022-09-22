const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.9 Alpha';
let debug:boolean = false;

var global_settings = {
    enabled: true,
    auto_pause: true,
    reuse_seed: false
};
let initedMenuItems:boolean = false;
let subscriptions = []

const minApiVersion = 50;
const targetApiVersion = 59;
console.log("              \n"+rando_name+" v"+rando_version
    + ", OpenRCT2 API version "+context.apiVersion+', minimum required API version is '+minApiVersion+', recommended API version is '+targetApiVersion
    + ', network.mode: '+network.mode+', context.mode: '+context.mode
);

if(context.apiVersion < minApiVersion && typeof ui !== 'undefined') {
    // show an error dialog?
    //ui.showError('', 'You need to update OpenRCT2 for RCTRandomizer!');
}

function main() {
    try {
        if(context.mode != 'normal') {
            return;
        }
        if(network.mode == 'client') {
            console.log(network.mode);
            var savedData = context.getParkStorage().getAll();
            if(savedData && savedData.hasOwnProperty('seed')) {
                runNextTick(_main);
            } else {
                // TODO: fix this hack
                console.log('ERROR: savedData not found, you probably joined the game before RCT Randomizer initialized!');
            }
            return;
        }
        runNextTick(_main);
    } catch(e) {
        printException('error in _main', e);
    }
}

registerPlugin({
    name: rando_name,
    version: rando_version,
    authors: ['Die4Ever'],
    type: 'remote',
    licence: "GPL-3.0",
    targetApiVersion: targetApiVersion,
    minApiVersion: minApiVersion,
    main: main
});

const difficulties = {'Very Easy': -0.5, Easy: -0.3, Medium: 0, Hard: 0.2, Extreme: 0.4};
const scenarioLengths = {Speedrun: 0.2, Random: 0, Normal: 1, Long: 2, Marathon: 3};// we need big numbers because of rounding issues, we call ceil so speedrun can be really low
const randoRanges = { Low: 1.3, Medium: 1.5, High: 2, Extreme: 3 };
const randoCycles = { Never: 0, Infrequent: 80, 'Semi-Frequent': 40, Frequent: 24, 'Very Frequent': 16, 'Extremely Frequent': 8 };// 8 months per RCT year, every 10 years, 5, 3, 1

var settings = {
    rando_version: rando_version,
    rando_range: randoRanges.Medium,
    difficulty: difficulties.Medium,
    scenarioLength: scenarioLengths.Random,
    num_months_cycle: randoCycles.Infrequent,
    cycle_offset: 0,
    rando_ride_types: true,
    rando_park_flags: true,
    rando_park_values: true,
    rando_goals: true,
    rando_scouting: true,
    rando_crowdcontrol: false,
    rando_changes: {}
};

function _main() {
    var savedData;

    if(debug)
        run_tests();

    global_settings = context.sharedStorage.get('RCTRando.global_settings', global_settings);
    console.log(rando_name+" v"+rando_version+" starting, network.mode: "+network.mode+", enabled: "+global_settings.enabled);

    try {
        savedData = context.getParkStorage().getAll();
        if(savedData)
            console.log("restored savedData", JSON.stringify(savedData));
    } catch(e) {
        printException('error checking savedData: ', e);
    }

    if(savedData && savedData.hasOwnProperty('seed')) {
        loadedGame(savedData);
    }
    else {
        newGame();
    }

    console.log(rando_name+" v"+rando_version+" finished startup\n               ");
}

function loadedGame(savedData) {
    setGlobalSeed(savedData.seed);
    console.log("restored saved seed "+globalseed, JSON.stringify(savedData));
    for(let k in savedData) {
        if(savedData.hasOwnProperty(k))
            settings[k] = savedData[k];
    }
    //startGameGui();// just for testing
    initMenuItems();
    if(global_settings.enabled===false) {
        return;
    }
    global_settings.enabled = true;
    createChangesWindow();
    AnyEntry();
    if(settings.rando_crowdcontrol) {
        init_crowdcontrol();
    }
}

function newGame() {
    // use for headless? saves in your %USERPROFILE%\Documents\OpenRCT2\plugin.store.json
    var nextSeed = context.sharedStorage.get('RCTRando.nextSeed');
    console.log("nextSeed was", nextSeed);
    if(nextSeed) {
        setGlobalSeed(nextSeed);
    } else {
        setGlobalSeed(context.getRandom(1, 999999 + 1));

        if(global_settings.reuse_seed) {
        }
    }
    context.sharedStorage.set("RCTRando.nextSeed", null);

    if(global_settings.enabled===false) {
        initMenuItems();
        return;
    }
    global_settings.enabled = true;
    // pause game and open menu
    startGameGui();
}

function SaveGlobalSettings() {
    context.sharedStorage.set('RCTRando.global_settings', global_settings);
}

function EnableDisableRando(enabled:boolean) {
    global_settings.enabled = enabled;
    console.log(global_settings.enabled ? 'Enabling' : 'Disabling');
    SaveGlobalSettings();
    if(global_settings.enabled) {
        main();
    } else {
        UnSubscribeEvents();
    }
}

function EnableDisableAutoPause(enabled:boolean) {
    global_settings.auto_pause = enabled;
    SaveGlobalSettings();
}

function EnableDisableReuseSeed(enabled:boolean) {
    global_settings.reuse_seed = enabled;
    SaveGlobalSettings();
}
