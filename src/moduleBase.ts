
abstract class ModuleBase {
    subscriptions=[];
    FirstEntry() {}
    AnyEntry() {}

    // settings and savestate management would be good here

    SubscribeEvent(event: HookType, callback: Function) {
        let s = context.subscribe(event, callback);
        this.subscriptions.push(s);
    }

    UnSubscribeEvents() {
        for(let i in this.subscriptions) {
            this.subscriptions[i].dispose();
        }
        this.subscriptions = [];
    }
}

var modules:ModuleBase[] = [];

function registerModule(module:ModuleBase) {
    console.log("registerModule", module.constructor.name);
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        if(m.constructor.name === module.constructor.name) {
            console.log("registerModule already found", module.constructor.name);
            return;
        }
    }
    modules.push(module);
}

function FirstEntry() {
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            console.log('FirstEntry(): ', m.constructor.name);
            setLocalSeed(m.constructor.name+' FirstEntry');
            m.FirstEntry();
        } catch(e) {
            printException('error in FirstEntry(): ' + m.constructor.name, e);
        }
    }
}

function AnyEntry() {
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            console.log('AnyEntry(): ', m.constructor.name);
            setLocalSeed(m.constructor.name+' AnyEntry');
            m.AnyEntry();
        } catch(e) {
            printException('error in AnyEntry(): ' + m.constructor.name, e);
        }
    }
}

function UnSubscribeEvents() {
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            console.log('UnSubscribeEvents(): ', m.constructor.name);
            m.UnSubscribeEvents();
        } catch(e) {
            printException('error in UnSubscribeEvents(): ', m.constructor.name);
        }
    }
}
