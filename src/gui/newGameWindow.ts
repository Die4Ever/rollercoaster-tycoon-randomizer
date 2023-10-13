
function startGameGui() {
    info('startGameGui()', globalseed);
    var ww = 350;
    var wh = 350;

    if (typeof ui === 'undefined') {
        info('startGameGui() ui is undefined');
        initRando();
        return null;
    }

    if(global_settings.auto_pause) {
        PauseGame();
    }

    let y = 0;

    var onStart = function(window) {
        if(settings.rando_archipelago === true) {
            return;
        }
        var s = window.findWidget('edit-seed');
        setGlobalSeed(s['text']);
        var d = window.findWidget('difficulty');
        settings.difficulty = difficulties[d['text']];
        var r = window.findWidget('range');
        settings.rando_range = randoRanges[r['text']];
        var l = window.findWidget('length');
        settings.scenarioLength = scenarioLengths[l['text']];
        settings.rando_ride_types = (window.findWidget('rando-ride-types') as CheckboxWidget).isChecked;
        settings.rando_park_flags = (window.findWidget('rando-park-flags') as CheckboxWidget).isChecked;
        settings.rando_park_values = (window.findWidget('rando-park-values') as CheckboxWidget).isChecked;
        settings.rando_goals = (window.findWidget('rando-goals') as CheckboxWidget).isChecked;
        settings.rando_research = (window.findWidget('rando-research') as CheckboxWidget).isChecked;
        settings.rando_crowdcontrol = (window.findWidget('rando-crowdcontrol') as CheckboxWidget).isChecked;
        var cycle = window.findWidget('reroll-frequency');
        settings.num_months_cycle = randoCycles[cycle['text']];

        // we need to unpause the game in order for the next tick to run
        var wasPaused = UnpauseGame();
        runNextTick(function() {
            initRando();
            if(wasPaused.wasPaused && global_settings.auto_pause) {
                // we know the game is currently unpaused because we're inside a tick event
                // so we don't need the fancy PauseGame function
                context.executeAction('pausetoggle', {});
            }
            createChangesWindow();
        });
    };

    var window = ui.openWindow({
        classification: 'rando-settings',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel('Mods4Ever.com/discord', {
                name: 'url',
                y: y++,
                width: 2,
                tooltip: 'Join the Discord!'
            }),
            NewEdit('Seed:', {
                name: 'edit-seed',
                y: y++,
                text: ''+globalseed,
                tooltip: 'Enter a number'
            }),
            NewDropdown('Difficulty:', {
                name: 'difficulty',
                y: y++,
                items: Object.keys(difficulties),
                selectedIndex: GetSelectedIndex(difficulties, settings.difficulty),
                tooltip: 'Choose a difficulty for the randomization'
            }),
            NewDropdown('Randomization Range:', {
                name: 'range',
                y: y++,
                items: Object.keys(randoRanges),
                selectedIndex: GetSelectedIndex(randoRanges, settings.rando_range),
                tooltip: 'The range/spread of randomized values.'
            }),
            NewDropdown('Scenario Length:', {
                name: 'length',
                y: y++,
                items: Object.keys(scenarioLengths),
                selectedIndex: GetSelectedIndex(scenarioLengths, settings.scenarioLength),
                tooltip: 'Longer scenario length will also scale up the goals so that difficulty is maintained.'
            }),
            NewDropdown('Ride Type Stat Re-rolls:', {
                name: 'reroll-frequency',
                y: y++,
                items: Object.keys(randoCycles),
                selectedIndex: GetSelectedIndex(randoCycles, settings.num_months_cycle),
                tooltip: 'How often to rerandomize the stats for ride types. Build the Theme Park of Theseus.'
            }),
            NewCheckbox('rando-ride-types', 'Randomize Ride Types', 0, y, 'Randomizes values such as excitement, intensity, and runningCost', settings.rando_ride_types),
            NewCheckbox('rando-park-flags', 'Randomize Park Rules', 1, y++, 'Randomizes flags such as forbidMarketingCampaigns and preferMoreIntenseRides', settings.rando_park_flags),
            NewCheckbox('rando-park-values', 'Randomize Park Values', 0, y, 'Randomizes values such as starting cash, starting bank loan amount, maxBankLoan, and landPrice', settings.rando_park_values),
            NewCheckbox('rando-goals', 'Randomize Goals', 1, y++, 'Even when disabled, goals will still be scaled by Scenario Length', settings.rando_goals),
            //NewCheckbox('rando-scouting', 'Free Scouting', 1, y++, 'Enable this to get ride type stats added to the changes window before placing a track', settings.rando_scouting),
            NewCheckbox('rando-research', 'Shuffle Research Order', 0, y++, 'Shuffles the order of things that get researched.', settings.rando_research),
            NewCheckbox('rando-crowdcontrol', 'Enable Crowd Control', 0, y++, 'Let your viewers mess with your game! Visit https://crowdcontrol.live/ for info', settings.rando_crowdcontrol),
            [{
                type: 'button',
                name: 'cancel-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26 - 29,
                width: 90,
                height: 26,
                text: 'Disable Rando',
                onClick: function() {
                    EnableDisableRando(false);
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'ok-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26,
                width: 90,
                height: 26,
                text: 'Start Game',
                onClick: function() {
                    window.close();
                }
            },
            {
                type: 'button',
                name: 'archipelago-button',
                x: ww - 90 - 88 - 6,
                y: wh - 6 - 26 - 29,
                width: 85,
                height: 26,
                text: 'Archipelago',
                tooltip: 'Prepares this park to connect to a game of Archipelago',
                onClick: function() {
                    init_archipelago_connection();
                    archipelagoGui();
                    settings.rando_archipelago = true;
                    window.close();
                }
            }]
        ),
        onClose: function() {
            try {
                if(global_settings.enabled)
                    onStart(window);
            } catch(e) {
                printException('error in GUI onClick(): ', e);
            }
        }
    });

    initMenuItems();
    return window;
}
