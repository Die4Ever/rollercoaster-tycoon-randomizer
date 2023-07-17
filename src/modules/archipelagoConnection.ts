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
    switch(data.cmd){
        case "Connected"://Packet stating player is connected to the Archipelago game
            var archipelagoPlayers = [];
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
            console.log(data.data[0].text);
            network.sendMessage(data.data[0].text);
            // if(data.type == "Goal"){
            //     var archipelagoPlayers = context.getParkStorage().get("RCTRando.ArchipelagoPlayers",archipelagoPlayers);
            //     for (let i = 0; i<archipelagoPlayers.length; i++){
            //         if(data.)
            //     }
            // }
            break;
        case "ReceivedItems":
            Archipelago.ReceiveArchipelagoItem(data.list);
    }
    return;
}

function init_archipelago_connection() {
    console.log("Hello?");
    //var connection = new APIConnection("Archipelago", 38280, ac_req);
    //connection.send({"password":"","game":"OpenRCT2","name":"Colby","items_handling":"0b011"})
}