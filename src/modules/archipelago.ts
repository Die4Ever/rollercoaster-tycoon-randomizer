/// <reference path="moduleBase.ts" />


class RCTRArchipelago extends ModuleBase {
    FirstEntry(): void {//Loads on park starting for first time. Something in my code calls it as well
        var self = this;
        info("Module to handle connecting and communicating with Archipelago");
        if(!settings.rando_archipelago)
            return;
        //Disable standard research by resetting research status to 0 and funding to none every in game day
        // self.SubscribeEvent("interval.day", ()=>{self.SetArchipelagoResearch(); self.CheckObjectives()});
        self.RemoveItems();//Removes everything from the invented items list. They'll be added back when Archipelago sends items
        // if (settings.archipelago_deathlink)
        // context.subscribe('vehicle.crash',self.SendDeathLink);
        if (archipelago_settings.rule_locations){//Setting rules for Archipelago, dictated by the YAML
            var setRules = function(){
                park.setFlag("difficultGuestGeneration", true);
                park.setFlag("difficultParkRating", true);
                park.setFlag("forbidHighConstruction", true);
                park.setFlag("forbidLandscapeChanges", true);
                park.setFlag("forbidMarketingCampaigns", true);
                park.setFlag("forbidTreeRemoval", true);
            }
            runNextTick(setRules);//Mutates the game context, so it has to be run on a tick event
        }
        if (archipelago_settings.purchase_land_checks){
            var enableLandChecks = function(){
                park.landPrice = 2000;//$200/per tile
            }
            runNextTick(enableLandChecks);
        }
        if (archipelago_settings.purchase_rights_checks){
            var enableRightsChecks = function(){
                park.constructionRightsPrice = 2000;
            }
            runNextTick(enableRightsChecks);
        }

        return;
    }

    AnyEntry(): void {//Loads on save file load and refreshing the code
        var self = this;
        if (!settings.rando_archipelago)//Don't P*ck with the game if we're not playing Archipelago
            return;
        //Load saved progress
        archipelago_locked_locations = context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations');
        archipelago_unlocked_locations = context.getParkStorage().get('RCTRando.ArchipelagoUnlockedLocations');
        archipelago_location_prices = context.getParkStorage().get('RCTRando.ArchipelagoLocationPrices');
        archipelago_objectives = context.getParkStorage().get('RCTRando.ArchipelagoObjectives');
        archipelago_settings = context.getParkStorage().get('RCTRando.ArchipelagoSettings');
        //Set up daily events
        self.SubscribeEvent("interval.day", ()=>{self.SetArchipelagoResearch(); self.CheckObjectives(); self.SetNames();});
        //Add menu items
        ui.registerMenuItem("Archipelago Checks!", archipelagoLocations); //Register the check menu 
        if (bDebug)
        ui.registerMenuItem("Archipelago Debug", archipelagoDebug);//Colby's debug menu. no touchy! 
        if (archipelago_settings.deathlink)//Enable deathlink checks if deathlink is enabled
        self.SubscribeEvent('vehicle.crash',e => self.SendDeathLink(e.id));
        context.subscribe('action.execute',e => self.logRide(e.player, e.action, e.result));
        archipelago_settings.deathlink_timeout = false;//Reset the Deathlink if the game was saved and closed during a timeout period

        //Set up actions for multiplayer
        try{
            context.registerAction('ExplodeRide', (args) => {return {};}, (args) => explodeRide(args));
        }
        catch(e){
            console.log("Error:" + e)
        }
    }

    SetArchipelagoResearch(): void {
        context.executeAction("parksetresearchfunding", {priorities: 0, fundingAmount: 0}, noop);//Set Funding to 0 and unselect every focus
        park.research.progress = 0; //If any progress is made (Say by users manually re-enabling research), set it back to 0. 
    }

    logRide(player, action, result): void {
        if(action == "ridecreate"){
            console.log("Player: " + player + "\nType: " + action + "\nResult: " + result);
        }
    }

    RemoveItems(): void{
        const origNumResearched = park.research.inventedItems.length;
        let numResearched = 0;
        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
        for(let i=0; i<researchItems.length; i++) {//We still randomize the items since finding multiple copies will unlock different vehicles
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
    
    ReceiveArchipelagoItem(item): void{
        var self = this;
        for(let i = 0; i < item.length; i++){
            var category = "item"; //Any item with the 0b100 flag is always a trap
            if(item[i].flags = 0b100)
            category = "trap";
            if(RideType[item[i].item])//Any item that fits a ride type is a ride
            category = "ride";
            if(category == "item"){//Check the actual item if none of the above works out
                switch(item[i].item){
                    case "scenery":
                        category = "scenery";
                        break;
                    case "Land Discount":
                    case "Construction Rights Discount":
                        category = "discount";
                        break;
                    case "difficultGuestGeneration":
                    case "difficultParkRating":
                    case "forbidHighConstruction":
                    case "forbidLandscapeChanges":
                    case "forbidMarketingCampaigns":
                    case "forbidTreeRemoval":
                        category = "rule";
                }
            }
            
            switch(category){
                case "ride":
                    self.AddRide(RideType[item[i].item]);
                    break;
                case "stall":
                    self.AddRide(item[i].item);
                    break;
                case "trap":
                    self.ActivateTrap(item[i].item);
                    break;
                case "rule":
                    self.ReleaseRule(item[i].item);
                    break;
                case "scenery":
                    self.AddScenery();
                    break;
                case "discount":
                    self.GrantDiscount(item[i].item);
                    break;
                default:
                    console.log("Error in ReceiveArchipelagoItem: category not found");
            }
        }
        return;
    }

    AddRide(ride): void{
        //Creates function that finds the ride in Uninvented and moves it to Invented items. 
        let unresearchedItems = park.research.uninventedItems;
        let researchedItems = park.research.inventedItems;
        for(let i=0; i<unresearchedItems.length; i++) {
            if (((unresearchedItems[i] as RideResearchItem).rideType) == ride){//Check if the ride type matches
                researchedItems.push(unresearchedItems[i]);//Add the ride to researched items
                unresearchedItems.splice(i,1);          //Remove the ride from unresearched items
                park.research.inventedItems = researchedItems;
                park.research.uninventedItems = unresearchedItems;//Save the researched items list
                return;
            }
        }
        console.log("Error in AddRide: ride not in uninvented items")
        return;
    }

    AddScenery(): void{
        //Creates function that moves the next scenery to Invented items. 
        let unresearchedItems = park.research.uninventedItems;
        let researchedItems = park.research.inventedItems;
        for(let i=0; i<unresearchedItems.length; i++) {
            if (((unresearchedItems[i]).type) == "scenery"){//Check if the object is scenery
                researchedItems.push(unresearchedItems[i]);//Add the scenery to researched items
                unresearchedItems.splice(i,1);          //Remove the scenery from unresearched items
                park.research.inventedItems = researchedItems;
                park.research.uninventedItems = unresearchedItems;//Save the researched items list
                return;
            }
        }
        console.log("Error in AddScenery: No more scenery to unlock")
        return;
    }

    ActivateTrap(trap): void{
        var self = this;
        switch(trap){
            case "FoodPoison":
                self.PoisonTrap();
                break;
            case "Bathroom":
                self.BathroomTrap();
                break;
        }
    }

    PoisonTrap(): void{
        //TODO: Create function that boosts nausea for every guest holding a food item
        return;
    }

    BathroomTrap(): void{
        var guests = map.getAllEntities("guest");
        for (var i=0; i<guests.length; i++) {
        guests[i].toilet = 255;
        }
    }

    ReleaseRule(rule): void{//Function that ends enforcement of detrimental park modifiers
        var releaseRule = function(rule){
            switch(rule){
                case "difficultGuestGeneration":
                    park.postMessage(
                        {type: 'award', text: "Congradulations! " + park.name + " has been recognized as an Archipelago historic site! Expect to see a permanent increase in visitors."} as ParkMessageDesc);
                    park.setFlag("difficultGuestGeneration", false);
                    break;

                case "difficultParkRating":
                    park.postMessage(
                        {type: 'peep', text: "Breaking news! The park ratings council has been overthrown in a military backed coup! The new leader has promised easier park ratings for the rest of this game!"} as ParkMessageDesc);
                    park.setFlag("difficultParkRating", false);
                    break;
                case "forbidHighConstruction":
                    park.postMessage(
                        {type: 'peep', text: "Wait a second, airplanes don't exist in Roller Coaster Tycoon. Why are limiting construction height? Let's go ahead and fix that now."} as ParkMessageDesc);
                    park.setFlag("forbidHighConstruction", false);
                    break;
                case "forbidLandscapeChanges":
                    park.postMessage(
                        {type: "chart", text: "IMPORTANT GOVERNMENT ANNOUNCEMENT: ALL UNEXPLODED ORDINANCE FROM THE GREAT TYCOON WAR HAS BEEN CLEARED FROM THIS SITE. " + park.name + " MAY RESUME LANDSCAPING OPERATIONS."} as ParkMessageDesc);
                    park.setFlag("forbidLandscapeChanges", false);
                    break;
                case "forbidMarketingCampaigns":
                    park.postMessage(
                        {type: 'money', text: "Inspector. The ministry of information has approved your application for promotion in all state media. You may now submit marketing campaigns. Glory to Arstotzka"} as ParkMessageDesc);
                    park.setFlag("forbidMarketingCampaigns", false);
                    break;
                case "forbidTreeRemoval":
                    park.postMessage(
                        {type: 'blank', text: "Upon further research, it would appear that the endangered trees in your park are in fact, invasive species. You may now chop them down."} as ParkMessageDesc);
                    park.setFlag("forbidTreeRemoval", false);
                    break;
                default:
                    console.log("Error in ReleaseRule: no rule found");
            }
        }
        runNextTick(releaseRule(rule));
    }

    GrantDiscount(type): any{
        if (type == "Land Discount"){
            if(archipelago_settings.current_land_checks >= archipelago_settings.max_land_checks){
                console.log("Error in GrantDiscount: current land checks greater than max land checks")
                return;
            }
            archipelago_settings.current_land_checks++;
            park.landPrice = Math.floor(2000 - (2000 * (archipelago_settings.current_land_checks/archipelago_settings.max_land_checks)));
            park.postMessage("Speech increased to " + (archipelago_settings.current_land_checks + archipelago_settings.current_rights_checks) + ". New land price is: " + context.formatString("{CURRENCY2DP}",  park.landPrice));//Cash price)
            saveArchipelagoProgress();
        }
        if (type == "Construction Rights Discount"){
            if(archipelago_settings.current_rights_checks >= archipelago_settings.max_rights_checks){
                console.log("Error in GrantDiscount: current construction rights checks greater than max construction rights checks")
                return;
            }
            archipelago_settings.current_rights_checks++;
            park.constructionRightsPrice = Math.floor(2000 - (2000 * (archipelago_settings.current_rights_checks/archipelago_settings.max_rights_checks)));
            park.postMessage("Speech increased to " + (archipelago_settings.current_land_checks + archipelago_settings.current_rights_checks) + ". New construction rights price is: " + context.formatString("{CURRENCY2DP}",  park.constructionRightsPrice));
            saveArchipelagoProgress();
        }
    }

    ReceiveDeathLink(DeathLinkPacket: {cause: string, source: string}): any{
        var self = this;
        if (archipelago_settings.deathlink_timeout == true){//If the timeout hasn't expired, don't force another coaster to crash
            console.log("Death Link Timeout has not expired. Ignoring Death Link signal")
            return;
        }
        if (!map.getAllEntities("car").length){//If there's nothing to explode, give the user a pass
            console.log("Rain check");
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
                            items: ["The service requested is currently unavaliable. We apologize ", "for any inconvenience. This RAIN CHECK entitiles you to the", "manual service listed. When available, please crash a roller ", "coaster at your convenience."," ", "Todays date: " + (date.month + 3) + '-' + date.day + '-' + 'Year ' + date.year, "Service: Ride Crash", "Quantity: 1",' ', 'Sender: ' + DeathLinkPacket.source, 'Cause of Death: ' + ((!DeathLinkPacket.cause) ? "Unlisted" : DeathLinkPacket.cause)]
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
        }
        context.executeAction('ExplodeRide', DeathLinkPacket);
    }

    SendDeathLink(vehicleID): any{
        if(archipelago_settings.deathlink_timeout == false) {
            archipelago_settings.deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
            context.setTimeout(() => {archipelago_settings.deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
            console.log("We're off to kill the Wizard!");
            var cars = map.getAllEntities("car");
            for(let i = 0; i < cars.length; i++){
                if(cars[i].id == vehicleID){
                    var rideID = cars[i].ride;
                    var ride = map.rides[rideID].name;
                    console.log("vehicleID:" + vehicleID);
                    console.log(rideID);
                    console.log(ride);
                    archipelago_send_message("Bounce",{ride: ride, tag: "DeathLink"});
                    break;
                }
            }
        }
        else {
            console.log("Death Link Timeout has not expired. Cancelling Death Link signal. Note: Multiple cars crashing will attempt to send multiple signals")
        }
    }

    SetNames(): any{
        //Generates guests with the names of the Archipelago players
        if(context.getParkStorage().get("RCTRando.ArchipelagoPlayers")){
            let guests = map.getAllEntities("guest");
            let archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as Array<string>);
            for(let i=0; i<(archipelagoPlayers.length); i++){
                var inPark = false;
                for(let j=0; j<(guests.length); j++){
                    if(archipelagoPlayers[i] == (guests[j].name)){
                    inPark = true;
                    break;
                    }
                }
                if(!inPark){
                    if(guests.length >= archipelagoPlayers.length){
                        guests[i].name = archipelagoPlayers[i];
                    }
                }
            }
        }
    }

    CreateUnlockedList(): any{
        var self = this;
        var unlocked = [];
        var location = archipelago_unlocked_locations;
        var prices = archipelago_location_prices;
        for(var i = 0; i < location.length; i++){//Loop through every locked location
            unlocked.push("[" + location[i].LocationID + "] " + "Unlocked " + archipelago_unlocked_locations[i].Item + " for " + archipelago_unlocked_locations[i].ReceivingPlayer + "!");
            if (prices[location[i].LocationID].Price == 0){//If the price is 0, paid with blood instead of cash
                unlocked.push("          Instead of cash, you sacraficed " + (prices[location[i].LocationID].Lives).toString() + " guests to the ELDER GODS!");
            }
            else{//Set up the string denoting the price
                var prereqs = prices[location[i].LocationID].RidePrereq;
                var cost = "          " + context.formatString("{CURRENCY2DP}",  (prices[location[i].LocationID].Price) * 10);//Cash price
                if(prereqs.length != 0) {//Handle prerequisites 
                    cost += " + " + prereqs[0].toString() + " ";
                    cost += prereqs[1] + "(s)";
                    if(prereqs[2] != 0)//Check for excitement requirement
                        cost += ', (> ' + prereqs[2] + ' excitement)';
                    if(prereqs[3] != 0)//Check for intensity requirement
                        cost += ', (> ' + prereqs[3] + ' intensity)';
                    if(prereqs[4] != 0)//Check for nausea requirement
                        cost += ', (> ' + prereqs[4] + ' nausea)';
                    if(prereqs[5] != 0)//Check for length requirement
                        cost += ', (> ' + context.formatString("{LENGTH}", prereqs[5]) + ')';
                }
                unlocked.push(cost);
            }
        }
        return unlocked;
    }

    CreateLockedList(): any{
        var self = this;
        var locked = [];
        var location = archipelago_locked_locations;
        var prices = archipelago_location_prices;
        for(var i = 0; i < location.length; i++){//Loop through every locked location
            if (self.IsVisible(location[i].LocationID)){
                if (prices[location[i].LocationID].Price == 0){//If the price is 0, pay with blood instead of cash
                    locked.push("[" + location[i].LocationID + "] " + "Instead of cash, you must sacrafice " + (prices[location[i].LocationID].Lives).toString() + " guests to the ELDER GODS!");
                }
                else{//Set up the string denoting the price
                    var prereqs = prices[location[i].LocationID].RidePrereq;
                    
                    var cost = "[" + location[i].LocationID + "] " + context.formatString("{CURRENCY2DP}",  (prices[location[i].LocationID].Price) * 10);//Cash price
                    if(prereqs.length != 0) {//Handle prerequisites 
                        cost += " + " + prereqs[0].toString() + " ";
                        cost += prereqs[1] + "(s)";
                        if(prereqs[2] != 0)//Check for excitement requirement
                            cost += ', (> ' + prereqs[2] + ' excitement)';
                        if(prereqs[3] != 0)//Check for intensity requirement
                            cost += ', (> ' + prereqs[3] + ' intensity)';
                        if(prereqs[4] != 0)//Check for nausea requirement
                            cost += ', (> ' + prereqs[4] + ' nausea)';
                        if(prereqs[5] != 0)//Check for length requirement
                            cost += ', (> ' + context.formatString("{LENGTH}", prereqs[5]) + ')';
                    }
                    locked.push(cost);
                }
                switch(archipelago_settings.location_information){
                    case 'None':
                        locked.push("          Unlocks something for somebody!")
                        break;
                    case 'Recipient':
                        locked.push("          Unlocks something for " + archipelago_locked_locations[i].ReceivingPlayer + "!");
                        break;
                    case 'Full':
                        locked.push("          Unlocks " + archipelago_locked_locations[i].Item + " for " + archipelago_locked_locations[i].ReceivingPlayer + "!");
                        break;
                }
            }
        }
        return locked;
    }

    CreateObjectiveList(): any{
        var self = this;
        var objective = [];
        if (archipelago_objectives.Guests){
            objective.push("Guests:");
            objective.push("          " + archipelago_objectives.Guests[0].toString());
        }
        if (archipelago_objectives.ParkValue[0]){
            objective.push("Park Value:");
            objective.push("          " + context.formatString("{CURRENCY2DP}",  Number(archipelago_objectives.ParkValue[0]) * 10));//Multiply by 10 to get in-game amount
        }
        var RollerCoaster = archipelago_objectives.RollerCoasters;
        if (RollerCoaster[0]){
            objective.push("Roller Coasters:");
            var Line = "          " + RollerCoaster[0];
            if(RollerCoaster[1]){
                Line += " (> " + RollerCoaster[1] + " Excitement)";
            }
            if(RollerCoaster[2]){
                Line += " (> " + RollerCoaster[2] + " Intensity)";
            }
            if(RollerCoaster[3]){
                Line += " (> " + RollerCoaster[3] + " Nausea)";
            }
            objective.push(Line);
        }
        // if (archipelago_objectives.RideIncome[0]){
        //     objective.push("Ride Income:");
        //     objective.push("          " + context.formatString("{CURRENCY2DP}",  (archipelago_objectives.RideIncome[0]) * 10));
        // }
        // if (archipelago_objectives.ShopIncome[0]){
        //     objective.push("Shop Income:");
        //     objective.push("          " + context.formatString("{CURRENCY2DP}",  (archipelago_objectives.ShopIncome[0]) * 10));
        // }
        if (archipelago_objectives.ParkRating[0]){
            objective.push("Park Rating:");
            objective.push("          " + archipelago_objectives.ParkRating[0].toString());
        }
        if (archipelago_objectives.LoanPaidOff[0]){
            objective.push("Repaid Loan:");
            objective.push("          Check your bank statement.");
        }
        
        return objective;
    }

    CheckObjectives(): any{
        var self = this;
        if (scenario.status == "completed"){
            return;
        }
        if (park.guests >= Number(archipelago_objectives.Guests[0])){
            archipelago_objectives.Guests[1] = true;
        }
        else{
            archipelago_objectives.Guests[1] = false;
        }

        if (park.value >= (Number(archipelago_objectives.ParkValue[0])/10)){
            archipelago_objectives.ParkValue[1] = true;
        }
        else{
            archipelago_objectives.ParkValue[1] = false;
        }

        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);//Combine the research lists
        var NumQualifiedRides = 0;
        for(var i = 0; i < map.numRides; i++){
            var ride = map.rides[i].type;
            var QualifiedExcitement = false;
            var QualifiedIntensity = false;
            var QualifiedNausea = false;
            var QualifiedLength = false;
            var elligible = false;
            if (!(ride == 28 || ride == 30 || ride == 32)){
                for(var j = 0; j < researchItems.length; j++){
                    if((researchItems[j] as RideResearchItem).rideType == ride){//If the items match...
                        if(researchItems[j].category == "rollercoaster"){//Check if it's a coaster
                            elligible = true;
                            break;
                        }
                    }
                }
                if (elligible){
                    QualifiedLength = true;//It appears ride objects don't actually give length as a property. I'll leave finding ride lengths as an excercize for future Colby 
                    if (map.rides[i].excitement >= (Number(archipelago_objectives.RollerCoasters[2]) * 100)){//Check if excitement is met. To translate ingame excitement to incode excitement, multiply ingame excitement by 100
                        QualifiedExcitement = true;
                    }
                    if (map.rides[i].intensity >= (Number(archipelago_objectives.RollerCoasters[3]) * 100)){
                        QualifiedIntensity = true;
                    }
                    if (map.rides[i].nausea >= (Number(archipelago_objectives.RollerCoasters[4]) * 100)){
                        QualifiedNausea = true;
                    }

                    if (QualifiedExcitement && QualifiedIntensity && QualifiedNausea && QualifiedLength){
                        NumQualifiedRides += 1;
                    }

                    if (NumQualifiedRides >= Number(archipelago_objectives.RollerCoasters[0])){
                        archipelago_objectives.RollerCoasters[6] = true;
                        break;
                    }
                }
            }

        }
        
        //TODO: Wait for monthly ride and shop income to become visible to the API
        archipelago_objectives.RideIncome[1] = true;
        archipelago_objectives.ShopIncome[1] = true;


        if (park.rating >= Number(archipelago_objectives.ParkRating[0])){
            archipelago_objectives.ParkRating[1] = true;
        }
        else{
            archipelago_objectives.ParkRating[1] = false;
        }

        if (archipelago_objectives.LoanPaidOff[0] == true)//Check if Loans are enabled
        {
            if (park.bankLoan <= 0){//Check if loan is paid off
                archipelago_objectives.LoanPaidOff[1] = true;
            }
            else{
                archipelago_objectives.LoanPaidOff[1] = false;
            }
        }
        else {//If loans are not enabled, set the condition for winning to true
            archipelago_objectives.LoanPaidOff[1] = true;
        }

        //Check if all conditions are met
        if (archipelago_objectives.Guests[1] == true && archipelago_objectives.ParkValue[1] == true && 
            archipelago_objectives.RollerCoasters[6] == true && archipelago_objectives.RideIncome[1] == true && 
            archipelago_objectives.ShopIncome[1] == true && archipelago_objectives.ParkRating[1] == true && 
            archipelago_objectives.LoanPaidOff[1] == true){
            context.executeAction("cheatset", {type: 34, param1: 0, param2: 0}, () => console.log("I will need to write a function to send the win condition over "));
            
        }
        
    }

    IsVisible(LockedID): boolean{
        var CheckID = 0; //We want to limit the locations shown until the correct previous locations have been unlocked
        switch(LockedID){//These unlocks form a tree, with 2 branching nodes until item 6. All further nodes have only 1 branch
            case 0:
                return true;
                break;
            case 1:
            case 2:
                CheckID = 0;
                break;
            case 3:
            case 4:
                CheckID = 1;
                break;
            case 5:
            case 6:
                CheckID = 2;
                break;
            case 7:
            case 8:
                CheckID = 3;
                break;
            case 9:
            case 10:
                CheckID = 4;
                break;
            case 11:
            case 12:
                CheckID = 5;
                break;
            case 13:
            case 14:
                CheckID = 6;
                break;
            default:
                CheckID = LockedID - 8;
            break;
        }
        for(var i = 0; i < archipelago_unlocked_locations.length; i++){
            if (CheckID == archipelago_unlocked_locations[i].LocationID)
            return true;
        }
        
        return false;
    }

    PurchaseItem(item: number): any{
        var self = this;
        let Locked = archipelago_locked_locations;
        let Unlocked = archipelago_unlocked_locations;
        let Prices = archipelago_location_prices;
        let LocationID = Locked[item].LocationID;
        let Prereqs = Prices[LocationID].RidePrereq;
        if(Prices[LocationID].Price <= (park.cash / 10) || Prices[LocationID].Price == 0){//Check if player has enough cash or if the price is 0.
            if(Prices[LocationID].Lives <= park.guests){//Check if the player has enough guests to sacrifice
                var NumQualifiedRides = 0;
                var object = Prices[LocationID]
                var ride = RideType[Prices[LocationID].RidePrereq[1]];

                for(var i = 0; i < map.numRides; i++){
                    var QualifiedExcitement = false;
                    var QualifiedIntensity = false;
                    var QualifiedNausea = false;
                    var QualifiedLength = false;
                    var elligible = false;
                    if(ride){//See if there's a prereq that's a specific ride 
                        if (Number(ride) == map.rides[i].type){//If the rides match, they're elligible
                        elligible = true;
                        }
                    }

                    if (ObjectCategory[object.RidePrereq[1]]){//See if there's a prereq that's a category
                        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);//Combine the research lists
                        for(var j = 0; j < researchItems.length; j++){
                            if((researchItems[j] as RideResearchItem).rideType == map.rides[i].type){//If the items match...
                                if(researchItems[j].category == Prices[LocationID].RidePrereq[1]){//Check if the categories match
                                    elligible = true;
                                }
                            }
                        }
                    }

                    if (elligible){
                        QualifiedLength = true;//It appears ride objects don't actually give length as a property. I'll leave finding ride lengths as an excercize for future Colby
                        if (map.rides[i].excitement >= (Prereqs[2] * 100)){//Check if excitement is met. To translate ingame excitement to incode excitement, multiply ingame excitement by 100
                            QualifiedExcitement = true;
                        }
                        if (map.rides[i].intensity >= (Prereqs[3] * 100)){
                            QualifiedIntensity = true;
                        }
                        if (map.rides[i].nausea >= (Prereqs[4] * 100)){
                            QualifiedNausea = true;
                        }
                    }

                    if (QualifiedExcitement && QualifiedIntensity && QualifiedNausea && QualifiedLength){
                        NumQualifiedRides += 1;
                    }
                }
                if(!Prereqs.length || NumQualifiedRides >= Prereqs[0]){
                    if(Prices[LocationID].Lives != 0){//Code to explode guests
                    var doomed = Math.floor(Prices[LocationID].Lives * 1.5);//Add a buffer to the stated cost to make up for janky guest exploding code
                        if(doomed < map.getAllEntities("guest").length){//Explode either the doomed amount, or every guest in the park, whichever is less
                            for(var i = 0; i < doomed; i++){
                                map.getAllEntities("guest")[i].setFlag("explode", true);// Credit to Gymnasiast/everything-must-die for the idea
                            }
                        }
                        else{
                            for(var i = 0; i < map.getAllEntities("guest").length; i++){
                                map.getAllEntities("guest")[i].setFlag("explode", true);                            
                            }
                        }
                    }
                    park.cash -= (Prices[LocationID].Price * 10);//Multiply by 10 to obtain the correct amount
                    Unlocked.push(Locked[item]);
                    Locked.splice(item,1);
                    archipelago_locked_locations = Locked;
                    archipelago_unlocked_locations = Unlocked;
                    ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
                    var lockedWindow = ui.getWindow("archipelago-locations");
                    lockedWindow.findWidget<ListViewWidget>("locked-location-list").items = self.CreateLockedList();
                }
                else{
                    ui.showError("Prerequisites not met", "One or more of the prerequisites for this unlock have not been fulfilled");
                }
            }
            else{
                ui.showError("Not Enough Guests...", "The Gods are unpleased with your puny sacrifice. Obtain more guests and try again.")
            }
        }
        else{
            ui.showError("Not Enough Cash...", "You do not have enough money to buy this!")
        }
        
        return;
    }


    
}


function explodeRide(args){
    console.log(args);
    const cause = args.args.cause;
    const source = args.args.source;
    const DeathLinkPacket = {cause, source};
    console.log(DeathLinkPacket);
    var self = this;
    var car = map.getAllEntities('car');
    var movingCar = [];
    for (let i = 0; i < car.length; i++){
        if(car[i].status == 'travelling'){
            movingCar.push(car[i]);
        }
    }
    if (!movingCar.length){//If there are no moving cars, wait 5 seconds and try again
        var archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
        if(archipelago)
            context.setTimeout(function() {archipelago.ReceiveDeathLink(DeathLinkPacket)}, 5000);
        return {};
    }
    var r = context.getRandom(0, movingCar.length);//Pick a car at random. It seems to only pick the first car of the train though...
    archipelago_settings.deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
    movingCar[r].status = "crashed";//Crash the ride!
    context.setTimeout(() => {archipelago_settings.deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
    return {};
}

function saveArchipelagoProgress(){
    context.getParkStorage().set('RCTRando.ArchipelagoSettings', archipelago_settings);
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelago());
