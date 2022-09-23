
function getChangeText(change):string {
    let str:string;
    let name = change.name;

    if(change.factor) {
        let factor = change.factor;
        factor = Math.round( factor * 100 + Number.EPSILON ) / 100;
        str = name+' '+factor+'x';
    } else {
        let isMoney:boolean = name in {'bankLoan':1, 'maxBankLoan':1, 'cash':1, 'constructionRightsPrice':1, 'landPrice':1, 'parkValue':1};
        let isBool:boolean = (typeof(change.from) === 'boolean' && typeof(change.to) === 'boolean');

        let from = change.from;
        let to = change.to;
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

    return str;
}

function getChangesList(widget) {
    let ret = [];
    let rides = [];

    for(let i=0; i<modules.length; i++) {
        const m = modules[i];
        for(let k in m.settings.changes) {
            let change = m.settings.changes[k];
            let str = getChangeText(change);
            if(k.startsWith('ride:'))
                rides.push(str);
            else
                ret.push(str);
        }
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
    for(let i in ret) {
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
