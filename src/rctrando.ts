/// <reference path="../lib/openrct2.d.ts" />
/// <reference path="base.ts" />
/// <reference path="gui.ts" />
/// <reference path="tests.ts" />

const rando_name = 'RollerCoaster Tycoon Randomizer';
const rando_version = '0.3';

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

//var difficulty = 0;
var scenarioLength = 0;// 0 means random
var rando_ride_types = true;
var rando_park_flags = true;
var rando_park_values = true;
var rando_goals = true;

var changes = {};

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
    if(savedData.hasOwnProperty('rando_changes'))
        changes = savedData.rando_changes;
    if(savedData.hasOwnProperty('rando_range'))
        rando_range = savedData.rando_range;
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

function initRando() {
    try {
        let storage = context.getParkStorage();
        storage.set("seed", globalseed);
        storage.set("difficulty", difficulty);
        storage.set("scenarioLength", scenarioLength);
        storage.set("rando_ride_types", rando_ride_types);
        storage.set("rando_park_flags", rando_park_flags);
        storage.set("rando_park_values", rando_park_values);
        storage.set("rando_goals", rando_goals);
        storage.set("rando_changes", changes);
        storage.set("rando_range", rando_range);
        console.log('just saved data', JSON.stringify(storage.getAll()));
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

function AddChange(key, name, from, to, factor=null) {
    var obj = {name: name, from: from, to: to, factor: factor};
    console.log('AddChange', key, JSON.stringify(obj));
    if(from === to && !factor) return;

    changes[key] = obj;
    context.getParkStorage().set("rando_changes", changes);
}

function RandomizeParkFlag(name, difficulty) {
    var val = park.getFlag(name);
    park.setFlag(name, RngBoolWithDifficulty(difficulty));
    AddChange(name, name, val, park.getFlag(name));
}

function RandomizeObjective(name, difficulty, scenarioLengthExp=1) {
    if(!scenario.objective[name]) return;

    const old = scenario.objective[name];
    if(rando_goals) {
        scenario.objective[name] = randomize(scenario.objective[name], difficulty) * (scenarioLength ** scenarioLengthExp);
    } else {
        scenario.objective[name] *= (scenarioLength ** scenarioLengthExp);
    }
    AddChange(name, 'Objective '+name, old, scenario.objective[name]);
}

function RandomizeField(obj, name, difficulty) {
    if(!obj[name]) return;

    const old = obj[name];
    obj[name] = randomize(obj[name], difficulty);
    AddChange(name, name, old, obj[name]);
}

function RandomizeScenario() {
    setLocalSeed('RandomizeScenarioLength');
    if(Math.abs(scenarioLength) < 0.1) {
        scenarioLength = rng(50, 300) / 100;
    }
    
    console.log('scenario.objective.year: ', scenario.objective.year, ', scenarioLength: '+scenarioLength);
    if(scenario.objective.year) {
        // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
        const old = scenario.objective.year;
        scenario.objective.year = Math.ceil(scenario.objective.year * scenarioLength);
        AddChange('objective.year', 'Objective Year', old, scenario.objective.year);
    } else {
        // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
        scenarioLength = 1;
    }

    setLocalSeed('RandomizeScenarioGoals');

    // the excitement goal doesn't get twice as easy when you have twice as much time, so we ** 0.3
    RandomizeObjective('guests', 1);
    RandomizeObjective('excitement', 1, 0.3);
    RandomizeObjective('monthlyIncome', 1);
    RandomizeObjective('parkValue', 1);

    //console.log(scenario);
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
        RandomizeField(park, 'maxBankLoan', -1);
        RandomizeField(park, 'landPrice', 1);
        RandomizeField(park, 'constructionRightsPrice', 1);
        RandomizeField(park, 'cash', -1);
        RandomizeField(park, 'bankLoan', 1);
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
        runNextTick(function() {
            RandomizeRide(ratings.rideId);
        });
    });
}

function RandomizeRideTypeField(ride, name, difficulty) {
    const type = ride.type;
    const old = ride[name];
    let factor = randomize(1, difficulty);
    ride[name] *= factor;
    let ride_type_name = ride.object.name;
    const key_name = 'ride:'+type+':'+name;
    if( !changes[key_name] || changes[key_name].factor.toFixed(5) !== factor.toFixed(5) )
        AddChange(key_name, ride_type_name+' '+name, null, null, factor); // prefer not changing the name, don't record absolute values just the factor
}

function RandomizeRide(rideId) {
    let ride = map.getRide(rideId);
    console.log('RandomizeRide '+ride.name+', type: '+ride.type+', classification: '+ride.classification);
    setLocalSeed('RandomizeRide' + ride.type);

    if(ride.classification == 'ride') {
        RandomizeRideTypeField(ride, 'runningCost', 1);
        RandomizeRideTypeField(ride, 'excitement', -1);
        RandomizeRideTypeField(ride, 'intensity', 0);
        RandomizeRideTypeField(ride, 'nausea', -1);
    }
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
