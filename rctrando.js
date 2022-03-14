
var rando_name = 'RollerCoaster Tycoon Randomizer';
var rando_version = '0.04';
var rando_authors = ['Die4Ever'];
// ~~ forces JS to convert to int
var globalseed = ~~0;
var tseed = ~~0;
var gen1, gen2;
gen2 = ~~2147483643;
gen1 = ~~(gen2/2);

function main() {
    var savedData;
    console.log(rando_name+" v"+rando_version+" starting...");
    try {
        savedData = context.getParkStorage().getAll();
        if(savedData)
            console.log("savedData", savedData);
    } catch(e) {
        printException('error checking savedData: ', e);
    }
    if(savedData && savedData.seed) {
        setGlobalSeed(savedData.seed);
        console.log("restored saved seed "+globalseed);
        SubscribeEvents();
    }
    else {
        initRando();
    }
    console.log(rando_name+" v"+rando_version+" finished startup with seed "+globalseed);
}

registerPlugin({
    name: rando_name,
    version: rando_version,
    authors: rando_authors,
    type: 'remote',
    licence: "GPL-3.0",
    targetApiVersion: 46,
    minApiVersion: 34,
    main: main
});

function initRando() {
    // saves in your Documents\OpenRCT2\plugin.store.json
    var nextSeed = context.sharedStorage.get('RCTRando.nextSeed');
    console.log("nextSeed", nextSeed);
    if(nextSeed) {
        setGlobalSeed(nextSeed);
    } else {
        setGlobalSeed(context.getRandom(1, 999999 + 1));
    }
    context.sharedStorage.set("RCTRando.nextSeed", null);
    if (typeof ui !== 'undefined') {
        // pause game and open menu
    }
    try {
        context.getParkStorage().set("seed", globalseed);
    } catch(e) {
        printException('error saving seed: ', e);
    }
    console.log(rando_name+" v"+rando_version+" starting with seed "+globalseed +", api version "+context.apiVersion);

    RandomizePark();
    RandomizeMap();
    RandomizeClimate();
    RandomizeScenario();
    SubscribeEvents();
    RandomizeGuests();
}

function SubscribeEvents() {
    context.subscribe("guest.generation", function(id) {
        RandomizeGuest(map.getEntity(id.id));
    });
    RandomizeRideTypes();
}

function rng(min, max) {
    tseed = ~~(gen1 * tseed * 5 + gen2 + (tseed/5) * 3);
    if(tseed < 0)
        tseed = ~~(-tseed);
    var ret = (tseed >>> 8) % max;
    //console.log("rng("+min+", "+max+") "+tseed+", "+ret);
    return ret;
}

function setGlobalSeed(newSeed) {
    // use this to set the seed for the whole game
    globalseed = ~~newSeed;
    tseed = ~~newSeed;
}

function setSeed(newSeed) {
    tseed = ~~newSeed;
}

function setLocalSeed(name) {
    setSeed(globalseed + crc32(name));
}

function randomize(value, difficulty) {
    // TODO: difficulty > 0 means larger numbers increase difficulty, < 0 means decreases difficulty
    // have a system to balance difficulty, maybe a card-shuffle rng
    var ret = (value * rng(50, 150)) / 100.0;
    console.log('randomize('+value+', '+difficulty+'): '+ret);
    return ret;
}

function RandomizeParkFlag(name, difficulty) {
    if( rng(0, 1) ) {
        console.log('flipping flag '+name);
        park.setFlag(name, !park.getFlag(name) );
        // TODO: we need our own UIs so we can put this kind of info in there
        //scenario.details += '\n'+name+': '+park.getFlag(name);
    }
    else {
        console.log('leaving flag '+name);
    }
}

function RandomizePark() {
    setLocalSeed('RandomizePark');
    
    RandomizeParkFlag("difficultGuestGeneration", 1);
    RandomizeParkFlag("difficultParkRating", 1);
    RandomizeParkFlag("forbidHighConstruction", 1);
    RandomizeParkFlag("forbidLandscapeChanges", 1);
    RandomizeParkFlag("forbidMarketingCampaigns", 1);
    RandomizeParkFlag("forbidTreeRemoval", 1);
    RandomizeParkFlag("freeParkEntry", 1);
    RandomizeParkFlag("noMoney", 1);
    RandomizeParkFlag("preferLessIntenseRides", -1);
    RandomizeParkFlag("preferMoreIntenseRides", 1);
    RandomizeParkFlag("unlockAllPrices", 0);

    park.maxBankLoan = randomize(park.maxBankLoan, -1);
    park.landPrice = randomize(park.landPrice, 1);
    park.constructionRightsPrice = randomize(park.constructionRightsPrice, 1);
    park.cash = randomize(park.cash, -1);
    park.bankLoan = randomize(park.bankLoan, 1);
}

function RandomizeMap() {
    setLocalSeed('RandomizeMap');
}

function RandomizeScenario() {
    setLocalSeed('RandomizeScenario');
    if(scenario.objective.guests)
        scenario.objective.guests = randomize(scenario.objective.guests, 1);
    if(scenario.objective.excitement)
        scenario.objective.excitement = randomize(scenario.objective.excitement, 1);
    if(scenario.objective.monthlyIncome)
        scenario.objective.monthlyIncome = randomize(scenario.objective.monthlyIncome, 1);
    if(scenario.objective.parkValue)
        scenario.objective.parkValue = randomize(scenario.objective.parkValue, 1);
    if(scenario.objective.year) // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
        scenario.objective.year = Math.ceil(randomize(scenario.objective.year, -1));
    
    console.log(scenario);
    console.log(scenario.objective);
}

function RandomizeClimate() {
    setLocalSeed('RandomizeClimate');
   // TODO: need setClimate function binding
}

function RandomizeRideTypes() {
    for(var r in map.rides) {
        RandomizeRide(map.rides[r].id);
    }

    context.subscribe("ride.ratings.calculate", function(ratings) {
        RandomizeRide(ratings.rideId);
    });
    context.subscribe("action.execute", function(event) {
        if( event.action != 'trackplace' ) return;
        if( event.isClientOnly ) return;
        RandomizeRide(event.args.ride);
    });
}

function RandomizeRide(rideId) {
    ride = map.getRide(rideId);
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


var crcTable = makeCRCTable();
function makeCRCTable(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

function crc32(str) {
    //var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

function printException(msg, e) {
    console.log('\nERROR:')
    console.log(e.stack);
    console.log(msg, e.name, e.message);
    console.log('===========');
}
