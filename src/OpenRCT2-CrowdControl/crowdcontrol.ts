/// <reference path="CCHandlers.ts" />

let cc_sock: Socket = null;
let cc_good: boolean = false;
let cc_reconnect_interval: number = null;

function cc_onError(hadError: boolean) {
    info('error in Crowd Control connection, will keep trying...');
    if(cc_good) {
        park.postMessage(
            {type: 'blank', text: 'error in Crowd Control connection, will keep trying...'} as ParkMessageDesc
        );
    }
    cc_good = false;
    cc_connect();
}

function cc_onClose(hadError: boolean) {
    info('Crowd Control connection closed, will keep trying...');
    if(cc_good) {
        park.postMessage(
            {type: 'blank', text: 'Crowd Control connection closed, will keep trying...'} as ParkMessageDesc
        );
    }
    cc_good = false;
    cc_connect();
}

function cc_onExpectedClose(hadError: boolean) {
    info('Crowd Control connection closed cc_onExpectedClose, will keep trying...');
    cc_good = true;
    cc_connect();
}

function cc_reconnect() {
    //info('Crowd Control reconnecting...');
    cc_connect();
}

function cc_onData(message: string) {
    let data: Object = null;
    let resp: Object = null;

    try {
        // chop off the null-terminator
        while(message[message.length-1] == '\0')
            message = message.substring(0, message.length-1);
        data = JSON.parse(message);
        info("Crowd Control received data: ", data);
    } catch(e) {
        printException('error parsing Crowd Control request JSON: ' + message, e);
    }

    try {
        resp = cc_req(data);
    } catch(e) {
        printException('error handling Crowd Control request: ' + message, e);
    }

    try {
        let r: string = JSON.stringify(resp) + '\0';
        info(message, r.length, r);
        cc_end(r);
    } catch(e) {
        printException('error sending Crowd Control response to: ' + message, e);
    }
}

function cc_reset_timeout() {
    if(cc_reconnect_interval !== null) {
        context.clearInterval(cc_reconnect_interval);
        cc_reconnect_interval = null;
    }

    //cc_reconnect_interval = context.setInterval(cc_end, 5000);
}

function cc_end(data?:string) {
    if(!cc_sock) return;

    info('cc_end()');
    try {
        cc_sock.off('close', cc_onClose);
        cc_sock.on('close', cc_onExpectedClose);
    } catch(e) {
        printException('error closing event handlers in cc_close', e);
    }

    try {
        data = data ? data : '{"id": 0, "status": 0}\0';
        info('cc_sock.end('+data+')');
        cc_sock.end(data);
    } catch(e) {
        printException('error closing old Crowd Control connection ', e);
    }

    try {
        cc_sock.destroy(null);
    } catch(e) {
        printException('error destroying old Crowd Control connection ', e);
    }

    cc_reset_timeout();
    cc_good = true;
}

function cc_destroy() {
    if(!cc_sock) return;

    info('cc_destroy()');
    try {
        cc_sock.off('close', cc_onClose);
    } catch(e) {
        printException('error closing event handlers in cc_close', e);
    }

    try {
        cc_sock.off('close', cc_onExpectedClose);
    } catch(e) {
        printException('error closing event handlers in cc_close', e);
    }

    try {
        cc_sock.destroy(null);
    } catch(e) {
        printException('error destroying old Crowd Control connection ', e);
    }

    cc_sock = null;
}

function cc_connect() {
    if (network.mode == "server") {
        //info("This is a server...");
    } else if (network.mode == "client") {
        //info("This is a client...");
        return;
    } else {
        //info("This is single player...");
    }

    cc_reset_timeout();
    cc_destroy();

    info('cc_connect');
    cc_sock = network.createSocket();

    cc_sock.connect(43385, '127.0.0.1', function() {
        if(!cc_good) {
            info('Crowd Control connected!');
            park.postMessage(
                {type: 'blank', text: 'Crowd Control connected!'} as ParkMessageDesc
            );
        }
        cc_good = true;
    });
    cc_sock.setNoDelay(true);

    cc_sock.on('error', cc_onError);
    cc_sock.on('close', cc_onClose);
    cc_sock.on('data', cc_onData);
}

function init_crowdcontrol() {
    cc_connect();

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

function cc_req(data) {
    return { id: data.id, status: handle(data) };
}
