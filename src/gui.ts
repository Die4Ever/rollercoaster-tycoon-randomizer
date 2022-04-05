
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

    PauseGame();

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
                // we need to unpause the game in order for the next tick to run
                var wasPaused = UnpauseGame();
                runNextTick(function() {
                    initRando();
                    if(wasPaused.wasPaused) {
                        // we know the game is currently unpaused because we're inside a tick event
                        // so we don't need the fancy PauseGame function
                        context.executeAction('pausetoggle', {});
                    }
                });
            } catch(e) {
                printException('error in GUI onClose(): ', e);
            }
        }
    });
    return window;
}

function initMenuItem() {
    if (typeof ui !== 'undefined') {
        ui.registerMenuItem("RCTRando Changes", createChangesWindow);
    }
}

function numberWithCommas(x, isMoney:boolean = false) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if(isMoney && parts.length > 1 && parts[1].length == 1)
        parts[1] += '0';
    return parts.join(".");
}

function getChangesList(widget) {
    let ret = [];
    let rides = [];
    for(var i in changes) {
        let c = changes[i];
        let str:string;

        if(c.factor) {
            let factor = c.factor;
            factor = Math.round( factor * 100 + Number.EPSILON ) / 100;
            str = c.name+' '+factor+'x';
        } else {
            let isMoney:boolean = i in {'bankLoan':1, 'maxBankLoan':1, 'cash':1, 'constructionRightsPrice':1, 'landPrice':1};
            let isBool:boolean = (typeof(c.from) === 'boolean' && typeof(c.to) === 'boolean');
            console.log(i, isMoney, isBool);

            let from = c.from;
            let to = c.to;
            if(isMoney) {
                from /= 10;
                to /= 10;
            }
            from = numberWithCommas(from, isMoney);
            to = numberWithCommas(to, isMoney);

            if(isBool && to)
                str = c.name+' enabled';
            else if(isBool)
                str = c.name+' disabled';
            else
                str = c.name+' changed from '+from+' to '+to;
        }
        if(i.startsWith('ride:'))
            rides.push(str);
        else
            ret.push(str);
    }
    ret.sort();
    rides.sort();
    if(rides.length > 0) {
        ret.push('Rides: (only 1 listed per type)');
        ret = ret.concat(rides);
    }

    if(!widget) return ret;
    if(widget.items.length != ret.length) {
        widget.items = ret;
        return ret;
    }
    var match = true;
    for(var i in ret) {
        if(widget.items[i][0] !== ret[i]) {
            match = false;
            break;
        }
    }
    if(!match)
        widget.items = ret;
    return ret;
}

function createChangesWindow() {
    var ww = 400;
    var wh = 350;

    let changes_list:ListViewWidget;

    let ticker = context.setInterval(function() {
        getChangesList(changes_list);
    }, 1000);

    var window = ui.openWindow({
        classification: 'rando-changes',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: ww,
        height: wh,
        widgets: [{
                type: 'listview',
                name: 'changes-list',
                x: 0,
                y: 13,
                width: ww-1,
                height: wh-13,
                scrollbars: "vertical",
                isStriped: true,
                items: getChangesList(null)
        }],
        onClose: function() {
            context.clearInterval(ticker);
        }
    });

    changes_list = window.findWidget('changes-list') as ListViewWidget;
}
