
function initRando() {
    SaveSettings();
    console.log(rando_name+' v'+rando_version
        + ' starting with seed '+globalseed
        + ', api version '+context.apiVersion
        + ', difficulty: '+settings.difficulty
        + ', scenarioLength: '+settings.scenarioLength
    );

    try {
        FirstEntry();
        AnyEntry();
        if(settings.rando_crowdcontrol) {
            init_crowdcontrol();
        }
    } catch(e) {
        printException('error in initRando(): ', e);
    }
}

function SaveSettings() {
    try {
        let storage = context.getParkStorage();
        settings['version'] = rando_version;
        settings['seed'] = globalseed;
        for(let k in settings) {
            if(settings.hasOwnProperty(k))
                storage.set(k, settings[k]);
        }
        console.log('just saved data', JSON.stringify(storage.getAll()));

        context.sharedStorage.set('RCTRando.previous_settings', settings);
    } catch(e) {
        printException('error saving settings: ', e);
    }
}

function AddChange(key, name, from, to, factor=null) {
    var obj = {name: name, from: from, to: to, factor: factor};
    console.log('AddChange', key, JSON.stringify(obj));
    if(from === to && !factor) return;

    settings.rando_changes[key] = obj;
    context.getParkStorage().set("rando_changes", settings.rando_changes);
}

function RandomizeField(obj, name, difficulty) {
    if(!obj[name]) return;

    const old = obj[name];
    obj[name] = randomize(obj[name], difficulty);
    AddChange(name, name, old, obj[name]);
}
