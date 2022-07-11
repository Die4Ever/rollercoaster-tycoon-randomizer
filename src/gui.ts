
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

function NewCheckbox(name:string, text:string, x:number, y:number, tooltip:string, checked?:boolean) {
    return NewWidget({
        type: 'checkbox',
        name: name,
        text: text,
        x: x + 0.1,
        y: y,
        width: 1,
        tooltip: tooltip,
        isChecked: (checked === undefined) ? true : checked
    });
}


function startGameGui() {
    console.log('startGameGui()', globalseed);
    var ww = 350;
    var wh = 350;

    if (typeof ui === 'undefined') {
        console.log('startGameGui() ui is undefined');
        initRando();
        return;
    }

    PauseGame();

    let y = 0;

    var onStart = function(window) {
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
        //settings.rando_crowdcontrol = (window.findWidget('rando-crowdcontrol') as CheckboxWidget).isChecked;
        var cycle = window.findWidget('reroll-frequency');
        settings.num_months_cycle = randoCycles[cycle['text']];

        // we need to unpause the game in order for the next tick to run
        var wasPaused = UnpauseGame();
        runNextTick(function() {
            initRando();
            if(wasPaused.wasPaused) {
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
            NewLabel('https://discord.gg/jjfKT9nYDR', {
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
                selectedIndex: 1,
                tooltip: 'Choose a difficulty for the randomization'
            }),
            NewDropdown('Randomization Range:', {
                name: 'range',
                y: y++,
                items: Object.keys(randoRanges),
                selectedIndex: 1,
                tooltip: 'The range/spread of randomized values.'
            }),
            NewDropdown('Scenario Length:', {
                name: 'length',
                y: y++,
                items: Object.keys(scenarioLengths),
                selectedIndex: 1,
                tooltip: 'Longer scenario length will also scale up the goals so that difficulty is maintained.'
            }),
            NewDropdown('Ride Type Stat Re-rolls:', {
                name: 'reroll-frequency',
                y: y++,
                items: Object.keys(randoCycles),
                selectedIndex: 1,
                tooltip: 'How often to rerandomize the stats for ride types. Build the Theme Park of Theseus.'
            }),
            NewCheckbox('rando-ride-types', 'Randomize Ride Types', 0, y, 'Randomizes values such as excitement, intensity, and runningCost'),
            NewCheckbox('rando-park-flags', 'Randomize Park Flags', 1, y++, 'Randomizes flags such as forbidMarketingCampaigns and preferMoreIntenseRides'),
            NewCheckbox('rando-park-values', 'Randomize Park Values', 0, y, 'Randomizes values such as starting cash, starting bank loan amount, maxBankLoan, and landPrice'),
            NewCheckbox('rando-goals', 'Randomize Goals', 1, y++, 'Even when disabled, goals will still be scaled by Scenario Length'),
            //NewCheckbox('rando-scouting', 'Free Scouting', 1, y++, 'Enable this to get ride type stats added to the changes window before placing a track'),
            //NewCheckbox('rando-crowdcontrol', 'Enable Crowd Control', 0, y++, 'Let your viewers mess with your game! Visit https://crowdcontrol.live/ for info', false),
            [{
                type: 'button',
                name: 'cancel-button',
                x: ww - 90 - 6,
                y: wh - 6 - 26 - 29,
                width: 90,
                height: 26,
                text: 'Disable Rando',
                onClick: function() {
                    rando_enabled = false;
                    window.close();
                    EnableDisableRando(false);
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
                    rando_enabled = true;
                    window.close();
                }
            }]
        ),
        onClose: function() {
            try {
                context.sharedStorage.set('RCTRando.enabled', rando_enabled);
                if(rando_enabled)
                    onStart(window);
            } catch(e) {
                printException('error in GUI onClick(): ', e);
            }
        }
    });

    initMenuItems();
    return window;
}

function initMenuItems() {
    if(initedMenuItems) return;
    if (typeof ui !== 'undefined') {
        ui.registerMenuItem("RCTRando Changes", createChangesWindow);
        ui.registerMenuItem("RCTRando Options", createOptionsWindow);
        initedMenuItems = true;
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
    for(var i in settings.rando_changes) {
        let c = settings.rando_changes[i];
        let str:string;
        let name = c.name;

        if(c.factor) {
            let factor = c.factor;
            factor = Math.round( factor * 100 + Number.EPSILON ) / 100;
            str = name+' '+factor+'x';
        } else {
            let isMoney:boolean = i in {'bankLoan':1, 'maxBankLoan':1, 'cash':1, 'constructionRightsPrice':1, 'landPrice':1, 'parkValue':1};
            let isBool:boolean = (typeof(c.from) === 'boolean' && typeof(c.to) === 'boolean');

            let from = c.from;
            let to = c.to;
            if(isMoney) {
                from /= 10;
                to /= 10;
            }
            from = numberWithCommas(from, isMoney);
            to = numberWithCommas(to, isMoney);

            if(isBool && to)
                str = name+' enabled';
            else if(isBool)
                str = name+' disabled';
            else
                str = name+' changed from '+from+' to '+to;
        }
        if(i.startsWith('ride:'))
            rides.push(str);
        else
            ret.push(str);
    }
    ret.sort();
    rides.sort();
    ret.unshift('Seed: '+globalseed);
    if(rides.length > 0) {
        ret.push('==== Ride Types: ====');
        ret = ret.concat(rides);
    }

    if(!widget) return ret;
    if(widget.items.length != ret.length) {
        widget.items = ret;
        return ret;
    }
    var changed = false;
    for(var i in ret) {
        if(widget.items[i][0] !== ret[i]) {
            changed = true;
            break;
        }
    }

    if(changed)
        widget.items = ret;
    return ret;
}

function createChangesWindow(window_height:number=350, window_width:number=400) {
    let window:Window;
    let changes_list:ListViewWidget;
    let resize_button:ButtonWidget;
    let paddingLeft = 7;
    let paddingRight = 7;
    let paddingTop = 16;
    let paddingBottom = 7;

    let ticker = context.setInterval(function() {
        getChangesList(changes_list);
    }, 1000);

    let changes_list_desc:Widget = {
        type: 'listview',
        name: 'changes-list',
        x: paddingLeft,
        y: paddingTop,
        width: window_width - 1 - paddingLeft - paddingRight,
        height: window_height - paddingTop - paddingBottom,
        scrollbars: "vertical",
        //isStriped: true,
        items: getChangesList(null)
    };

    window = ui.openWindow({
        classification: 'rando-changes',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: window_width,
        height: window_height,
        minWidth: 80,
        minHeight: 30,
        maxWidth: 600,
        maxHeight: 5000,
        widgets: [
            changes_list_desc,
            {
                type: 'button',
                name: 'fix-size-button',
                x: paddingLeft,
                y: 15,
                width: 50,
                height: 14,
                text: 'Resize',
                isVisible: false,
                onClick: function() {
                    window.width = window_width;
                    window.height = window_height;
                    resize_button.isVisible = false;
                }
            }
        ],
        onClose: function() {
            context.clearInterval(ticker);
        },
        onUpdate: function() {
            changes_list.width = window.width - 1 - paddingLeft - paddingRight;
            changes_list.height = window.height - paddingTop - paddingBottom;

            if(changes_list.height < 100 && changes_list.scrollbars == 'vertical') {
                changes_list.isVisible=false;
                changes_list.scrollbars = 'none';
                resize_button.isVisible = true;
            } else if(changes_list.height > 100 && changes_list.scrollbars == 'none') {
                resize_button.isVisible = false;
                changes_list.isVisible=true;
                changes_list.scrollbars = 'vertical';
            }
        }
    });

    changes_list = window.findWidget('changes-list') as ListViewWidget;
    resize_button = window.findWidget('fix-size-button') as ButtonWidget;
}

function createOptionsWindow() {
    let window:Window;
    let randoEnabled:CheckboxWidget;
    const window_height:number = 80;
    const window_width:number = 180;

    let randoEnabledDesc:CheckboxWidget = NewCheckbox('rando-enabled', 'Enable Randomizer', 0, 0, 'Enable or Disable the Randomizer plugin.', rando_enabled);
    randoEnabledDesc.onChange = EnableDisableRando;

    window = ui.openWindow({
        classification: 'rando-options',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: window_width,
        height: window_height,
        widgets: [
            randoEnabledDesc,
        ]
    });

    randoEnabled = window.findWidget('rando-enabled') as CheckboxWidget;
}
