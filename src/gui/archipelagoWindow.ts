/// <reference path="../../lib/openrct2.d.ts" />


function archipelagoGui(){
    var ww = 350;
    var wh = 225;
    let y = 0;

    var onStart = function() {
        console.log('This is where we connect to Archipelago and set up the game.');
        //TODO: Get seed from Archipelago
        setGlobalSeed(1337['text']);//Using a filler here until I get websocket support working
        //TODO: Get Ride Types from Archipelago
        //TODO: Get Park Flags from Archipelago
        //TODO: Get Goals from Archipelago
        //No need for research, since we're using a different system entirely for that
        settings.rando_research = false;
        //Crowd control has a lot of options that would most likely break Archipelago. We're going to disable both at once until further notice.
        //TODO: Get reroll frequency from Archipelago
        //TODO: Get DeathLink toggle from Archipelago
        archipelago_settings.deathlink_timeout = false;
        //TODO: Get Locations list from Archipelago
        //Until these are implemented, we're going to stick with default values, which should be good enough for debugging
        //We're going to track the objectives ourselves instead
        scenario.objective.type = "haveFun";
        archipelago_settings.started = true;
        saveArchipelagoProgress();//Save the settings to our Archipelago tracker
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
        });
    }

    var window = ui.openWindow({
        classification: 'archipelago-connect',
        title: "Archipelago Connection",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("If you haven't done so, open your OpenRCT2 Client. You can find more info at archipelago.gg/tutorial", {
                name: 'Instructions',
                y: y++,
                width: 2,
                tooltip: "Shoutout to Die4Ever for figuring out all this networking stuff, cause I certainly wouldn't have been able to."
            }),
            NewLabel(archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.", {
                name: 'Connected-to-game',
                y: y++,
                width: 2,
                tooltip: "Ooh, it changes based on connection status! That's pretty fancy!"
            }),
            NewLabel(archipelago_connected_to_server ? "The Archipelago Client is connected to the server!" : "The Archipelago Client is {RED}not{WHITE} connected to the server.", {
                name: 'Connected-to-server',
                y: y++,
                width: 2,
                tooltip: "Too bad this font doesn't support emoji. :("
            }),
            NewLabel("", {
                name: 'Correct-scenario',
                y: y++,
                width: 2,
                tooltip: "Writing code to figure this out specifically was kind of a pain."
            }),
            [{
                type: 'button',
                name: 'cancel-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 90,
                height: 26,
                text: 'Cancel',
                tooltip: 'Cancels the Archipelago game and set up a local randomizer',
                onClick: function() {
                    startGameGui();
                    settings.rando_archipelago = false;
                    // var connection = GetModule("APIConnection") as APIConnection;
                    connection.destroy()
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'start-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Start Game!',
                tooltip: 'Starts your game of Archipelago!',
                isDisabled: (!archipelago_connected_to_game || !archipelago_connected_to_server || !archipelago_correct_scenario),
                onClick: function() {
                    onStart();
                    console.log("At this point, the user should be playing Archipelago! This only needs to be clicked once per multiworld");
                    window.close();
                }
            },
            {
                type: 'checkbox',
                name: 'multiple-game-requests-toggle',
                text: 'Send multiple game requests',
                x: ww - 325,
                y: wh - 6 - 42 - 45,
                width: 240,
                height: 10,
                tooltip: 'If enabled, the game will split its request for items/locations into several packets. If you\'re in a multiworld with lots of games, this will fix the issue of your items not appearing...hopefully. Recommended off.',
                isChecked: archipelago_multiple_requests,
                onChange: function(isChecked: boolean) {
                    var currentWindow = ui.getWindow("archipelago-connect");
                    archipelago_multiple_requests = isChecked;
                }
            }
            ]
        )
    });
    return window;
}

function archipelagoLocations(){
    var ww = 700;
    var wh = 350;
    let y = 0;
    const furryProblem: boolean = (map.getAllEntities("staff").filter((staff: Staff) => staff.staffType === "entertainer").length < 19 ? true : false);

    var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
    var messageLog = context.getParkStorage().get("RCTRando.MessageLog") as Array<any>;

    var game_choice = ["Ocarina of Time", "Adventure", "Donkey Kong Country 3", "Final Fantasy 1", "Hollow Knight", 
    "The Legend of Zelda", "A Link to the Past", "Links Awakening", "Pokemon Red and Blue", "Rogue Legacy", 
    "Sonic Adventure 2", "Super Mario World", "Super Mario 64", "Super Metroid", "VVVVVV"];
    var game = game_choice[Math.floor(Math.random() * game_choice.length)];//Gotta throw that shade

    var existing: Window = ui.getWindow("archipelago-locations");
    if(existing) {
        return existing;
    }

    var window = ui.openWindow({
        classification: 'archipelago-locations',
        title: "Welcome to the Unlock Shop!",
        width: ww,
        height: wh,
        onTabChange: () => {
            var currentWindow = ui.getWindow("archipelago-locations");
            if (currentWindow.tabIndex == 0){
                currentWindow.findWidget<ListViewWidget>("locked-location-list").items = Archipelago.CreateLockedList();
            }
            else if (currentWindow.tabIndex == 1){
                currentWindow.findWidget<ListViewWidget>("unlocked-location-list").items = Archipelago.CreateUnlockedList();
            }
            else if (currentWindow.tabIndex == 2){
                currentWindow.findWidget<ListViewWidget>("objective-list").items = Archipelago.CreateObjectiveList();
            }
            else if (currentWindow.tabIndex == 3){
                currentWindow.findWidget<ListViewWidget>("message-list").items = context.getParkStorage().get("RCTRando.MessageLog") as Array<any>;
                currentWindow.findWidget<CheckboxWidget>("universal-notifications-toggle").isChecked = archipelago_settings.universal_item_messages;
                currentWindow.findWidget<CheckboxWidget>("park-message-toggle").isChecked = archipelago_settings.park_message_chat;
                currentWindow.findWidget<CheckboxWidget>("network-chat-toggle").isChecked = archipelago_settings.network_chat;
            }
        },
        tabs:
        [
            {
                image: {frameBase: 5261,frameCount: 8,frameDuration: 4},
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
                            onClick: (item: number) => Archipelago.PurchaseItem((item - item %2) / 2)
                        },
                        {
                            type: 'textbox',
                            name: 'lookup-box',
                            text: '',
                            maxLength: 3,
                            x: 25,
                            y: 275,
                            width: 100,
                            height: 20,
                            tooltip: "Input your desired shop number here, and it'll tell you what you need to purchase!",
                        },
                        {
                            type: 'button',
                            name: 'lookup-button',
                            x: 25,
                            y: 300,
                            width: 100,
                            height: 26,
                            text: 'Find item!',
                            tooltip: 'Playtesters told me they didn\'t like "Doing modulus math while trying to play a game", so here you go. You\'re welcome',
                            onClick: function() {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                var message = currentWindow.findWidget<TextBoxWidget>("lookup-box").text;
                                var wanted_number = parseInt(message, 10);
                                if (!wanted_number)
                                return;
                                if (wanted_number < 0)
                                return;
                                if (wanted_number < 8)
                                archipelago_print_message("Item " + String(wanted_number) + " is on the{WHITE} White Branch!")
                                else{
                                    switch (wanted_number % 8){
                                        case 0: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {RED}Red Branch!");
                                        break;
                                    case 1: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {GREEN}Green Branch!");
                                        break;
                                    case 2: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {BABYBLUE}Blue Branch!");
                                        break;
                                    case 3: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {YELLOW}Yellow Branch!");
                                        break;
                                    case 4: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {PALEGOLD}Gold Branch!");
                                        break;
                                    case 5: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {PALESILVER}Silver Branch!");
                                        break;
                                    case 6: 
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {CELADON}Celadon Branch!");
                                        break;
                                    case 7:
                                        archipelago_print_message("Item " + String(wanted_number) + " is on the {LIGHTPINK}Pink Branch!");
                                        break;
                                    }
                                }
                            }
                        },
                        {
                            type: 'button',
                            name: 'excorcize-furry-button',
                            x: 500,
                            y: 300,
                            width: 175,
                            height: 26,
                            text: 'A furry problem? In my park?',
                            tooltip: "It's more likely than you think!",
                            //Disable the button if there's not a furry problem in the park
                            isDisabled: furryProblem,
                            onClick: () => {archipelagoExcorcizeFurries();}
                        },
                        {
                            type: 'label',
                            name: 'Connected-to-server',
                            x: 200,
                            y: 300,
                            width: 300,
                            height: 26,
                            text: archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.",
                            tooltip: "Well, back in the day I used to connect at twelve-hundred baud, but ever since the merger, I'm lucky if I get twelve baud! "
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
                            width: 650,
                            height: 200,
                            isStriped: true,
                            items: Archipelago.CreateUnlockedList()
                        },
                        {
                            type: 'label',
                            name: 'Connected-to-server',
                            x: 200,
                            y: 300,
                            width: 300,
                            height: 26,
                            text: archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.",
                            tooltip: "Well, back in the day I used to connect at twelve-hundred baud, but ever since the merger, I'm lucky if I get twelve baud! "
                        }
                    ]
                )
            },
            {
                image: {frameBase: 5511,frameCount: 15,frameDuration: 4},
                widgets: [].concat
                (
                    [

                        {
                            type: 'label',
                            name: 'Goal',
                            x: 45,
                            y: 60,
                            width: 1000,
                            height: 56,
                            text: "Your goal, should you choose to accept it, is to build a grand theme park featuring - at minimum - the following attributes:",
                            tooltip: 'If you have deathlink on... good luck'
                        },
                        {
                            type: 'listview',
                            name: 'objective-list',
                            x: 25,
                            y: 75,
                            width: 650,
                            height: 200,
                            isStriped: true,
                            scrollbars: 'both',
                            columns:[{width: 1400}],
                            items: Archipelago.CreateObjectiveList()
                        },
                        {
                            type: 'label',
                            name: 'Connected-to-server',
                            x: 200,
                            y: 300,
                            width: 300,
                            height: 26,
                            text: archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.",
                            tooltip: "Well, back in the day I used to connect at twelve-hundred baud, but ever since the merger, I'm lucky if I get twelve baud! "
                        }
                    ]
                )
            },
            {
                image: {frameBase: 5269,frameCount: 8,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Message-Log-Label',
                            x: 250,
                            y: 50,
                            width: 100,
                            height: 26,
                            text: 'Message Log',
                            tooltip: "Y'all's sure do talk a lot, don't you?"
                        },
                        {
                            type: 'listview',
                            name: 'message-list',
                            x: 25,
                            y: 75,
                            width: 650,
                            height: 200,
                            isStriped: false,
                            items: (messageLog ? messageLog : []),
                            scrollbars: 'both',
                            columns:[{width: 1400}]
                        },
                        {
                            type: 'textbox',
                            name: 'chatbox',
                            text: 'Type your message here!',
                            maxLength: 999,
                            x: 25,
                            y: 275,
                            width: 650,
                            height: 20,
                            tooltip: "You know, not every game lets you type in-game. All I'm saying is that we're better than " + game + " because of this.",
                        },
                        {
                            type: 'button',
                            name: 'send-chat-button',
                            x: 25,
                            y: 300,
                            width: 100,
                            height: 26,
                            text: 'Send Message!',
                            tooltip: 'The shortcut to this button is alt-F4',
                            onClick: function() {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                var message = currentWindow.findWidget<TextBoxWidget>("chatbox").text;
                                if (!message)
                                return;
                                switch(message){
                                    case '!!help':
                                        archipelago_print_message("!!help: Prints this menu. I bet you didn't know that.\n!!toggleDeathLink: Enables/Disables Deathlink\n");
                                        break;
                                    case '!!toggleDeathLink':
                                        archipelago_settings.death_link = !archipelago_settings.death_link;
                                        if(archipelago_settings.death_link)
                                        archipelago_print_message("Deathlink Enabled you monster");
                                        else
                                        archipelago_print_message("Deathlink Disabled you coward");
                                    break;
                                    case 'Colby sucks':
                                        archipelago_send_message("Say","Colby is awesome!");
                                        break;
                                    default:
                                        archipelago_send_message("Say", message);
                                        break;
                                }
                                currentWindow.findWidget<TextBoxWidget>("chatbox").text = '';
                            }
                        },
                        {
                            type: 'checkbox',
                            name: 'universal-notifications-toggle',
                            text: 'Enable universal item notifications',
                            x: 150,
                            y: 310,
                            width: 240,
                            height: 10,
                            tooltip: 'If disabled, only items directly related to you will appear as chats. Useful in large games.',
                            isChecked: archipelago_settings.universal_item_messages,
                            onChange: function(isChecked: boolean) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                archipelago_settings.universal_item_messages = isChecked;
                                saveArchipelagoProgress();
                            }
                        },
                        {
                            type: 'checkbox',
                            name: 'park-message-toggle',
                            text: 'Print Archipelago Chat to Park Messages',
                            x: 400,
                            y: 310,
                            width: 240,
                            height: 10,
                            tooltip: 'Prints Archipelago chats and messages as in game notifications. If your group is chatty, this could be annoying',
                            isChecked: archipelago_settings.park_message_chat,
                            onChange: function(isChecked: boolean) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                archipelago_settings.park_message_chat = isChecked;
                                saveArchipelagoProgress();
                            }
                        },
                        {
                            type: 'checkbox',
                            name: 'network-chat-toggle',
                            text: "Print Archipelago Chat to Network Messages",
                            x: 400,
                            y: 330,
                            width: 220,
                            height: 10,
                            tooltip: 'Prints Archipelago chats and messages as network chats. This will not work in single player mode',
                            isChecked: archipelago_settings.network_chat,
                            onChange: function(isChecked: boolean) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                archipelago_settings.network_chat = isChecked;
                                saveArchipelagoProgress();
                            }
                        }
                    ]
                )
            }
        ]
    });
    return window;
}

function archipelagoExcorcizeFurries(){
    if (ui.getWindow("archipelago-excorcize-furries"))
    return;
    var ww = 350;
    var wh = 225;
    let y = 0;
    let challenge = returnChallenge();
    let buttons = [];
    for (let i = 0; i < challenge.buttons.length; i++){
        buttons.push({
            type: 'button',
            name: 'button-' + String(i),
            x: 35 + (i%3) * 90,
            y: 112 + (Math.floor(i/3) * 26),
            width: 90,
            height: 26,
            text: challenge.buttons[i].text,
            tooltip: challenge.buttons[i].tooltip,
            onClick: challenge.buttons[i].onClick
        })
    }
    var prompt = ui.openWindow({
        classification: 'archipelago-excorcize-furries',
        title: "Furry Removal Services",
        width: ww,
        height: wh,
        colours: challenge.colors,
        widgets: [].concat(
            NewLabel(challenge.label1, {
                name: 'label-1',
                y: y++,
                width: 2,
                tooltip: challenge.label1_tooltip
            }),
            NewLabel(challenge.label2, {
                name: 'label-2',
                y: y++,
                width: 2,
                tooltip: challenge.label2_tooltip
            }),
            buttons
        )
    });
    return;
}

function explodeFurries(){
    var staff_list = map.getAllEntities("staff").filter((staff: Staff) => staff.staffType === "entertainer");
    let effect = Math.floor(Math.random() * 8);
    try{
        ui.getWindow('archipelago-locations').close();
    }
    catch{
        console.log("Error: No Window to close");
    }
    for (let i = 0; i < staff_list.length; i++){
        if(staff_list[i].staffType == "entertainer"){
            if (!staff_list[i].patrolArea.tiles.length){
                let id = staff_list[i].id;
                let x = staff_list[i].x;
                let y = staff_list[i].y;
                let z = staff_list[i].z;
                // context.executeAction("stafffire",{id: id});
                staff_list[i].remove();
                switch(effect){
                case 0://What hilarious effect will banishment have?
                    map.createEntity("balloon",{x,y,z});
                    break;
                case 1:
                    map.createEntity("crash_splash",{x,y,z});
                    break;
                case 2:
                    map.createEntity("duck",{x,y,z});
                    break;
                case 3: 
                    map.createEntity("explosion_cloud",{x,y,z});
                    break;
                case 4:
                    map.createEntity("explosion_flare",{x,y,z});
                    break;
                case 5:
                    map.createEntity("litter",{x,y,z});
                    break;
                case 6:
                    map.createEntity("money_effect",{x,y,z,});
                    break;
                case 7:
                    map.createEntity("steam_particle",{x,y,z});
                    break;
                }
            }
        }
    }
}

function explodeGuests(number){
    var guest_list = map.getAllEntities("guest");
    if (guest_list.length > number){
        for(var i = 0; i < number; i++){
            guest_list[i].setFlag("explode", true);// Credit to Gymnasiast/everything-must-die for the idea
        }
    }
    else{
        for(var i = 0; i < guest_list.length; i++){
            guest_list[i].setFlag("explode", true);// Credit to Gymnasiast/everything-must-die for the idea
        }
    }
}

function archipelagoDebug(){
    var ww = 600;
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
                    y: 50,
                    width: 200,
                    height: 25,
                    text: 'AddRide (Merry Go Round)',
                    onClick: function() {
                        // network.sendMessage("data.data.text");
                        // console.log(RideType["Merry Go Round"]);

                        // park.cash = 10000;
                        // var i = "Monorail";
                        //console.log(RideType["rollercoaster"]);
                        //console.log(RideType[i]);
                        // console.log(scenario.status);
                        //park.setFlag("scenarioCompleteNameInput",true);
                        //console.log(map.rides[0]);
                        //console.log(RideType["Looping Roller Coaster"].rideType);
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        // context.executeAction("landsetrights",{x1:1,y1:1,x2:2,y2:2,setting:4,ownership:7}, () => console.log("I'm so good at this."));
                        // console.log(park.research.inventedItems[0]);
                        BathroomTrap.AddRide(RideType["Merry Go Round"]);
                        // BathroomTrap.AddScenery();
                        // BathroomTrap.GrantDiscount("Land Discount");
                        // park.landPrice = 2000.50;
                        //ac_req({"cmd":"PrintJSON","data":[{"text":"1","type":"player_id"},{"text":" found their "},{"text":"69696969","player":1,"flags":1,"type":"item_id"},{"text":" ("},{"text":"69696969","player":1,"type":"location_id"},{"text":")"}],"type":"ItemSend","receiving":1,"item":{"item":69696969,"location":69696969,"player":1,"flags":1,"class":"NetworkItem"}})
                        // console.log(context.getParkStorage().get('RCTRando.nuttin'));
                        // (BathroomTrap as RCTRArchipelagoConnection).connect();
                        // init_archipelago_connection();

                    }
                },
                {
                    type: 'button',
                    name: 'debug-button2',
                    x: 5,
                    y: 80,
                    width: 200,
                    height: 25,
                    text: 'Receive DeathLink',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        ac_req({"cmd":"Bounced","tags":["DeathLink"],"data":{"time":1690148379.2967014,"source":"Colby","cause":"Colby is out of usable Pokémon! Colby blacked out!"}})
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button3',
                    x: 5,
                    y: 110,
                    width: 200,
                    height: 25,
                    text: 'Connected to Archipelago',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        ac_req({"cmd":"Connected","team":0,"slot":2,"players":[{"team":0,"slot":1,"alias":"Cool1","name":"Cool1","class":"NetworkPlayer"},{"team":0,"slot":2,"alias":"Test","name":"Test","class":"NetworkPlayer"}],"missing_locations":[81000,81001,81002,81003,81004,81005,81006,81007,81008,81009,81010,81011,81012,81013,81014,81015,81016,81017,81018,81019,81020,81021,81022,81023,81024],"checked_locations":[],"slot_info":{"1":{"name":"Cool1","game":"Clique","type":1,"group_members":[],"class":"NetworkSlot"},"2":{"name":"Test","game":"ChecksFinder","type":1,"group_members":[],"class":"NetworkSlot"}},"hint_points":0,"slot_data":{"world_seed":3098991349,"seed_name":"31784654339393198182","player_name":"Test","player_id":2,"client_version":7,"race":false}})
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button4',
                    x: 5,
                    y: 20,
                    width: 200,
                    height: 25,
                    text: 'Set Game State',
                    onClick: function() {
                        archipelago_settings.location_information = 'Full';
                        archipelago_unlocked_locations = [{LocationID: 0,Item: "Sling Shot",ReceivingPlayer: "Dallin"}, {LocationID: 1,Item: "progressive automation",ReceivingPlayer: "Drew"}, {LocationID: 2,Item: "16 pork chops",ReceivingPlayer: "Minecraft d00ds"}];
                        archipelago_locked_locations = [{LocationID: 3,Item: "Howling Wraiths",ReceivingPlayer: "Miranda"},{LocationID: 4,Item: "Hookshot",ReceivingPlayer: "Dallin"}, {LocationID: 5,Item: "progressive flamethrower",ReceivingPlayer: "Drew"}, {LocationID: 6,Item: "egg shard",ReceivingPlayer: "Minecraft d00ds"}, {LocationID: 7,Item: "Descending Dive",ReceivingPlayer: "Miranda"}];
                        archipelago_location_prices = [{LocationID: 0, Price: 500, Lives: 0, RidePrereq: []}, {LocationID: 1, Price: 2500, Lives: 0, RidePrereq: []},{LocationID: 2, Price: 2500, Lives: 0, RidePrereq: []},{LocationID: 3, Price: 6000, Lives: 0, RidePrereq: []},{LocationID: 4, Price: 4000, Lives: 0, RidePrereq: [2, "gentle",0,0,0,0]},{LocationID: 5, Price: 4000, Lives: 0, RidePrereq: [3, "Looping Roller Coaster", 6.3,0,0,0]},{LocationID: 6, Price: 0, Lives: 200, RidePrereq: []},{LocationID: 7, Price: 10000, Lives: 0, RidePrereq: [1, "Wooden Roller Coaster", 0, 5.0, 7.0, 1000]}];
                        archipelago_objectives = {Guests: [300, false], ParkValue: [0, false], RollerCoasters: [5,2,2,2,0,false], RideIncome: [0, false], ShopIncome: [8000, false], ParkRating: [700, false], LoanPaidOff: [true, false], Monopoly: [true, false], UniqueRides: [[], true]};
                        context.getParkStorage().set('RCTRando.ArchipelagoLocationPrices', archipelago_location_prices);
                        context.getParkStorage().set('RCTRando.ArchipelagoObjectives', archipelago_objectives);
                        ArchipelagoSaveLocations(archipelago_locked_locations, archipelago_unlocked_locations);
                        }
                },
                {
                    type: 'button',
                    name: 'debug-button5',
                    x: 5,
                    y: 140,
                    width: 200,
                    height: 25,
                    text: 'Archipelago Player Completed Goal',
                    onClick: function() {

                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        ac_req({"cmd":"PrintJSON","data":[{"text":"Cool1 (Team #1) has completed their goal."}],"type":"Goal","team":0,"slot":1})
                        console.log(context.getParkStorage().get("RCTRando.ArchipelagoPlayers"))

                    }
                },
                {
                    type: 'button',
                    name: 'debug-button6',
                    x: 5,
                    y: 170,
                    width: 200,
                    height: 25,
                    text: 'Release Rule',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.ReleaseRule("forbidTreeRemoval");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button7',
                    x: 5,
                    y: 200,
                    width: 200,
                    height: 25,
                    text: '"Grant Discount(Land)"',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.GrantDiscount("Land Discount");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button8',
                    x: 5,
                    y: 230,
                    width: 200,
                    height: 25,
                    text: '"Grant Discount(Construction Rights)"',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.GrantDiscount("Construction Rights Discount");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button9',
                    x: 5,
                    y: 260,
                    width: 200,
                    height: 25,
                    text: '"Display all cars"',
                    onClick: function() {
                        console.log(map.getAllEntities("car"));
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button10',
                    x: 5,
                    y: 290,
                    width: 200,
                    height: 25,
                    text: 'Colbys Decision',
                    onClick: function() {
                        console.log(scenario.name);
                        console.log(ScenarioName[0]);
                        archipelago_settings.location_information = locationInfo.Full;
                        archipelago_send_message("GetDataPackage");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button11',
                    x: 5,
                    y: 320,
                    width: 200,
                    height: 25,
                    text: 'Furry Trap',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        archipelago_print_message("Curtis found Colbys Furry Convention Trap!");
                        BathroomTrap.FurryConventionTrap();
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button12',
                    x: 210,
                    y: 20,
                    width: 200,
                    height: 25,
                    text: 'Spam Trap',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        archipelago_print_message("Dustin found Colbys Spam Mail Trap!");
                        BathroomTrap.SpamTrap();
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button13',
                    x: 210,
                    y: 50,
                    width: 200,
                    height: 25,
                    text: 'Bathroom Trap',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        archipelago_print_message("Ty found Colby's Bathroom Trap!");
                        BathroomTrap.BathroomTrap();
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button14',
                    x: 210,
                    y: 80,
                    width: 200,
                    height: 25,
                    text: 'Set Monopoly Mode',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.SetPurchasableTiles();
                        archipelago_settings.monopoly_x = 1;
                        archipelago_settings.monopoly_y = 1;
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button15',
                    x: 210,
                    y: 110,
                    width: 200,
                    height: 25,
                    text: 'Set Obscene Cash',
                    onClick: function() {
                        park.cash = 1000000;
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button16',
                    x: 210,
                    y: 140,
                    width: 200,
                    height: 25,
                    text: 'AC_Connect',
                    onClick: function() {
                        init_archipelago_connection();
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button17',
                    x: 210,
                    y: 170,
                    width: 200,
                    height: 25,
                    text: 'List Unresearched Rides',
                    onClick: function() {
                        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
                        for(let i=0; i<researchItems.length; i++) {
                            console.log(researchItems[i]);
                        }
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button18',
                    x: 210,
                    y: 200,
                    width: 200,
                    height: 25,
                    text: 'AddCash($10,000)',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.AddCash("$10,000");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button19',
                    x: 210,
                    y: 230,
                    width: 200,
                    height: 25,
                    text: 'AddGuests(250)',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.AddGuests("250 Guests");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button20',
                    x: 210,
                    y: 260,
                    width: 200,
                    height: 25,
                    text: 'Set Weather (Blizzard)',
                    onClick: function() {
                        // let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
                        // console.log(researchItems.length);
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.setWeather("Blizzard");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button21',
                    x: 210,
                    y: 290,
                    width: 200,
                    height: 25,
                    text: 'Cmd: "Sync"',
                    onClick: function() {
                        archipelago_send_message("Sync");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button22',
                    x: 210,
                    y: 320,
                    width: 200,
                    height: 25,
                    text: 'UI Tests',
                    onClick: function() {
                        // console.log(archipelago_settings.received_items);
                        // archipelago_print_message
                        var window = ui.openWindow({
                            classification: 'rain-check',
                            title: "Official Archipelago Rain Check",
                            width: 400,
                            height: 300,
                            colours: [7,7],
                            widgets: [].concat(
                                [
                                    {
                                        type: 'label',
                                        name: 'Debug-Label',
                                        x: 0,
                                        y: 50,
                                        width: 400,
                                        height: 26,
                                        text: 'Colby {RED} is {WHITE} very {PURPLE} cool{WHITE} indeed!',
                                        tooltip: "Y'all's sure do {MAGENTA}talk a lot, don't you?"
                                    }
                                ]
                            )
                        });
                        return window;
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button23',
                    x: 415,
                    y: 320,
                    width: 200,
                    height: 25,
                    text: 'Colbys Choice',
                    onClick: function() {    
                        // console.log(JSON.stringify(archipelago_locked_locations))
                        explodeFurries();
                    }
                }
           ]
        )
    });
    return window;
}

function test(player, type, result){
    if(type == "ridecreate")
    console.log("Player: " + player + "\nType: " + type + "\nResult: " + result);
}
