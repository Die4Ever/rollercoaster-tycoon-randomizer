const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.5 Alpha';
let debug:boolean = false;

console.log("              \n"+rando_name+" v"+rando_version
    + ", OpenRCT2 API version "+context.apiVersion+', minimum required API version is 46, recommended API version is 51'
    + ', network.mode: '+network.mode+', context.mode: '+context.mode
);

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
    targetApiVersion: 51,
    minApiVersion: 46,
    main: main
});

var settings = {
    rando_range: 2,
    difficulty: 0,
    scenarioLength: 0,// 0 means random
    rando_ride_types: true,
    rando_park_flags: true,
    rando_park_values: true,
    rando_goals: true,
    rando_changes: {},
    num_years_cycle: 40// 8 months per year in RCT, 5 years per cycle
};

function _main() {
    var savedData;

    if(debug)
        run_tests();

    console.log(rando_name+" v"+rando_version+" starting, network.mode: "+network.mode);

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
    initMenuItem();
    createChangesWindow();
    SubscribeEvents();
}

function newGame() {
    // use for headless? saves in your %USERPROFILE%\Documents\OpenRCT2\plugin.store.json
    var nextSeed = context.sharedStorage.get('RCTRando.nextSeed');
    console.log("nextSeed was", nextSeed);
    if(nextSeed) {
        setGlobalSeed(nextSeed);
    } else {
        setGlobalSeed(context.getRandom(1, 999999 + 1));
    }
    context.sharedStorage.set("RCTRando.nextSeed", null);
    // pause game and open menu
    startGameGui();
}
