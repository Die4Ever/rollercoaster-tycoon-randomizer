/// <reference path="moduleBase.ts" />
/// <reference path="../../lib/openrct2.d.ts" />

class RCTRArchipelagoConnection extends ModuleBase {

    AnyEntry(): void {
        var self = this;
        if (!settings.rando_archipelago)
            return;
        init_archipelago_connection();
        
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelagoConnection());


function ac_req(data) {
    var Archipelago = GetModule("RCTRArchipelago") as RCTRArchipelago;
    console.log(data);
    var archipelagoPlayers = [];
    switch(data.cmd){
        case "RoomInfo":
            settings.archipelago_current_time = data.time;
            archipelago_send_message("Connect",{password: 8, name: "Colby"});
            break;
        case "Connected"://Packet stating player is connected to the Archipelago game
            archipelagoPlayers = [];
            console.log(data.players.length);
            for(let i=0; i<data.players.length; i++) {
                console.log("hi");
                //Create guest list populated with Player names
                archipelagoPlayers.push(data.players[i].alias);
            }
            context.getParkStorage().set("RCTRando.ArchipelagoPlayers",archipelagoPlayers);
            console.log(archipelagoPlayers);
            Archipelago.SetNames();
            context.getParkStorage().set("RCTRando.ArchipelagoHintPoints",data.hint_points);
            break;

        case "ConnectionRefused"://Packet stating an error has occured in connecting to the Archipelago game
            var errorMessage = "Archipelago Refused the connection with the following error(s):";
            for(let i = 0; i < data.errors.length; i++){
                errorMessage += data.errors[i];
            }
            archipelago_print_message(errorMessage);

        case "PrintJSON"://Packet with data to print to the screen
            archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as Array<string>);
            switch(data.type){
                case "ItemSend":
                    var itemMessage = archipelagoPlayers[(data.data[0].text) - 1];
                    itemMessage += data.data[1].text;
                    itemMessage += data.data[2].text;
                    itemMessage += data.data[3].text;
                    itemMessage += "You know what? Future Colby will figure out the rest when the actual Archipelago connection is working";
                    archipelago_print_message(itemMessage);
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

        case "DataPacket":
            var item_name_to_id = [];
            var location_name_to_id = [];
            for (let i = 0; i < data.data.length; i++){//Might be wrong. Take a look future Colby.
                item_name_to_id.push(data.data[i].games[1].item_name_to_id);
                location_name_to_id.push(data.data[i].games[i].location_name_to_id);
            }
            context.getParkStorage().set("RCTRando.ArchipelagoItemNameToID",item_name_to_id);
            context.getParkStorage().set("RCTRando.ArchipelagoLocationNameToID",location_name_to_id);
            break;

        case "Bounced":
            for(let i = 0; i < data.tags.length; i++){
                if(data.tags[i] == "DeathLink"){
                    const cause = data.data.cause;
                    const source = data.data.source;
                    Archipelago.ReceiveDeathLink({cause, source});
                    archipelago_print_message(cause);
                    break;
                }
            }
            break;

        case "InvalidPacket":
            console.log("Invalid Packet Error: " + data.type);
            console.log(data.text);
            break;

        case "ReceivedItems":
            Archipelago.ReceiveArchipelagoItem(data.list);
            break;

        case "LocationInfo":
            for(let i = 0; i < data.locations.length; i++){
                var locationMessage = "Your ";
                locationMessage += data.locations[i].item;
                locationMessage += " is at "
                locationMessage += data.locations[i].player;
                locationMessage += "'s ";
                locationMessage += data.locations[i].location;
                archipelago_print_message(locationMessage);
            }
    }
    return;
}

function init_archipelago_connection() {
    console.log("Hello?");
    //var connection = new APIConnection("Archipelago", 38280, ac_req);
    //connection.send({"password":"","game":"OpenRCT2","name":"Colby","items_handling":"0b011"})
}

function archipelago_print_message(message) {
    var messageLog = context.getParkStorage().get("RCTRando.MessageLog") as Array<any>;
    if(messageLog)
    messageLog.push(message);
    else
    messageLog = [message];
    context.getParkStorage().set("RCTRando.MessageLog", messageLog);
    var lockedWindow = ui.getWindow("archipelago-locations");
    if(lockedWindow)
    lockedWindow.findWidget<ListViewWidget>("message-list").items = messageLog;
    if(settings.archipelago_park_message_chat){
        park.postMessage(
            {type: 'blank', text: message} as ParkMessageDesc
        );
    }
    if(settings.archipelago_network_chat){
        network.sendMessage(message);

    }

    // var lockedWindow = ui.getWindow("archipelago-locations");
    // lockedWindow.findWidget<ListViewWidget>("locked-location-list").items = self.CreateLockedList();
}

function archipelago_send_message(type, message?) {
    switch(type){//Gotta fill these in as we improve crud
        case "Connect":
            console.log({cmd: "Connect", password: message.password, game: "OpenRCT2", name: message.name, uuid: message.name + ": OpenRCT2", version: {major: 0, minor: 4, build: 1}, item_handling: 0b111, tags: (settings.archipelago_deathlink) ? ["DeathLink"] : [], slot_data: true});
            break;
        case "ConnectUpdate":
            console.log({cmd: "ConnectUpdate", tags: (settings.archipelago_deathlink) ? ["DeathLink"] : []})
        case "Sync":
            console.log({cmd: "Synch"});
            break;
        case "LocationChecks":
            var checks = [];//List of unlocked locations
            for (let i = 0; i < message.length; i++){
                checks.push(message[i].LocationID + 2000000);//OpenRCT2 has reserved the item ID space starting at 2000000
            }
            console.log({cmd: "LocationChecks", locations: checks});
            break;
        // case "LocationScouts":
        //     break;
        case "StatusUpdate":
            console.log({cmd: "StatusUpdate", status: message});//CLIENT_UNKNOWN = 0; CLIENT_CONNECTED = 5; CLIENT_READY = 10; CLIENT_PLAYING = 20; CLIENT_GOAL = 30
            break;
        case "Say":
            console.log({cmd: "Say", text: message});
            break;
        case "GetDataPackage":
            break;
        case "Bounce":
            break;
        case "Get":
            break;
        case "Set":
            break;
        case "SetNotify":
            break;
    }
}