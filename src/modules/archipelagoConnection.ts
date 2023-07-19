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
            break;

        case "PrintJSON"://Packet with data to print to the screen
            archipelagoPlayers = (context.getParkStorage().get("RCTRando.ArchipelagoPlayers") as Array<string>);
            switch(data.type){
                case "Goal":
                    archipelago_print_message(data.data[0].text);
                    let guests = map.getAllEntities("guest");
                    for(let i=0; i<(guests.length); i++){
                        if(guests[i].name == archipelagoPlayers[data.slot]){
                            guests[i].setFlag("joy", true);
                            break;
                        }
                    }
                    break;
                case "ItemSend":
                    
                    var message = archipelagoPlayers[(data.data[0].text) - 1];
                    message += data.data[1].text;
                    message += data.data[2].text;
                    message += "You know what? Future Colby will figure out the rest when the actual Archipelago connection is working";
                    archipelago_print_message(message);
                    break;
                default:
                    archipelago_print_message(data.data[0].text);
            }
            break;
        case "ReceivedItems":
            Archipelago.ReceiveArchipelagoItem(data.list);
            break;
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