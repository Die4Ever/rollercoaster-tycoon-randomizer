class RCTRRideTypes extends ModuleBase {
    FirstEntry(): void {
        for(var r in map.rides) {
            this.RandomizeRide(map.rides[r]);
        }
    }

    AnyEntry(): void {
        const self = this;
        self.SubscribeEvent("ride.ratings.calculate", function(ratings) {
            self.RandomizeRideCalculations(ratings);
        });

        self.SubscribeEvent("interval.day", function() {
            self.UpdateNonexistentRides();
        });
    }

    RandomizeRideCalculations(ratings) {
        // called from event ride.ratings.calculate
        if(!settings.rando_ride_types)
            return;
        let ride = map.getRide(ratings.rideId);
        if(!ride)
            return;
        const isDummy:boolean = ratings.excitement <= 0;
        const tride = isDummy ? null : ratings;
        ratings.runningCost = ride.runningCost;// just pretend this is a ride object lol
        this.RandomizeRideTypeStats(ratings.rideId, tride, ride.type, ride.classification);
        if(ratings.runningCost > 0)
            ride.runningCost = ratings.runningCost;
    }

    RandomizeRide(ride) {
        // called from FirstEntry
        if(!settings.rando_ride_types)
            return;
        if(!ride)
            return;
        this.RandomizeRideTypeStats(ride.Id, ride, ride.type, ride.classification);
    }

    UpdateNonexistentRides() {
        // called from event interval.day
        // existing rides will get randomized at their own time
        var existingRideTypes = {};
        for(var r in map.rides) {
            let ride = map.rides[r];
            let type = ride.type;
            existingRideTypes[type] = 1;
        }

        // now loop through changes array to show changes for ride types that are no longer in the park
        for(var c in this.settings.changes) {
            let m = c.match(/ride:(\d+):(.+)/);
            if(!m) continue;
            let type:number = parseInt(m[1]);
            let field = m[2];
            if(existingRideTypes[type]) continue;
            // only run each one once
            existingRideTypes[type] = 1;

            let change_name = this.settings.changes[c].name;
            let rideTypeName = change_name.replace(' '+field, '');
            this.RandomizeRideTypeStats(null, null, type, 'ride');
        }
    }

    RandomizeRideTypeStats(rideId, ride, rideTypeId, classification) {
        let changed:boolean = false;
        let isIntense:boolean = true;// TODO: need a list of rides that aren't intense so they get a larger range
        let rideTypeName = this.GetRideTypeName(rideTypeId);
        let isRide:boolean = (classification == 'ride');// otherwise it's a shop/stall and only has runningCost

        if(isRide) {
            this.SetRideTypeSeed(rideTypeId, 'ride');
            changed = this.RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'excitement', -1, 0.5) || changed;
            changed = this.RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'intensity', 0, isIntense ? 0.3 : 0.5) || changed;
            changed = this.RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'nausea', -1, 0.3) || changed;
        }

        if(ride && ride.runningCost > 0) {
            this.SetRideTypeSeed(rideTypeId, 'runningCost');
            changed = this.RandomizeRideTypeField(ride, rideTypeName, rideTypeId, 'runningCost', 1, 0.5) || changed;
        }

        /*if(changed) {
            info('RandomizeRide type: '+rideTypeName+' ('+rideTypeId+')'
            + ', date.monthsElapsed: '+date.monthsElapsed
            + ', num_months_cycle: '+settings.num_months_cycle+', cycle: '+cycle, ride);
        }*/

        if(changed && rideId) {
            park.postMessage(
                {type: 'attraction', text: rideTypeName + ' stats have been re-rolled', subject: rideId} as ParkMessageDesc
            );
        } else if(changed) {
            park.postMessage(
                {type: 'attraction', text: rideTypeName + ' stats have been re-rolled'} as ParkMessageDesc
            );
        }

        return changed;
    }

    SetRideTypeSeed(rideTypeId, salt) {
        setLocalSeed('RandomizeRide cycle ' + rideTypeId);
        let cycle:number = 0;
        if(settings.num_months_cycle) {
            let rand_cycle = rng(0, settings.num_months_cycle * 1000);
            cycle = Math.floor((rand_cycle + date.monthsElapsed) / settings.num_months_cycle);
        }
        cycle += settings.cycle_offset;
        setLocalSeed('RandomizeRide ' + rideTypeId + ' ' + cycle + salt);
    }

    RandomizeRideTypeField(ride, rideTypeName, rideTypeId, name, difficulty, wetdry=1) {
        const type = rideTypeId;
        let factor = randomize(1, difficulty);
        const dry = 1 - wetdry;
        factor = (factor * wetdry) + (1 * dry);
        if(ride && ride[name])
            ride[name] *= factor;
        const key_name = 'ride:'+type+':'+name;
        let old_change = this.settings.changes[key_name];
        if(!settings.rando_scouting && !ride && !old_change) {
            // when run generically with no specific ride, we're just updating the GUI
            // don't add new values, just update existing ones, because the ride might not have all these properties (shops/stalls)
            return false;
        }
        if( !old_change || old_change.factor.toFixed(5) !== factor.toFixed(5) ) {
            // if we need to add or update the change entry
            this.AddChange(key_name, rideTypeName+' '+name, null, null, factor); // don't record absolute values just the factor
            return old_change as boolean;
        }
        return false;
    }

    GetRideTypeName(id: number): string {
        if(!RideType[id]) {
            return id.toString();
        }
        return RideType[id];
    }
}

registerModule(new RCTRRideTypes());
