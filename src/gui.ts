
function NewWidget(widget) {
    var margin = 3;
    var window_width = 350 - margin*2;
    var start_y = 26;
    // 3 margins because left, right, and center
    let cellWidth = (window_width - margin * 3) / 2;
    let cellHeight = 26;

    widget.x *= cellWidth + margin;
    widget.x += margin;
    if(!widget.width)
        widget.width = 1;
    widget.width *= cellWidth;
    widget.y *= cellHeight + margin*2;// double margins for y
    widget.y += start_y;
    widget.height = cellHeight;

    return widget;
}

function NewLabel(label, desc) {
    // copy instead of reference
    desc = Object.assign({}, desc);
    desc.type = 'label';
    desc.name = 'label-' + desc.name;
    desc.x = 0;
    desc.text = label;
    desc.textAlign = 'centred';
    return NewWidget(desc);
}

function NewEdit(label, desc) {
    label = NewLabel(label, desc);
    desc.x = 1;
    desc.y -= 0.2;
    desc.type = 'textbox';
    let edit = NewWidget(desc);
    return [label, edit];
}

function NewDropdown(label, desc) {
    label = NewLabel(label, desc);
    desc.x = 1;
    desc.y -= 0.2;
    desc.type = 'dropdown';
    let dropdown = NewWidget(desc);
    return [label, dropdown];
}

function NewCheckbox(name, text, y, tooltip) {
    return NewWidget({
        type: 'checkbox',
        name: name,
        text: text,
        x: 0.5,
        y: y,
        width: 1,
        tooltip: tooltip,
        isChecked: true
    });
}


function startGameGui() {
    console.log('startGameGui()', globalseed);
    var ww = 350;
    var wh = 300;

    if (typeof ui === 'undefined') {
        console.log('startGameGui() ui is undefined');
        initRando();
        return;
    }

    initMenuItem();

    context.executeAction('pausetoggle', {});

    var window = ui.openWindow({
        classification: 'rando-settings',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel('https://discord.gg/jjfKT9nYDR', {
                name: 'url',
                y: 0,
                width: 2,
                tooltip: 'Join the Discord!'
            }),
            NewEdit('Seed:', {
                name: 'edit-seed',
                y: 1,
                text: ''+globalseed,
                tooltip: 'Enter a number'
            }),
            NewDropdown('Difficulty:', {
                name: 'difficulty',
                y: 2,
                items: Object.keys(difficulties),
                selectedIndex: 1,
                tooltip: 'Choose a difficulty for the randomization'
            }),
            NewDropdown('Scenario Length:', {
                name: 'length',
                y: 3,
                items: Object.keys(scenarioLengths),
                selectedIndex: 1,
                tooltip: 'Longer scenario length will also scale up the goals so that difficulty is maintained.'
            }),
            NewCheckbox('rando-ride-types', 'Randomize Ride Types', 4, 'Randomizes values such as inspectionInterval and intensity'),
            NewCheckbox('rando-park-flags', 'Randomize Park Flags', 5, 'Randomizes flags such as forbidMarketingCampaigns and preferMoreIntenseRides'),
            NewCheckbox('rando-park-values', 'Randomize Park Values', 6, 'Randomizes values such as starting cash, starting bank loan amount, maxBankLoan, and landPrice'),
            NewCheckbox('rando-goals', 'Randomize Goals', 7, 'Even when disabled, goals will still be scaled by Scenario Length'),
            [{
                type: 'button',
                name: 'ok-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26,
                width: 90,
                height: 26,
                text: 'Start Game',
                onClick: function() { window.close(); }
            }]
        ),
        onClose: function() {
            try {
                var s = window.findWidget('edit-seed');
                setGlobalSeed(s['text']);
                var d = window.findWidget('difficulty');
                difficulty = difficulties[d['text']];
                var l = window.findWidget('length');
                scenarioLength = scenarioLengths[l['text']];
                rando_ride_types = (window.findWidget('rando-ride-types') as CheckboxWidget).isChecked;
                rando_park_flags = (window.findWidget('rando-park-flags') as CheckboxWidget).isChecked;
                rando_park_values = (window.findWidget('rando-park-values') as CheckboxWidget).isChecked;
                rando_goals = (window.findWidget('rando-goals') as CheckboxWidget).isChecked;
                runNextTick(initRando);
                context.executeAction('pausetoggle', {});
            } catch(e) {
                printException('error in GUI onClose(): ', e);
            }
        }
    });
    return window;
}

function initMenuItem() {
    if (typeof ui !== 'undefined') {
        ui.registerMenuItem("RCTRando", createChangesWindow);
    }
}

function createChangesWindow() {
    var ww = 350;
    var wh = 300;

    var window = ui.openWindow({
        classification: 'rando-changes',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: ww,
        height: wh,
        widgets: [].concat(
            NewLabel('https://discord.gg/jjfKT9nYDR', {
                name: 'url',
                y: 0,
                width: 2,
                tooltip: 'Join the Discord!'
            }),
            NewLabel('List of things RCTRando has changed...', {
                name: 'label',
                y: 1,
                width: 2,
                tooltip: 'What\'s changed...'
            })
        )
    });
}