
// called after new game window
function initRando() {
    global_settings.last_used_settings = settings;
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
        if(settings.rando_crowdcontrol) {
            init_crowdcontrol();
        }
    } catch(e) {
        printException('error in initRando(): ', e);
    }
}

function SaveSettings() {
    try {
        settings['version'] = rando_version;
        settings['seed'] = globalseed;
        context.getParkStorage().set('RCTRando.settings', settings);
        debug('just saved data', JSON.stringify(settings));
    } catch(e) {
        printException('error saving settings: ', e);
    }
}
