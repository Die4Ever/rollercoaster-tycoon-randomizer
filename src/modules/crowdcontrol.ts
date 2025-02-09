/// <reference path="../OpenRCT2-CrowdControl/CCHandlers.ts" />
/// <reference path="moduleBase.ts" />

class RCTRCrowdControl extends ModuleBase {
    AnyEntry(): void {
        if(settings.rando_crowdcontrol) {
            init_crowdcontrol();
        }
    }
}

registerModule(new RCTRCrowdControl());

function cc_req(data) {
    return { id: data.id, status: handle(data) };
}

function init_crowdcontrol() {
    var connection = new APIConnection("Crowd Control", 43385, cc_req);

    //Handle renames as guests enter the park
    context.subscribe("guest.generation", (e) => {
        if (peepQueue.length == 0) return;
        const guest = map.getEntity(e.id);
        if (guest != null && guest.type == "guest") {
            context.executeAction("guestsetname", {
                peep: guest.id,
                name: peepQueue[0]
            }, noop);

            park.postMessage({
                type: "peep",
                text: peepQueue[0] + " has entered the park!",
                subject: guest.id
            });

            peepQueue.shift();
        }
    });

    context.registerAction("guestSetColor", (args: any) => {
        return {};
    }, (args: any) => {
        const guests = map.getAllEntities("guest");
        const color = args.color;
        for (let i = 0; i < guests.length; i++) {
            const guest:Guest = guests[i];
            guest.tshirtColour = color;
            guest.trousersColour = color;
        }
        return {};
    });

    context.registerAction("guestAddMoney", (args: any) => {
        return {}
    }, (args: any) => {
        const guests = map.getAllEntities("guest");
        for (let i = 0; i < guests.length; i++) {
            const guest:Guest = guests[i];
            let cash = guest.cash + args.money;
            if (cash < 0) {
                cash = 0;
            } else if (cash > 1000) {
                cash = 1000;
            }
            guest.cash = cash;
        }
        return {};
    });

    context.registerAction("killPlants", (args: any) => { return {} }, (args: any) => {
        for (let y = 0; y < map.size.y; y++) {
            for (let x = 0; x < map.size.x; x++) {
                const tile = map.getTile(x, y);
                for (var i = 0; i < tile.numElements; i++) {
                    const element = tile.getElement(i);
                    if (element.type == "small_scenery") {
                        (element as SmallSceneryElement).age = 100;
                    }
                }
            }
        }
        return {};
    });

    context.registerAction("breakThings", (args: any) => { return {} }, (args: any) => {
        for (let y = 0; y < map.size.y; y++) {
            for (let x = 0; x < map.size.x; x++) {
                const tile = map.getTile(x, y);
                for (var i = 0; i < tile.numElements; i++) {
                    const element = tile.getElement(i);
                    if (element.type == "footpath") {
                        (element as FootpathElement).isAdditionBroken = (context.getRandom(0, 10) == 0);
                    }
                }
            }
        }
        return {};
    });
}
