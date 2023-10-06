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


function ac_req(data) {
    var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
    // console.log(data);
    var archipelagoPlayers: string[] = [];
    switch(data.cmd){
        case "RoomInfo":
            archipelago_settings.current_time = data.time;
            console.log("Archipelago Time has been set:");
            console.log(archipelago_settings.current_time);
            // archipelago_send_message("Connect",{password: 8, name: "Colby"});
            break;
        case "Connected"://Packet stating player is connected to the Archipelago game
            archipelagoPlayers = [];
            var multiworld_games = []
            for(let i=0; i<data.players.length; i++) {
                //Create guest list populated with Player names
                archipelagoPlayers.push(data.players[i][2]);
                multiworld_games.push(data.slot_info[i + 1][1]);
            }
            console.log(data.slot_info);
            console.log("Here's our players:");
            console.log(archipelagoPlayers);
            context.getParkStorage().set("RCTRando.ArchipelagoPlayers",archipelagoPlayers);
            Archipelago.SetNames();
            context.getParkStorage().set("RCTRando.ArchipelagoHintPoints",data.hint_points);
            
            archipelago_settings.multiworld_games = multiworld_games;
            console.log("Here's the games in the multiworld:");
            console.log(archipelago_settings.multiworld_games);

            if(!archipelago_init_received)
            Archipelago.SetImportedSettings(data.slot_data);
            break;

        case "ConnectionRefused"://Packet stating an error has occured in connecting to the Archipelago game
            var errorMessage = "Archipelago Refused the connection with the following error(s):";
            for(let i = 0; i < data.errors.length; i++){
                errorMessage += data.errors[i];
            }
            archipelago_print_message(errorMessage);
            break;

        case "PrintJSON"://Packet with data to print to the screen
            archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as Array<string>);
            switch(data.type){
                case "ItemSend":
                    let message = "";
                    for (let i = 0; i < data.data.length; i++){
                        let color = "";
                        if(data.data[i].color){
                            switch(data.data[i].color){
                                case "black":
                                    color = "BLACK";
                                    break;
                                case "red":
                                    color = "RED"
                                    break;
                                case "green":
                                    color = "GREEN"
                                    break;
                                case "yellow":
                                    color = "YELLOW";
                                    break;
                                case "blue":
                                case "cyan":
                                case "slateblue":
                                    color = "BABYBLUE";
                                    break;
                                case "magenta":
                                case "plum":
                                    color = "PALELAVENDER";
                                    break;
                                case "white":
                                    color = "WHITE";
                                    break;
                            }
                            message += '{' + color + '}' + data.data[i].text + '{WHITE}';
                        }
                        else{
                            message += data.data[i].text;
                        }
                    }
                    console.log(message);
                    archipelago_print_message(message);
                    break;

                case "ItemCheat":
                    var cheatMessage = "Colby will write out code to figure out how cheats work when he gets the proxy client";
                    archipelago_print_message(cheatMessage);
                    break;

                case "Hint":
                    var hintMessage = "Colby has a lot to do when he gets the proxy";
                    archipelago_print_message(hintMessage);
                    break;

                case "Goal":
                    archipelago_print_message(data.data[0].text);
                    let guests = map.getAllEntities("guest");
                    for(let i=0; i<(guests.length); i++){
                        if(guests[i].name == archipelagoPlayers[data.slot - 1]){
                            guests[i].setFlag("joy", true);
                            break;
                        }
                    }
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

            console.log("Received DataPackage, setting translation tables");

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

            full_item_id_to_name = item_id_to_name;
            full_location_id_to_name = location_id_to_name;

            context.getParkStorage().set("RCTRando.ArchipelagoItemIDToName",full_item_id_to_name);
            context.getParkStorage().set("RCTRando.ArchipelagoLocationIDToName",full_location_id_to_name);

            console.log(full_item_id_to_name);
            console.log(full_location_id_to_name);
            break;

        case "Bounced":
            if(data.tags){
                for(let i = 0; i < data.tags.length; i++){
                    if(data.tags[i] == "DeathLink"){
                        const cause = data.data.cause;
                        const source = data.data.source;
                        Archipelago.ReceiveDeathLink({cause, source});
                        archipelago_print_message(cause);
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
                archipelago_locked_locations.push({LocationID: i, Item: full_item_id_to_name[data.locations[i][0]], ReceivingPlayer: players[data.locations[i][2] - 1]})
            }
            ArchipelagoSaveLocations(archipelago_locked_locations,[]);
    }
    return;
}
var connection = null;
function init_archipelago_connection() {
    console.log("Hello?");
    connection = new APIConnection("Archipelago", 38280, ac_req);
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

function archipelago_send_message(type: string, message?: any) {
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
            console.log({cmd: "StatusUpdate", status: message});//CLIENT_UNKNOWN = 0; CLIENT_CONNECTED = 5; CLIENT_READY = 10; CLIENT_PLAYING = 20; CLIENT_GOAL = 30
            break;
        case "Say":
            console.log({cmd: "Say", text: message});
            connection.send({cmd: "Say", text: message});
            break;
        case "GetDataPackage":
            connection.send({cmd: "GetDataPackage", games: archipelago_settings.multiworld_games});
            break;
        case "Bounce":
            if(message.tag == "DeathLink"){
                connection.send({cmd: "Bounce", tags: ["DeathLink"], data: {time: Math.round(+new Date()/1000), cause: message.ride + " has crashed!", source: "Colby"}});
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