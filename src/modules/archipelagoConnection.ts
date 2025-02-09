/// <reference path="moduleBase.ts" />
/// <reference path="../../lib/openrct2.d.ts" />

class RCTRArchipelagoConnection extends ModuleBase {

    AnyEntry(): void {
        var self = this;
        if (!settings.rando_archipelago)
            return;
        //init_archipelago_connection();

    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelagoConnection());
var send_timeout = false; //For plugin side sends
var spam_timeout = false; //For user side sends

function archipelago_send_message(type: string, message?: any) {
    try {
        trace(connection.buffer.length);
        if (connection.buffer.length == 0){
            if (!send_timeout){
                archipelago_select_message(type, message);
                send_timeout = true;
                context.setTimeout(() => {send_timeout = false;}, 3000);
            }
            else{
                context.setTimeout(() => {archipelago_send_message(type,message);}, 3000);
            }
        }
    }
    catch(e) {
        printException('error sending '+this.name, e);
        throw(e);
    }
}

function archipelago_select_message(type: string, message?: any){
    switch(type){
    case "Connect":
        trace({cmd: "Connect", password: message.password, game: "OpenRCT2", name: message.name, uuid: message.name + ": OpenRCT2", version: {major: 0, minor: 4, build: 1}, item_handling: 0b111, tags: (archipelago_settings.deathlink) ? ["DeathLink"] : [], slot_data: true});
        break;
    case "ConnectUpdate":
        trace({cmd: "ConnectUpdate", tags: (archipelago_settings.deathlink) ? ["DeathLink"] : []})
        break;
    case "Sync"://Get's all the currently received items for the game
        connection.send({cmd: "Sync"});
        break;
    case "LocationChecks":
        var checks = [];//List of unlocked locations
        for (let i = 0; i < message.length; i++){
            checks.push(message[i].LocationID + 2000000);//OpenRCT2 has reserved the item ID space starting at 2000000
        }
        connection.send({cmd: "LocationChecks", locations: checks});
        break;
    case "LocationScouts"://Get's the item info for every location in the unlock shop
        var wanted_locations = [];
        for(let i = 0; i < archipelago_location_prices.length; i++){
            wanted_locations.push(2000000 + i);
        }
        connection.send({cmd: "LocationScouts", locations: wanted_locations, create_as_hint: 0});
        break;
    case "LocationHints":
        connection.send({cmd: "LocationScouts", locations: message, create_as_hint: 2});
        break;
    case "StatusUpdate":
        connection.send({cmd: "StatusUpdate", status: message});//CLIENT_UNKNOWN = 0; CLIENT_CONNECTED = 5; CLIENT_READY = 10; CLIENT_PLAYING = 20; CLIENT_GOAL = 30
        break;
    case "Say":
        const regex = /peck/gi;
        message = message.replace(regex, 'p*ck');
        trace({cmd: "Say", text: message});
        connection.send({cmd: "Say", text: message});
        break;
    case "GetDataPackage":
        connection.send({cmd: "GetDataPackage", games: [message]});
        break;
    case "Bounce":
        if(message.tag == "DeathLink"){
            connection.send({cmd: "Bounce", tags: ["DeathLink"], data: {time: Math.round(+new Date()/1000), cause: message.ride + " has crashed!", source: archipelago_settings.player[0]}});
        }
        break;
    case "Get":
        connection.send({cmd: "Get", keys: []});
        break;
    case "Set":

        break;
    case "SetNotify":
        break;
    }
}

function ac_req(data) {//This is what we do when we receive a data packet
    // TODO: come up with a better name for this function, and also move some of these big cases into their own functions
    var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
    var archipelagoPlayers: playerTuple[] = [];
    switch(data.cmd){
        case "RoomInfo":
            archipelago_settings.current_time = data.time;
            trace("Archipelago Time has been set:");
            trace(archipelago_settings.current_time);
            break;
        case "Connected"://Packet stating player is connected to the Archipelago game
            if(!archipelago_settings.started){
                var multiworld_games = [];
                if(!context.getParkStorage().get("RCTRando.ArchipelagoPlayers")){ //We only need to do this once
                    for(let i=0; i<data.players.length; i++) {
                        //Create guest list populated with Player names
                        archipelagoPlayers.push([data.players[i][2], false]);
                        multiworld_games.push(data.slot_info[i + 1][1]);
                    }
                    trace(data.slot_info);
                    trace("Here's our players:");
                    trace(archipelagoPlayers);
                    context.getParkStorage().set("RCTRando.ArchipelagoPlayers",archipelagoPlayers);
                    Archipelago.SetNames();
                    archipelago_settings.player = archipelagoPlayers[data.slot - 1];
                }
                context.getParkStorage().set("RCTRando.ArchipelagoHintPoints",data.hint_points);

                //To prevent sending lots of redundant data, we strip copies of games
                var unique_multiworld_games = multiworld_games.filter(function(elem, index, self) {
                    return index === self.indexOf(elem);
                })
                archipelago_settings.multiworld_games = unique_multiworld_games;
                trace("Here's the games in the multiworld:");
                trace(archipelago_settings.multiworld_games);

                if(!archipelago_init_received)
                Archipelago.SetImportedSettings(data.slot_data);
            }

            // If the user has already made progress on this game, reflect that in the unlock shop
            context.setTimeout(() => {archipelago_update_locations(data.checked_locations)}, 2000);

            archipelago_connected_to_server = true;
            break;

        case "ConnectionRefused"://Packet stating an error has occured in connecting to the Archipelago game
            var errorMessage = "Archipelago Refused the connection with the following error(s):";
            for(let i = 0; i < data.errors.length; i++){
                errorMessage += data.errors[i];
            }
            archipelago_print_message(errorMessage);
            break;

        case "PrintJSON"://Packet with data to print to the screen
            archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as playerTuple[]);
            switch(data.type){
                case "Hint":
                case "ItemSend":
                    if (!archipelago_settings.universal_item_messages){//Only display item messages directly relevant to the player if enabled
                        let display = false;
                        for (let i = 0; i < data.data.length; i++){
                            if(data.data[i].type == "player_id"){
                                let checked_player = context.getParkStorage().get("RCTRando.ArchipelagoPlayers")[Number(data.data[i].text)-1][0];
                                if (archipelago_settings.player[0] == checked_player){
                                    display = true;
                                    break;//Breaks the for loop
                                }
                            }
                        }
                        if (!display)
                        break;//Breaks the case statement
                    }
                    let message = "";
                    for (let i = 0; i < data.data.length; i++){
                        let color = "";
                        if(data.data[i].type){
                            let segment = data.data[i].text;
                            switch(data.data[i].type){
                                case "player_id":
                                    segment = archipelagoPlayers[Number(data.data[i].text)-1][0];//Gets the name of the relevant player
                                    color = "PALELAVENDER";//Colors them purple
                                    break;
                                case "item_id":
                                    segment = context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")[Number(data.data[i].text)];
                                    switch(data.data[i].flags){
                                        case 0://Normal
                                        case 2://Useful
                                            color = "BABYBLUE";
                                            break;
                                        case 1://Progression
                                            color = "PALELAVENDER";
                                            break;
                                        case 4://Trap
                                            color = "RED";
                                            break;
                                    }
                                    break;
                                case "location_id":
                                    segment = context.getParkStorage().get("RCTRando.ArchipelagoLocationIDToName")[Number(data.data[i].text)];
                                    color = "GREEN";
                                    break;

                                // Once upon a time, the client sent a different datapacket.
                                // case "black":
                                //     color = "BLACK";
                                //     break;
                                // case "red":
                                //     color = "RED"
                                //     break;
                                // case "green":
                                //     color = "GREEN"
                                //     break;
                                // case "yellow":
                                //     color = "YELLOW";
                                //     break;
                                // case "blue":
                                // case "cyan":
                                // case "slateblue":
                                //     color = "BABYBLUE";
                                //     break;
                                // case "magenta":
                                // case "plum":
                                //     color = "PALELAVENDER";
                                //     segment = context.getParkStorage().get("RCTRando.ArchipelagoPlayers")[Number(data.data[i].text)-1]
                                //     break;
                                // case "white":
                                //     color = "WHITE";
                                //     break;
                            }
                            message += '{' + color + '}' + segment + '{WHITE}';
                        }
                        else{
                            message += data.data[i].text;
                        }
                    }
                    console.log(message);
                    archipelago_print_message(message);
                    break;

                case "ItemCheat":
                    // var cheatMessage = "Colby will write out code to figure out how cheats work when he gets the proxy client";
                    archipelago_print_message(data.data[0].text);
                    break;

                // case "Hint":
                //     var hintMessage = "Colby has a lot to do when he gets the proxy";
                //     archipelago_print_message(hintMessage);
                //     break;

                case "Goal":
                    archipelago_print_message(data.data[0].text);
                    archipelagoPlayers[data.slot - 1][1] = true;
                    context.getParkStorage().set("RCTRando.ArchipelagoPlayers",archipelagoPlayers);
                    // let guests = map.getAllEntities("guest");
                    // for(let i=0; i<(guests.length); i++){
                    //     if(guests[i].name == archipelagoPlayers[data.slot - 1]){
                    //         guests[i].setFlag("joy", true);
                    //         break;
                    //     }
                    // }

                    break;

                default:
                    archipelago_print_message(data.data[0].text);
            }
            break;

        case "DataPackage":
            var item_name_to_id = {};
            var item_id_to_name = {};
            var location_name_to_id = {};
            var location_id_to_name = {};
            let current_game = Object.keys(data.data.games)[0];

            trace("Here's all the keys:");
            trace(Object.keys(data.data.games));

            trace("Here's our current game:");
            trace(current_game);
            trace("Here's every game we've received so far (This shouldn't have the current game):");
            trace(archipelago_settings.received_games);

            if(archipelago_settings.received_games.indexOf(current_game) !== -1)//Throw away data we already have
                break;

            trace("Received DataPackage, updating translation tables");

            function mergeObjects(target: { [key: string]: any }, source: { [key: string]: any }): void {
                for (const key in source) {
                    // console.log(key);
                  if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                  }
                }
              }

            function flipObject(obj: { [key: string]: any }): { [key: string]: string } {
                const flippedObject: { [key: string]: string } = {};

                for (const key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    flippedObject[value] = key;
                  }
                }

                return flippedObject;
              }
            for (const gameName in data.data.games){//For every game in this game of Archipelago
                if (data.data.games.hasOwnProperty(gameName)) {
                    mergeObjects(item_name_to_id, data.data.games[gameName].item_name_to_id);
                    mergeObjects(location_name_to_id, data.data.games[gameName].location_name_to_id);
                }
            }
            item_id_to_name = flipObject(item_name_to_id);
            location_id_to_name = flipObject(location_name_to_id);

            mergeObjects(full_item_id_to_name, item_id_to_name);
            mergeObjects(full_location_id_to_name, location_id_to_name);

            context.getParkStorage().set("RCTRando.ArchipelagoItemIDToName",full_item_id_to_name);
            context.getParkStorage().set("RCTRando.ArchipelagoLocationIDToName",full_location_id_to_name);

            // console.log(full_item_id_to_name);
            // console.log(full_location_id_to_name);

            trace("Just added data for this game:");
            trace(current_game);

            archipelago_settings.received_games.push(current_game);
            saveArchipelagoProgress();
            break;

        case "Bounced"://Keeps the connection alive and recevies the Deathlink Signal from other games
            if(data.tags){
                for(let i = 0; i < data.tags.length; i++){
                    if(data.tags[i] == "DeathLink"){
                        const cause = data.data.cause;
                        const source = data.data.source;
                        if(archipelago_settings.deathlink){
                            Archipelago.ReceiveDeathLink({cause, source, attempt: 1});
                        }
                        if(cause){
                            archipelago_print_message(cause);
                        }
                        else{
                            var player_color = "{PALELAVENDER}" + source;
                            var message_choice = [player_color + " {RED}is bad at video games!", player_color + " {RED}just got Windows Vista'd.",
                                player_color + " {RED}should have upgraded to Linux.", player_color + " {RED}has met their maker!",
                                '{RED}"What is death anyways?"\n{PALELAVENDER}-' + player_color,
                                "{RED}If it makes you feel better, at least it's " + player_color + "{RED}'s fault and not yours.", player_color + " {RED}is an airsick lowlander!",
                                player_color + "{RED} missed 100% of the shots they didn't take.", "{RED}It was " + player_color + "{RED}'s controller, I swear!",
                                player_color + "{RED} was not the imposter.", player_color + "{RED} rolled a natural 1.",
                                player_color + "{RED} should not have tried stealing the kings flocks from Ammon!", player_color + "{RED} started a land war in Asia!"];
                            var death_message = message_choice[Math.floor(Math.random() * message_choice.length)];
                            archipelago_print_message(death_message);
                        }
                        break;
                    }
                }
            }
            break;

        case "InvalidPacket":
            console.log("Invalid Packet Error: " + data.type);
            console.log(data.text);
            break;

        case "ReceivedItems":
            if (archipelago_settings.started){//We don't want to apply all the previously received items before we start the game.
                Archipelago.ReceiveArchipelagoItem(data.items, data.index);
            }
            break;

        case "LocationInfo":
            if(data.locations.length > 9){//This is for the unlock shop and not a hint
                const players: string[] = context.getParkStorage().get("RCTRando.ArchipelagoPlayers");
                var ready = true;
                if(context.getParkStorage().get('RCTRando.ArchipelagoLockedLocations'))
                    break;//If we have the locations already, we can assume this was an unintentional repeat request

                if(ready){
                    for(let i = 0; i < data.locations.length; i++){
                        archipelago_locked_locations.push({LocationID: i, Item: data.locations[i][0], ReceivingPlayer: players[data.locations[i][2] - 1][0]})
                    }
                    ArchipelagoSaveLocations(archipelago_locked_locations,[]);
                }
                else{//We don't have all the item info yet. Try again.
                    console.log("Item Info incorrect. Retrying.");
                    context.setTimeout(() => {archipelago_send_message("LocationScouts");}, 3000)
                }

            }
            break;
        case "SetReply"://Handles hints
            const hint_pattern: RegExp = /^_read_hints_/;
            if(hint_pattern.test(data.key)){
                trace(context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as playerTuple[]);
                for(let i = 0; i < data.value.length; i++){
                    let archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as playerTuple[]);
                    var hint: archipelago_hint = {
                        ReceivingPlayer: archipelagoPlayers[Number(data.value[i].receiving_player) - 1][0],
                        FindingPlayer: archipelagoPlayers[Number(data.value[i].finding_player) - 1][0],
                        Location: context.getParkStorage().get("RCTRando.ArchipelagoLocationIDToName")[Number(data.value[i].location)],
                        Item: context.getParkStorage().get("RCTRando.ArchipelagoItemIDToName")[Number(data.value[i].item)],
                        Found: data.value[i].found
                    }
                    //Check if we've received the hint before
                    var position = -1;
                    for (let j = 0; j < archipelago_settings.hints.length; j++) {
                        const obj = archipelago_settings.hints[j];
                        if (obj.Location === hint.Location && obj.FindingPlayer === hint.FindingPlayer) {
                            position = j; // Return the index of the matching object
                        }
                    }
                    if(position > -1){
                        archipelago_settings.hints[position].Found = hint.Found;
                    }
                    else{
                        archipelago_settings.hints.push(hint);
                    }
                }
                saveArchipelagoProgress();
            }
            break;

        case "Ping":
            data.cmd = "Pong";
            if(data.multiply){
                let number = data.multiply;
                for(let i = 0; i < number; i++){
                    data.multiply = i;
                    connection.send(data, false);
                }
            }
            else
                connection.send(data, false);
            break;
    }
    return;
}

function errorCallback() {
    archipelago_connected_to_game = false;
    try {
        var window:Window = ui.getWindow("archipelago-connect");
        window.findWidget<LabelWidget>("label-Connected-to-game").text = "The Archipelago Client is {RED}not{WHITE} connected to the game!";
        var button:ButtonWidget = window.findWidget<ButtonWidget>("start-button");
        button.isDisabled = (!archipelago_connected_to_game || !archipelago_connected_to_server || !archipelago_correct_scenario);
    }
    catch{
        trace("Looks like the Archipelago window isn't open.");
    }
    try {
        var window:Window = ui.getWindow("archipelago-locations");
        window.findWidget<LabelWidget>("label-Connected-to-server").text = "The Archipelago Client is {RED}not{WHITE} connected to the game!";
        trace(archipelago_connected_to_server);
    }
    catch{
        trace("Looks like the Archipelago Shop isn't open");
    }
}

function connectCallback() {
    archipelago_connected_to_game = true;
    try {
        var window:Window = ui.getWindow("archipelago-connect");
        var label:LabelWidget = window.findWidget<LabelWidget>("label-Connected-to-game");
        if (label){
            label.text = "The Archipelago Client is connected to the game!";
            window.findWidget<ButtonWidget>("start-button").isDisabled = !archipelago_connected_to_game || !archipelago_connected_to_server || !archipelago_correct_scenario;
        }
    }
    catch {
        trace("Looks like the setup window isn't open.")
    }
    try{
        if(ui.getWindow("archipelago-locations").findWidget<LabelWidget>("label-Connected-to-server"))
        ui.getWindow("archipelago-locations").findWidget<LabelWidget>("label-Connected-to-server").text = "The Archipelago Client is connected to the game!";
    }
    catch{
        trace("Looks like the unlock shop isn't open.");
    }
}

var connection = null;
function init_archipelago_connection() {
    trace("Hello?");
    connection = new APIConnection("Archipelago", 38280, ac_req, errorCallback, connectCallback);
}

function archipelago_print_message(message: string) {
    var messageLog = context.getParkStorage().get("RCTRando.MessageLog") as Array<any>;
    if(messageLog)
    messageLog.push(message);
    else
    messageLog = [message];
    context.getParkStorage().set("RCTRando.MessageLog", messageLog);
    var lockedWindow = ui.getWindow("archipelago-locations");
    if(lockedWindow){//If the archipelago window is open
        if(lockedWindow.findWidget<ListViewWidget>("message-list"))//If the player is on the chat tab
        lockedWindow.findWidget<ListViewWidget>("message-list").items = messageLog;
    }
    if(archipelago_settings.park_message_chat){
        park.postMessage(
            {type: 'blank', text: message} as ParkMessageDesc
        );
    }
    if(archipelago_settings.network_chat){
        network.sendMessage(message);

    }
}
