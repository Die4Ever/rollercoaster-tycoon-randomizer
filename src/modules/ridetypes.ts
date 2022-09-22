class RCTRRideTypes extends ModuleBase {
    FirstEntry(): void {
        for(var r in map.rides) {
            RandomizeRide(map.rides[r].id);
        }
    }

    AnyEntry(): void {
        this.SubscribeEvent("ride.ratings.calculate", function(ratings) {
            // TODO: do I need to modify the values in ratings, or does this work fine because it happens next tick?
            const isDummy:boolean = ratings.excitement <= 0;
            runNextTick(function() {
                RandomizeRide(ratings.rideId, isDummy);
            });
        });

        this.SubscribeEvent("interval.day", function() {
            UpdateNonexistentRides();
        });
    }
}

registerModule(new RCTRRideTypes());


function RandomizeRideTypeField(ride, rideTypeName, rideTypeId, name, difficulty, wetdry=1) {
    const type = rideTypeId;
    let factor = randomize(1, difficulty);
    const dry = 1 - wetdry;
    factor = (factor * wetdry) + (1 * dry);
    if(ride)
        ride[name] *= factor;
    const key_name = 'ride:'+type+':'+name;
    let old_change = settings.rando_changes[key_name];
    if(!settings.rando_scouting && !ride && !old_change) {
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
    RandomizeRideType(ride, RideType[ride.type], ride.type, isDummy);
}

function RandomizeRideType(ride, rideTypeName, rideTypeId, isDummy:boolean=false) {
    setLocalSeed('RandomizeRide cycle ' + rideTypeId);
    let cycle:number = 0;
    if(settings.num_months_cycle) {
        let rand_cycle = rng(0, settings.num_months_cycle * 1000);
        cycle = Math.floor((rand_cycle + date.monthsElapsed) / settings.num_months_cycle);
    }
    cycle += settings.cycle_offset;

    setLocalSeed('RandomizeRide ' + rideTypeId + ' ' + cycle);

    let changed:boolean = false;
    let isIntense:boolean = true;// TODO: need a list of rides that aren't intense so they get a larger range
    if(!ride || ride.classification == 'ride') {
        const tride = isDummy ? null : ride;
        changed = RandomizeRideTypeField(tride, rideTypeName, rideTypeId, 'runningCost', 1) || changed;
        changed = RandomizeRideTypeField(tride, rideTypeName, rideTypeId, 'excitement', -1) || changed;
        changed = RandomizeRideTypeField(tride, rideTypeName, rideTypeId, 'intensity', 0, isIntense ? 0.5 : 1.0) || changed;
        changed = RandomizeRideTypeField(tride, rideTypeName, rideTypeId, 'nausea', -1, 0.7) || changed;
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
