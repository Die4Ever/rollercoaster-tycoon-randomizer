
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

function GetSelectedIndex(items, value) {
    var keys = Object.keys(items);
    var closest = 0;
    var closest_dist = 99999999;
    for(var i = 0; i < keys.length; i++) {
        var v = items[keys[i]];
        if(v == value) return i;

        var dist = Math.abs(v - value);
        if( dist < closest_dist ) {
            closest = i;
            closest_dist = dist;
        }
    }
    return closest;
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

function createOptionsWindow() {
    let window:Window;
    const window_height:number = 200;
    const window_width:number = 250;

    let randoEnabledDesc:CheckboxDesc = NewCheckbox('rando-enabled', 'Enable Randomizer', 0, 1, 'Enable or Disable the Randomizer plugin.', global_settings.enabled);
    randoEnabledDesc.onChange = EnableDisableRando;

    let autoPauseDesc:CheckboxDesc = NewCheckbox('auto-pause', 'Auto Pause', 0, 2, 'Automatically pause the game at the start so you can read the changes list.', global_settings.auto_pause);
    autoPauseDesc.onChange = function(checked:boolean) {
        global_settings.auto_pause = checked;
        SaveGlobalSettings();
    };

    let reuseSeedDesc:CheckboxDesc = NewCheckbox('reuse-seed', 'Reuse Seed', 0, 3, 'Reuse the previously used seed by default.', global_settings.reuse_seed);
    reuseSeedDesc.onChange = function(checked:boolean) {
        global_settings.reuse_seed = checked;
        SaveGlobalSettings();
    };

    let reuseSettingsDesc:CheckboxDesc = NewCheckbox('reuse-settings', 'Reuse Settings', 0, 4, 'Reuse the previously used settings by default.', global_settings.reuse_settings);
    reuseSettingsDesc.onChange = function(checked:boolean) {
        global_settings.reuse_settings = checked;
        SaveGlobalSettings();
    };

    window = ui.openWindow({
        classification: 'rando-options',
        title: "RollerCoaster Tycoon Randomizer v"+rando_version,
        width: window_width,
        height: window_height,
        widgets: [
            NewLabel('Mods4Ever.com/discord', {
                name: 'url',
                y: 0,
                width: 1.3,
                tooltip: 'Join the Discord!'
            }),
            randoEnabledDesc, autoPauseDesc, reuseSeedDesc, reuseSettingsDesc
        ]
    });
}
