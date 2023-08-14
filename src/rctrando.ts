
function loadedGame(savedData) {
    setGlobalSeed(savedData.seed);
    info("restored saved seed "+globalseed, JSON.stringify(savedData));
    for(let k in savedData) {
        settings[k] = savedData[k];
    }
    //startGameGui();// just for testing
    initMenuItems();
    if(global_settings.enabled===false) {
        return;
    }
    global_settings.enabled = true;
    //createChangesWindow(); FUTURE COLBY: UNCOMMENT THIS LINE!
    AnyEntry();
}

function newGame() {
    // use for headless? saves in your %USERPROFILE%\Documents\OpenRCT2\plugin.store.json
    var nextSeed = context.sharedStorage.get('RCTRando.nextSeed');
    info("nextSeed was", nextSeed);
    if(nextSeed) {
        setGlobalSeed(nextSeed);
    } else {
        setGlobalSeed(context.getRandom(1, 999999 + 1));

        if(global_settings.reuse_seed && global_settings.last_used_settings['seed']) {
            setGlobalSeed(global_settings.last_used_settings['seed']);
        }
    }
    context.sharedStorage.set("RCTRando.nextSeed", null);

    if(global_settings.enabled===false) {
        initMenuItems();
        return;
    }
    global_settings.enabled = true;
    if(global_settings.reuse_settings) {
        var last = DeepCopy(global_settings.last_used_settings);
        for(var k in last) {
            if(k==='seed' || k==='rando_version' || k==='version' || k==='changes' || k==='transient') continue;
            settings[k] = last[k];
        }
    }
    // if Archipelago was enabled, disable that until the user selects it
    settings.rando_archipelago = false;
    // pause game and open menu
    startGameGui();
}

function SaveGlobalSettings() {
    context.sharedStorage.set('RCTRando.global_settings', global_settings);
}

function EnableDisableRando(enabled:boolean) {
    global_settings.enabled = enabled;
    info(global_settings.enabled ? 'Enabling' : 'Disabling');
    SaveGlobalSettings();
    if(global_settings.enabled) {
        main();
    } else {
        UnSubscribeEvents();
    }
}

function EnableDisableAutoPause(enabled:boolean) {
    global_settings.auto_pause = enabled;
    SaveGlobalSettings();
}

function EnableDisableReuseSeed(enabled:boolean) {
    global_settings.reuse_seed = enabled;
    SaveGlobalSettings();
}

// called after new game window
function initRando() {
    global_settings.last_used_settings = DeepCopy(settings);
    global_settings.last_used_settings['seed'] = globalseed;
    SaveGlobalSettings();
    SaveSettings();
    info(rando_name+' v'+rando_version
        + ' starting with seed '+globalseed
        + ', api version '+context.apiVersion
        + ', difficulty: '+settings.difficulty
        + ', scenarioLength: '+settings.scenarioLength
    );

    try {
        FirstEntry();
    } catch(e) {
        printException('error in initRando(): ', e);
    }
}

function SaveSettings() {
    try {
        settings['rando_version'] = rando_version;
        settings['seed'] = globalseed;
        context.getParkStorage().set('RCTRando.settings', settings);
        debug('just saved data', JSON.stringify(settings));
    } catch(e) {
        printException('error saving settings: ', e);
    }
}

function ArchipelagoSaveLocations(LockedLocations, UnlockedLocations) {
    try {
        archipelago_send_message("LocationChecks", UnlockedLocations);
        context.getParkStorage().set('RCTRando.ArchipelagoLockedLocations', LockedLocations);
        context.getParkStorage().set('RCTRando.ArchipelagoUnlockedLocations', UnlockedLocations);
        console.log("Location lists updated!");
    } catch(e) {
        printException('error in ArchipelagoSaveLocations: ', e);
    }
}