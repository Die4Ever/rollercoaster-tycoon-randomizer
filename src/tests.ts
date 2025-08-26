/// <reference path="base.ts" />

function test_difficulty(goal, d) {
    settings.difficulty = goal;
    let currDifficulty = 1;
    let num = 1000;

    info('                  \ntest_difficulty', goal, d, JSON.stringify(settings.rando_range));

    let total = 0;
    for(var i=0; i<num; i++) {
        total += GetDifficultyCurve(d);
    }
    info("difficulty "+goal+", "+d+", avg: "+ (total/num));

    total = 0;
    for(var i=0; i<num; i++) {
        total += Number(RngBoolWithDifficulty(d));
    }
    info("    RngBoolWithDifficulty difficulty "+goal+", "+d+", avg: "+ (total/num));

    let min = 1;
    let max = 1;
    let highs = 0;
    let lows = 0;
    total = 0;
    for(var i=0; i<num; i++) {
        let v = randomize(1, d, settings.rando_range);
        min = Math.min(min, v);
        max = Math.max(max, v);
        if(v > 1) highs++;
        if(v < 1) lows++;
        total += v;
    }
    info("    randomize difficulty "+goal+", "+d+", avg: "+ (total/num)+', min: '+min+', max: '+max+', lows: '+lows+', highs: '+highs);
}

function run_tests() {
    info('starting tests...');
    info(RideType[1]);
    setGlobalSeed(25);
    var oldRange = settings.rando_range;
    settings.rando_range = randoRanges['Medium'];
    for(var d = -0.6; d < 0.7; d += 0.6) {
        for(var i = -1; i <= 1; i += 1) {
            test_difficulty(d, i);
        }
    }

    for(var r in randoRanges) {
        settings.rando_range = randoRanges[r];
        info('            \nrun_tests range', r);
        test_difficulty(0, 0);
    }

    settings.rando_range = randoRanges['Extreme'];
    test_difficulty(difficulties['Extreme'], 1);
    test_difficulty(difficulties['Extreme'], -1);

    settings.rando_range = oldRange;
    settings.difficulty = 1;
    info('finished tests');
}
