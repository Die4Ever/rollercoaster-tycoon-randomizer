/// <reference path="../../lib/openrct2.d.ts" />


function archipelagoGui(){
    var ww = 350;
    var wh = 225;
    let y = 0;

    var onStart = function() {
        try{
            trace('This is where we connect to Archipelago and set up the game.');
            //TODO: Get seed from Archipelago
            setGlobalSeed(Math.floor(Math.random() * 1000000));//Maybe someday I'll allow custom seeds
            //No need for research, since we're using a different system entirely for that
            settings.rando_research = false;
            //Crowd control has a lot of options that would most likely break Archipelago. We're going to disable both at once until further notice.
            archipelago_settings.deathlink_timeout = false;
            //We're going to track the objectives ourselves instead
            scenario.objective.type = "haveFun";
            archipelago_settings.started = true;
            saveArchipelagoProgress();//Save the settings to our Archipelago tracker
            // we need to unpause the game in order for the next tick to run
            UnpauseGame();
            runNextTick(function() {
                initRando();
                if(global_settings.auto_pause) {
                    PauseGame();
                }
            createChangesWindow();
            });
        }
        catch(e){
            printException("Error in onStart (archipelagoWindow):", e);
            throw e;
        }
    }

    var window = ui.openWindow({
        classification: 'archipelago-connect',
        title: "Archipelago " + archipelago_version,
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
                    connection.destroy();
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
                    trace("At this point, the user should be playing Archipelago! This only needs to be clicked once per multiworld");
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'Tutorial-button',
                x: ww - 160 - 44 - 6,
                y: wh - 24 - 6,
                width: 85,
                height: 26,
                text: 'Tutorial',
                tooltip: 'I\'ll learn you good!',
                isDisabled: false,
                onClick: function() {
                    tutorial_0();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'What if this logo was animated? Wouldn\'t that be cool?',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }//,
            // {
            //     type: 'checkbox',
            //     name: 'multiple-game-requests-toggle',
            //     text: 'Send multiple game requests',
            //     x: ww - 325,
            //     y: wh - 6 - 27 - 45,
            //     width: 240,
            //     height: 10,
            //     tooltip: 'If enabled, the game will split its request for items/locations into several packets. If you\'re in a multiworld with lots of games, this will fix the issue of your items not appearing...hopefully. Recommended off.',
            //     isChecked: archipelago_multiple_requests,
            //     onChange: function(isChecked: boolean) {
            //         var currentWindow = ui.getWindow("archipelago-connect");
            //         archipelago_multiple_requests = isChecked;
            //     }
            // }
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
                (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).text = 'Skips: ' + String(archipelago_settings.skips);
                (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isDisabled = !archipelago_settings.skips;
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
            else if (currentWindow.tabIndex == 4){
                currentWindow.findWidget<ListViewWidget>("Hint-list").items = createHintList();
            }
        },
        onClose: () => {
            archipelago_skip_enabled = false;
        },
        tabs:
        [
            {//Locked Checks
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
                            type: 'checkbox',
                            name: 'colorblind-toggle',
                            text: 'Enable Colorblind Mode',
                            x: 25,
                            y: 285,
                            width: 240,
                            height: 10,
                            tooltip: 'If you\'re clicking this, you are most likely caucasian and male! That\s true of both colorblind people *and* Archipelago players!',
                            isChecked: archipelago_settings.colorblind_mode,
                            onChange: function(isChecked: boolean) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                archipelago_settings.colorblind_mode = isChecked;
                                currentWindow.findWidget<ListViewWidget>("locked-location-list").items = Archipelago.CreateLockedList();
                                saveArchipelagoProgress();
                            }
                        },
                        {
                            type: 'button',
                            name: 'excorcize-furry-button',
                            x: 500,
                            y: 285,
                            width: 175,
                            height: 26,
                            text: 'A furry problem? In my park?',
                            tooltip: "It's more likely than you think!",
                            //Disable the button if there's not a furry problem in the park
                            isDisabled: furryProblem,
                            onClick: () => {archipelagoExcorcizeFurries();}
                        },
                        {
                            type: 'button',
                            name: 'skip-button',
                            x: 500,
                            y: 315,
                            width: 175,
                            height: 26,
                            text: 'Skips: ' + String(archipelago_settings.skips),
                            tooltip: "You're telling me you *don't* want to build 9 Railroads?",
                            //Disable the button if there's no skips in the bank
                            isDisabled: !archipelago_settings.skips,
                            onClick: () => {
                                let pressed = (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isPressed;
                                if (!pressed){
                                    (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isPressed = true;
                                    archipelago_skip_enabled = true;
                                    trace("Clicky");
                                }
                                else{
                                    (ui.getWindow("archipelago-locations").findWidget("skip-button") as ButtonWidget).isPressed = false;
                                    archipelago_skip_enabled = false;
                                    trace("Unclicky");
                                }
                            }
                        },
                        {
                            type: 'label',
                            name: 'Version',
                            x: 200,
                            y: 330,
                            width: 300,
                            height: 26,
                            text: "Archipelago " + archipelago_version,
                            tooltip: "You see that number? We like watching that number go up. That means I'm good at programming."
                        },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'I\'ll be honest, I spent way too many hours trying to figure out how to add custom images to not plaster this wherever I could.',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            },
            {//Unlocked Checks
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
                        // {
                        //     type: 'label',
                        //     name: 'Connected-to-server',
                        //     x: 200,
                        //     y: 330,
                        //     width: 300,
                        //     height: 26,
                        //     text: archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.",
                        //     tooltip: "Well, back in the day I used to connect at twelve-hundred baud, but ever since the merger, I'm lucky if I get twelve baud! "
                        // },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'I know for a fact nobody is reading this exact tooltip. Therefore I can say whatever I want here without repercussions! Dutch is not a real language.',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            },
            {//Goals
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
                        // {
                        //     type: 'label',
                        //     name: 'Connected-to-server',
                        //     x: 200,
                        //     y: 300,
                        //     width: 300,
                        //     height: 26,
                        //     text: archipelago_connected_to_game ? "The Archipelago Client is connected to the game!" : "The Archipelago Client is {RED}not{WHITE} connected to the game.",
                        //     tooltip: "Well, back in the day I used to connect at twelve-hundred baud, but ever since the merger, I'm lucky if I get twelve baud! "
                        // },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'If you like Archipelago in OpenRCT2, let me know! You can find me at "Crazycolbster" on Discord. If you don\'t like Archipelago in OpenRCT2, that sounds like a you problem.',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            },
            {//Chat
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
                                interpretMessage();
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
                        },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'I bet ' + game + ' doesn\'t have the archipelago logo in it.',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            },
            {//Hints
                image: {frameBase: 5367,frameCount: 8,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Hint-Log-Label',
                            x: 250,
                            y: 50,
                            width: 100,
                            height: 26,
                            text: 'Hints',
                            tooltip: "Is it really that important to know where your items are?"
                        },
                        {
                            type: 'listview',
                            name: 'Hint-list',
                            x: 25,
                            y: 75,
                            width: 650,
                            height: 200,
                            isStriped: true,
                            items: (createHintList()),
                            scrollbars: 'vertical',
                            columns:[{width: 140},{width: 140},{width: 140},{width: 140},{width: 140}]
                        },
                        {
                            type: 'checkbox',
                            name: 'not-found-toggle',
                            text: 'Only show Not Found',
                            x: 150,
                            y: 310,
                            width: 240,
                            height: 10,
                            tooltip: 'Hides any items already found.',
                            isChecked: archipelago_settings.hint_not_found_filter,
                            onChange: function(isChecked: boolean) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                archipelago_settings.hint_not_found_filter = isChecked;
                                saveArchipelagoProgress();
                                currentWindow.findWidget<ListViewWidget>("Hint-list").items = createHintList();
                            }
                        },{
                            type: 'label',
                            name: 'Player-List-Label',
                            x: 150,
                            y: 325,
                            width: 150,
                            height: 26,
                            text: 'Filter by player:',
                            tooltip: "Filters by the selected player. Man, this is better than the client!"
                        },
                        {
                            type: 'dropdown',
                            name: 'player-toggle',
                            text: 'Filter by Player',
                            x: 300,
                            y: 325,
                            width: 240,
                            height: 10,
                            tooltip: 'Filters by the selected player. Man, this is better than the client!',
                            items: ["All", ...(context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as playerTuple[]).map(tuple => tuple[0])],
                            onChange: function(index: number) {
                                var currentWindow = ui.getWindow("archipelago-locations");
                                if(index)
                                archipelago_settings.hint_player_filter = context.getParkStorage().get("RCTRando.ArchipelagoPlayers")[index - 1][0];
                                else
                                archipelago_settings.hint_player_filter = 0;
                                saveArchipelagoProgress();
                                currentWindow.findWidget<ListViewWidget>("Hint-list").items = createHintList();
                            }
                        },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'After recovering from this project, I\'m thinking about doing Kirby and the Amazing Mirror next. Wouldn\'t that be cool?',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            },
            {//EnergyLink
                image: {frameBase: 5277,frameCount: 7,frameDuration: 4},
                widgets: [].concat
                (
                    [
                        {
                            type: 'label',
                            name: 'Bank-Label',
                            x: 250,
                            y: 50,
                            width: 160,
                            height: 26,
                            text: 'EnergyLink Bank ATM Machine',
                            tooltip: "We here at this Multi-Billion Dollar Bank care deeply about you, just like how oil companies care deeply about climate change."
                        },
                        {
                            type: 'button',
                            name: 'withdraw-button',
                            x: 25,
                            y: 100,
                            width: 200,
                            height: 200,
                            text: 'Withdraw Funds',
                            tooltip: 'I\'m sure that Stardew Valley player didn\'t need the money anyways!',
                            onClick: function() {
                                ui.showTextInput({title: "Enter Amount to be Withdrawn", 
                                description: "Note: A 10% fee will be assessed on both deposits and withdrawls. " + 
                                "All users in the multiworld have access to this account.", 
                                callback(value: string){
                                    if(!(parseInt(value)  > -1)){//Numbers only
                                        ui.showError("Not A Valid Amount", "This ATM Machine only accepts amounts as a positive integer. Please input a valid amount.")
                                        return;
                                    }
                                    var amount = parseInt(value);
                                    // Convert 1 internal currency to a multiplier by formatting it into a string and parsing it
                                    var currency = context.formatString("{CURRENCY2DP}", 1)
                                    var currencyMultiplierAsArray = currency.match(/[\d.]+/g); // Matches numbers and decimals
                                    //Finishes converting the value to just the number
                                    var currencyMultiplier = parseFloat(currencyMultiplierAsArray.join(""));
                                    // Get the user to type in a value into a textbox and use the multiplier
                                    amount = Math.floor(amount / currencyMultiplier);//Amount is now in the undelying game currency units
                                    if(!archipelago_settings.team)//If the team isn't set
                                        archipelago_settings.team = 0;//Put them on team 0
                                    const key = "EnergyLink" + String(archipelago_settings.team);
                                    const tag = archipelago_settings.seed + String(date.ticksElapsed);
                                    archipelago_send_message("Set", {key: key, default: 0, tag: tag, want_reply: true, operations: [{operation: "add", value: -amount * (5 * 10**6)}, {"operation": "max", "value": 0}]})
                                } });
                            }
                        },
                        {
                            type: 'button',
                            name: 'deposit-button',
                            x: 250,
                            y: 100,
                            width: 200,
                            height: 200,
                            text: 'Deposit Funds',
                            tooltip: 'Look at you. You\'re so generous.',
                            onClick: function() {
                                ui.showTextInput({title: "Enter Amount to be Deposited", 
                                description: "Note: A 10% fee will be assessed on both deposits and withdrawls. " + 
                                "All users in the multiworld have access to this account.", 
                                callback(value: string){
                                    if(!(parseInt(value)  > -1)){//Numbers only
                                        ui.showError("Not A Valid Amount", "This ATM Machine only accepts amounts as a positive integer. Please input a valid amount.")
                                        return;
                                    }
                                    var amount = parseInt(value);
                                    // Convert 1 internal currency to a multiplier by formatting it into a string and parsing it
                                    var currency = context.formatString("{CURRENCY2DP}", 1)
                                    var currencyMultiplierAsArray = currency.match(/[\d.]+/g); // Matches numbers and decimals
                                    //Finishes converting the value to just the number
                                    var currencyMultiplier = parseFloat(currencyMultiplierAsArray.join(""));
                                    // Get the user to type in a value into a textbox and use the multiplier
                                    amount = Math.floor(amount / currencyMultiplier);//Amount is now in the undelying game currency units
                                    if(park.cash - amount < 100000){//The player must have the equivalent of at least $10,000 afterwards to be elligible to deposit
                                        ui.showError("Insufficient Reserves", "Multiworld Customs and Import laws require that the customer have at least " +
                                        context.formatString("{CURRENCY2DP}", 100000) + " in reserve to contribute to their account at EnergyLink Bank.")
                                        return;
                                    }
                                    if(!archipelago_settings.team)//If the team isn't set
                                        archipelago_settings.team = 0;//Put them on team 0
                                    const key = "EnergyLink" + String(archipelago_settings.team);
                                    const tag = archipelago_settings.seed + String(date.ticksElapsed);
                                    archipelago_send_message("Set", {key: key, default: 0, tag: tag, want_reply: true, operations: [{operation: "add", value: .9* amount * (5 * 10**6)}]})
                                } });                            }
                        },
                        {
                            type: 'button',
                            name: 'inquiry-button',
                            x: 475,
                            y: 100,
                            width: 200,
                            height: 200,
                            text: 'Balance Inquiry',
                            tooltip: 'IRL ATMs charging you money for this should be a crime.',
                            onClick: function() {
                                if(!archipelago_settings.team)//If the team isn't set
                                    archipelago_settings.team = 0;//Put them on team 0
                                const key = "EnergyLink" + String(archipelago_settings.team);
                                const tag = "inquiry";
                                archipelago_send_message("Set", {key: key, default: 0, tag: tag, want_reply: true, operations: []})                            }
                        },
                        {
                            type: 'custom',
                            name: 'custom-archipealgo-logo-1',
                            x: 5,
                            y: wh - 24,
                            width: 22,
                            height: 20,
                            tooltip: 'Linux is clearly the superior operating system. We all agree, right?',
                            onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
                        }
                    ]
                )
            }
        ]
    });
    return window;
}

function archipelagoExcorcizeFurries(quiz?){
    if (ui.getWindow("archipelago-excorcize-furries"))
    return;
    var ww = 350;
    var wh = 225;
    let y = 0;
    let challenge = null;
    if(quiz)
        challenge = returnChallenge(quiz);
    else 
        challenge = returnChallenge();
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
    // let effect = 6;
    try{
        ui.getWindow('archipelago-locations').close();
    }
    catch{
        console.log("Error in explodeFurries: No Window to close");
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
                if (i < 250){//TODO: Remove this check on next major OpenRCT2 release
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
                        let litter = map.createEntity("litter",{x,y,z}) as Litter;//,litterType:"burger_box"});//Math.floor(Math.random()*12)});
                        switch(Math.floor(Math.random() * 8)){
                            case 0:
                                litter.litterType = "vomit";
                                break;
                            case 1:
                                litter.litterType = "vomit_alt";
                                break;
                            case 2:
                                litter.litterType = "empty_can";
                                break;
                            case 3:
                                litter.litterType = "rubbish";
                                break;
                            case 4:
                                litter.litterType = "burger_box";
                                break;
                            case 5:
                                litter.litterType = "empty_cup";
                                break;
                            case 6:
                                litter.litterType = "empty_box";
                                break;
                            case 7:
                                litter.litterType = "empty_bottle";
                                break;
                            case 8:
                                litter.litterType = "empty_bowl_red";
                                break;
                            case 9:
                                litter.litterType = "empty_bowl_blue";
                                break;
                            case 10:
                                litter.litterType = "empty_drink_carton";
                                break;
                            case 11:
                                litter.litterType = "empty_juice_cup";
                                break;
                            default:
                                litter.litterType = "vomit_alt";
                                break;
                        }
                        break;
                    case 6:
                        map.createEntity("money_effect",{x,y,z})//,Value:Math.floor(Math.random()*100000)});
                        break;
                    case 7:
                        map.createEntity("steam_particle",{x,y,z});
                        break;
                    }
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
                        // archipelago_unlocked_locations = [{LocationID: 0,Item: "Sling Shot",ReceivingPlayer: "Dallin"}, {LocationID: 1,Item: "progressive automation",ReceivingPlayer: "Drew"}, {LocationID: 2,Item: "16 pork chops",ReceivingPlayer: "Minecraft d00ds"}];
                        // archipelago_locked_locations = [{LocationID: 3,Item: "Howling Wraiths",ReceivingPlayer: "Miranda"},{LocationID: 4,Item: "Hookshot",ReceivingPlayer: "Dallin"}, {LocationID: 5,Item: "progressive flamethrower",ReceivingPlayer: "Drew"}, {LocationID: 6,Item: "egg shard",ReceivingPlayer: "Minecraft d00ds"}, {LocationID: 7,Item: "Descending Dive",ReceivingPlayer: "Miranda"}];
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
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        archipelago_settings.received_games.push("Ocarina of Time", "Adventure", "Donkey Kong Country 3", "Final Fantasy 1", "Hollow Knight",
                        "The Legend of Zelda", "A Link to the Past", "Links Awakening", "Pokemon Red and Blue", "Rogue Legacy",
                        "Sonic Adventure 2", "Super Mario World", "Super Mario 64", "Super Metroid", "VVVVVV")
                        console.log(archipelago_settings.received_games.length);
                        // console.log(ScenarioName[0]);
                        // archipelago_settings.location_information = locationInfo.Full;
                        // archipelago_send_message("GetDataPackage");
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
                            title: "Official Archipelago UI Debug",
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
                                        text: 'Colby {RED} is {WHITE} very {PURPLE} cool{WHITE} indeed!',//{INLINE_SPRITE}{164}{20}{0}{0}',
                                        tooltip: "Y'all's sure do {MAGENTA}talk a lot, don't you?"
                                    },
                                    {
                                        type: 'custom',
                                        name: 'custom-archipealgo-logo',
                                        x: 0,
                                        y: 75,
                                        width: 100,
                                        height: 108,
                                        onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
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
                    y: 170,
                    width: 200,
                    height: 25,
                    text: 'Get List for Archipelago',
                    onClick: function() {
                        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
                        var items: any = [];
                        for(let i = 0; i < researchItems.length; i++){
                            if(researchItems[i].category == "scenery")
                            items.push("scenery");
                            else
                            items.push(RideType[(researchItems[i] as RideResearchItem).rideType]);
                        }
                        console.log("\n\n\n\n\n");
                        console.log(scenario.name);
                        console.log(JSON.stringify(items));
                        console.log("\n\n\n\n\n");
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button24',
                    x: 415,
                    y: 320,
                    width: 200,
                    height: 25,
                    text: 'Colbys Choice',
                    onClick: function() { 
                        ArchipelagoSaveLocations(context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations'),context.getParkStorage().get('RCTRando.ArchipelagoUnlockedLocations'));
                        // for(let i = 0; i < 15; i++){
                        // console.log(objectManager.getAllObjects("peep_animations")[i]);}
                        // context.executeAction("staffhire", {autoPosition: true, staffType: 3, costumeIndex: 9, staffOrders: 0} satisfies StaffHireArgs);
                        // for(let i = 0; i < map.numRides; i++){
                        //     switch(map.rides[i].classification){
                        //         case "ride":
                        //             park.bankLoan += 2000;
                        //             break;
                        //         default:
                        //             console.log(map.rides[i].type);
                        //     }
                        // }
                        // runNextTick(() => {park.cash += 20000});
                        // var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        // runNextTick(BathroomTrap.SpamTrap);
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button25',
                    x: 415,
                    y: 20,
                    width: 200,
                    height: 25,
                    text: 'Add Skip',
                    onClick: function() {
                        archipelago_settings.skips ++;
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button26',
                    x: 415,
                    y: 50,
                    width: 200,
                    height: 25,
                    text: 'Try Furry Quiz',
                    onClick: function() {
                        archipelagoExcorcizeFurries(challenges.length - 1);
                    }
                },
                {
                    type: 'button',
                    name: 'debug-button27',
                    x: 415,
                    y: 80,
                    width: 200,
                    height: 25,
                    text: 'Loan Shark Trap',
                    onClick: function() {
                        var BathroomTrap = GetModule("RCTRArchipelago") as RCTRArchipelago;
                        BathroomTrap.LoanSharkTrap();
                    }
                }
           ]
        )
    });
    return window;
}

var tutorial_0 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_0 = ui.openWindow({
        classification: 'tutorial-1',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("Welcome to Archipelago! You may be thinking \"Gee, how do you even play Roller Coaster Tycoon on Archipelago?\" or \"What IS Archipelago?", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "You may also be thinking \"Gee, I bet the developer of this mod is really cool, good looking and humble!\", but that's neither here nor there."
            }),
            NewLabel("Archipelago is a multi-game, multi-world randomizer! Have you ever wanted to play Minecraft, Ocarina of Time, and OpenRCT2 cooperatively at the same time, with everything interlinked? Now you can!", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "If you said no, you're probably a liar."
            }),
            NewLabel("First off, make sure your game is connected and you have Archipelago running. You can find those instructions at archipelago.gg", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "Fun fact: gg is the country code top-level domain for the Bailiwick of Guernsey. Fun fact 2: I have no idea where the p*ck the Balilwick of Guernsey is."
            }),
            [{
                type: 'button',
                name: 'cancel-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Cancel',
                tooltip: 'Changed your mind? Fine, I didn\'t want you to read this anyways!',
                onClick: function() {
                    tutorial_0.close();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_0.close();
                    tutorial_1();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_0;
}

var tutorial_1 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_1 = ui.openWindow({
        classification: 'tutorial-1',
        title: "How to play!",
        width: ww,
        height: wh + 80,
        widgets: [].concat(
            NewLabel("Once your game is connected, hit the \"Start Game!\" button to begin!", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "In online games, usually people run a countdown before everyone begins. You'll probably want to look at the client for that, since messages are weird while the game is paused."
            }),
            NewLabel("The primary method of progress in your game will be purchasing items in the shop. You can find the shop under the map icon labeled \"Archipelago Checks!\". You can also strike the \"Home\" key to open it.", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "If the shop is empty, past Colby p*cked up the code. See the troubleshooting guide online. Just kidding! There isn't one."
            }),
            {
                type: 'custom',
                name: 'menu-location',
                x: ww / 3,
                y: wh - 120,
                width: 131,
                height: 160,
                tooltip: 'Importing images to an OpenRCT2 plugin is a pain. I hope you\'re thankful!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_menu_location_image_ID.start).id, 0,0)}
            },
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29 + 90,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_1.close();
                    tutorial_0();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29 + 90,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_1.close();
                    tutorial_2();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24 + 80,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_1;
}

var tutorial_2 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_2 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("The first tab you’ll see upon opening the shop is well, the shop. Here you can buy items for other games! Depending on your settings, you’ll see who it goes to and what it is.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "$$$$$$$$$$$$$$$$$$$$$$$$$$$"
            }),
            NewLabel("The shop is organized into colored branches. When somebody asks you for their {LIGHTPINK}Pink_4{WHITE}, you’ll know it’s the fourth item on the {LIGHTPINK}Pink{WHITE} branch!", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "That's right, {WHITE}I {BLACK}CAN {GREEN}COLOR {RED}THE {BABYBLUE}TEXT!"
            }),
            NewLabel("Some items have prerequisites aside cash that need to be met before you can buy them. If it requires any sort of stat (excitement, length, total guests, etc.), they must be posted in the test data tab of the ride before they’ll be counted. Each ride must meet all the listed stats.", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "Nobody told me that balancing the checks would be such a hard task. I guess I gotta keep playing the game to make sure it feels right. Oh no, what a nightmare."
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_2.close();
                    tutorial_1();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_2.close();
                    tutorial_3();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_2;
}

var tutorial_3 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_3 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("The second tab is your purchase history. Use it when your friends say you aren’t pulling your weight.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "I'll be honest, I put that in because its easy to track and looks more important than it actually is."
            }),
            NewLabel("Tab 3 is the goals tab! In this tab you’ll see what requirements you must fulfill to complete your game in Archipelago. These will have been set in your options file when you generate the game.", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "They should add modular goals as a regular option in the base game!"
            }),
            NewLabel("The required rides list has 3 colors: {RED}Red means you haven’t yet unlocked the ride. Keep playing and somebody will find it! {YELLOW}Yellow means the ride is unlocked, but not yet built. {GREEN}Green means the ride is built and ready to go!", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "The goals tab is updated at the start of each day, by the way. Not that that really matters, given that days last about 8 seconds in this weird universe."
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_3.close();
                    tutorial_2();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_3.close();
                    tutorial_4();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_3;
}

var tutorial_4 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_4 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("The fourth tab is the chat tab. Here you can communicate with other players in the multworld! It also logs messages and unlocks from other players and the server.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "Someday I'll also have the in-game multiplayer chat work as well, but that would first require getting in-game multiplayer to work, which is a shockingly difficult task."
            }),
            NewLabel("You can use the text input to run a select number of commands for the local world. These include some player-debugging tools, Archipelago settings, and so forth. To see the list, type in !!help", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "!!addSkip if you're a filthy cheater."
            }),
            NewLabel("", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: ""
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_4.close();
                    tutorial_3();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_4.close();
                    tutorial_5();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_4;
}

var tutorial_5 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_5 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("The fifth tab is the hint tab. It tracks any hits received in the multiworld, most importantly, yours! This will be auto-populated if the visibility setting in the shop is “Visible”.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "And it's worked every time without ever giving us a glitch! *Cries in developer"
            }),
            NewLabel("You can additionally filter by a particular player in this tab. To hint an item, you can use the native Archipelago command !hint {Item Name}", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "You can spam the chat by using !countdown"
            }),
            NewLabel("Here’s a few helpful items: “Allow High Construction”, “Allow Tree Removal”, “Allow Landscape Changes”", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "\"$5,000\" if you're feeling greedy."
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_5.close();
                    tutorial_4();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_5.close();
                    tutorial_6();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_5;
}

var tutorial_6 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_6 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("The sixth and final tab is EnergyLink Bank ATM Machine. This ATM Machine lets you send money to the multiworld for any game that supports EnergyLink.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "Yes, I do realize \"ATM Machine\" is redundant. Yes, I do know it's annoying you. No, I will not fix it. It's funnier this way."
            }),
            NewLabel("These games include (But are not limited to) Pokémon Red/Blue, Factorio (The EnergyLink OG), Stardew Valley, and the OG MegaMan games.", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "Did you know, Red's dad left the family to become a Roller Coaster Tycoon?"
            }),
            NewLabel("The ATM Machine charges a 10% fee each way for depositing and withdrawing any funds in EnergyLink. Additionally, you must have at least "+ context.formatString("{CURRENCY2DP}", 100000) + " remaining at the end of any deposit as collateral.", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "You wouldn't believe how expensive the infrastructure to send money across the multiworld is!"
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_6.close();
                    tutorial_5();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_6.close();
                    tutorial_7();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_6;
}

var tutorial_7 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_7 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("Finally, a few extra notes. Deathlink is an optional rule that players may choose. Any time somebody dies with deathlink enabled; everybody dies. For you, that means a ride will crash.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "Disable deathlink if you're a coward. Especially if somebody is playing VVVVVV"
            }),
            NewLabel("Conversely, if you crash a ride (Yes, even in testing mode), everybody will die. Deathlink has a 20 second cooldown. Fix your ride before it elapses!", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "There's a hidden second way to send a deathlink. Think you can find it?"
            }),
            NewLabel("If for some reason, you find an abundance of furries in your park, you can banish them by using the button in the bottom right of the unlock shop. “A Furry Problem? In MY Park?”", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "It's more likely than you think!"
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_7.close();
                    tutorial_6();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Next Page',
                tooltip: '"Pro tip: Hover your mouse over any of the window elements in this plugin to get insightful and useful commentary!"',
                isDisabled: false,
                onClick: function() {
                    tutorial_7.close();
                    tutorial_8();
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_7;
}

var tutorial_8 = function() {
    var ww = 350;
    var wh = 225;
    let y = 0;
    var tutorial_8 = ui.openWindow({
        classification: 'tutorial-2',
        title: "How to play!",
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel("In case a ride is too challenging/expensive/tedious to build, you have a limited number of skips to bypass the check. When selecting the world options, you could include more to be found.", {
                name: 'Line-1',
                y: 0,
                width: 2,
                tooltip: "Nothing is as satisfying as not having to build 10 monorails."
            }),
            NewLabel("Skips are found beneath to the Furry Banishment Button TM.", {
                name: 'Line-2',
                y: 1.5,
                width: 2,
                tooltip: "Skips is also found in a park in California, working with Mordecai and Rigby."
            }),
            NewLabel("Thanks for reading the tutorial! As a reward, here "+ context.formatString("{CURRENCY2DP}", 200) + ". Don’t spend it all in one place!", {
                name: 'Line-3',
                y: 3,
                width: 2,
                tooltip: "You can support me on Patreon at ... just kidding. I don't have a Patreon. I'm doing just fine as an Electrical Engineer."
            }),
            [{
                type: 'button',
                name: 'back-button',
                x: ww - 160 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Back',
                tooltip: 'The previous page was pretty good, wasn\'t it?',
                onClick: function() {
                    tutorial_8.close();
                    tutorial_7();
                }
            },
            {
                type: 'button',
                name: 'next-button',
                x: ww - 160 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Yay ' + context.formatString("{CURRENCY2DP}", 200) + "!",
                tooltip: 'What do you mean that\'s not a lot of money?',
                isDisabled: false,
                onClick: function() {
                    tutorial_8.close();
                    park.cash += 200;
                }
            },
            {
                type: 'custom',
                name: 'custom-archipealgo-logo-1',
                x: 5,
                y: wh - 24,
                width: 22,
                height: 20,
                tooltip: 'Be sure to play with Deathlink! It\s a fun option that doesn\'t cause any stress at all!',
                onDraw: (g: GraphicsContext) => {g.colour = 0;g.image(g.getImage(archipelago_icon_ID.start).id, 0,0)}
            }
            ]
        )
    })
    return tutorial_8;
}

function createHintList(){
    var hint_list = [["{WHITE}Receiving Player","{WHITE}Item","{WHITE}Finding Player","{WHITE}Location","{WHITE}Status"]];
    var hints = archipelago_settings.hints;
    for(let i = 0; i < hints.length; i++){
        let hint = [hints[i].ReceivingPlayer,hints[i].Item,hints[i].FindingPlayer,hints[i].Location,hints[i].Found? "{GREEN}Found" : "{RED}Not Found"];
        if((!hints[i].Found || !archipelago_settings.hint_not_found_filter) && //Found Filter
            ((hints[i].ReceivingPlayer == archipelago_settings.hint_player_filter || hints[i].FindingPlayer == archipelago_settings.hint_player_filter) ||
            archipelago_settings.hint_player_filter == 0))// Player Filter
        hint_list.push(hint);
    }
    return hint_list;
}

function interpretMessage(){
    var currentWindow = ui.getWindow("archipelago-locations");
    if (!currentWindow)
    return;
    if(currentWindow.findWidget<ButtonWidget>("send-chat-button")){
        var message = currentWindow.findWidget<TextBoxWidget>("chatbox").text;
        if (!message)
        return;
        trace("This is the message:");
        trace(message);
        if(message.charAt(0) === '!' && message.charAt(1) === '!'){
            message = message.toLocaleLowerCase();
            switch(message){
                case '!!help':
                    archipelago_print_message("!!help: Prints this menu. I bet you didn't know that.");
                    archipelago_print_message("!!toggleDeathLink: Enables/Disables Deathlink\n");
                    archipelago_print_message("!!setMaxSpeed x: Sets the maximum allowed speed.");
                    archipelago_print_message("!!sync: syncs all the items in case the connector is bad at its job.");
                    archipelago_print_message("!!addSkip: Cheats in a skip for the unlock shop. This is on the honor system.");
                    break;
                case '!!toggledeathlink':
                    archipelago_settings.death_link = !archipelago_settings.death_link;
                    if(archipelago_settings.death_link)
                    archipelago_print_message("Deathlink Enabled you monster");
                    else
                    archipelago_print_message("Deathlink Disabled you coward");
                    break;
                case '!!setmaxspeed 1'://Changes maximum speed allowed
                    archipelago_settings.maximum_speed = 1;
                    archipelago_print_message("Maximum speed reset to 1. We're off! Like a herd of turtles!")
                    break;
                case '!!setmaxspeed 2':
                    archipelago_settings.maximum_speed = 2;
                    archipelago_print_message("Maximum speed set to 2. Those guests sure are slow, ain't they?");
                    break;
                case '!!setmaxspeed 3':
                    archipelago_settings.maximum_speed = 3;
                    archipelago_print_message("Maximum speed set to 3. Zoom. Look at it go.");
                    break;
                case '!!setmaxspeed 4':
                    archipelago_settings.maximum_speed = 4;
                    archipelago_print_message("Maximum speed set to 4. Is this not fast enough for you yet?");
                    break;
                case '!!setmaxspeed 5':
                    archipelago_settings.maximum_speed = 8;
                    archipelago_print_message("Maximum speed set. You better pray you don't get a furry trap.");
                    break;
                case '!!sync':
                    ArchipelagoSaveLocations(context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations'),context.getParkStorage().get('RCTRando.ArchipelagoUnlockedLocations'));
                    archipelago_send_message("Sync");
                    break;
                case '!!addskip':
                    archipelago_settings.skips ++;
                    archipelago_print_message("It appears somebody set their difficulty too high. This is where your hubris brought you!");
                    break;
                case '!!fixunlockshop':
                    archipelago_print_message("Apologies from present Colby for past Colby being bad at programming.");
                    archipelago_send_message("LocationScouts");
                    break;
                default:
                    archipelago_print_message("Unknown command: try using !!help");
                    break;
            }
        }
        else {
            if(message == "Colby sucks"){ //Gotta do some error correction here.
                archipelago_send_message("Say","Colby is awesome!");
                return;
            }
            archipelago_send_message("Say", message);
        }
        currentWindow.findWidget<TextBoxWidget>("chatbox").text = '';
    }
    return;
}

function test(player, type, result){
    if(type == "ridecreate")
    console.log("Player: " + player + "\nType: " + type + "\nResult: " + result);
}
