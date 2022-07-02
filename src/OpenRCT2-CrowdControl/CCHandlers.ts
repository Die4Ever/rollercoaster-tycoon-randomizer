/// <reference path="../../lib/openrct2.d.ts" />
/// <reference path="CCTypes.ts" />
/// <reference path="CCUtils.ts" />
/// <reference path="CCAds.ts" />

function noop(result: GameActionResult): void { }

function rctMessage(text: string, type: ParkMessageType = "money") {
    park.postMessage({
        type: type,
        text: text
    });
}

function cheat(cheat: Cheat, p1: number = 0, p2: number = 0) {
    context.executeAction("setcheataction", {
        type: cheat,
        param1: p1,
        param2: p2
    }, noop);
}

class Handler {
    startEffect: (effect: CCEffect) => CCStatus;
    stopEffect: (effect: CCEffect) => CCStatus;

    constructor(
        startEffect: (effect: CCEffect) => CCStatus,
        stopEffect: (effect: CCEffect) => CCStatus = (effect) => CCStatus.SUCCESS) {
        this.startEffect = startEffect;
        this.stopEffect = stopEffect;
    }
}

function addMoney(effect: CCEffect, amount: number): CCStatus {
    cheat(Cheat.AddMoney, amount * 10);

    if (amount < 0) {
        rctMessage(`${effect.viewer} stole $${-amount}.00 from you!`);
    } else if (amount > 0) {
        rctMessage(`${effect.viewer} donated $${amount}.00 to you!`);
    }

    return CCStatus.SUCCESS;
}

function clearLoan(effect: CCEffect): CCStatus {
    cheat(Cheat.ClearLoan);

    rctMessage(`${effect.viewer} paid off your loan!`);

    return CCStatus.SUCCESS;
}

function spawnducks(effect: CCEffect): CCStatus {
    cheat(Cheat.CreateDucks, 100);

    rctMessage(`${effect.viewer} released the ducks!`);

    return CCStatus.SUCCESS;
}

function despawnducks(effect: CCEffect): CCStatus {
    cheat(Cheat.RemoveDucks);

    rctMessage(`${effect.viewer} killed all the ducks!`);

    return CCStatus.SUCCESS;
}

function goBackOneMonth(effect: CCEffect): CCStatus {
    const monthsElapsed = date.monthProgress - 1;
    if (monthsElapsed < 0) {
        return CCStatus.RETRY;
    }
    const year = Math.floor(monthsElapsed / 8);
    const month = monthsElapsed % 8;
    context.executeAction("parksetdate", {
        year: year + 1,
        month: month + 1,
        day: date.day
    }, noop);

    rctMessage(`${effect.viewer} forced the date to ${formatDate(date.day, month + 1, year + 1)}`);
    return CCStatus.SUCCESS;
}

function goBackToStart(effect: CCEffect): CCStatus {
    context.executeAction("parksetdate", {
        year: 1,
        month: 1,
        day: 1
    }, noop);

    rctMessage(`${effect.viewer} forced the date to March, Year 1`);
    return CCStatus.SUCCESS;
}

function forcewin(effect: CCEffect): CCStatus {
    cheat(Cheat.WinScenario);

    rctMessage(`${effect.viewer} forced you to win!`);
    return CCStatus.SUCCESS;
}

function forceWeather(effect: CCEffect, weather?: number): CCStatus {
    if (!weather) {
        weather = context.getRandom(0, 9);
    }

    cheat(Cheat.ForceWeather, weather);

    rctMessage(`${effect.viewer} changed the weather!`);
    return CCStatus.SUCCESS;
}

function freezeweather(effect: CCEffect): CCStatus {
    cheat(Cheat.freezeweather, 1);

    rctMessage(`${effect.viewer} halted weather changes!`);
    return CCStatus.SUCCESS;
}

function unfreezeweather(effect: CCEffect): CCStatus {
    cheat(Cheat.freezeweather, 0);

    rctMessage(`The weather is back to normal now...`);
    return CCStatus.SUCCESS;
}

function fixallrides(effect: CCEffect): CCStatus {
    cheat(Cheat.fixrides);

    rctMessage(`${effect.viewer} fixed all the rides!`);
    return CCStatus.SUCCESS;
}

function fastchainlifts(effect: CCEffect): CCStatus {
    cheat(Cheat.FastLiftHill, 1);

    for (let i = 0; i < map.numRides; i++) {
        const ride = map.getRide(i);
        if (ride.classification == "ride") {
            context.executeAction("ridesetsetting", {
                ride: ride.id,
                setting: 8,
                value: 100
            }, noop);
        }
    }

    rctMessage(`${effect.viewer} sped up the chain lifts!`);
    return CCStatus.SUCCESS;
}

function slowchainlifts(effect: CCEffect): CCStatus {
    cheat(Cheat.FastLiftHill, 1);

    for (let i = 0; i < map.numRides; i++) {
        const ride = map.getRide(i);
        if (ride.classification == "ride") {
            context.executeAction("ridesetsetting", {
                ride: ride.id,
                setting: 8,
                value: 1
            }, noop);
        }
    }

    rctMessage(`${effect.viewer} slowed down the chain lifts!`);
    return CCStatus.SUCCESS;
}

let peepQueue: string[] = [];

function peepnameafterdonator(effect: CCEffect): CCStatus {
    peepQueue.push(effect.viewer);
    return CCStatus.SUCCESS;
}

function peepRandomColor(effect: CCEffect): CCStatus {
    const color = context.getRandom(0, 31);

    context.executeAction("guestSetColor", { color: color }, noop);

    rctMessage(`${effect.viewer} changed the fashion!`)
    return CCStatus.SUCCESS;
}

function peepHungry(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 2, 0);
    rctMessage(`${effect.viewer} made the guests ravenous.`);
    return CCStatus.SUCCESS;
}

function peepFull(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 2, 255);
    rctMessage(`${effect.viewer} made the guests stuffed.`);
    return CCStatus.SUCCESS;
}

function peepThirsty(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 3, 0);
    rctMessage(`${effect.viewer} made the guests very thirsty.`);
    return CCStatus.SUCCESS;
}

function peepQuench(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 3, 255);
    rctMessage(`${effect.viewer} made the guests no longer thirsty.`);
    return CCStatus.SUCCESS;
}

function peepPee(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 6, 255);
    rctMessage(`${effect.viewer} made the guests need to use the restroom.`);
    return CCStatus.SUCCESS;
}

function peepNoPee(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGuestParameter, 6, 0);
    rctMessage(`${effect.viewer} made the guests no longer need to use the restroom.`);
    return CCStatus.SUCCESS;
}

function peepGiveCash(effect: CCEffect, amount: number): CCStatus {
    context.executeAction("guestAddMoney", { money: amount }, noop);
    if (amount < 0) {
        rctMessage(`${effect.viewer} stole $${amount}.00 from all the guests.`)
    } else if (amount > 0) {
        rctMessage(`${effect.viewer} gave $${amount}.00 to all the guests.`)
    }
    return CCStatus.SUCCESS;
}

function peepgiveballoon(effect: CCEffect): CCStatus {
    cheat(Cheat.GiveAllGuests, 2);
    rctMessage(`${effect.viewer} gave everyone a balloon!`);
    return CCStatus.SUCCESS;
}

function removeLitter(effect: CCEffect): CCStatus {
    cheat(Cheat.RemoveLitter);
    rctMessage(`${effect.viewer} cleaned the place up!`);
    return CCStatus.SUCCESS;
}

function mowgrass(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGrassLength, 0);
    rctMessage(`${effect.viewer} mowed the lawn!`);
    return CCStatus.SUCCESS;
}

function unmowgrass(effect: CCEffect): CCStatus {
    cheat(Cheat.SetGrassLength, 100);
    rctMessage(`${effect.viewer} made the grass grow!`);
    return CCStatus.SUCCESS;
}

function waterplants(effect: CCEffect): CCStatus {
    cheat(Cheat.waterplants);
    rctMessage(`${effect.viewer} watered the plants!`);
    return CCStatus.SUCCESS;
}

function killPlants(effect: CCEffect): CCStatus {
    context.executeAction("killPlants", {}, noop);
    rctMessage(`${effect.viewer} killed the plants!`);
    return CCStatus.SUCCESS;
}

function breakThings(effect: CCEffect): CCStatus {
    context.executeAction("breakThings", {}, noop);
    rctMessage(`${effect.viewer} broke things!`);
    return CCStatus.SUCCESS;
}

function fixThings(effect: CCEffect): CCStatus {
    cheat(Cheat.FixVandalism);
    rctMessage(`${effect.viewer} fixed things!`);
    return CCStatus.SUCCESS;
}

function spawnRandomWindows(effect: CCEffect): CCStatus {
    if (ui) {
        const randomNumber = context.getRandom(1, 6);
        for (let i = 0; i < randomNumber; i++) {
            showRandomAd();
        }
        return CCStatus.SUCCESS;
    }
    return CCStatus.FAILED;
}

function closeallwindows(effect: CCEffect): CCStatus {
    if (ui) {
        ui.closeAllWindows();
        rctMessage(`${effect.viewer} closed your windows!`);
    }
    return CCStatus.FAILED;
}

function rerollRides(effect: CCEffect): CCStatus {
    settings.cycle_offset++;
    rctMessage(`${effect.viewer} re-randomized your rides!`);
    return CCStatus.SUCCESS;
}

function extendScenario(effect: CCEffect): CCStatus {
    scenario.objective.year++;
    rctMessage(`${effect.viewer} extended your scenario!`);
    return CCStatus.SUCCESS;
}

let handlers: { [key: string]: Handler } = {
    give100: new Handler((effect: CCEffect) => addMoney(effect, 100)),
    give1000: new Handler((effect: CCEffect) => addMoney(effect, 1000)),
    take100: new Handler((effect: CCEffect) => addMoney(effect, -100)),
    take1000: new Handler((effect: CCEffect) => addMoney(effect, -1000)),
    zeroloan: new Handler(clearLoan),

    minusonemonth: new Handler(goBackOneMonth),
    resetdate: new Handler(goBackToStart),
    forcewin: new Handler(forcewin),

    forceweatherrandom: new Handler((effect: CCEffect) => forceWeather(effect)),
    forceweather0: new Handler((effect: CCEffect) => forceWeather(effect, 0)),
    forceweather1: new Handler((effect: CCEffect) => forceWeather(effect, 1)),
    forceweather2: new Handler((effect: CCEffect) => forceWeather(effect, 2)),
    forceweather3: new Handler((effect: CCEffect) => forceWeather(effect, 3)),
    forceweather4: new Handler((effect: CCEffect) => forceWeather(effect, 4)),
    forceweather5: new Handler((effect: CCEffect) => forceWeather(effect, 5)),
    forceweather6: new Handler((effect: CCEffect) => forceWeather(effect, 6)),
    forceweather7: new Handler((effect: CCEffect) => forceWeather(effect, 7)),
    forceweather8: new Handler((effect: CCEffect) => forceWeather(effect, 8)),
    freezeweather: new Handler(freezeweather, unfreezeweather),

    fixallrides: new Handler(fixallrides),
    fastchainlift: new Handler(fastchainlifts),
    slowchainlift: new Handler(slowchainlifts),

    peepnameafterdonator: new Handler(peepnameafterdonator),
    peeprecolor: new Handler(peepRandomColor),
    peepfeed: new Handler(peepFull),
    peepunfeed: new Handler(peepHungry),
    peepdrink: new Handler(peepQuench),
    peepundrink: new Handler(peepThirsty),
    peepfillbladder: new Handler(peepPee),
    peepemptybladder: new Handler(peepNoPee),
    peepgivemoney: new Handler((effect: CCEffect) => peepGiveCash(effect, 20)),
    peeptakemoney: new Handler((effect: CCEffect) => peepGiveCash(effect, -20)),
    peepgiveballoon: new Handler(peepgiveballoon),

    cleanpaths: new Handler(removeLitter),
    mowgrass: new Handler(mowgrass),
    unmowgrass: new Handler(unmowgrass),
    waterplants: new Handler(waterplants),
    burnplants: new Handler(killPlants),
    smashscenery: new Handler(breakThings),
    fixscenery: new Handler(fixThings),

    spawnducks: new Handler(spawnducks),
    clearducks: new Handler(despawnducks),

    openrandomwindows: new Handler(spawnRandomWindows),
    closeallwindows: new Handler(closeallwindows),

    rerollrides: new Handler(rerollRides),
    extendscenario: new Handler(extendScenario)
};

function handle(effect: CCEffect): CCStatus {
    const handler = handlers[effect.code];
    if (handler && effect.type == CCRequestType.START) {
        return handler.startEffect(effect);
    } else if (handler && effect.type == CCRequestType.STOP) {
        return handler.stopEffect(effect);
    } else {
        return CCStatus.FAILED;
    }
}