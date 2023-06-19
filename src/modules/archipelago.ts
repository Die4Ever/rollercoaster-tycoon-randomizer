/// <reference path="moduleBase.ts" />


class RCTRArchipelago extends ModuleBase {
    FirstEntry(): void {
        if(!settings.rando_archipelago)
            return;
        info("Module to handle connecting and communicating with Archipelago");
        //Disable standard research by resetting research status to 0 and funding to none every in game day
        this.SubscribeEvent("interval.day",this.SetArchipelagoResearch);
        this.RemoveItems();//Removes everything from the invented items list. They'll be added back when Archipelago sends items
        if (settings.archipelago_deathlink)
        context.subscribe('vehicle.crash',this.SendDeathLink);
        return;
    }

    AnyEntry(): void {
        if (!settings.rando_archipelago)
            return;
        ui.registerMenuItem("Archipelago Checks!", archipelagoLocations); //Register the check menu 
        ui.registerMenuItem("Archipelago Debug", archipelagoDebug);//Colby's debug menu. no touchy! 
    }

    SetArchipelagoResearch(): void {
        context.executeAction("parksetresearchfunding", {priorities: 0, fundingAmount: 0}, noop);//Set Funding to 0 and unselect every focus
        park.research.progress = 0; //If any progress is made (Say by users manually re-enabling research), set it back to 0. 
    }

    RemoveItems(): void{
        const origNumResearched = park.research.inventedItems.length;
        let numResearched = 0;
        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
        for(let i=0; i<researchItems.length; i++) {
            let a = researchItems[i];
            let slot = rng(0, researchItems.length - 1);
            researchItems[i] = researchItems[slot];
            researchItems[slot] = a;
        }
        park.research.inventedItems = researchItems.slice(0, numResearched);
        park.research.uninventedItems = researchItems.slice(numResearched);
        this.AddChange('ShuffledResearch', 'Shuffled research items', null, null, null);
        this.AddChange('NumInventedItems', 'Invented items', origNumResearched, numResearched);
    }
    
    ReceiveArchipelagoItem(category, item): void{
        switch(category){
            case "ride":
                this.AddRide(item);
                break;
            default:
                console.log("Colby is bad at his job, please inform him of this");
        }
        return;
    }

    AddRide(ride): void{
        //Creates function that finds the ride in Uninvented and moves it to Invented items. 

        console.log(ride);
        try{
            if(ride == undefined){
                console.log("If you see this, there has been a serious error");
                return;
            }
        }
        catch{
            console.log("If you see this, at least the try catch check worked")
        }
        let unresearchedItems = park.research.uninventedItems;
        let researchedItems = park.research.inventedItems;
        console.log(ride);
        for(let i=0; i<unresearchedItems.length; i++) {
            if (unresearchedItems[i].rideType == ride){
                researchedItems.push(unresearchedItems[i]);
                unresearchedItems.splice(i,1);
                console.log(unresearchedItems[i].rideType);
                park.research.uninventedItems = unresearchedItems;
                park.research.inventedItems = researchedItems;
                return;
            }
        }
        console.log("Error: ride not in uninvented items")
        return;
    }

    ActivateTrap(trap): void{
        switch(trap){
            case "FoodPoison":
                this.PoisonTrap();
                break;
            case "Bathroom":
                this.BathroomTrap();
                break;
        }
    }

    PoisonTrap(): void{
        //TODO: Create function that boosts nausea for every guest holding a food item
        return;
    }

    BathroomTrap(): void{
        for (var i = 0; i < map.numEntities; i++) {//get every entity on the map
            var entity = map.getEntity(i);//load data for the entity
            if (entity && entity.type === 'guest') {//if we're looking at a guest, do this. Honestly, don't know why 3 &'s though
                entity.toilet = 255;//Everybody *really* needs to pee 
            }
        }
    }

    ReceiveDeathLink(DeathLinkPacket: {cause: string, source: string}): any{
        if (settings.archipelago_deathlink_timeout == true){//If the timeout hasn't expired, don't force another coaster to crash
            console.log("Death Link Timeout has not expired. Ignoring Death Link signal")
            return;
        }
        if (map.getAllEntities("car").length == 0){//If there's nothing to explode, give the user a pass
            console.log("Rain check");//TODO: Create popup informing user they have a pass... this time
            var window = ui.openWindow({
                classification: 'rain-check',
                title: "Official Archipelago Rain Check",
                width: 400,
                height: 300,
                colours: [7,7],
                widgets: [].concat(
                    [
                        {
                            type: 'listview',
                            name: 'rain-check',
                            x: 25,
                            y: 35,
                            width: 350,
                            height: 200,
                            isStriped: true,
                            items: ["The service requested is currently unavaliable. We apologize ", "for any inconvenience. This RAIN CHECK entitiles you to the", "manual service listed. When available, please crash a roller ", "coaster at your convenience."," ", "Todays date: " + (date.month + 3) + '-' + date.day + '-' + 'Year ' + date.year, "Service: Ride Crash", "Quantity: 1",' ', 'Sender: ' + DeathLinkPacket.source, 'Cause of Death: ' + ((DeathLinkPacket.cause.length == 0) ? "Unlisted" : DeathLinkPacket.cause)]
                        },
                        {
                            type: 'button',
                            name: 'Ok',
                            x: 125,
                            y: 250,
                            width: 150,
                            height: 25,
                            text: 'Click here to sign and close.',
                            onClick: function() {
                                window.close();        
                        }
                    }]
                )
            });
            return window;
            return;
        }
        var r = Math.floor(Math.random() * map.getAllEntities('car').length);//Pick a car at random. It seems to only pick the first car of the train though...
        var timeOut = 0;//Set a time out in case nothing's moving
        while(map.getAllEntities('car')[r].status != 'travelling'){//Do random checks until something is found that's moving
            r = Math.floor(Math.random() * map.getAllEntities('car').length);
            timeOut++;
            if (timeOut > 400){//If we can't find this in 400 tries, wait 5 seconds and try again
                var archipelago = GetModule("RCTRArchipelago");
                if(archipelago)
                    context.setTimeout(function() {archipelago.ReceiveDeathLink()}, 5000);
                return;
            }
        }
        settings.archipelago_deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
        map.getAllEntities('car')[r].status = "crashed";//Crash the ride!
        context.setTimeout(() => {settings.archipelago_deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
    }

    SendDeathLink(): any{
        if(settings.archipelago_deathlink_timeout == false) {
            settings.archipelago_deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
            context.setTimeout(() => {settings.archipelago_deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
            console.log("We're off to kill the Wizard!");
            //TODO: Send signal to Archipelago to activate deathlink
        }
        else {
            console.log("Death Link Timeout has not expired. Cancelling Death Link signal. Note: Multiple cars crashing will attempt to send multiple signals")
        }
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelago());
