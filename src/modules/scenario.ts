class RCTRScenario extends ModuleBase {
    FirstEntry(): void {
        setLocalSeed('RandomizeScenarioLength');
        if(Math.abs(settings.scenarioLength) < 0.1) {
            settings.scenarioLength = rng(50, 300) / 100;
        }

        console.log('scenario.objective.year: ', scenario.objective.year, ', scenarioLength: '+settings.scenarioLength);
        if(scenario.objective.year) {
            // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
            const old = scenario.objective.year;
            scenario.objective.year = Math.ceil(scenario.objective.year * settings.scenarioLength);
            this.AddChange('objective.year', 'Objective Year', old, scenario.objective.year);
        } else {
            // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
            settings.scenarioLength = 1;
        }

        setLocalSeed('RandomizeScenarioGoals');

        // the excitement goal doesn't get twice as easy when you have twice as much time, so we ** 0.3
        this.RandomizeObjective('guests', 1, 0.9);
        this.RandomizeObjective('excitement', 1, 0.3);
        this.RandomizeObjective('monthlyIncome', 0.9);
        this.RandomizeObjective('parkValue', 0.9);

        //console.log(scenario);
        console.log(scenario.objective);
    }

    RandomizeObjective(name, difficulty, scenarioLengthExp=1) {
        if(!scenario.objective[name]) return;

        const old = scenario.objective[name];
        if(settings.rando_goals) {
            scenario.objective[name] = randomize(scenario.objective[name], difficulty) * (settings.scenarioLength ** scenarioLengthExp);
        } else {
            scenario.objective[name] *= (settings.scenarioLength ** scenarioLengthExp);
        }
        this.AddChange(name, 'Objective '+name, old, scenario.objective[name]);
    }
}

registerModule(new RCTRScenario());
