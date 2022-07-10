
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
        RandomizeRideTypes();
        RandomizeGuests();
        SubscribeEvents();
        if(settings.rando_crowdcontrol) {
            init_crowdcontrol();
        }
    } catch(e) {
        printException('error in initRando(): ', e);
    }
}

function SubscribeEvents() {
    context.subscribe("guest.generation", function(id) {
        RandomizeGuest(map.getEntity(id.id));
    });

    context.subscribe("ride.ratings.calculate", function(ratings) {
        // TODO: do I need to modify the values in ratings, or does this work fine because it happens next tick?
        const isDummy:boolean = ratings.excitement <= 0;
        runNextTick(function() {
            RandomizeRide(ratings.rideId, isDummy);
        });
    });

    context.subscribe("interval.day", function() {
        UpdateNonexistentRides();
    });
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
    RandomizeObjective('guests', 1, 0.9);
    RandomizeObjective('excitement', 1, 0.3);
    RandomizeObjective('monthlyIncome', 0.9);
    RandomizeObjective('parkValue', 0.9);

    //console.log(scenario);
    console.log(scenario.objective);
}

function RandomizePark() {
    setLocalSeed('RandomizeParkFlags');

    if(settings.rando_park_flags) {
        RandomizeParkFlag("difficultGuestGeneration", 1);
        RandomizeParkFlag("difficultParkRating", 1);
        //RandomizeParkFlag("forbidHighConstruction", 1); // TODO: put this back in when OpenRCT2 lets me adjust the max height
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
    for(var r in map.rides) {
        RandomizeRide(map.rides[r].id);
    }
}

function RandomizeRideTypeField(ride, rideTypeName, rideTypeId, name, difficulty, wetdry=1) {
    const type = rideTypeId;
    let factor = randomize(1, difficulty);
    const dry = 1 - wetdry;
    factor = (factor * wetdry) + (1 * dry);
    if(ride)
        ride[name] *= factor;
    const key_name = 'ride:'+type+':'+name;
    let old_change = settings.rando_changes[key_name];
    if(!ride && !old_change) {
        // when run generically with no specific ride, we're just updating the GUI
        // don't add new values, just update existing ones, because the ride might not have all these properties (shops/stalls)
        return false;
    }
    if( !old_change || old_change.factor.toFixed(5) !== factor.toFixed(5) ) {
        AddChange(key_name, rideTypeName+' '+name, null, null, factor); // don't record absolute values just the factor
        return old_change as boolean;
    }
    return false;
}

function RandomizeRide(rideId, isDummy=false) {
    if(!settings.rando_ride_types)
        return;
    let ride = map.getRide(rideId);
    RandomizeRideType(isDummy ? null : ride, RideType[ride.type], ride.type);
}

function RandomizeRideType(ride, rideTypeName, rideTypeId) {
    setLocalSeed('RandomizeRide cycle ' + rideTypeId);
    let cycle:number = 0;
    if(settings.num_months_cycle) {
        let rand_cycle = rng(0, settings.num_months_cycle * 1000);
        cycle = Math.floor((rand_cycle + date.monthsElapsed) / settings.num_months_cycle);
    }
    cycle += settings.cycle_offset;

    setLocalSeed('RandomizeRide ' + rideTypeId + ' ' + cycle);

    let changed:boolean = false;
    let isIntense:boolean = true;// need a list of rides that aren't intense so they get a larger range
    if(!ride || ride.classification == 'ride') {
        changed = RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'runningCost', 1) || changed;
        changed = RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'excitement', -1) || changed;
        changed = RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'intensity', 0, isIntense ? 0.5 : 1.0) || changed;
        changed = RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'nausea', -1, 0.7) || changed;
    }
    else if(!ride || ride.classification != 'ride') {
        changed = RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'runningCost', 1) || changed;
    }

    /*if(changed) {
        console.log('RandomizeRide type: '+rideTypeName+' ('+rideTypeId+')'
        + ', date.monthsElapsed: '+date.monthsElapsed
        + ', num_months_cycle: '+settings.num_months_cycle+', cycle: '+cycle, ride);
    }*/

    if(changed && ride) {
        let rideId = ride.id;
        park.postMessage(
            {type: 'attraction', text: rideTypeName + ' stats have been re-rolled', subject: rideId} as ParkMessageDesc
        );
    } else if(changed) {
        park.postMessage(
            {type: 'attraction', text: rideTypeName + ' stats have been re-rolled'} as ParkMessageDesc
        );
    }
}

function UpdateNonexistentRides() {
    // existing rides will get randomized at their own time
    var existingRideTypes = {};
    for(var r in map.rides) {
        let type = map.rides[r].type;
        existingRideTypes[type] = 1;
    }

    // now loop through changes array to show changes for ride types that are no longer in the park
    for(var c in settings.rando_changes) {
        let m = c.match(/ride:(\d+):(.+)/);
        if(!m) continue;
        let type:number = parseInt(m[1]);
        let field = m[2];
        if(existingRideTypes[type]) continue;
        // only run each one once
        existingRideTypes[type] = 1;

        let change_name = settings.rando_changes[c].name;
        let rideTypeName = change_name.replace(' '+field, '');
        RandomizeRideType(null, rideTypeName, type);
    }
}

function RandomizeGuests() {
    var guests = map.getAllEntities('guest');
    for(var i in guests) {
        RandomizeGuest(guests[i]);
    }
}

function RandomizeGuest(guest) {
    setLocalSeed('RandomizeGuest ' + guest.id);
}
