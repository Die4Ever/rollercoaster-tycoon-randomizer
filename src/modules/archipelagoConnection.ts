/// <reference path="moduleBase.ts" />

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
    console.log("Henlo!?");
    console.log(data);
    return {"cmd":"connect","password":"","game":"OpenRCT2","name":"Colby","items_handling":"0b011"};
}

function init_archipelago_connection() {
    console.log("Hello?");
    var connection = new APIConnection("Archipelago", 38280, ac_req);
    //connection.send({"password":"","game":"OpenRCT2","name":"Colby","items_handling":"0b011"})
}