
function archipelagoGui(){
    var ww = 350;
    var wh = 350;
    let y = 0;

    var onStart = function() {
        console.log('This is where we connect to Archipelago and set up the game.');
        //TODO: Get seed from Archipelago
        setGlobalSeed(1337['text']);//Using a filler here until I get websocket support working
        //TODO: Set Difficulty from Archipelago
        //TODO: Get Range from Archipelago
        //TODO: Get Length from Archipelago
        //TODO: Get Ride Types from Archipelago
        //TODO: Get Park Flags from Archipelago
        //TODO: Get Park Values from Archipelago
        //TODO: Get Goals from Archipelago
        //No need for research, since we're using a different system entirely for that
        settings.rando_research = false;
        //Crowd control has a lot of options that would most likely break Archipelago. We're going to disable both at once until further notice.
        //TODO: Get reroll frequency from Archipelago
        //TODO: Get DeathLink toggle from Archipelago
        settings.archipelago_deathlink = true; //Change this line once actual Archipelago code is implemented
        settings.archipelago_deathlink_timeout = false;
        //TODO: Get Locations list from Archipelago
        //Until these are implemented, we're going to stick with default values, which should be good enough for debugging
        
        // we need to unpause the game in order for the next tick to run
        var wasPaused = UnpauseGame();
        runNextTick(function() {
            initRando();
            if(wasPaused.wasPaused && global_settings.auto_pause) {
                // we know the game is currently unpaused because we're inside a tick event
                // so we don't need the fancy PauseGame function
                context.executeAction('pausetoggle', {});
            }
        createChangesWindow();
        //ui.registerMenuItem("Archipelago Checks!", archipelagoLocations); //Register the check menu 
        //ui.registerMenuItem("Archipelago Debug", archipelagoDebug);//Colby's debug menu. no touchy!
        console.log("And it's going to work perfectly")
        });
    }

    var window = ui.openWindow({
        classification: 'archipelago-connect',
        title: "Archipelago Connection",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel('Your plugin.store.json file is ready. Provide this to the host of your Archipelago game along with your .yaml file.', {
                name: 'Instructions',
                y: y++,
                width: 2,
                tooltip: 'For more information, visit archipelago.gg/tutorial'
            }),
            NewEdit('Server Address:', {
                name: 'server-address',
                y: y++,
                text: '',
                tooltip: 'Enter the server address and port (e.g. archipelago.gg:53055)'
            }),
            NewEdit('Slot Name:', {
                name: 'slot-name',
                y: y++,
                text: '',
                tooltip: 'Enter your slot name'
            }),
            NewEdit('Server Password:', {
                name: 'server-password',
                y: y++,
                text: '',
                tooltip: 'Enter the server password, if there is one'
            }),
            [{
                type: 'button',
                name: 'cancel-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26 - 29,
                width: 90,
                height: 26,
                text: 'Cancel',
                tooltip: 'Cancels the Archipelago game and set up a local randomizer',
                onClick: function() {
                    startGameGui();
                    settings.rando_archipelago = false;
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'connect-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26,
                width: 90,
                height: 26,
                text: 'Connect to Server',
                onClick: function() {
                    //TODO: Create function connecting to the Archipelago server
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'start-button',
                x: ww - 90 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Start Game!',
                tooltip: 'Starts your game of Archipelago!',
                onClick: function() {
                    onStart();
                    console.log("At this point, the user should be playing Archipelago! This only needs to be clicked once per multiworld");
                    window.close();
                }
            },
            ]
        )
    });
    return window;
}

function archipelagoLocations(){
    var ww = 700;
    var wh = 350;
    let y = 0;

    var Archipelago = GetModule("RCTRArchipelago");

    var window = ui.openWindow({
        classification: 'archipelago-locations',
        title: "Welcome to the Unlock Shop!",
        width: ww,
        height: wh,
        tabs: 
        [
            {
                image: {frameBase: 80246,frameCount: 14,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Locked-Location-Label',
                            x: 250,
                            y: 50,
                            width: 100,
                            height: 26,
                            text: 'Locked Checks',
                            tooltip: 'Buying these will help somebody in the multiworld!'
                        },
                        {
                            type: 'listview',
                            name: 'locked-location-list',
                            x: 25,
                            y: 75,
                            width: 650,
                            height: 200,
                            isStriped: true,
                            items: Archipelago.CreateLockedList(),
                            scrollbars: 'none',
                            onClick: (item: number, column: number) => console.log(`Clicked item ${item} in column ${column} in listview`)
                        },
                        {
                            type: 'button',
                            name: 'debug-button',
                            x: 300,
                            y: 300,
                            width: 100,
                            height: 26,
                            text: 'Colbys Debug Button. No Touchy!',
                            onClick: function() {
                                console.log(map.getAllEntities('car')[1]);
                                // for (var i = 0; i < map.numEntities; i++) {//get every entity on the map
                                //     console.log(map.getEntity(i));//load data for the entity;
                                
                            }
                        }
                    ]
                )
            },
            {
                image: {frameBase: 5442,frameCount: 16,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Unlocked-Location-Label',
                            x: 125,
                            y: 50,
                            width: 100,
                            height: 26,
                            text: 'Unlocked Checks',
                            tooltip: 'Thank you for your purchases! No refunds!'
                        },
                        {
                            type: 'listview',
                            name: 'unlocked-location-list',
                            x: 25,
                            y: 75,
                            width: 300,
                            height: 200,
                            isStriped: true,
                            items: 
                            [
                                "dank item 1", "Listview item 2", "Listview item 3"
                            ]
                            //onClick: (item: number, column: number) => console.log(`Clicked item ${item} in column ${column} in listview`)
                        },
                        {
                            type: 'button',
                            name: 'debug-button',
                            x: 125,
                            y: 300,
                            width: 100,
                            height: 26,
                            text: 'Colbys Debug Button. No Touchy!',
                            onClick: function() {
                                console.log(map.getAllEntities('car')[1]);
                                // for (var i = 0; i < map.numEntities; i++) {//get every entity on the map
                                //     console.log(map.getEntity(i));//load data for the entity;
                                
                            }
                        }
                    ]
                )
            },
            {
                image: {frameBase: 80276,frameCount: 15,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Scenario-Goal',
                            x: 125,
                            y: 50,
                            width: 100,
                            height: 26,
                            text: 'Scenario Goal',
                            tooltip: 'Go forth, and beat Archipelago!'
                        }
                    ]
                )
            }
        ]
    });
    return window;
}

function archipelagoDebug(){
    var ww = 350;
    var wh = 350;
    let y = 0;

    var window = ui.openWindow({
        classification: 'debug-window',
        title: "Debug Window. You should never see this!",
        width: ww,
        height: wh,
        widgets: [].concat(
            [
            {
                type: 'button',
                name: 'debug-button',
                x: 5,
                y: 90,
                width: 390,
                height: 126,
                text: 'Colbys Debug Button. No Touchy!',
                onClick: function() {
                var x = undefined;
                var y = 0;
                var z = 1;

                if (x != 0 || null)
                console.log("Bad!");
                console.log(x);


                if (y != 0 || null)
                console.log("Also bad!");
                console.log(y);

                if (z != 0 || null)
                console.log("Good!");
                console.log(z);
                    // for (var i = 0; i < map.numEntities; i++) {//get every entity on the map
                    //     console.log(map.getEntity(i));//load data for the entity;
                    
                }
            },
            {
                type: 'button',
                name: 'debug-button2',
                x: ww - 90 - 88 - 6,
                y: wh - 6 - 66,
                width: 90,
                height: 26,
                text: 'Anudda Debugga',
                onClick: function() {
                    settings.archipelago_location_information = 'Full';
                    archipelago_unlocked_locations = [{LocationID: 0,Item: "Sling Shot",ReceivingPlayer: "Dallin"}, {LocationID: 1,Item: "progressive automation",ReceivingPlayer: "Drew"}, {LocationID: 2,Item: "16 pork chops",ReceivingPlayer: "Minecraft d00ds"}];
                    archipelago_locked_locations = [{LocationID: 3,Item: "Howling Wraiths",ReceivingPlayer: "Miranda"},{LocationID: 4,Item: "Hookshot",ReceivingPlayer: "Dallin"}, {LocationID: 5,Item: "progressive flamethrower",ReceivingPlayer: "Drew"}, {LocationID: 6,Item: "egg shard",ReceivingPlayer: "Minecraft d00ds"}, {LocationID: 7,Item: "Descending Dive",ReceivingPlayer: "Miranda"}];
                    archipelago_location_prices = [{LocationID: 0, Price: 50000, Lives: 0, RidePrereq: []}, {LocationID: 1, Price: 250000, Lives: 0, RidePrereq: []},{LocationID: 2, Price: 250000, Lives: 0, RidePrereq: []},{LocationID: 3, Price: 600000, Lives: 0, RidePrereq: []},{LocationID: 4, Price: 400000, Lives: 0, RidePrereq: [2, "rollercoaster",0,0,0,0]},{LocationID: 5, Price: 400000, Lives: 0, RidePrereq: [3, "Looping Coaster", 6.3,0,0,0]},{LocationID: 6, Price: 0, Lives: 200, RidePrereq: [21, "Dodgems",0,0,0,0]},{LocationID: 7, Price: 1000000, Lives: 0, RidePrereq: [1, "Wooden Roller Coaster", 0, 5.0, 7.0, 1000]}];
                    ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
                    // var BathroomTrap = GetModule("RCTRArchipelago");
                    // if(BathroomTrap)
                    // BathroomTrap.ReceiveDeathLink({cause: "Curtis was run over by a train", source: "Curtis"});
                    }
            }]
        )
    });
    return window;
}