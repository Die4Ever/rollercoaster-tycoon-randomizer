
abstract class ModuleBase {
    subscriptions;
    settings;

    constructor() {
        this.subscriptions = [];
        this.settings = {enabled:true, changes:{}};
    }

    LoadSettings() {
        if(!settings[this.constructor.name]) {
            this.SaveSettings();
            return;
        };
        this.settings = settings[this.constructor.name];
    }

    SaveSettings() {
        settings[this.constructor.name] = this.settings;
        SaveSettings();
    }

    FirstEntry() {
        info(this.constructor.name, 'empty FirstEntry() function');
    }
    AnyEntry() {
        info(this.constructor.name, 'empty AnyEntry() function');
    }

    // settings and savestate management would be good here, need constructor

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

    AddChange(key, name, from, to, factor=null) {
        var obj = {name: name, from: from, to: to, factor: factor};
        info(this.constructor.name, 'AddChange', key, JSON.stringify(obj));

        this.settings.changes[key] = obj;
        this.SaveSettings();
    }

    RandomizeField(obj:Object, name:string, difficulty:number) {
        if(!obj[name]) return;

        const old = obj[name];
        let newVal = randomize(obj[name], difficulty);
        if(old != newVal) {
            obj[name] = newVal;
            this.AddChange(name, name, old, obj[name]);
        }
    }
}

var modules:ModuleBase[] = [];

function registerModule(module:ModuleBase) {
    info("registerModule", module.constructor.name);
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        if(m.constructor.name === module.constructor.name) {
            info("registerModule already found", module.constructor.name);
            return;
        }
    }
    modules.push(module);
}

function LoadSettings() {
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            info('LoadConfigs(): ', m.constructor.name);
            m.LoadSettings();
        } catch(e) {
            printException('error in LoadConfigs(): ' + m.constructor.name, e);
        }
    }
}

function FirstEntry() {
    LoadSettings();

    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            info('FirstEntry(): ', m.constructor.name, m.settings.enabled);
            // we don't retain the changes lists on new games
            m.settings['changes'] = {};
            m.SaveSettings();
            if(!m.settings.enabled) continue;
            setLocalSeed(m.constructor.name+' FirstEntry');
            m.FirstEntry();
        } catch(e) {
            printException('error in FirstEntry(): ' + m.constructor.name, e);
        }
    }

    AnyEntry(false);
}

function AnyEntry(bLoadSettings:boolean=true) {
    if(bLoadSettings) LoadSettings();

    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        try {
            info('AnyEntry(): ', m.constructor.name, m.settings.enabled);
            if(!m.settings.enabled) continue;
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
            info('UnSubscribeEvents(): ', m.constructor.name);
            m.UnSubscribeEvents();
        } catch(e) {
            printException('error in UnSubscribeEvents(): ', m.constructor.name);
        }
    }
}

function GetModule(classname:string): ModuleBase {
    for(var i=0; i<modules.length; i++) {
        const m = modules[i];
        if(classname === m.constructor.name) {
            return m;
        }
    }
    return null;
}
