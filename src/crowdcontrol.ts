
let cc_sock: Socket = null;
let cc_good: boolean = false;

function cc_onError(hadError: boolean) {
    console.log('error in Crowd Control connection, attempting to reconnect');
    if(cc_good) {
        park.postMessage(
            {type: 'blank', text: 'error in Crowd Control connection, attempting to reconnect'} as ParkMessageDesc
        );
    }
    cc_good = false;
    cc_connect();
}

function cc_onClose(hadError: boolean) {
    console.log('Crowd Control connection closed, attempting to reconnect');
    if(cc_good) {
        park.postMessage(
            {type: 'blank', text: 'Crowd Control connection closed, attempting to reconnect'} as ParkMessageDesc
        );
    }
    cc_good = false;
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
        console.log("Crowd Control received data: ", data);
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
        console.log(message, r.length, r);
        cc_sock.end(r);
        cc_connect();
    } catch(e) {
        printException('error sending Crowd Control response to: ' + message, e);
    }
}

function cc_connect() {
    if(cc_sock) { 
        cc_sock.off('error', cc_onError);
        cc_sock.off('close', cc_onClose);
        cc_sock.destroy(null);
    }

    cc_sock = network.createSocket();

    cc_sock.connect(43385, '127.0.0.1', function() {
        console.log('Crowd Control connected!');
        if(!cc_good) {
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
}

function cc_req(data) {
    const Success = 0;
    const Failed = 1;
    const NotAvail = 2;
    const TempFail = 3;

    park.postMessage(
        {type: 'blank', text: data.viewer + ' used ' + data.code} as ParkMessageDesc
    );

    return { id: data.id, status: Success };
}
