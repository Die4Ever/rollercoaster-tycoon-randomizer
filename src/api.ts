
class APIConnection
{
    sock:Socket = null;
    good: boolean = false;
    connected: boolean = false;
    reconnect_interval: number = null;
    name:string = "API";
    port:number;
    callback:CallableFunction;
    errorCallback:CallableFunction;
    connectCallback:CallableFunction;
    onCloseCallback: (hadError: any) => void;
    onExpectedCloseCallback: (hadError: any) => void;
    onErrorCallback: (hadError: any) => void;
    onDataCallback: (hadError: any) => void;
    buffer:string = "";
    awaitingResponse:boolean = false;
    responseTimeout: number = null;
    sendQueue = [];

    constructor(name:string, port:number, callback:CallableFunction, errorCallback?:CallableFunction, connectCallback?:CallableFunction) {
        this.name = name;
        this.port = port;
        this.callback = callback;
        this.errorCallback = errorCallback;
        this.connectCallback = connectCallback;

        var self = this;
        this.onCloseCallback = function(hadError){self.onClose(hadError);};
        this.onExpectedCloseCallback = function(hadError){self.onExpectedClose(hadError);}
        this.onErrorCallback = function(hadError){self.onError(hadError);};
        this.onDataCallback = function(hadError){self.onData(hadError);};

        this.connect();
    }

    send(data:Object, awaitResponse:boolean) {
        try {
            let r: string = JSON.stringify(data) + '\0';

            if(this.awaitingResponse || !this.connected || this.sendQueue.length > 0) {
                info(this.name+' queuing:', r.length, r);
                this.sendQueue.push(r);
                this.sendQueue.push(awaitResponse);
            } else {
                info(this.name+' sending:', r.length, r);
                if(awaitResponse !== false) {
                    this._setAwaitResponse();
                }
                this.end(r);
            }
        } catch(e) {
            printException('error sending '+this.name, e);
        }
    }

    private _setAwaitResponse() {
        let self = this;
        this.awaitingResponse = true;
        this.responseTimeout = context.setTimeout(function() {
            self.responseTimeout = null;
            self._sendNext();
        }, 30000);
    }

    private _clearAwaitResponse() {
        if(this.responseTimeout) {
            context.clearTimeout(this.responseTimeout);
        }
        this.awaitingResponse = false;
    }

    private _sendNext() {
        try {
            this._clearAwaitResponse();

            if(!this.connected) return;

            let r:string = this.sendQueue.shift();
            let awaitResponse:boolean = this.sendQueue.shift();
            if(!r) return;
            info(this.name+' _sendNext() sending:', r.length, r);

            if(awaitResponse) {
                this._setAwaitResponse();
            }

            let success = this.end(r);
            if(!success) {
                this._clearAwaitResponse();
                this.sendQueue.unshift(r);
                this.sendQueue.unshift(awaitResponse);
            }
        } catch(e) {
            printException('error in _sendNext() '+this.name, e);
        }
    }

    private _checkSendQueue() {
        if(this.awaitingResponse) return;
        this._sendNext();
    }

    private destroy() {
        this.connected = false;
        if(!this.sock) {
            return;
        }

        info(this.name+'.destroy()');
        try {
            this.sock.off('close', this.onCloseCallback);
        } catch(e) {
            printException('error closing event handlers in '+this.name+'.close', e);
        }

        try {
            this.sock.off('close', this.onExpectedCloseCallback);
        } catch(e) {
            printException('error closing event handlers in '+this.name+'.close', e);
        }

        try {
            this.sock.destroy(null);
        } catch(e) {
            printException('error destroying old '+this.name+' connection ', e);
        }

        this.sock = null;
    }

    private onError(hadError: boolean) {
        this.connected = false;
        info('error in '+this.name+' connection, will keep trying...');
        if(this.good) {
            park.postMessage(
                {type: 'blank', text: 'error in '+this.name+' connection, will keep trying...'} as ParkMessageDesc
            );
        }
        if(this.errorCallback) {
            this.errorCallback();
        }
        this.good = false;
        this.connect();
    }

    private onClose(hadError: boolean) {
        this.connected = false;
        info(this.name+' connection closed, will keep trying...');
        if(this.good) {
            park.postMessage(
                {type: 'blank', text: this.name+' connection closed, will keep trying...'} as ParkMessageDesc
            );
        }
        this.good = false;
        this.connect();
    }

    private onExpectedClose(hadError: boolean) {
        this.connected = false;
        info(this.name+' connection closed cc_onExpectedClose, will keep trying...');
        this.good = true;
        this.connect();
    }

    private reconnect() {
        this.connected = false;
        debug(this.name+' reconnecting...');
        this.connect();
    }

    private onData(message: string) {
        let data: Object = null;
        let resp: Object = null;
        let success: boolean = false;

        let packets = message.split('\0');

        info("OnDataReceived " + message.length + ", Buffer:" + this.buffer.length + ", packets.length:" + packets.length);

        for(let i=0; i<packets.length; i++) {
            let message = packets[i];
            resp = null;
            if(message.length == 0) continue;

            try {
                data = JSON.parse(message);
                this.buffer = "";
            } catch(e) {
                try {
                    this.buffer += message;
                    data = JSON.parse(this.buffer);
                    this.buffer = "";
                }
                catch(e) {
                    //printException('error parsing '+this.name, e);//+' request JSON: ' + this.buffer, e);
                    continue;
                }
            }

            try {
                info(this.name+" received data: ", JSON.stringify(data));
                success = true;
                resp = this.callback(data);
            } catch(e) {
                printException('error handling '+this.name+' request: ' + message, e);
            }

            if(resp) {
                this.send(resp, false);
            }
        }

        if(success) {
            this._sendNext();
        }
    }

    private reset_timeout() {
        if(this.reconnect_interval !== null) {
            context.clearInterval(this.reconnect_interval);
            this.reconnect_interval = null;
        }

        //this.reconnect_interval = context.setInterval(this.end, 5000);
    }

    private end(data:string) {
        this.connected = false;
        if(!this.sock) return false;

        info(this.name+'.end('+data.length+')');
        try {
            this.sock.off('close', this.onCloseCallback);
            this.sock.on('close', this.onExpectedCloseCallback);
        } catch(e) {
            printException('error closing event handlers in '+this.name+'.close', e);
        }

        try {
            //info(this.name+'.sock.end('+data+')');
            this.sock.end(data);
        } catch(e) {
            printException('error closing old '+this.name+' connection ', e);
        }

        try {
            let oldSock = this.sock;
            this.sock = null;
            oldSock.destroy(null);
        } catch(e) {
            printException('error destroying old '+this.name+' connection ', e);
        }

        if(!this.sock) {
            info(this.name+'.end destroy failed? calling connect', this.sock);
            this.connect();
            return false;
        }

        this.reset_timeout();
        this.good = true;
        return true;
    }

    private connect() {
        var self = this;

        if (network.mode == "server") {
            //info("This is a server...");
        } else if (network.mode == "client") {
            //info("This is a client...");
            return;
        } else {
            //info("This is single player...");
        }

        this.reset_timeout();
        this.destroy();

        info(this.name+'.connect');
        this.sock = network.createSocket();

        this.sock.connect(this.port, '127.0.0.1', function() {
            self.connected = true;
            if(!self.good) {
                info(self.name+' connected to port '+self.port);
                park.postMessage(
                    {type: 'blank', text: self.name+' connected!'} as ParkMessageDesc
                );
                if(self.connectCallback) {
                    self.connectCallback();
                }
            }
            self.good = true;
            self._checkSendQueue();
        });
        this.sock.setNoDelay(true);

        this.sock.on('error', this.onErrorCallback);
        this.sock.on('close', this.onCloseCallback);
        this.sock.on('data', this.onDataCallback);
    }
}
