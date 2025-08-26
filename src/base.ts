// ~~ forces JS to convert to int
let globalseed = ~~0;
let tseed = ~~0;
const gen2 = ~~2147483643;
const gen1 = ~~(gen2/2);

// works with integers, min and max are both inclusive
function rng(min:number, max:number) {
    tseed = ~~(gen1 * tseed * 5 + gen2 + (tseed/5) * 3);
    if(tseed < 0)
        tseed = ~~(-tseed);
    var ret = (tseed >>> 8) % (1 + max - min);
    ret += min;
    //info("rng("+min+", "+max+") "+tseed+", "+ret);
    return ret;
}

function rngf()
{// 0 to 1.0
    // divide by 1 less than 0xFFFFFF, so that it's never the max and we don't have to worry about rounding
    return rng(0, 0xFFFFFF)/0xFFFFFE;
}

function rngfn()
{// -1.0 to 1.0
    return rngf() * 2.0 - 1.0;
}

function rngexp(origmin:number, origmax:number, curve:number)
{
    let min = origmin;
    let max = origmax;
    if(min != 0)
        min = min ** (1/curve);
    max = (max+1) ** (1/curve);
    let frange = max-min;
    let f = rngf()*frange + min;
    f = f ** curve;
    f = clamp( f, origmin, origmax );
    return f;
}

// boolean
function rng_bool(): boolean {
    return rng(0, 100) < 50;
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

function GetDifficultyCurve(d) {
    if(d == 0) return 0.5;
    var dist = Math.abs(settings.difficulty - d);
    return 1 - (dist / (dist + 1));
}

function RngBoolWithDifficulty(d) {
    var val = rng(0, 100000);
    var mid = 50000;
    if( d == 0 ) return val < mid;
    var adjust = GetDifficultyCurve(d);
    adjust = adjust * 2;
    mid *= adjust;
    //info('RngBoolWithDifficulty, adjust: '+adjust+', mid: '+mid);

    return val < mid;
}

function setGlobalSeed(newSeed) {
    // use this to set the seed for the whole game
    info('setGlobalSeed from '+globalseed+' to '+newSeed);
    globalseed = ~~newSeed;
    tseed = ~~newSeed;
}

function setSeed(newSeed) {
    tseed = ~~newSeed;
}

function setLocalSeed(name) {
    setSeed(globalseed + crc32(name));
}

function randomize(value, difficulty, range) {
    // difficulty > 0 means larger numbers increase difficulty, < 0 means decreases difficulty
    var min = 100.0;
    var max = range * 100.0;
    var ret = rng(min, max) / 100.0;
    if(rng_bool())
        ret = 1 / ret;
    let difficulty_curve = GetDifficultyCurve(difficulty) * 2;
    ret *= value * difficulty_curve;
    //info('randomize('+value+', '+difficulty+'): '+ret, difficulty_curve);
    return ret;
}

function shuffle(items:Array<any>) {
    for(let i=items.length-1; i>=0; i--) {
        let a = items[i];
        let slot = rng(0, i + 1);
        items[i] = items[slot];
        items[slot] = a;
    }
}

var crcTable = makeCRCTable();
function makeCRCTable(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

function crc32(str) {
    //var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

function DeepCopy(o) {
    return JSON.parse(JSON.stringify(o));
}

// game state can't be modified outside of synchronized functions, and tick is one of them
function runNextTick(func) {
    let sub = context.subscribe('interval.tick', function(args) {
        try {
            func();
        } catch(e) {
            printException('error in runNextTick', e);
        }
        sub.dispose();
    });
}


function ifPaused(whenPaused: () => void, whenUnpaused: () => void) {
    var wasPaused = context.paused;

    if(wasPaused && whenPaused) {
        whenPaused();
    }
    else if(!wasPaused && whenUnpaused) {
        whenUnpaused();
    }

    return wasPaused;
}

function PauseGame() {
    return ifPaused(null, () => { context.executeAction('pausetoggle', {}); });
}

function UnpauseGame() {
    return ifPaused(() => { context.executeAction('pausetoggle', {}); }, null);
}

function printException(msg: string, e) {
    info('===========\nERROR:')
    try {
        info(e.stack);
        info(msg, e.name, e.message);
    } catch(e2) {
        info('error in printException', msg, e, e2);
        info('types: ', msg.constructor.name, e.constructor.name, e2.constructor.name);
    }
    info('===========');
}

// February shouldn't be shown, it's just padding
const MONTHS = ["February", "March", "April", "May", "June", "July", "August", "September", "October"];

function formatDate(day: number, month: number, year: number) {
    return `${MONTHS[month]} ${day}, Year ${year}`
}
