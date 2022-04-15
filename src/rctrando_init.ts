const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.6';
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

const difficulties = {Easy: -0.3, Medium: 0, Hard: 0.3, Extreme: 0.6};
const scenarioLengths = {Speedrun: 0.2, Random: 0, Normal: 1, Long: 2, Marathon: 3};// we need big numbers because of rounding issues, we call ceil so speedrun can be really low
const randoRanges = { Low: 1.5, Medium: 2, High: 3, Extreme: 4 };
const randoCycles = { Never: 0, Infrequent: 80, 'Semi-Frequent': 40, Frequent: 24, 'Very Frequent': 8 };// 8 months per RCT year, every 10 years, 5, 3, 1

var settings = {
    rando_version: rando_version,
    rando_range: randoRanges.Medium,
    difficulty: difficulties.Medium,
    scenarioLength: scenarioLengths.Random,
    num_months_cycle: randoCycles.Infrequent,
    rando_ride_types: true,
    rando_park_flags: true,
    rando_park_values: true,
    rando_goals: true,
    rando_changes: {}
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
