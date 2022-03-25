
var rando_name = 'RollerCoaster Tycoon Randomizer';
var rando_version = '0.2';
console.log(rando_name+" v"+rando_version+", OpenRCT2 API version "+context.apiVersion+', minimum required API version is 46');
var rando_authors = ['Die4Ever'];
// ~~ forces JS to convert to int
var globalseed = ~~0;
var tseed = ~~0;
var gen2 = ~~2147483643;
var gen1 = ~~(gen2/2);

var difficulties = {Easy: -0.3, Medium: 0, Hard: 0.3, Extreme: 0.6};
var scenarioLengths = {Speedrun: 0.5, Random: 0, Normal: 1, Long: 1.5, Marathon: 2};
var difficulty = 0;
var scenarioLength = 0;// 0 means random
var rando_ride_types = true;
var rando_park_flags = true;
var rando_park_values = true;
var rando_goals = true;
var debug = false;

function _main() {
    var savedData;

    if(debug)
        run_tests();

    console.log(rando_name+" v"+rando_version+" starting...");
    try {
        savedData = context.getParkStorage().getAll();
        if(savedData)
            console.log("restored savedData", savedData);
    } catch(e) {
        printException('error checking savedData: ', e);
    }

    if(savedData && (savedData.seed || savedData.seed === 0)) {
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
    console.log(rando_name+" v"+rando_version+" finished startup");
}

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

function NewWidget(widget) {
    var margin = 3;
    var window_width = 350 - margin*2;
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

function NewCheckbox(name, text, y, tooltip) {
    return NewWidget({
        type: 'checkbox',
        name: name,
        text: text,
        x: 0.5,
        y: y,
        width: 1,
        tooltip: tooltip,
        isChecked: true
    });
}

function initGui() {
    console.log('initGui()', globalseed);
    var ww = 350;
    var wh = 300;

    context.executeAction('pausetoggle', {});

    var window = ui.openWindow({
        classification: 'rando-settings',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: ww,
        height: wh,
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
            }),
            NewCheckbox('rando-ride-types', 'Randomize Ride Types', 4, 'Randomizes values such as inspectionInterval and intensity'),
            NewCheckbox('rando-park-flags', 'Randomize Park Flags', 5, 'Randomizes flags such as forbidMarketingCampaigns and preferMoreIntenseRides'),
            NewCheckbox('rando-park-values', 'Randomize Park Values', 6, 'Randomizes values such as starting cash, starting bank loan amount, maxBankLoan, and landPrice'),
            NewCheckbox('rando-goals', 'Randomize Goals', 7, 'Even when disabled, goals will still be scaled by Scenario Length'),
            [{
                type: 'button',
                name: 'ok-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26,
                width: 90,
                height: 26,
                text: 'Start Game',
                onClick: function() { window.close(); }
            }]
        ),
        onClose: function() {
            try {
                var s = window.findWidget('edit-seed');
                setGlobalSeed(s.text);
                var d = window.findWidget('difficulty');
                difficulty = difficulties[d.text];
                var l = window.findWidget('length');
                scenarioLength = scenarioLengths[l.text];
                rando_ride_types = window.findWidget('rando-ride-types').isChecked;
                rando_park_flags = window.findWidget('rando-park-flags').isChecked;
                rando_park_values = window.findWidget('rando-park-values').isChecked;
                rando_goals = window.findWidget('rando-goals').isChecked;
                initRando();
                context.executeAction('pausetoggle', {});
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

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

// works with integers
function rng(min, max) {
    tseed = ~~(gen1 * tseed * 5 + gen2 + (tseed/5) * 3);
    if(tseed < 0)
        tseed = ~~(-tseed);
    var ret = (tseed >>> 8) % (1 + max - min);
    ret += min;
    //console.log("rng("+min+", "+max+") "+tseed+", "+ret);
    return ret;
}

// boolean
function brng() {
    // next seed
    rng(0,1);
    return (tseed >>> 15) & 1;
}

function GetDifficultyCurve(d) {
    if(d == 0) return 0.5;
    var dist = Math.abs(difficulty - d);
    return 1 - (dist / (dist + 1));
}

function RngBoolWithDifficulty(d) {
    var val = rng(0, 100000);
    var mid = 50000;
    if( d == 0 ) return val < mid;
    var adjust = GetDifficultyCurve(d);
    adjust = adjust * 2;
    mid *= adjust;
    //console.log('RngBoolWithDifficulty, adjust: '+adjust+', mid: '+mid);

    return val < mid;
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
    // difficulty > 0 means larger numbers increase difficulty, < 0 means decreases difficulty
    var curve = GetDifficultyCurve(difficulty) * 2;
    var min = 50 * curve;
    var max = 150 * curve;
    var ret = (value * rng(min, max)) / 100.0;
    //console.log('static_randomize('+value+', '+difficulty+'): '+ret);
    return ret;
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

    if(rando_goals) {
        if(scenario.objective.guests)
            scenario.objective.guests = randomize(scenario.objective.guests, 1) * scenarioLength;
        if(scenario.objective.excitement)
            scenario.objective.excitement = randomize(scenario.objective.excitement, 1) * scenarioLength;
        if(scenario.objective.monthlyIncome)
            scenario.objective.monthlyIncome = randomize(scenario.objective.monthlyIncome, 1) * scenarioLength;
        if(scenario.objective.parkValue)
            scenario.objective.parkValue = randomize(scenario.objective.parkValue, 1) * scenarioLength;
    } else {
        if(scenario.objective.guests)
            scenario.objective.guests *= scenarioLength;
        if(scenario.objective.excitement)
            scenario.objective.excitement *= scenarioLength;
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
    console.log('===========\nERROR:')
    try {
        console.log(e.stack);
        console.log(msg, e.name, e.message);
    } catch(e2) {
        console.log('error in printException', msg, e, e2);
        console.log('types: ', msg.constructor.name, e.constructor.name, e2.constructor.name, e2);
    }
    console.log('===========');
}

function test_difficulty(goal, d) {
    difficulty = goal;
    currDifficulty = 1;
    num = 1000;

    total = 0;
    for(var i=0; i<num; i++) {
        total += GetDifficultyCurve(d);
    }
    console.log("difficulty "+goal+", "+d+", avg: "+ (total/num));

    total = 0;
    for(var i=0; i<num; i++) {
        total += RngBoolWithDifficulty(d);
    }
    console.log("    RngBoolWithDifficulty difficulty "+goal+", "+d+", avg: "+ (total/num));

    total = 0;
    for(var i=0; i<num; i++) {
        total += randomize(1, d);
    }
    console.log("    randomize difficulty "+goal+", "+d+", avg: "+ (total/num));
}

function run_tests() {
    console.log('starting tests...');
    setGlobalSeed(25);
    for(var d = -0.6; d < 0.7; d += 0.6) {
        for(var i = -1; i <= 1; i += 1) {
            test_difficulty(d, i);
        }
    }
    currDifficulty = 1;
    difficulty = 1;
    console.log('finished tests');
}