/// <reference path="base.ts" />

function test_difficulty(goal, d) {
    difficulty = goal;
    let currDifficulty = 1;
    let num = 1000;

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

    total = 0;
    for(var i=0; i<num; i++) {
        total += randomize(1, d);
    }
    console.log("    randomize difficulty "+goal+", "+d+", avg: "+ (total/num));
}

function run_tests() {
    console.log('starting tests...');
    setGlobalSeed(25);
    for(var d = -0.6; d < 0.7; d += 0.6) {
        for(var i = -1; i <= 1; i += 1) {
            test_difficulty(d, i);
        }
    }
    let currDifficulty = 1;
    difficulty = 1;
    console.log('finished tests');
}
