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
    console.log(connection.buffer.length);
    if (connection.buffer.length == 0){
        if (!send_timeout){
            switch(type){//Gotta fill these in as we improve crud
                case "Connect":
                    console.log({cmd: "Connect", password: message.password, game: "OpenRCT2", name: message.name, uuid: message.name + ": OpenRCT2", version: {major: 0, minor: 4, build: 1}, item_handling: 0b111, tags: (archipelago_settings.deathlink) ? ["DeathLink"] : [], slot_data: true});
                    break;
                case "ConnectUpdate":
                    console.log({cmd: "ConnectUpdate", tags: (archipelago_settings.deathlink) ? ["DeathLink"] : []})
                    break;
                case "Sync":
                    connection.send({cmd: "Sync"});
                    break;
                case "LocationChecks":
                    var checks = [];//List of unlocked locations
                    for (let i = 0; i < message.length; i++){
                        checks.push(message[i].LocationID + 2000000);//OpenRCT2 has reserved the item ID space starting at 2000000
                    }
                    connection.send({cmd: "LocationChecks", locations: checks});
                    break;
                case "LocationScouts":
                    var wanted_locations = [];
                    for(let i = 0; i < archipelago_location_prices.length; i++){
                        wanted_locations.push(2000000 + i);
                    }
                    connection.send({cmd: "LocationScouts", locations: wanted_locations, create_as_hint: 0});
                    break;
                case "StatusUpdate":
                    connection.send({cmd: "StatusUpdate", status: message});//CLIENT_UNKNOWN = 0; CLIENT_CONNECTED = 5; CLIENT_READY = 10; CLIENT_PLAYING = 20; CLIENT_GOAL = 30
                    break;
                case "Say":
                    const regex = /peck/gi;
                    message = message.replace(regex, 'p*ck');
                    console.log({cmd: "Say", text: message});
                    connection.send({cmd: "Say", text: message});
                    break;
                case "GetDataPackage":
                    var self = this;
                    var requested_games = [];
                    var timeout = 1;
                    if (archipelago_multiple_requests){
                        for(let i = 0; i < archipelago_settings.multiworld_games.length; i++){
                            requested_games.push(archipelago_settings.multiworld_games[i]);
                            console.log(requested_games);
                            if (requested_games.length == 1){
                                let games = requested_games;
                                context.setTimeout(() => {
                                    connection.send({cmd: "GetDataPackage", games: games}); archipelago_games_requested += 1;
                                    }, timeout);//console.log("Sending the following games for IDs: " + requested_games);
                                timeout += 5000;
                                requested_games = [];
                            }
                        }
                        if (requested_games){//request any remaining games
                            let games = requested_games; 
                            context.setTimeout(() => {connection.send({cmd: "GetDataPackage", games: games}); archipelago_games_requested += games.length;}, timeout);
                        }
                    }
                    else{
                        connection.send({cmd: "GetDataPackage", games: archipelago_settings.multiworld_games}); 
                        archipelago_games_requested += archipelago_settings.multiworld_games.length;
                    }
                    break;
                case "Bounce"://Fix
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
            send_timeout = true;
            context.setTimeout(() => {send_timeout = false;}, 3000);
        }
        else{
            context.setTimeout(() => {archipelago_send_message(type,message);}, 3000);
        }
    }
    else{
        console.log("Receiving message. Will send once complete.");
        context.setTimeout(() => {archipelago_send_message(type,message);}, 3000);
    }
}

function ac_req(data) {//This is what we do when we receive a data packet
    var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
    var archipelagoPlayers: playerTuple[] = [];
    switch(data.cmd){
        case "RoomInfo":
            archipelago_settings.current_time = data.time;
            console.log("Archipelago Time has been set:");
            console.log(archipelago_settings.current_time);
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
                    console.log(data.slot_info);
                    console.log("Here's our players:");
                    console.log(archipelagoPlayers);
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
                console.log("Here's the games in the multiworld:");
                console.log(archipelago_settings.multiworld_games);

                if(!archipelago_init_received)
                Archipelago.SetImportedSettings(data.slot_data);
            }

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
                case "ItemSend":
                case "Hint":
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

            console.log("Received DataPackage, updating translation tables");

            function mergeObjects(target: { [key: string]: any }, source: { [key: string]: any }): void {
                for (const key in source) {
                    console.log(key);
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

            console.log(full_item_id_to_name);
            console.log(full_location_id_to_name);
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
            const players: string[] = context.getParkStorage().get("RCTRando.ArchipelagoPlayers");
            for(let i = 0; i < data.locations.length; i++){
                archipelago_locked_locations.push({LocationID: i, Item: full_item_id_to_name[data.locations[i][0]], ReceivingPlayer: players[data.locations[i][2] - 1][0]})
            }
            ArchipelagoSaveLocations(archipelago_locked_locations,[]);
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
        console.log("Looks like the Archipelago window isn't open.");
    }
    try {
        var window:Window = ui.getWindow("archipelago-locations");
        window.findWidget<LabelWidget>("label-Connected-to-server").text = "The Archipelago Client is {RED}not{WHITE} connected to the game!";
        console.log(archipelago_connected_to_server);
    }
    catch{
        console.log("Looks like the Archipelago Shop isn't open");
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
        console.log("Looks like the setup window isn't open.")
    }
    try{
        if(ui.getWindow("archipelago-locations").findWidget<LabelWidget>("label-Connected-to-server"))
        ui.getWindow("archipelago-locations").findWidget<LabelWidget>("label-Connected-to-server").text = "The Archipelago Client is connected to the game!";
    }
    catch{
        console.log("Looks like the unlock shop isn't open.");
    }
}

var connection = null;
function init_archipelago_connection() {
    console.log("Hello?");
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
