
function initRando() {
    try {
        let storage = context.getParkStorage();
        settings['seed'] = globalseed;
        for(let k in settings) {
            if(settings.hasOwnProperty(k))
                storage.set(k, settings[k]);
        }
        console.log('just saved data', JSON.stringify(storage.getAll()));
    } catch(e) {
        printException('error saving seed: ', e);
    }
    console.log(rando_name+' v'+rando_version
        + ' starting with seed '+globalseed
        + ', api version '+context.apiVersion
        + ', difficulty: '+settings.difficulty
        + ', scenarioLength: '+settings.scenarioLength
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

    settings.rando_changes[key] = obj;
    context.getParkStorage().set("rando_changes", settings.rando_changes);
}

function RandomizeParkFlag(name, difficulty) {
    var val = park.getFlag(name);
    park.setFlag(name, RngBoolWithDifficulty(difficulty));
    AddChange(name, name, val, park.getFlag(name));
}

function RandomizeObjective(name, difficulty, scenarioLengthExp=1) {
    if(!scenario.objective[name]) return;

    const old = scenario.objective[name];
    if(settings.rando_goals) {
        scenario.objective[name] = randomize(scenario.objective[name], difficulty) * (settings.scenarioLength ** scenarioLengthExp);
    } else {
        scenario.objective[name] *= (settings.scenarioLength ** scenarioLengthExp);
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
    if(Math.abs(settings.scenarioLength) < 0.1) {
        settings.scenarioLength = rng(50, 300) / 100;
    }
    
    console.log('scenario.objective.year: ', scenario.objective.year, ', scenarioLength: '+settings.scenarioLength);
    if(scenario.objective.year) {
        // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
        const old = scenario.objective.year;
        scenario.objective.year = Math.ceil(scenario.objective.year * settings.scenarioLength);
        AddChange('objective.year', 'Objective Year', old, scenario.objective.year);
    } else {
        // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
        settings.scenarioLength = 1;
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
    
    if(settings.rando_park_flags) {
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
    if(settings.rando_park_values) {
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
    if(!settings.rando_ride_types)
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
    if( !settings.rando_changes[key_name] || settings.rando_changes[key_name].factor.toFixed(5) !== factor.toFixed(5) )
        AddChange(key_name, ride_type_name+' '+name, null, null, factor); // prefer not changing the name, don't record absolute values just the factor
}

function RandomizeRide(rideId) {
    let ride = map.getRide(rideId);
    console.log('RandomizeRide '+ride.name+', type: '+ride.object.name+' ('+ride.type+')'
        + ', classification: '+ride.classification+', date.yearsElapsed: '+date.yearsElapsed
        + ', num_years_cycle: '+settings.num_years_cycle);
    setLocalSeed('RandomizeRide ' + ride.type);

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
