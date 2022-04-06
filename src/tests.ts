/// <reference path="base.ts" />

function test_difficulty(goal, d) {
    difficulty = goal;
    let currDifficulty = 1;
    let num = 1000;

    console.log('                  \ntest_difficulty', goal, d, JSON.stringify(rando_range));

    let total = 0;
    for(var i=0; i<num; i++) {
        total += GetDifficultyCurve(d);
    }
    console.log("difficulty "+goal+", "+d+", avg: "+ (total/num));

    total = 0;
    for(var i=0; i<num; i++) {
        total += Number(RngBoolWithDifficulty(d));
    }
    console.log("    RngBoolWithDifficulty difficulty "+goal+", "+d+", avg: "+ (total/num));

    let min = 1;
    let max = 1;
    let highs = 0;
    let lows = 0;
    total = 0;
    for(var i=0; i<num; i++) {
        let v = randomize(1, d);
        min = Math.min(min, v);
        max = Math.max(max, v);
        if(v > 1) highs++;
        if(v < 1) lows++;
        total += v;
    }
    console.log("    randomize difficulty "+goal+", "+d+", avg: "+ (total/num)+', min: '+min+', max: '+max+', lows: '+lows+', highs: '+highs);
}

function run_tests() {
    console.log('starting tests...');
    setGlobalSeed(25);
    var oldRange = rando_range;
    rando_range = randoRanges['Medium'];
    for(var d = -0.6; d < 0.7; d += 0.6) {
        for(var i = -1; i <= 1; i += 1) {
            test_difficulty(d, i);
        }
    }

    for(var r in randoRanges) {
        rando_range = randoRanges[r];
        console.log('            \nrun_tests range', r);
        test_difficulty(0, 0);
    }

    rando_range = randoRanges['Extreme'];
    test_difficulty(difficulties['Extreme'], 1);
    test_difficulty(difficulties['Extreme'], -1);

    rando_range = oldRange;
    let currDifficulty = 1;
    difficulty = 1;
    console.log('finished tests');
}
