
var rando_name = 'RollerCoaster Tycoon Randomizer';
var rando_version = '0.03';
var rando_authors = ['Die4Ever'];
// ~~ forces JS to convert to int
var globalseed = ~~0;
var tseed = ~~0;
var gen1, gen2;
gen2 = ~~2147483643;
gen1 = ~~(gen2/2);

function main() {
    var savedData = context.getParkStorage().getAll();
    console.log("savedData", savedData);
    if(savedData.seed) {
        setGlobalSeed(savedData.seed);
        console.log("restored saved seed "+globalseed);
        SubscribeEvents();
    }
    else {
        initRando();
    }
    console.log(rando_name+" v"+rando_version+" finished startup");
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
    context.getParkStorage().set("seed", globalseed);
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
    console.log("rng("+min+", "+max+") "+tseed+", "+ret);
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
    /* console.log(park);
    {
        cash: 100000,
        rating: 500,
        bankLoan: 100000,
        maxBankLoan: 350000,
        entranceFee: 0,
        guests: 2,
        suggestedGuestMaximum: 0,
        guestGenerationProbability: 87,
        guestInitialCash: 500,
        guestInitialHappiness: 192,
        guestInitialHunger: 220,
        guestInitialThirst: 216,
        value: 140,
        companyValue: 140,
        totalRideValueForMoney: 0,
        totalAdmissions: 0,
        totalIncomeFromAdmissions: 0,
        landPrice: 750,
        constructionRightsPrice: 400,
        parkSize: 6280,
        name: 'Crazy Castle',
        messages: [],
        casualtyPenalty: 0,
        getFlag: [Native Function],
        setFlag: [Native Function],
        postMessage: [Native Function]
    } */

    /*  type ParkFlags =
        "difficultGuestGeneration" |
        "difficultParkRating" |
        "forbidHighConstruction" |
        "forbidLandscapeChanges" |
        "forbidMarketingCampaigns" |
        "forbidTreeRemoval" |
        "freeParkEntry" |
        "noMoney" |
        "open" |
        "preferLessIntenseRides" |
        "preferMoreIntenseRides" |
        "scenarioCompleteNameInput" |
        "unlockAllPrices"; */

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
    /* console.log(map);
    {
        size: { x: 100, y: 100 },
       numRides: 0,
       numEntities: 10000,
       rides: [],
       getRide: [Native Function],
       getTile: [Native Function],
       getEntity: [Native Function],
       getAllEntities: [Native Function],
       createEntity: [Native Function]
    } */
}

function RandomizeScenario() {
    /* console.log(scenario);
    {
        name: 'Crazy Castle',
        details: 'You have inherited a large castle - Your job is to convert it into a small theme park.',
        completedBy: '?',
        filename: 'Crazy Castle.SC6',
        parkRatingWarningDays: 0,
        objective:
        {
            type: 'guestsBy',
            guests: 1500,
            year: 4,
            excitement: 0,
            monthlyIncome: 0,
            parkValue: 0
        },
        status: 'inProgress',
        completedCompanyValue: null,
        companyValueRecord: 0
    }
    
    type ScenarioObjectiveType =
        "none" |
        "guestsBy" |
        "parkValueBy" |
        "haveFun" |
        "buildTheBest" |
        "10Rollercoasters" |
        "guestsAndRating" |
        "monthlyRideIncome" |
        "10RollercoastersLength" |
        "finish5Rollercoasters" |
        "repayLoanAndParkValue" |
        "monthlyFoodIncome";
    */

    if(scenario.objective.guests)
        scenario.objective.guests = randomize(scenario.objective.guests, 1);
    if(scenario.objective.excitement)
        scenario.objective.excitement = randomize(scenario.objective.excitement, 1);
    if(scenario.objective.monthlyIncome)
        scenario.objective.monthlyIncome = randomize(scenario.objective.monthlyIncome, 1);
    if(scenario.objective.parkValue)
        scenario.objective.parkValue = randomize(scenario.objective.parkValue, 1);
    if(scenario.objective.year)
        scenario.objective.year = randomize(scenario.objective.year, -1);
    
    console.log(scenario);
    console.log(scenario.objective);
}

function RandomizeClimate() {
    /* console.log(climate);
    {
        type: 'warm',
        current: {
            weather: 'partiallyCloudy',
            temperature: 17
        },
        future: {
            weather: 'cloudy',
            temperature: 12
        }
    }

    type ClimateType =
        "coolAndWet" |
        "warm" |
        "hotAndDry" |
        "cold";
    */
   // TODO: need setClimate function binding
}

function RandomizeRideTypes() {
    // TODO: need bindings for ride types to be able to adjust their stats
    // or maybe just do it by listening to the trackplace event?

    context.subscribe("ride.ratings.calculate", function(ratings) {
        console.log('ride.ratings.calculate', ratings);
        /* { 0:
            { rideId: 2,
            excitement: 121,
            intensity: 60,
            nausea: 75 } } */
        //ratings.excitement = 999;
        // modifying the ratings values here does work (or does it only modify the display?)
        // but I want to do it in some meaningful way?
    });
    context.subscribe("action.execute", function(event) {
        if( event.action != 'trackplace' ) return;
        if( event.isClientOnly ) return;
        /*
        {
            action: 'trackplace',
            args: {
                x: 832,
                y: 1536,
                z: 144,
                direction: 0,
                ride: 2,
                trackType: 261,
                brakeSpeed: 0,
                colour: 0,
                seatRotation: 4,
                trackPlaceFlags: 0,
                isFromTrackDesign: false,
                flags: 0
            },
            player: -1,
            type: 3,
            isClientOnly: false,
            result: {
                cost: 3970,
                position: {
                    x: 848,
                    y: 1552,
                    z: 144
                },
                expenditureType: 'ride_construction'
            }
        }
        */
        console.log('action.execute', event);
    });
}

function RandomizeGuests() {
    var guests = map.getAllEntities('guest');
    for(var i in guests) {
        RandomizeGuest(guests[i]);
    }
}

function RandomizeGuest(guest) {
    /* https://github.com/OpenRCT2/OpenRCT2/blob/develop/distribution/openrct2.d.ts#L1366
    console.log('RandomizeGuest:', guest);
    RandomizeGuest': {
        tshirtColour: 25,
        trousersColour: 23,
        balloonColour: 0,
        hatColour: 0,
        umbrellaColour: 0,
        happiness: 170,
        happinessTarget: 170,
        nausea: 0,
        nauseaTarget: 0,
        hunger: 204,
        thirst: 208,
        toilet: 0,
        mass: 51,
        minIntensity: 0,
        maxIntensity: 15,
        nauseaTolerance: 3,
        cash: 600,
        isInPark: false,
        isLost: true,
        lostCountdown: 0,
        peepType: 'guest',
        name: 'Geoffrey D.',
        destination:
        { x: 0,
            y: 0 },
        energy: 72,
        energyTarget: 72,
        getFlag: [Native Function],
        setFlag: [Native Function],
        id: 66,
        type: 'guest',
        x: 1296,
        y: 3263,
        z: 112,
        remove: [Native Function]
    }
    */
}

