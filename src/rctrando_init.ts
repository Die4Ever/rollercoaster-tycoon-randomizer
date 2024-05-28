const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.9.3 Alpha';

const bDebug:boolean = true;
function debug(message?: any, ...optionalParams: any[]): void {
    if(bDebug)
        console.log(message, optionalParams);
}
function info(message?: any, ...optionalParams: any[]): void {
    console.log(message, optionalParams);
}
function trace(message?: any, ...optionalParams: any[]): void {
    //if(bDebug)
        //console.log(message, optionalParams);
}

if (bDebug)
    ui.registerMenuItem("Archipelago Debug", archipelagoDebug);//Colby's debug menu. no touchy!

var global_settings = {
    rando_version: rando_version,
    enabled: true,
    auto_pause: true,
    reuse_seed: false,
    reuse_settings: true,
    last_used_settings: {}
};
let initedMenuItems:boolean = false;
let subscriptions = []

const minApiVersion = 52;// or 60?
const targetApiVersion = 84;// v0.4.11
info("              \n"+rando_name+" v"+rando_version
    + ", OpenRCT2 API version "+context.apiVersion+', minimum required API version is '+minApiVersion+', recommended API version is '+targetApiVersion
    + ', network.mode: '+network.mode+', context.mode: '+context.mode
);

if(context.apiVersion < targetApiVersion && typeof ui !== 'undefined') {
    // show an error dialog?
    ui.showError('You need to update OpenRCT2', 'for RCTRandomizer!');
}

function main() {
    try {
        context.registerAction('RCTRandoExec',
            (args) => {return {};},
            (args) => {return {};}
        );

        if(context.mode != 'normal') {
            return;
        }
        if(network.mode == 'client') {
            info(network.mode);
            var savedData = context.getParkStorage().get('RCTRando.settings');
            if(savedData && savedData.hasOwnProperty('seed')) {
                runNextTick(_main);
            } else {
                // TODO: fix this hack
                info('ERROR: savedData not found, you probably joined the game before RCT Randomizer initialized!');
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
    authors: ['Die4Ever','Crazycolbster'],
    type: 'remote',
    licence: "GPL-3.0",
    targetApiVersion: targetApiVersion,
    minApiVersion: minApiVersion,
    main: main
});

const difficulties = {'Very Easy': -0.7, Easy: -0.4, Medium: -0.1, Hard: 0.2, Extreme: 0.4};
const scenarioLengths = {Speedrun: 0.2, Random: 0, Normal: 1, Long: 2, Marathon: 3};// we need big numbers because of rounding issues, we call ceil so speedrun can be really low
const randoRanges = { None: 1, Low: 1.3, Medium: 1.5, High: 2, Extreme: 3 };
const randoCycles = { Never: 0, Infrequent: 80, 'Semi-Frequent': 40, Frequent: 24, 'Very Frequent': 16, 'Extremely Frequent': 8 };// 8 months per RCT year, every 10 years, 5, 3, 1

var settings = {
    rando_version: rando_version,
    rando_range: randoRanges.Medium,
    difficulty: difficulties.Easy,
    scenarioLength: scenarioLengths.Random,
    num_months_cycle: randoCycles.Infrequent,
    cycle_offset: 0,
    rando_ride_types: true,
    rando_park_flags: true,
    rando_park_values: true,
    rando_goals: true,
    rando_scouting: true,
    rando_research: true,
    rando_crowdcontrol: false,
    rando_archipelago: false
};

function _main() {
    var savedData;

    if(bDebug)
        run_tests();

    try {
        var temp_global_settings = context.sharedStorage.get('RCTRando.global_settings', global_settings);
        if(temp_global_settings['rando_version'] == rando_version) {
            for(let k in temp_global_settings) {
                global_settings[k] = temp_global_settings[k];
            }
        }
    } catch(e) {
        printException('error loading global_settings: ', e);
    }

    info(rando_name+" v"+rando_version+" starting, network.mode: "+network.mode+", enabled: "+global_settings.enabled);

    try {
        savedData = context.getParkStorage().get('RCTRando.settings');
        if(savedData)
            info("restored savedData", JSON.stringify(savedData));
    } catch(e) {
        printException('error checking savedData: ', e);
    }

    if(savedData && savedData.hasOwnProperty('seed')) {
        loadedGame(savedData);
    }
    else {
        newGame();
    }

    info(rando_name+" v"+rando_version+" finished startup\n               ");
}
