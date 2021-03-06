// ~~ forces JS to convert to int
let globalseed = ~~0;
let tseed = ~~0;
const gen2 = ~~2147483643;
const gen1 = ~~(gen2/2);

// works with integers
function rng(min:number, max:number) {
    tseed = ~~(gen1 * tseed * 5 + gen2 + (tseed/5) * 3);
    if(tseed < 0)
        tseed = ~~(-tseed);
    var ret = (tseed >>> 8) % (1 + max - min);
    ret += min;
    //console.log("rng("+min+", "+max+") "+tseed+", "+ret);
    return ret;
}

function rngf()
{// 0 to 1.0
    return rng(0, 1000000)/1000000;
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
function rng_bool() {
    // next seed
    rng(0,1);
    return (tseed >>> 15) & 1;
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
    //console.log('RngBoolWithDifficulty, adjust: '+adjust+', mid: '+mid);

    return val < mid;
}

function setGlobalSeed(newSeed) {
    // use this to set the seed for the whole game
    console.log('setGlobalSeed from '+globalseed+' to '+newSeed);
    globalseed = ~~newSeed;
    tseed = ~~newSeed;
}

function setSeed(newSeed) {
    tseed = ~~newSeed;
}

function setLocalSeed(name) {
    setSeed(globalseed + crc32(name));
}

function randomize(value, difficulty) {
    // difficulty > 0 means larger numbers increase difficulty, < 0 means decreases difficulty
    var min = 100.0;
    var max = settings.rando_range * 100.0;
    var ret = rng(min, max) / 100.0;
    if(rng_bool())
        ret = 1 / ret;
    let difficulty_curve = GetDifficultyCurve(difficulty) * 2;
    ret *= value * difficulty_curve;
    //console.log('randomize('+value+', '+difficulty+'): '+ret, difficulty_curve);
    return ret;
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
    var wasPaused = { wasPaused: undefined };
    var oldElapsed = date.ticksElapsed;
    context.setTimeout(function() {
        if( date.ticksElapsed == oldElapsed ) {
            wasPaused.wasPaused = true;
            if(whenPaused)
                whenPaused();
        } else {
            wasPaused.wasPaused = false;
            if(whenUnpaused)
                whenUnpaused();
        }
    }, 100);
    return wasPaused;
}

function PauseGame() {
    return ifPaused(null, () => { context.executeAction('pausetoggle', {}); });
}

function UnpauseGame() {
    return ifPaused(() => { context.executeAction('pausetoggle', {}); }, null);
}

function printException(msg, e) {
    console.log('===========\nERROR:')
    try {
        console.log(e.stack);
        console.log(msg, e.name, e.message);
    } catch(e2) {
        console.log('error in printException', msg, e, e2);
        console.log('types: ', msg.constructor.name, e.constructor.name, e2.constructor.name);
    }
    console.log('===========');
}
