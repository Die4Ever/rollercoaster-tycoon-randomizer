/// <reference path="moduleBase.ts" />


class RCTRArchipelago extends ModuleBase {
    FirstEntry(): void {//Loads on park starting for first time. Something in my code calls it as well
        var self = this;
        // self.RemoveItems();// Used to get the full list of items and scenery for Archipelago
        info("Module to handle connecting and communicating with Archipelago");
        if(!settings.rando_archipelago)
            return;
        self.RemoveItems();//Removes everything from the invented items list. They'll be added back when Archipelago sends items
        archipelago_send_message("Sync");//Get's all the currently received items for the game
        archipelago_send_message("LocationScouts");//Gets the item info for every location in the unlock shop

        // archipelago_send_message("GetDataPackage");
        self.SetPostGenerationSettings();//Let the other settings to do their thing
        //Setting rules for Archipelago, dictated by the YAML
        var setRules = function(){
            if(archipelago_settings.rule_locations[0])
            park.setFlag("difficultGuestGeneration", true);
            else
            park.setFlag("difficultGuestGeneration", false);
            if(archipelago_settings.rule_locations[1])
            park.setFlag("difficultParkRating", true);
            else
            park.setFlag("difficultParkRating", false);
            if(archipelago_settings.rule_locations[2])
            park.setFlag("forbidHighConstruction", true);
            else
            park.setFlag("forbidHighConstruction", false);
            if(archipelago_settings.rule_locations[3])
            park.setFlag("forbidLandscapeChanges", true);
            else
            park.setFlag("forbidLandscapeChanges", false);
            if(archipelago_settings.rule_locations[4])
            park.setFlag("forbidMarketingCampaigns", true);
            else
            park.setFlag("forbidMarketingCampaigns", false);
            if(archipelago_settings.rule_locations[5])
            park.setFlag("forbidTreeRemoval", true);
            else
            park.setFlag("forbidTreeRemoval", false);
        }
        runNextTick(setRules);//Mutates the game context, so it has to be run on a tick event

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
        saveArchipelagoProgress();
        return;
    }

    AnyEntry(): void {//Loads on save file load and refreshing the code
        var self = this;
        if (!settings.rando_archipelago)//Don't P*ck with the game if we're not playing Archipelago
            return;
        //Connection Stuff
        context.setTimeout(() => {self.SendStatus();}, 4500);
        //Load saved progress
        if(context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations')){//Don't break the lists if nothings saved yet.
            archipelago_locked_locations = context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations');
            archipelago_unlocked_locations = context.getParkStorage().get('RCTRando.ArchipelagoUnlockedLocations');
            archipelago_location_prices = context.getParkStorage().get('RCTRando.ArchipelagoLocationPrices');
            archipelago_objectives = context.getParkStorage().get('RCTRando.ArchipelagoObjectives');
            archipelago_settings = context.getParkStorage().get('RCTRando.ArchipelagoSettings');
        }
        if (context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")){
            full_item_id_to_name = context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName");
            full_location_id_to_name = context.getParkStorage().get("RCTRando.ArchipelagoLocationIDToName");
        }
        //Set up connection to client
        if (!archipelago_connected_to_game)
        init_archipelago_connection();
        //Set up daily events
        self.SubscribeEvent("interval.day", ()=>{self.SetArchipelagoResearch(); self.CheckObjectives(); self.SetNames();});
        //Add menu items
        ui.registerMenuItem("Archipelago Checks!", archipelagoLocations); //Register the check menu
        if (archipelago_settings.deathlink)//Enable deathlink checks if deathlink is enabled
        self.SubscribeEvent('vehicle.crash',(e: any) => self.SendDeathLink(e.id));
        context.subscribe('action.execute',e => self.InterpretAction(e.player, e.action, e.args, e.result));
        context.subscribe('interval.tick', (e: any) => self.CheckMonopoly());
        archipelago_settings.deathlink_timeout = false;//Reset the Deathlink if the game was saved and closed during a timeout period
        //Get our games if we don't have them yet
        self.RequestGames();

        //Set shortcuts
        ui.registerShortcut(
            {id:"spamTrapBackspace", text:"[AP] Don't press this when a spam window is open", bindings:['BACKSPACE'],
            callback() {if(ui.getWindow("popup")){showRandomAd(); showRandomAd();};}
        });

        ui.registerShortcut(
            {id:"spamTrapShiftBackspace", text:"[AP] Don't press this when a spam window is open", bindings:['SHIFT+BACKSPACE'],
            callback() {if(ui.getWindow("popup")){context.setTimeout(() => {for(let i = 0; i < 12; i++){showRandomAd();};}, 50);};}
        });

        ui.registerShortcut(
            {id:"sendMessage", text:"[AP] Sends message from the unlock shop.",bindings:['RETURN'],
            callback() {try {
                interpretMessage();
            }
            catch{
                trace("Looks like the Archipelago Shop isn't open");
            }}
        });

        ui.registerShortcut(
            {id:"openUnlockShop", text:"[AP] Opens the unlock shop.", bindings:['HOME'],
        callback() {
            try{
                archipelagoLocations()
            }
            catch{
                trace("Welp. Something went wrong with the shortcut");
            }
        }}
        )

        //Set up actions for multiplayer
        try{
            context.registerAction('ExplodeRide', (args) => {return {};}, (args) => explodeRide(args));
        }
        catch(e){
            console.log("Error in registering ExplodeRide:" + e)
        }

        if(bDebug){
            // archipelago_settings.location_information = 'Full';
            // archipelago_unlocked_locations = [{LocationID: 0,Item: "Sling Shot",ReceivingPlayer: "Dallin"}, {LocationID: 1,Item: "progressive automation",ReceivingPlayer: "Drew"}, {LocationID: 2,Item: "16 pork chops",ReceivingPlayer: "Minecraft d00ds"}];
            // archipelago_locked_locations = [{LocationID: 3,Item: "Howling Wraiths",ReceivingPlayer: "Miranda"},{LocationID: 4,Item: "Hookshot",ReceivingPlayer: "Dallin"}, {LocationID: 5,Item: "progressive flamethrower",ReceivingPlayer: "Drew"}, {LocationID: 6,Item: "egg shard",ReceivingPlayer: "Minecraft d00ds"}, {LocationID: 7,Item: "Descending Dive",ReceivingPlayer: "Miranda"}];
            // archipelago_location_prices = [{LocationID: 0, Price: 500, Lives: 0, RidePrereq: []}, {LocationID: 1, Price: 2500, Lives: 0, RidePrereq: []},{LocationID: 2, Price: 2500, Lives: 0, RidePrereq: []},{LocationID: 3, Price: 6000, Lives: 0, RidePrereq: []},{LocationID: 4, Price: 4000, Lives: 0, RidePrereq: [2, "gentle",0,0,0,0]},{LocationID: 5, Price: 4000, Lives: 0, RidePrereq: [3, "Looping Roller Coaster", 6.3,0,0,0]},{LocationID: 6, Price: 0, Lives: 200, RidePrereq: []},{LocationID: 7, Price: 10000, Lives: 0, RidePrereq: [1, "Wooden Roller Coaster", 0, 5.0, 7.0, 1000]}];
            // archipelago_objectives = {Guests: [300, false], ParkValue: [100000, false], RollerCoasters: [5,2,2,2,0,false], RideIncome: [0, false], ShopIncome: [8000, false], ParkRating: [700, false], LoanPaidOff: [true, false], Monopoly: [true, false]};
            // context.getParkStorage().set('RCTRando.ArchipelagoLocationPrices', archipelago_location_prices);
            // context.getParkStorage().set('RCTRando.ArchipelagoObjectives', archipelago_objectives);
            // ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
        }
    }

    SetImportedSettings(imported_settings: any): void{
        var self = this;
        trace("Setting values retrieved from Archipelago");
        switch(imported_settings.difficulty){
            case 0://very_easy
                settings.difficulty = difficulties["Very Easy"];
                break;
            case 1://easy
                settings.difficulty = difficulties["Easy"];
                break;
            case 2://medium
                settings.difficulty = difficulties["Medium"];
                break;
            case 3://hard
                settings.difficulty = difficulties["Hard"];
                break;
            case 4://extreme
                settings.difficulty = difficulties["Extreme"];
                break;
        }
        switch(imported_settings.scenario_length){
            case 0://speedrun
                settings.scenarioLength = scenarioLengths.Speedrun;
                break;
            case 1://normal
                settings.scenarioLength = scenarioLengths.Normal;
                break;
            case 2://lengthy
                settings.scenarioLength = scenarioLengths.Long;
                break;
            case 3://marathon
                settings.scenarioLength = scenarioLengths.Marathon;
                break;
        }
        if(imported_settings.death_link)
        archipelago_settings.deathlink = true;
        else
        archipelago_settings.deathlink = false;
        switch(imported_settings.randomization_range){
            case 0://none
                settings.rando_range = randoRanges.None;
                break;
            case 1://low
                settings.rando_range = randoRanges.Low;
                break;
            case 2://medium
                settings.rando_range = randoRanges.Medium
                break;
            case 3://high
                settings.rando_range = randoRanges.High
                break;
            case 4://extreme
                settings.rando_range = randoRanges.Extreme
                break;
        }
        switch(imported_settings.stat_rerolls){
            case 0://never
                settings.num_months_cycle = randoCycles.Never;
                break;
            case 1://infrequent
                settings.num_months_cycle = randoCycles.Infrequent;
                break;
            case 2://semi_frequent
                settings.num_months_cycle = randoCycles["Semi-Frequent"];
                break;
            case 3://frequent
                settings.num_months_cycle = randoCycles.Frequent;
                break;
            case 4://very_frequent
                settings.num_months_cycle = randoCycles["Very Frequent"];
                break;
            case 5://extremely_frequent
                settings.num_months_cycle = randoCycles["Extremely Frequent"];
                break;
        }

        if(imported_settings.randomize_park_values)
        settings.rando_park_values = true;
        else
        settings.rando_park_values = false;

        if(imported_settings.ignore_ride_stat_changes)
        settings.rando_ride_types = false;
        else
        settings.rando_ride_types = true;

        archipelago_settings.preferred_intensity = imported_settings.preferred_intensity;

        archipelago_objectives.Guests[0] = imported_settings.objectives.Guests[0];
        archipelago_objectives.ParkValue[0] = imported_settings.objectives.ParkValue[0];
        for(let i = 0; i < 5; i++){
            archipelago_objectives.RollerCoasters[i] = imported_settings.objectives.RollerCoasters[i];
        }
        archipelago_objectives.RideIncome[0] = imported_settings.objectives.RideIncome[0];
        archipelago_objectives.ShopIncome[0] = imported_settings.objectives.ShopIncome[0];
        archipelago_objectives.ParkRating[0] = imported_settings.objectives.ParkRating[0];
        archipelago_objectives.LoanPaidOff[0] = imported_settings.objectives.LoanPaidOff[0];
        archipelago_objectives.Monopoly[0] = imported_settings.objectives.Monopoly[0];
        archipelago_objectives.UniqueRides[0] = imported_settings.objectives.UniqueRides[0];

        trace(archipelago_objectives.Monopoly[0]);
        if(archipelago_objectives.Monopoly[0])
        self.SetPurchasableTiles();

        archipelago_settings.rule_locations = imported_settings.rules;
        trace("These Park Rules are enabled: " + archipelago_settings.rule_locations);

        switch(imported_settings.visibility){
            case 0:
                archipelago_settings.location_information = "None"
                break;
            case 1:
                archipelago_settings.location_information = "Recipient"
                break;
            case 2:
                archipelago_settings.location_information = "Full"
                break;
        }

        archipelago_location_prices = imported_settings.location_prices;
        context.getParkStorage().set('RCTRando.ArchipelagoLocationPrices', archipelago_location_prices);

        context.getParkStorage().set('RCTRando.ArchipelagoObjectives', archipelago_objectives);
        saveArchipelagoProgress();

        var scenario_name: string = scenario.name.toLowerCase();
        trace("Game expects: " + scenario_name + "\nArchipelago provided: " + ScenarioName[imported_settings.scenario]);
        if(ScenarioName[imported_settings.scenario] == scenario_name)
        archipelago_correct_scenario = true;
        else{
            archipelago_correct_scenario = false;
            ui.getWindow("archipelago-connect").findWidget<LabelWidget>("label-Correct-scenario").text = "{RED}WARNING!{WHITE} Archipelagos scenario does not match this one. Please open: " + ScenarioName[imported_settings.scenario];
        }

        archipelago_connected_to_server = true;
        ui.getWindow("archipelago-connect").findWidget<LabelWidget>("label-Connected-to-server").text = "The Archipelago Client is connected to the server!";
        ui.getWindow("archipelago-connect").findWidget<ButtonWidget>("start-button").isDisabled = !archipelago_connected_to_game || !archipelago_connected_to_server || !archipelago_correct_scenario;
    }

    SetArchipelagoResearch(): void {
        context.executeAction("parksetresearchfunding", {priorities: 0, fundingAmount: 0}, noop);//Set Funding to 0 and unselect every focus
        park.research.progress = 0; //If any progress is made (Say by users manually re-enabling research), set it back to 0.
    }

    InterpretAction(player, action, args, result): void {//Interprets game actions for various processes
        // if(action == "ridecreate"){
        //     console.log("Player: " + player + "\nType: " + action + "\nResult: " + result);
        // }
        switch(action){
            case "gamesetspeed":
                trace(args.speed);
                trace(archipelago_settings.maximum_speed);
                if(args.speed > archipelago_settings.maximum_speed){
                    ui.showError("Too fast!", "You haven't unlocked that speed tier yet!")
                    context.executeAction("gamesetspeed",{speed: 1} as GameSetSpeedArgs);
                }
        }
    }

    RemoveItems(): void{
        const origNumResearched = park.research.inventedItems.length;
        let numResearched = 0;
        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);

        //Used to show what items are in the scenario
        // var items: any = [];
        // for(let i = 0; i < researchItems.length; i++){
            // if(researchItems[i].category == "scenery")
            // items.push("scenery");
            // else
            // items.push(RideType[researchItems[i].rideType]);
        // }
        // console.log("\n\n\n\n\n");
        // console.log(scenario.name);
        // console.log(JSON.stringify(items));
        // console.log("\n\n\n\n\n");

        objectManager.load(["rct2.ride.atm1","rct2.ride.faid1"]);//Add First Aid Room and ATM. They won't be unlocked if the yaml says they won't
        //Loads the entertainers into the park for the furry trap
        objectManager.load(["rct2.peep_animations.entertainer_elephant.json","rct2.peep_animations.entertainer_gorilla.json","rct2.peep_animations.entertainer_panda.json","rct2.peep_animations.entertainer_tiger.json"])

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

    ReceiveArchipelagoItem(items: any[], index: number): void{
        var self = this;
        console.log("Here's the array of items:");
        console.log(items);
        // var new_items = []
        // var received_items = archipelago_settings.received_items.slice();
        // for(let i = 0; i < items.length; i++){
        //     let current_item = items[i][0];
        //     let current_object = received_items.filter(obj => obj.item === items[i][0]);//Get the item from the list, if it exists
        //     if (current_object){
        //         current_object.amount ++;//Add 1 to the amount on the list
        //     }
        //     else{
        //         received_items.push({item: current_item, amount: 1});
        //     }
        // }
        var compare_list: any = [];
        if(index == 0){
            for(let i = 0; i < items.length; i++){
                if (compare_list.indexOf(items[i][0]) > -1){//Check if item on the list already
                    compare_list.indexOf(items[i][0])[1] ++;//Add 1 to the count
                }
                else{
                    compare_list.push([items[i][0], 1]);//Create the new item on the list.
                }
                trace(compare_list);
            }
        }
        else{
            compare_list = archipelago_settings.received_items.slice();//Stupid p*cking Typescript, throwing refrences arround in the air like it just don't care
            for(let i = 0; i < items.length; i++){
                if (compare_list.indexOf(items[i][0]) > -1){//Item, Location, Player, Flags, Class
                    compare_list.indexOf(items[i][0])[1] ++;//Add 1 to the count
                }
                else{
                    compare_list.push([items[i][0], 1]);//Create the new item on the list.
                }
            }
        }
        for(let i = 0; i < compare_list.length; i++){//Each item
            for(let j = 0; j < compare_list[i][1]; j++){//Each instance of item
                var category = "item";
                let compare_number = archipelago_settings.received_items[i];
                if (compare_number === undefined)
                compare_number = 0;
                if(compare_list[i][j] > compare_number){//If its not on the list already
                    if(compare_list[i][0] >= 2000000 && compare_list[i][0] <= 2000121){//This number will need to change if we ever add more items/traps/etc.
                        var item = item_id_to_name[compare_list[i][0]];
                        trace(item);
                        if(item.indexOf("Trap") > -1)
                        category = "trap";
                        if(Number(RideType[item]) > -1)//Any item that fits a ride type is a ride
                        category = "ride";
                        if(item.indexOf("$") > -1)
                        category = "cash";
                        if(item.indexOf("Guests") > -1)
                        category = "guests";
                        if(category == "item"){//Check the actual item if none of the above works out
                            switch(item){
                                case "scenery":
                                    category = "scenery";
                                    break;
                                case "Land Discount":
                                case "Construction Rights Discount":
                                    category = "discount";
                                    break;
                                case "Easier Guest Generation":
                                case "Easier Park Rating":
                                case "Allow High Construction":
                                case "Allow Landscape Changes":
                                case "Allow Marketing Campaigns":
                                case "Allow Tree Removal":
                                    category = "rule";
                                    break;
                                case "Beauty Contest":
                                    category = "beauty";
                                    break;
                                case "Rainstorm":
                                case "Thunderstorm":
                                case "Snowstorm":
                                case "Blizzard":
                                    category = "weather";
                                    break;
                                case "Progressive Speed":
                                    category = "speed";
                                    break;
                                case "Skip":
                                    category = "skip";
                                    break;
                            }
                        }

                        switch(category){
                            case "ride":
                                self.AddRide(RideType[item]);
                                break;
                            case "stall":
                                self.AddRide(item);
                                break;
                            case "trap":
                                self.ActivateTrap(item);
                                break;
                            case "rule":
                                self.ReleaseRule(item);
                                break;
                            case "scenery":
                                self.AddScenery();
                                break;
                            case "discount":
                                self.GrantDiscount(item);
                                break;
                            case "cash":
                                self.AddCash(item)
                                break;
                            case "guests":
                                self.AddGuests(item)
                                break;
                            case "beauty":
                                self.BeautyContest();
                                break;
                            case "weather":
                                self.setWeather(item)
                                break;
                            case "speed":
                                self.updateMaxSpeed();
                                break;
                            case "skip":
                                self.addSkip();
                                break;
                            default:
                                console.log("Error in ReceiveArchipelagoItem: category not found");
                        }
                    }
                }
            }
        }
        archipelago_settings.received_items = compare_list;//Save the updated list
        saveArchipelagoProgress();
        return;
    }

    AddRide(ride: any): void{
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

        console.log("Error in AddRide: ride not in uninvented items");
        archipelago_print_message("For some reason, the game tried to unlock the following ride unsucessfully:" + String(RideType[ride]));
        ui.showError("Ride Unsuccessful", "For some reason, the game tried to unlock the following ride unsucessfully:" + String(RideType[ride]));
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

    ActivateTrap(trap: string): void{
        var self = this;
        switch(trap){
            case "FoodPoison":
                self.PoisonTrap();
                break;
            case "Bathroom Trap":
                self.BathroomTrap();
                break;
            case "Furry Convention Trap":
                self.FurryConventionTrap();
                break;
            case "Spam Trap":
                self.SpamTrap();
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

    FurryConventionTrap(): void{
        var furry_number = Math.ceil(park.guests * .2);
        if(furry_number < 25)
        furry_number = 25;
        if(furry_number > 300)
        furry_number = 300;
        for(let i = 0; i < furry_number; i++){
            var furry_type = Math.floor(Math.random() * 3);
            // context.executeAction("staffhire",{autoPosition: true, staffType: 3, entertainerType: furry_type, staffOrders: 0} as StaffHireArgs);
            let furry = context.executeAction("staffhire", {autoPosition: true, staffType: 3});
        }
    }

    SpamTrap(): void{
        for(let i = 0; i < 10; i++){
            showRandomAd();
        }
    }

    ReleaseRule(rule: string): void{//Function that ends enforcement of detrimental park modifiers
        var releaseRule = function(){
            switch(rule){
                case "Easier Guest Generation":
                    park.postMessage(
                        {type: 'award', text: "Congradulations! " + park.name + " has been recognized as an Archipelago historic site! Expect to see a permanent increase in visitors."} as ParkMessageDesc);
                    park.setFlag("difficultGuestGeneration", false);
                    break;

                case "Easier Park Rating":
                    park.postMessage(
                        {type: 'peep', text: "Breaking news! The park ratings council has been overthrown in a military backed coup! The new leader has promised easier park ratings for the rest of this game!"} as ParkMessageDesc);
                    park.setFlag("difficultParkRating", false);
                    break;
                case "Allow High Construction":
                    park.postMessage(
                        {type: 'peep', text: "Wait a second, airplanes don't exist in Roller Coaster Tycoon. Why are we limiting construction height? Let's go ahead and fix that now."} as ParkMessageDesc);
                    park.setFlag("forbidHighConstruction", false);
                    break;
                case "Allow Landscape Changes":
                    park.postMessage(
                        {type: "chart", text: "IMPORTANT GOVERNMENT ANNOUNCEMENT: ALL UNEXPLODED ORDINANCE FROM THE GREAT TYCOON WAR HAS BEEN CLEARED FROM THIS SITE. " + park.name + " MAY RESUME LANDSCAPING OPERATIONS."} as ParkMessageDesc);
                    park.setFlag("forbidLandscapeChanges", false);
                    break;
                case "Allow Marketing Campaigns":
                    park.postMessage(
                        {type: 'money', text: "Inspector. The ministry of information has approved your application for promotion in all state media. You may now submit marketing campaigns. Glory to Arstotzka"} as ParkMessageDesc);
                    park.setFlag("forbidMarketingCampaigns", false);
                    break;
                case "Allow Tree Removal":
                    park.postMessage(
                        {type: 'blank', text: "Upon further research, it would appear that the endangered trees in your park are in fact, invasive species. You may now chop them down."} as ParkMessageDesc);
                    park.setFlag("forbidTreeRemoval", false);
                    break;
                default:
                    console.log("Error in ReleaseRule: no rule found");
            }
        }
        runNextTick(releaseRule);
    }

    GrantDiscount(type: string): any{
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

    AddCash(amount: any): void{
        amount = amount.replace(/\D/g,'');//Drops the '$' from the amount
        amount = Number(amount);//Converts to a number
        runNextTick(() => {park.cash += amount * 10;});//Multiply by 10 to get the dollar amount
    }

    AddGuests(amount: any): void{
        amount = amount.replace(/\D/g,'');//Strips everything but the number
        amount = Number(amount);
        context.executeAction("cheatset", {type: 20, param1: amount, param2: 0}, () => trace("Added " + String(amount) + " guests to the park."));
    }

    BeautyContest(): any{//Yep. It's a stupid refrence, but I aint removing it now!
        var window = ui.openWindow({
            classification: 'Beauty Contest',
            title: "Community Chest",
            width: 300,
            height: 150,
            colours: [17,0],
            widgets: [].concat(
                [
                    {
                        type: 'label',
                        x: 0,
                        y: 25,
                        width: 300,
                        height: 25,
                        textAlign: "centred",
                        text: "You have won"
                    },
                    {
                        type: 'label',
                        x: 0,
                        y: 50,
                        width: 300,
                        height: 25,
                        textAlign: "centred",
                        text: "second prize"
                    },
                    {
                        type: 'label',
                        x: 0,
                        y: 75,
                        width: 300,
                        height: 25,
                        textAlign: "centred",
                        text: "in a"
                    },
                    {
                        type: 'label',
                        x: 0,
                        y: 100,
                        width: 300,
                        height: 25,
                        textAlign: "centred",
                        text: "beauty contest"
                    },
                    {
                        type: "button",
                        x: 0,
                        y: 125,
                        width: 300,
                        height: 25,
                        text: "collect $10",
                        onClick: function() {
                            park.cash += 100;
                            window.close();
                        }
                    }
                ]
            )
        });
        return window;
    }

    setWeather(weather: string): any{
        switch(weather){
            case "Rainstorm":
                context.executeAction("cheatset", {type: 35, param1: 4, param2: 0}, () => trace("Summoned a " + weather));
                break;
            case "Thunderstorm":
                context.executeAction("cheatset", {type: 35, param1: 5, param2: 0}, () => trace("Summoned a " + weather));
                break;
            case "Snowstorm":
                context.executeAction("cheatset", {type: 35, param1: 7, param2: 0}, () => trace("Summoned a " + weather));
                break;
            case "Blizzard":
                context.executeAction("cheatset", {type: 35, param1: 8, param2: 0}, () => trace("Summoned a " + weather));
                break;
            default:
                console.log("Error in setWeather: Invalid Weather Type Provided.");

        }
    }

    updateMaxSpeed(): any{
        park.postMessage(
            {type: 'award', text: "The Elder Gods have granted your petition to defy phyics and create entropy. Your maximum speed has increased!"} as ParkMessageDesc);
        if (archipelago_settings.maximum_speed < 4)
            archipelago_settings.maximum_speed ++;
        else
            archipelago_settings.maximum_speed = 8;
        saveArchipelagoProgress();
    }

    addSkip(): any{
        archipelago_settings.skips ++;
        try{
            (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).text = 'Skips: ' + String(archipelago_settings.skips);
            (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isDisabled = !archipelago_settings.skips;
        }
        catch{
            trace("Looks like the Archipelago Shop isn't open");
        }
        saveArchipelagoProgress();
    }

    SetPurchasableTiles(): any{
        var x = map.size.x;//Gets the size of the map
        var y = map.size.y;
        for(let i = 0; i < x; i++){
            for(let j = 0; j < y; j++){
                var tile = map.getTile(i,j).elements;
                for(let k = 0; k < tile.length; k++){
                    if(tile[k].type == "surface"){
                        var surface = tile[k] as SurfaceElement;
                        var tile_ownership = surface.hasOwnership;
                        var tile_construction_rights = surface.hasConstructionRights;
                        if((!tile_ownership) && (!tile_construction_rights)){
                            var has_footpath = false;
                            var elligible = true;
                            for(let l = 0; l < tile.length; l++){
                                if(tile[l].type == "footpath"){
                                    has_footpath = true;
                                    if(!(tile[l].baseHeight == surface.baseHeight))
                                    elligible = false;
                                }
                                if(tile[l].type == "entrance")
                                elligible = false;
                            }
                            if(has_footpath){
                                if(elligible)//Any unowned land that doesn't have a non-surface path or park entrance is elligible
                                surface.ownership = 1 << 6;//According to surface.h, Construction rights are 1 bitshifted left 6 times
                            }
                            else{
                                if(elligible)
                                surface.ownership = 1 << 7;//And purchase rights are 1 bitshifted 7 times.
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    ReceiveDeathLink(DeathLinkPacket: {cause: string, source: string, attempt: number}): any{
        var self = this;
        if (archipelago_settings.deathlink_timeout == true){//If the timeout hasn't expired, don't force another coaster to crash
            trace("Death Link Timeout has not expired. Ignoring Death Link signal")
            return;
        }
        if ((!map.getAllEntities("car").length) || DeathLinkPacket.attempt == 3){//If there's nothing to explode, give the user a pass
            trace("Rain check");
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
        if(context.paused){//Hold up until we're no longer paused
            ui.showError("You appear to be paused.", "Could you unpause for a bit so we can activate this Death Link?");
            context.setTimeout(function() {self.ReceiveDeathLink(DeathLinkPacket)}, 5000);
            return;
        }
        context.executeAction('ExplodeRide', DeathLinkPacket);
    }

    SendDeathLink(vehicleID?: number, name?: string): any{
        if(archipelago_settings.deathlink_timeout == false) {
            archipelago_settings.deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
            context.setTimeout(() => {archipelago_settings.deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
            trace("Sending Deathlink");
            if(vehicleID){
                var cars = map.getAllEntities("car");
                //console.log((cars));
                for(let i = 0; i < cars.length; i++){
                    if(cars[i].id == vehicleID){
                        var rideID = cars[i].ride;
                        var rideName = "";//map.rides[rideID].name;
                        var rides = map.rides;
                        for(let j = 0; j < rides.length; j++){
                            if (rides[j].id == rideID){
                                rideName = rides[j].name;
                                break;//breaks the for loop
                            }
                        }
                        trace("vehicleID:" + vehicleID);
                        trace("rideID:" + rideID);
                        trace("ride name:" + rideName);
                        archipelago_send_message("Bounce",{ride: rideName, tag: "DeathLink"});
                        break;
                    }
                }
            }
            if(name){
                archipelago_send_message("Bounce",{ride: name, tag: "DeathLink"});
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
            let archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as playerTuple[]);
            for(let i=0; i<(archipelagoPlayers.length); i++){
                var inPark = false;
                for(let j=0; j<(guests.length); j++){
                    if(archipelagoPlayers[i][0] == (guests[j].name)){
                        inPark = true;
                        if(archipelagoPlayers[i][1] == true){//If this game has beaten their scenario
                            guests[j].setFlag("joy", true);//Make them do a little dance,
                            guests[j].happiness = 255;//Make them constantly happy,
                            guests[j].energy = 128;//Make them energized,
                            guests[j].trousersColour = context.getRandom(0, 55);//And make them very colorful
                            guests[j].tshirtColour = context.getRandom(0, 55);
                            guests[j].umbrellaColour = context.getRandom(0, 55);
                            guests[j].cash = 6942
                        }
                        break;
                    }
                }
                if(!inPark){
                    if(guests.length >= archipelagoPlayers.length){
                        guests[i].name = archipelagoPlayers[i][0];
                    }
                }
            }
        }
    }

    CreateUnlockedList(): any{
        try{
            var self = this;
            var unlocked = [];
            var location = archipelago_unlocked_locations;
            var prices = archipelago_location_prices;
            for(var i = 0; i < location.length; i++){//Loop through every unlocked location
                var [display_color, colorblind_color] = self.GetColors(location[i].LocationID);
                let item = context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")[archipelago_unlocked_locations[i].Item]
                unlocked.push("Unlocked " + item + " for " + archipelago_unlocked_locations[i].ReceivingPlayer + "!");
                if (prices[location[i].LocationID].Price == 0){//If the price is 0, paid with blood instead of cash
                    unlocked.push(display_color + "          [" + (location[i].LocationID < 8 ? location[i].LocationID : Math.floor(location[i].LocationID / 8) - 1) + "] " + "Instead of cash, you sacrificed " + (prices[location[i].LocationID].Lives).toString() + " guests to the ELDER GODS!");
                }
                else{//Set up the string denoting the price
                    var prereqs = prices[location[i].LocationID].RidePrereq;
                    var cost = display_color + "          " + "[" + (location[i].LocationID < 8 ? location[i].LocationID : Math.floor(location[i].LocationID / 8) - 1) + "] "  + context.formatString("{CURRENCY2DP}",  (prices[location[i].LocationID].Price) * 10);//Cash price
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
        catch(e){
            console.log("Error in Create Unlocked List:" + e);
        }
    }
    //TODO: Update code to show correct color branch instead of total location number
    CreateLockedList(): any{
        try{
            var self = this;
            var locked = [];
            var location = archipelago_locked_locations.slice();
            var prices = archipelago_location_prices.slice();
            for(var i = 0; i < location.length; i++){//Loop through every locked location
                if (self.IsVisible(location[i].LocationID)){
                    var [display_color, colorblind_color] = self.GetColors(location[i].LocationID);
                    if (prices[location[i].LocationID].Price == 0){//If the price is 0, pay with blood instead of cash
                        locked.push(display_color + "[" + location[i].LocationID + "] " + "Instead of cash, you must sacrifice " + (prices[location[i].LocationID].Lives).toString() + " guests to the ELDER GODS!");
                    }
                    //Maybe I'll use this somewhere for colorblind mode: ❌
                    else{//Set up the string denoting the price
                        var prereqs = prices[location[i].LocationID].RidePrereq;
                        var cost = ""
                        // if(archipelago_settings.colorblind_mode)
                        //     cost += "[" + colorblind_color + "] ";
                        cost += (archipelago_settings.colorblind_mode ? "[" + colorblind_color + "] ": display_color) + "[" + (location[i].LocationID < 8 ? location[i].LocationID : Math.floor(location[i].LocationID / 8) - 1) + "] " + context.formatString("{CURRENCY2DP}",  (prices[location[i].LocationID].Price) * 10);//Cash price
                        // console.log(prereqs);
                        if(prereqs.length != 0) {//Handle prerequisites 
                            var built = self.CheckElligibleRides(location[i].LocationID);
                            cost += ((built[0] >= prereqs[0]) ? " + " + prereqs[0].toString() + display_color + " ": 
                            " + {RED}" + prereqs[0].toString() + display_color + " ");
                            cost += prereqs[1] + "(s)";
                            if(prereqs[2] != 0)//Check for excitement requirement
                                cost += ((built[1] >= prereqs[2]) ? ', (> ' + prereqs[2] + ' excitement)': ',{RED} (> ' + prereqs[2] + ' excitement)' + display_color);
                            if(prereqs[3] != 0)//Check for intensity requirement
                                cost += ((built[2] >= prereqs[3]) ? ', (> ' + prereqs[3] + ' intensity)':',{RED} (> ' + prereqs[3] + ' intensity)' + display_color);
                            if(prereqs[4] != 0)//Check for nausea requirement
                                cost += ((built[3] >= prereqs[4]) ? ', (> ' + prereqs[4] + ' nausea)': '{RED}, (> ' + prereqs[4] + ' nausea)' + display_color);
                            if(prereqs[5] != 0)//Check for length requirement
                                cost += ((built[4] >= prereqs[5]) ? ', (> ' + context.formatString("{LENGTH}", prereqs[5]) + ')': ',{RED} (> ' + context.formatString("{LENGTH}", prereqs[5]) + ')' + display_color);
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
                            trace("Here's our current item:");
                            trace(archipelago_locked_locations[i]);
                            trace(archipelago_locked_locations[i].Item);
                            let item = context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")[archipelago_locked_locations[i].Item]
                            trace(item);
                            locked.push("          Unlocks " + item + " for " + archipelago_locked_locations[i].ReceivingPlayer + "!");
                            break;
                    }
                }
            }
            trace(locked);
            trace(archipelago_unlocked_locations);
            if(!locked.length){
                if(!archipelago_unlocked_locations.length){
                    return ["{WHITE}Either this game just started and you're impatient, or Colby is bad at programming", 
                    "{WHITE}If you're still seeing this message after 2 minutes (Be sure to actually close and reopen this window),",
                    "{WHITE}bother Colby in the Discord and he'll complain about past Colby.",
                    "{WHITE}The secret word for him is 'Ducks'"];
                }
                else
                return ["Conglaturations! You've unlocked everything! Now go outside and touch some grass."]
            }
            return locked;
        }
        catch(e){
            console.log("Error in CreateLockedList:" + e);
        }
    }

    GetColors(locationID): any{
        var display_color = '{WHITE}';
        var colorblind_color = 'White';
        if (locationID < 8)
            display_color = '{WHITE}';
        else{
            switch(locationID%8){
                case 0: 
                    display_color = '{BLACK}';
                    colorblind_color = 'Black';
                    break;
                case 1: 
                    display_color = '{GREEN}';
                    colorblind_color = 'Green';
                    break;
                case 2: 
                    display_color = '{BABYBLUE}';
                    colorblind_color = "Blue";
                    break;
                case 3: 
                    display_color = '{YELLOW}';
                    colorblind_color = "Yellow";
                    break;
                case 4: 
                    display_color = '{PALEGOLD}';
                    colorblind_color = "Gold";
                    break;
                case 5: 
                    display_color = '{PALESILVER}';
                    colorblind_color = "Silver";
                    break;
                case 6: 
                    display_color = '{CELADON}'
                    colorblind_color = "Celadon";
                    break;
                case 7:
                    display_color = '{LIGHTPINK}';
                    colorblind_color = "Pink";
                    break;
            }
        }
        if (archipelago_settings.colorblind_mode)
            display_color = '{BLACK}';
        return [display_color, colorblind_color];
    }

    CreateObjectiveList(): any{
        try{
            var self = this;
            var objective = [];
            if (archipelago_objectives.Guests[0]){
                objective.push("Guests:");
                //Place a checkmark beforehand if the objective is complete
                objective.push(archipelago_objectives.Guests[1] ? ("✓        " + archipelago_objectives.Guests[0].toString()) : ("          " + archipelago_objectives.Guests[0].toString()) );
            }
            if (archipelago_objectives.ParkValue[0]){
                objective.push("Park Value:");
                //Multiply by 10 to get in-game amount
                objective.push(archipelago_objectives.ParkValue[1] ? ("✓        " + context.formatString("{CURRENCY2DP}",  Number(archipelago_objectives.ParkValue[0]) * 10)) : ("          " + context.formatString("{CURRENCY2DP}",  Number(archipelago_objectives.ParkValue[0]) * 10)));
            }
            var RollerCoaster = archipelago_objectives.RollerCoasters;
            if (RollerCoaster[0]){
                objective.push("Roller Coasters:");
                var Line = (RollerCoaster[5] ? ("✓        " + RollerCoaster[0]) : ("          " + RollerCoaster[0]));
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
                objective.push(archipelago_objectives.ParkRating[1] ? ("✓        " + archipelago_objectives.ParkRating[0].toString()) : ("          " + archipelago_objectives.ParkRating[0].toString()));
            }
            if (archipelago_objectives.LoanPaidOff[0]){
                objective.push("Repaid Loan:");
                objective.push(archipelago_objectives.LoanPaidOff[1] ? ("✓        Check your bank statement.") : ("          Check your bank statement."));
            }
            if (archipelago_objectives.Monopoly[0]){
                objective.push("Real Estate Monopoly:");
                objective.push(archipelago_objectives.Monopoly[1] ? ("✓        Own every tile on the map!") : ("          Own every tile on the map!"));
            }
            if (archipelago_objectives.UniqueRides[0].length){
                objective.push("Required Rides:");
                var ride_list = (archipelago_objectives.UniqueRides[1]) ? "✓        " : "        ";
                for(let i = 0; i < archipelago_objectives.UniqueRides[0].length; i++){
                    if(isInPark(archipelago_objectives.UniqueRides[0][i])){
                        ride_list += ("{GREEN}" + archipelago_objectives.UniqueRides[0][i]) + 
                            ((i + 1 == archipelago_objectives.UniqueRides[0].length) ?  "": "{BLACK}, ");
                    }
                    else if(isUnlocked(archipelago_objectives.UniqueRides[0][i])){
                        ride_list += ("{YELLOW}" + archipelago_objectives.UniqueRides[0][i]) + 
                            ((i + 1 == archipelago_objectives.UniqueRides[0].length) ?  "": "{BLACK}, ");
                    }
                    else{
                        ride_list += ("{RED}" + archipelago_objectives.UniqueRides[0][i]) + 
                            ((i + 1 == archipelago_objectives.UniqueRides[0].length) ?  "": "{BLACK}, ");
                    }
                }
                // console.log("This is the ride list: " + ride_list);
                objective.push(ride_list);
            }
            return objective;
        }
        catch(e){
            console.log("Error in Create Objective List:" + e);
        }
    }

    CheckObjectives(): any{
        try{
            trace("Checking Objectives:");
            var self = this;
            if (scenario.status == "completed"){
                if(!archipelago_settings.player[1])
                archipelago_send_message("StatusUpdate", 30);
                trace("Scenairio Already Completed");
                return;
            }
            if (park.guests >= Number(archipelago_objectives.Guests[0])){
                archipelago_objectives.Guests[1] = true;
                trace("Guests is good!")
            }
            else{
                archipelago_objectives.Guests[1] = false;
                trace("Guests is no good!")
            }
            trace("Current park value: " + String(park.value));
            trace("Park value objective: "+ String(archipelago_objectives.ParkValue));
            if (park.value >= (Number(archipelago_objectives.ParkValue[0])*10)){
                archipelago_objectives.ParkValue[1] = true;
                trace("Park Value is good!")
            }
            else{
                archipelago_objectives.ParkValue[1] = false;
                trace("Park Value is no good!")
            }

            if (archipelago_objectives.RollerCoasters[0]){
                let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);//Combine the research lists
                var NumQualifiedRides = 0;
                for(var i = 0; i < map.numRides; i++){
                    var ride = map.rides[i].type;
                    var QualifiedExcitement = false;
                    var QualifiedIntensity = false;
                    var QualifiedNausea = false;
                    var QualifiedLength = false;
                    var elligible = false;

                    //Handle checks for Roller Coasters
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
                            if (map.rides[i].excitement >= (Number(archipelago_objectives.RollerCoasters[1]) * 100)){//Check if excitement is met. To translate ingame excitement to incode excitement, multiply ingame excitement by 100
                                QualifiedExcitement = true;
                            }
                            if (map.rides[i].intensity >= (Number(archipelago_objectives.RollerCoasters[2]) * 100)){
                                QualifiedIntensity = true;
                            }
                            if (map.rides[i].nausea >= (Number(archipelago_objectives.RollerCoasters[3]) * 100)){
                                QualifiedNausea = true;
                            }

                            if (QualifiedExcitement && QualifiedIntensity && QualifiedNausea && QualifiedLength){
                                NumQualifiedRides += 1;
                            }

                            if (NumQualifiedRides >= Number(archipelago_objectives.RollerCoasters[0])){
                                archipelago_objectives.RollerCoasters[5] = true;
                                trace("Coasters are good!");
                                break;
                            }
                            else {
                                archipelago_objectives.RollerCoasters[5] = false;
                                trace("Coasters are not good!");
                            }
                        }
                    }

                }
            }
            else
            archipelago_objectives.RollerCoasters[5] = true;

            //TODO: Wait for monthly ride and shop income to become visible to the API
            archipelago_objectives.RideIncome[1] = true;
            archipelago_objectives.ShopIncome[1] = true;


            if (park.rating >= Number(archipelago_objectives.ParkRating[0])){
                archipelago_objectives.ParkRating[1] = true;
                trace("Rating is good!")
            }
            else{
                archipelago_objectives.ParkRating[1] = false;
                trace("Rating is no good!")
            }

            if (archipelago_objectives.LoanPaidOff[0] == true)//Check if Loans are enabled
            {
                if (park.bankLoan <= 0){//Check if loan is paid off //TODO: This may be a glitch. Go check future Colby
                    archipelago_objectives.LoanPaidOff[1] = true;
                    trace("Loan is good!")
                }
                else{
                    trace("Loan is no good!")
                    archipelago_objectives.LoanPaidOff[1] = false;
                }
            }
            else {//If loans are not enabled, set the condition for winning to true
                archipelago_objectives.LoanPaidOff[1] = true;
            }

            if (archipelago_objectives.Monopoly[0]){//Check if Monopoly is Enabled
                if(archipelago_settings.monopoly_complete){
                    archipelago_objectives.Monopoly[1] = true;
                    trace("Monopoly is good!")
                }
            }
            else {//If Monopoly isn't enabled, autoset to true
                archipelago_objectives.Monopoly[1] = true;
            }
            if (archipelago_objectives.UniqueRides[0]){
                var goal_complete = true;
                for(let i = 0; i < archipelago_objectives.UniqueRides[0].length; i++){
                    var found = false;
                    var checkedRide = archipelago_objectives.UniqueRides[0][i];
                    for(let j = 0; j < map.numRides; j++){
                        if (Number(RideType[checkedRide]) == map.rides[j].type){
                            if (map.rides[j].excitement > 1 || map.rides[j].intensity > 1){
                                trace(map.rides[j].excitement);
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found){
                        goal_complete = false;
                        break;
                    }
                }
                if (goal_complete){
                    archipelago_objectives.UniqueRides[1] = true;
                    trace("Unique is good!")
                }
                else{
                    archipelago_objectives.UniqueRides[1] = false;
                    trace("Unique is no good!")
                }
            }
            else{
                archipelago_objectives.UniqueRides[1] = true;
            }
            //Check if all conditions are met
            if (archipelago_objectives.Guests[1] == true && archipelago_objectives.ParkValue[1] == true &&
                archipelago_objectives.RollerCoasters[5] == true && archipelago_objectives.RideIncome[1] == true &&
                archipelago_objectives.ShopIncome[1] == true && archipelago_objectives.ParkRating[1] == true &&
                archipelago_objectives.LoanPaidOff[1] == true &&
                archipelago_objectives.Monopoly[1] == true && archipelago_objectives.UniqueRides[1] == true){
                context.executeAction("cheatset", {type: 34, param1: 0, param2: 0}, () => archipelago_send_message("StatusUpdate", 30));
                trace("The file won! Yayyyy!");
            }
        }
        catch(e){
            console.log("Error in CheckObjectives:" + e);
        }
    }

    CheckMonopoly(): any{
        try{
            if(archipelago_objectives.Monopoly[0] && !(archipelago_settings.monopoly_complete)){
                var x = map.size.x;//Gets the size of the map
                var y = map.size.y;
                var monopoly = true;//Assume true until proven false
                var timeout_counter = 0;//Only check 16 tiles/tick max
                for(let i = archipelago_settings.monopoly_x; i < (x - 1); i++){//check the x's. Map.size gives a couple coordinates off the map, so we exclude those.
                    for(let j = archipelago_settings.monopoly_y; j < (y - 1); j++){//check the y's
                        var tile = map.getTile(i,j).elements;//get the tile data
                        for(let k = 0; k < tile.length; k++){//iterate through everything on the tile
                            if(tile[k].type == "surface"){//if it's a surface element
                                var surface = tile[k] as SurfaceElement;
                                var tile_ownership = surface.hasOwnership;//check ownership and construction rights
                                var tile_construction_rights = surface.hasConstructionRights;
                                var is_entrance = false;//Park entrance won't have ownership or construction rights
                                if((!tile_ownership) && (!tile_construction_rights)){
                                    for(let l = k + 1; l < tile.length; l++){
                                        if(tile[l].type == "entrance"){
                                            is_entrance = true;
                                            break;
                                        }
                                    }
                                    if(is_entrance == false){//if unowned and lacking an entrance
                                        return;
                                    }
                                }
                                break;
                            }
                        }
                        timeout_counter++;
                        if(timeout_counter >= 16){
                            archipelago_settings.monopoly_x = i;
                            archipelago_settings.monopoly_y = j;
                            saveArchipelagoProgress();
                            return;
                        }
                    }
                }
                archipelago_settings.monopoly_complete = true;
            }
        }
        catch(e){
            console.log("Error in CheckMonopoly:" + e);
        }
    }

    IsVisible(LockedID: number): boolean{
        var CheckID = 0; //We want to limit the locations shown until the correct previous locations have been unlocked
        const unlocked_list = archipelago_unlocked_locations.slice();
        const locked_list = archipelago_locked_locations.slice();
        switch(LockedID){//These unlocks form a tree, with 2 branching nodes until item 6. All further nodes have only 1 branch
            case 0:
                return true;
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
        //We're done with LockedID now, so we're going to use it to check if collect has broken the list in any way
        trace("Locked ID is: " + String(LockedID));
        trace("CheckID is: " + String(CheckID));

        LockedID -= 8;
        while(LockedID > 14){
            for(let i = 0; i < locked_list.length; i++){
                    if(locked_list[i].LocationID == LockedID){
                        return false;
                    }
                }
            LockedID -= 8;
        }

        switch(LockedID){
            case 14:
            case 13:
                for(let i = 0; i < locked_list.length; i++){
                    if(locked_list[i].LocationID == 6 || locked_list[i].LocationID == 2 || locked_list[i].LocationID == 0){
                        return false;
                    }
                }
                break;
            case 12:
            case 11:
                for(let i = 0; i < locked_list.length; i++){
                    if(locked_list[i].LocationID == 5 || locked_list[i].LocationID == 2 || locked_list[i].LocationID == 0){
                        return false;
                    }
                }
                break;
            case 10:
            case 9:
                for(let i = 0; i < locked_list.length; i++){
                    if(locked_list[i].LocationID == 4 || locked_list[i].LocationID == 1 || locked_list[i].LocationID == 0){
                        return false;
                    }
                }
                break;
            case 8:
            case 7:
                for(let i = 0; i < locked_list.length; i++){
                    if(locked_list[i].LocationID == 3 || locked_list[i].LocationID == 1 || locked_list[i].LocationID == 0){
                        return false;
                    }
                }
                break;
        }

        for(let i = 0; i < unlocked_list.length; i++){
            if (CheckID == unlocked_list[i].LocationID)
            return true;
        }

        return false;
    }

    PurchaseItem(item: number): any{
        if(spam_timeout){
            ui.showError("Spam Purchase Error", "Spam may be the fastest way to a vikings heart, but it's also the fastest way to break the connection to the client, and that would be frustrating for everybody. Try again in a second.");
            return;
        }
        var self = this;
        console.log("Purchasing item number:");
        console.log(item);
        let Locked = archipelago_locked_locations.slice();
        let Unlocked = archipelago_unlocked_locations.slice();
        let Prices = archipelago_location_prices.slice();
        let LocationID = 0;
        let wantedItem = 0;
        let counter = 0;
        for(let i = 0; i < Locked.length; i++){
            if(self.IsVisible(Locked[i].LocationID)){
                if(item == counter){
                    LocationID = Locked[i].LocationID;
                    wantedItem = i;
                    trace("Here's the locationID: " + String(LocationID));
                    break;
                }
                else
                counter ++;
            }
        }
        let Prereqs = Prices[LocationID].RidePrereq;//Have to get LocationID before we can properly check Prereqs

        trace(Prices[LocationID]);
        if((Prices[LocationID].Price <= (park.cash / 10) || Prices[LocationID].Price == 0) || archipelago_skip_enabled){//Check if player has enough cash or if the price is 0.
            if((Prices[LocationID].Lives <= park.guests) || archipelago_skip_enabled){//Check if the player has enough guests to sacrifice
                var NumQualifiedRides = self.CheckElligibleRides(LocationID)[0];
                let guest_list = map.getAllEntities("guest");
                if(!Prereqs.length || NumQualifiedRides >= Prereqs[0] || archipelago_skip_enabled){
                    if(!archipelago_skip_enabled){
                        trace("Prereqs have been met with this many qualified rides: " + String(NumQualifiedRides));
                        if(Prices[LocationID].Lives != 0){//Code to explode guests
                        var doomed = Math.floor(Prices[LocationID].Lives * 1.5);//Add a buffer to the stated cost to make up for janky guest exploding code
                            if(doomed < guest_list.length){//Explode either the doomed amount, or every guest in the park, whichever is less
                                for(var i = 0; i < doomed; i++){
                                    guest_list[i].setFlag("explode", true);// Credit to Gymnasiast/everything-must-die for the idea
                                }
                            }
                            else{
                                for(var i = 0; i < guest_list.length; i++){
                                    guest_list[i].setFlag("explode", true);
                                }
                            }
                        }
                        park.cash -= (Prices[LocationID].Price * 10);//Multiply by 10 to obtain the correct amount
                    }
                    else{
                        archipelago_skip_enabled = false;
                        archipelago_settings.skips --;
                        (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).text = 'Skips: ' + String(archipelago_settings.skips);
                        (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isPressed = false;
                        (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isDisabled = !archipelago_settings.skips;
                    }

                    Unlocked.push(Locked[wantedItem]);
                    Locked.splice(wantedItem,1);
                    archipelago_locked_locations = Locked;
                    trace(JSON.stringify(archipelago_locked_locations));
                    archipelago_unlocked_locations = Unlocked;
                    trace(archipelago_locked_locations);
                    ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
                    var lockedWindow = ui.getWindow("archipelago-locations");
                    lockedWindow.findWidget<ListViewWidget>("locked-location-list").items = self.CreateLockedList();
                    spam_timeout = true;
                    context.setTimeout(() => {spam_timeout = false;}, 2000);
                    //If we have full visibility, send hints for any items shown
                    if(archipelago_settings.location_information == "Full"){
                        let hint_list = [];
                        trace(hint_list);
                        const temp_list = archipelago_locked_locations.slice();//Dude, screw how lists are handled in this stupid language
                        for(let i = 0; i < temp_list.length; i++){
                            let location = temp_list[i].LocationID;
                            trace(location);
                            if(self.IsVisible(location))
                            hint_list.push(location + 2000000);
                        }
                        trace(hint_list);
                        context.setTimeout(() => (archipelago_send_message("LocationHints",hint_list)), 2000)
                    }
                }
                else{
                    ui.showError("Prerequisites not met", "You only have " + String(NumQualifiedRides) + " elligible rides in the park! (Ensure they have posted stats)");
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

    CheckElligibleRides(LocationID): any{
        let Prices = archipelago_location_prices.slice();
        let Locked = archipelago_locked_locations.slice();
        var object = Prices[LocationID]
        let Prereqs = Prices[LocationID].RidePrereq;//Have to get LocationID before we can properly check Prereqs
        var ride = RideType[Prices[LocationID].RidePrereq[1]];
        let ride_list = map.rides;
        var NumQualifiedRides = 0;
        var QualifiedExcitementCounter = 0;
        var QualifiedIntensityCounter = 0;
        var QualifiedNauseaCounter = 0;
        var QualifiedLengthCounter = 0;
        console.log(JSON.stringify(Locked));
        console.log(LocationID);
        for(var i = 0; i < map.numRides; i++){
            var QualifiedExcitement = false;
            var QualifiedIntensity = false;
            var QualifiedNausea = false;
            var QualifiedLength = false;
            var elligible = false;
            if(Number(ride) > -1){//See if there's a prereq that's a specific ride
                if (Number(ride) == ride_list[i].type){//If the rides match, they're elligible
                elligible = true;
                }
            }

            if (ObjectCategory[object.RidePrereq[1]]){//See if there's a prereq that's a category
                let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);//Combine the research lists
                for(var j = 0; j < researchItems.length; j++){
                    if((researchItems[j] as RideResearchItem).rideType == ride_list[i].type){//If the items match...
                        if(researchItems[j].category == Prices[LocationID].RidePrereq[1]){//Check if the categories match
                            elligible = true;
                        }
                    }
                }
            }

            if (elligible){
                QualifiedLength = true;//It appears ride objects don't actually give length as a property. I'll leave finding ride lengths as an excercize for future Colby
                QualifiedLengthCounter++;
                if (ride_list[i].excitement >= (Prereqs[2] * 100)){//Check if excitement is met. To translate ingame excitement to incode excitement, multiply ingame excitement by 100
                    QualifiedExcitement = true;
                    QualifiedExcitementCounter++;
                }
                if (ride_list[i].intensity >= (Prereqs[3] * 100)){
                    QualifiedIntensity = true;
                    QualifiedIntensityCounter++;
                }
                if (ride_list[i].nausea >= (Prereqs[4] * 100)){
                    QualifiedNausea = true;
                    QualifiedNauseaCounter++;
                }
            }

            if (QualifiedExcitement && QualifiedIntensity && QualifiedNausea && QualifiedLength){
                NumQualifiedRides += 1;
            }
        }
        return [NumQualifiedRides,QualifiedExcitementCounter,QualifiedIntensityCounter,QualifiedNauseaCounter,QualifiedLengthCounter];
    }

    SendStatus(): any{
        var self = this;
        if(archipelago_connected_to_server){
            if(scenario.status == "completed"){//Goal Complete
                archipelago_send_message("StatusUpdate", 30)
            }
            else{//Just Playing
                archipelago_send_message("StatusUpdate", 20)
            }
        }
        else{
            context.setTimeout(() => {self.SendStatus();}, 1500);
        }
    }
    SetPostGenerationSettings(): void{
        if (park.getFlag("noMoney")){
            let guests = map.getAllEntities("guest");
            let funnyNumbers = [690, 4200, 270, 1, 10, 314];
            park.cash = 100069;
            for(let i = 0; i < guests.length; i++){
                guests[i].cash = funnyNumbers[Math.floor(Math.random() * funnyNumbers.length)];
            }
        }
        park.setFlag("noMoney", false);
        context.setTimeout(() => {//Wait 5 seconds to change this back if the base randomizer
            switch(archipelago_settings.preferred_intensity){//alters it.
                case 0:
                    park.setFlag("preferLessIntenseRides", true);
                    park.setFlag("preferMoreIntenseRides", false);
                    break;
                case 1:
                    park.setFlag("preferLessIntenseRides", false);
                    park.setFlag("preferMoreIntenseRides", false);
                    break;
                case 2:
                    park.setFlag("preferLessIntenseRides", false);
                    park.setFlag("preferMoreIntenseRides", true);
                    break;
                }
        }, 5000);
        park.setFlag("unlockAllPrices", true);//Allows charging for the entrance, rides, or both
        console.log("Ducks");
    }

    RequestGames(): void{
        var self = this;
        let games = archipelago_settings.multiworld_games;
        let received_games = archipelago_settings.received_games;
        archipelago_repeat_game_request_ready = false;
        trace(received_games);
        if (!games.length || !archipelago_connected_to_server){//If we haven't received the game list yet, we can't actually do anything
            context.setTimeout(() => {self.RequestGames();}, 250);
            return;
        }
        trace("We have the list of games!")
        //If we haven't started yet or if the current game has already been received
        if(!archipelago_current_game_request || received_games.indexOf(archipelago_current_game_request) !== -1){
            for(let i = 0; i < games.length; i++){
                if(received_games.indexOf(games[i]) === -1){
                    archipelago_current_game_request = games[i];
                    archipelago_repeat_game_request_ready = true;
                    trace("We have a new game to request:");
                    trace(archipelago_current_game_request);
                    archipelago_repeat_game_request_counter = 0;
                    break;
                }
            }
        }

        if(!archipelago_current_game_request || received_games.indexOf(archipelago_current_game_request) !== -1){//The above code couldn't find any new games, whch hypothetically means we have them all
            trace("We have all the games! Either that or future Colby is really annoyed right now");
            if(!context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")){
                context.getParkStorage().set("RCTRando.ArchipelagoItemIDToName",full_item_id_to_name);//P*cking past Colby forgot to check for the case of a single player game
                context.getParkStorage().set("RCTRando.ArchipelagoLocationIDToName",full_location_id_to_name);
            return;
            }
        }
        trace("Request Counter:");
        trace(archipelago_repeat_game_request_counter);
        if (archipelago_repeat_game_request_counter > 80){
            archipelago_repeat_game_request_ready = true;
            archipelago_repeat_game_request_counter = 0;
        }
        if (archipelago_repeat_game_request_ready)
            archipelago_send_message("GetDataPackage", archipelago_current_game_request);
        archipelago_repeat_game_request_counter ++;
        context.setTimeout(() => {self.RequestGames();}, 250);
    }
}

function isInPark(ride: string): boolean{
    let ride_list = map.rides;
    for(let i = 0; i < ride_list.length; i++){
        if(ride_list[i].type == RideType[ride])
            return true;
    }
    return false;
}

function isUnlocked(ride: string): boolean{
    let ride_list = park.research.inventedItems;
    for(let i = 0; i < ride_list.length; i++){
        let compared_ride = ride_list[i] as RideResearchItem;//Have to cast the given item as a RideResearchItem to not make VSCode yell at me.
        if(compared_ride.rideType == RideType[ride])
            return true;
    }
    return false;
}

function explodeRide(args: any){
    trace(args);
    const cause = args.args.cause;
    const source = args.args.source;
    const attempt = args.args.attempt + 1;
    const DeathLinkPacket = {cause, source, attempt};
    trace(DeathLinkPacket);
    var self = this;
    var car = map.getAllEntities('car');
    context.setTimeout(() => {archipelago_settings.deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
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
    var r = movingCar[context.getRandom(0, movingCar.length)];//Pick a car at random
    var counter = r.id; //Keeps track of which car we're dealing with
    
    do{
        (map.getEntity(counter) as Car).status = "crashed";//Crash the ride!
        trace((map.getEntity(counter) as Car));
        counter = (map.getEntity(counter) as Car).nextCarOnRide;
    }
    while ((map.getEntity(counter) as Car).id != (r as Car).id);

    archipelago_settings.deathlink_timeout = true;//Set the timeout. Rides won't crash twice in 20 seconds (From deathlink, anyways)
    context.setTimeout(() => {archipelago_settings.deathlink_timeout = false;}, 20000);//In 20 seconds, reenable the Death Link
    return {};
}

function archipelago_update_locations(checked_locations){
    try{
        if(archipelago_locked_locations.length){
            trace("Updating locations to latest progress from Server");
            for(let i = 0; i < checked_locations.length; i++){
                let inquired_location = checked_locations[i] - 2000000 //Locations in game have the 2000000 stripped out
                for(let j = 0; j < archipelago_locked_locations.length; j++){
                    if (archipelago_locked_locations[j].LocationID == inquired_location){
                        let Locked = archipelago_locked_locations.slice();
                        let Unlocked = archipelago_unlocked_locations.slice();
                        Unlocked.push(Locked[j]);
                        Locked.splice(j,1);
                        archipelago_locked_locations = Locked;
                        archipelago_unlocked_locations = Unlocked;
                    }
                }
            }
            ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
            try{
                var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
                var lockedWindow = ui.getWindow("archipelago-locations");
                lockedWindow.findWidget<ListViewWidget>("locked-location-list").items = Archipelago.CreateLockedList();
            }
            catch{
                trace("It appears the unlock shop is not open. They'll find the updated shop when they do so.");
            }
        }
        else{
            if(archipelago_settings.started)//If the game is started and we still don't have the unlock shop, ask again
                context.setTimeout(() => {archipelago_send_message("LocationScouts");}, 250);//If we don't have the list, ask for the list again
            context.setTimeout(() => {archipelago_update_locations(checked_locations)}, 2000);
        }
    }
    catch(e){
        console.log("Error in archipelago_update_locations:" + e);
    }
}

function saveArchipelagoProgress(){
    context.getParkStorage().set('RCTRando.ArchipelagoSettings', archipelago_settings);
    trace("Progress Saved!")
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelago());
