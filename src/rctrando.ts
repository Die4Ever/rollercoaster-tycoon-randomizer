/// <reference path="../lib/openrct2.d.ts" />
/// <reference path="base.ts" />
/// <reference path="gui.ts" />
/// <reference path="tests.ts" />

const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.3';
console.log(rando_name+" v"+rando_version+", OpenRCT2 API version "+context.apiVersion+', minimum required API version is 46, network.mode: '+network.mode);

function main() {
    try {
        _main();
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
    targetApiVersion: 46,
    minApiVersion: 46,
    main: main
});

var difficulties = {Easy: -0.3, Medium: 0, Hard: 0.3, Extreme: 0.6};
// we need big numbers because of rounding issues, we call ceil so speedrun can be really low
var scenarioLengths = {Speedrun: 0.2, Random: 0, Normal: 1, Long: 2, Marathon: 3};
//var difficulty = 0;
var scenarioLength = 0;// 0 means random
var rando_ride_types = true;
var rando_park_flags = true;
var rando_park_values = true;
var rando_goals = true;

function _main() {
    var savedData;

    if(debug)
        run_tests();

    console.log(rando_name+" v"+rando_version+" starting, network.mode: "+network.mode);

    try {
        savedData = context.getParkStorage().getAll();
        if(savedData)
            console.log("restored savedData", savedData);
    } catch(e) {
        printException('error checking savedData: ', e);
    }

    if(savedData && (savedData.seed || savedData.seed === 0)) {
        loadedGame(savedData);
    }
    else {
        newGame();
    }
    console.log(rando_name+" v"+rando_version+" finished startup");
}

function loadedGame(savedData) {
    setGlobalSeed(savedData.seed);
    console.log("restored saved seed "+globalseed, savedData);
    if(savedData.hasOwnProperty('difficulty'))
        difficulty = savedData.difficulty;
    if(savedData.hasOwnProperty('scenarioLength'))
        scenarioLength = savedData.scenarioLength;
    if(savedData.hasOwnProperty('rando_ride_types'))
        rando_ride_types = savedData.rando_ride_types;
    if(savedData.hasOwnProperty('rando_park_flags'))
        rando_park_flags = savedData.rando_park_flags;
    if(savedData.hasOwnProperty('rando_park_values'))
        rando_park_values = savedData.rando_park_values;
    if(savedData.hasOwnProperty('rando_goals'))
        rando_goals = savedData.rando_goals;
    //startGameGui();// just for testing
    initMenuItem();
    SubscribeEvents();
}

function newGame() {
    // saves in your %USERPROFILE%\Documents\OpenRCT2\plugin.store.json
    var nextSeed = context.sharedStorage.get('RCTRando.nextSeed');
    console.log("nextSeed", nextSeed);
    if(nextSeed) {
        setGlobalSeed(nextSeed);
    } else {
        setGlobalSeed(context.getRandom(1, 999999 + 1));
    }
    context.sharedStorage.set("RCTRando.nextSeed", null);
    // pause game and open menu
    startGameGui();
}

function initRando() {
    try {
        context.getParkStorage().set("seed", globalseed);
        context.getParkStorage().set("difficulty", difficulty);
        context.getParkStorage().set("scenarioLength", scenarioLength);
        context.getParkStorage().set("rando_ride_types", rando_ride_types);
        context.getParkStorage().set("rando_park_flags", rando_park_flags);
        context.getParkStorage().set("rando_park_values", rando_park_values);
        context.getParkStorage().set("rando_goals", rando_goals);
        console.log('just saved data', context.getParkStorage().getAll());
    } catch(e) {
        printException('error saving seed: ', e);
    }
    console.log(rando_name+' v'+rando_version
        + ' starting with seed '+globalseed
        + ', api version '+context.apiVersion
        + ', difficulty: '+difficulty
        + ', scenarioLength: '+scenarioLength
    );

    try {
        RandomizeScenario();
        RandomizePark();
        RandomizeMap();
        RandomizeClimate();
        SubscribeEvents();
        RandomizeGuests();
    } catch(e) {
        printException('error in initRando(): ', e);
    }
}

function SubscribeEvents() {
    context.subscribe("guest.generation", function(id) {
        RandomizeGuest(map.getEntity(id.id));
    });
    RandomizeRideTypes();
}

function RandomizeParkFlag(name, difficulty) {
    var val = park.getFlag(name);
    if( RngBoolWithDifficulty(difficulty) ) {
        console.log('enabling flag '+name);
        park.setFlag(name, true );
        // TODO: we need our own UIs so we can put this kind of info in there
        //scenario.details += '\n'+name+': '+park.getFlag(name);
    }
    else {
        console.log('disabling flag '+name);
        park.setFlag(name, false );
    }
}

function RandomizeScenario() {
    setLocalSeed('RandomizeScenarioLength');
    if(Math.abs(scenarioLength) < 0.1) {
        scenarioLength = rng(50, 300) / 100;
    }
    
    console.log('scenario.objective.year: ', scenario.objective.year, ', scenarioLength: '+scenarioLength);
    if(scenario.objective.year) {
        // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
        scenario.objective.year = Math.ceil(scenario.objective.year * scenarioLength);
        console.log('scenarioLength: '+scenarioLength+', new scenario.objective.year: '+scenario.objective.year);
    } else {
        // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
        scenarioLength = 1;
    }

    setLocalSeed('RandomizeScenarioGoals');

    // the excitement goal doesn't get twice as easy when you have twice as much time, so we ** 0.3
    if(rando_goals) {
        if(scenario.objective.guests)
            scenario.objective.guests = randomize(scenario.objective.guests, 1) * scenarioLength;
        if(scenario.objective.excitement)
            scenario.objective.excitement = randomize(scenario.objective.excitement, 1) * (scenarioLength ** 0.3);
        if(scenario.objective.monthlyIncome)
            scenario.objective.monthlyIncome = randomize(scenario.objective.monthlyIncome, 1) * scenarioLength;
        if(scenario.objective.parkValue)
            scenario.objective.parkValue = randomize(scenario.objective.parkValue, 1) * scenarioLength;
    } else {
        if(scenario.objective.guests)
            scenario.objective.guests *= scenarioLength;
        if(scenario.objective.excitement)
            scenario.objective.excitement *= scenarioLength ** 0.3;
        if(scenario.objective.monthlyIncome)
            scenario.objective.monthlyIncome *= scenarioLength;
        if(scenario.objective.parkValue)
            scenario.objective.parkValue *= scenarioLength;
    }
    console.log(scenario);
    console.log(scenario.objective);
}

function RandomizePark() {
    setLocalSeed('RandomizeParkFlags');
    
    if(rando_park_flags) {
        RandomizeParkFlag("difficultGuestGeneration", 1);
        RandomizeParkFlag("difficultParkRating", 1);
        RandomizeParkFlag("forbidHighConstruction", 1);
        RandomizeParkFlag("forbidLandscapeChanges", 1);
        RandomizeParkFlag("forbidMarketingCampaigns", 1);
        RandomizeParkFlag("forbidTreeRemoval", 1);
        RandomizeParkFlag("freeParkEntry", 1);
        RandomizeParkFlag("preferMoreIntenseRides", 1);
        RandomizeParkFlag("preferLessIntenseRides", -1);
        RandomizeParkFlag("unlockAllPrices", -1);// I think this allows the player to always set entry fees and ride fees?
        //RandomizeParkFlag("noMoney", -1);// too easy?
    }

    setLocalSeed('RandomizeParkValues');
    if(rando_park_values) {
        park.maxBankLoan = randomize(park.maxBankLoan, -1);
        park.landPrice = randomize(park.landPrice, 1);
        park.constructionRightsPrice = randomize(park.constructionRightsPrice, 1);
        park.cash = randomize(park.cash, -1);
        park.bankLoan = randomize(park.bankLoan, 1);
    }
}

function RandomizeMap() {
    setLocalSeed('RandomizeMap');
}

function RandomizeClimate() {
    setLocalSeed('RandomizeClimate');
   // TODO: need setClimate function binding
}

function RandomizeRideTypes() {
    if(!rando_ride_types)
        return;

    for(var r in map.rides) {
        RandomizeRide(map.rides[r].id);
    }

    context.subscribe("ride.ratings.calculate", function(ratings) {
        RandomizeRide(ratings.rideId);
    });
    context.subscribe("action.execute", function(event) {
        if( event.action != 'trackplace' ) return;
        if( event.isClientOnly ) return;
        RandomizeRide(event.args['ride']);
    });
}

function RandomizeRide(rideId) {
    let ride = map.getRide(rideId);
    console.log('RandomizeRide '+ride.name+', type: '+ride.type);
    setLocalSeed('RandomizeRide' + ride.type);
    ride.runningCost = randomize(ride.runningCost, 1);
    ride.inspectionInterval = randomize(ride.inspectionInterval, 1);
    ride.excitement = randomize(ride.excitement, -1);
    ride.intensity = randomize(ride.intensity, 0);
    ride.nausea = randomize(ride.nausea, -1);
}

function RandomizeGuests() {
    var guests = map.getAllEntities('guest');
    for(var i in guests) {
        RandomizeGuest(guests[i]);
    }
}

function RandomizeGuest(guest) {
    setLocalSeed('RandomizeGuest' + guest.id);
}
