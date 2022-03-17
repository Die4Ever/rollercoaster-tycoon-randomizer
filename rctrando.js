
var rando_name = 'RollerCoaster Tycoon Randomizer';
var rando_version = '0.04';
var rando_authors = ['Die4Ever'];
// ~~ forces JS to convert to int
var globalseed = ~~0;
var tseed = ~~0;
var gen1, gen2;
gen2 = ~~2147483643;
gen1 = ~~(gen2/2);

var difficulty = 1;
var scenarioLength = 0;// 0 means random

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
        //initGui();// just for testing
        SubscribeEvents();
    }
    else {
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
            initGui();
        } else {
            initRando();
        }
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
    minApiVersion: 46,
    main: main
});

function initRando() {
    try {
        context.getParkStorage().set("seed", globalseed);
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

function NewWidget(widget) {
    var margin = 3;
    var window_width = 300;
    var start_y = 26;
    // 3 margins because left, right, and center
    cellWidth = (window_width - margin * 3) / 2;
    cellHeight = 26;

    widget.x *= cellWidth + margin;
    widget.x += margin;
    if(!widget.width)
        widget.width = 1;
    widget.width *= cellWidth;
    widget.y *= cellHeight + margin*2;// double margins for y
    widget.y += start_y;
    widget.height = cellHeight;

    return widget;
}

function NewLabel(label, desc) {
    // copy instead of reference
    desc = Object.assign({}, desc);
    desc.type = 'label';
    desc.name = 'label-' + desc.name;
    desc.x = 0;
    desc.text = label;
    desc.textAlign = 'centred';
    return NewWidget(desc);
}

function NewEdit(label, desc) {
    label = NewLabel(label, desc);
    desc.x = 1;
    desc.y -= 0.2;
    desc.type = 'textbox';
    edit = NewWidget(desc);
    return [label, edit];
}

function NewDropdown(label, desc) {
    label = NewLabel(label, desc);
    desc.x = 1;
    desc.y -= 0.2;
    desc.type = 'dropdown';
    dropdown = NewWidget(desc);
    return [label, dropdown];
}

function initGui() {
    console.log('initGui()', globalseed);
    var difficulties = {Easy: 0.5, Medium: 1, Hard: 2, Extreme: 3};
    var scenarioLengths = {Speedrun: 0.5, Random: 0, Medium: 1, Long: 1.5, Marathon: 2};
    var window = ui.openWindow({
        classification: 'rando-settings',
        title: "RollerCoaster Tycoon Randomizer",
        width: 300,
        height: 200,
        widgets: [].concat(
            NewLabel('https://discord.gg/jjfKT9nYDR', {
                name: 'url',
                y: 0,
                width: 2,
                tooltip: 'Join the Discord!'
            }),
            NewEdit('Seed:', {
                name: 'edit-seed',
                y: 1,
                text: ''+globalseed,
                tooltip: 'Enter a number'
            }),
            NewDropdown('Difficulty:', {
                name: 'difficulty',
                y: 2,
                items: Object.keys(difficulties),
                selectedIndex: 1,
                tooltip: 'Choose a difficulty for the randomization'
            }),
            NewDropdown('Scenario Length:', {
                name: 'length',
                y: 3,
                items: Object.keys(scenarioLengths),
                selectedIndex: 1,
                tooltip: 'Longer scenario length will also scale up the goals so that difficulty is maintained.'
            })
        ),
        onClose: function() {
            try {
                var s = window.findWidget('edit-seed');
                setGlobalSeed(s.text);
                var d = window.findWidget('difficulty');
                difficulty = difficulties[d.text];
                var l = window.findWidget('length');
                scenarioLength = scenarioLengths[l.text];
                initRando();
            } catch(e) {
                printException('error in GUI onClose(): ', e);
            }
        }
    });
    return window;
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
    console.log('setGlobalSeed from '+globalseed+' to '+newSeed);
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

function RandomizeScenario() {
    setLocalSeed('RandomizeScenarioLength');
    if(scenarioLength == 0)
        scenarioLength = rng(0.5, 3);
        
    console.log('scenario.objective.year: ', scenario.objective.year);
    if(scenario.objective.year) {
        // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
        scenario.objective.year = Math.ceil(scenario.objective.year * scenarioLength);
        console.log('scenarioLength: '+scenarioLength+', new scenario.objective.year: '+scenario.objective.year);
    } else {
        // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
        scenarioLength = 1;
    }

    setLocalSeed('RandomizeScenario');

    if(scenario.objective.guests)
        scenario.objective.guests = randomize(scenario.objective.guests, 1);
    if(scenario.objective.excitement)
        scenario.objective.excitement = randomize(scenario.objective.excitement, 1);
    if(scenario.objective.monthlyIncome)
        scenario.objective.monthlyIncome = randomize(scenario.objective.monthlyIncome, 1);
    if(scenario.objective.parkValue)
        scenario.objective.parkValue = randomize(scenario.objective.parkValue, 1);
        
    console.log(scenario);
    console.log(scenario.objective);
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
