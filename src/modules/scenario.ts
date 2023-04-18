class RCTRScenario extends ModuleBase {
    FirstEntry(): void {
        setLocalSeed('RandomizeScenarioLength');
        let scenarioLength = settings.scenarioLength;
        if(Math.abs(scenarioLength) < 0.1) {
            scenarioLength = rng(50, 300) / 100;
        }

        info('scenario.objective.year: ', scenario.objective.year, ', scenarioLength: '+scenarioLength);
        if(scenario.objective.year) {
            // ceil because it's nice to lean towards longer scenarios? need to make other things more difficult then
            const old = scenario.objective.year;
            scenario.objective.year = Math.ceil(scenario.objective.year * scenarioLength);
            this.AddChange('objective.year', 'Objective Year', old, scenario.objective.year);
        } else {
            // if we fail to adjust the scenario length, then we need to treat it as 1 so that the difficulty scaling isn't ruined
            scenarioLength = 1;
        }

        setLocalSeed('RandomizeScenarioGoals');

        // the excitement goal doesn't get twice as easy when you have twice as much time, so we ** 0.3
        this.RandomizeObjective('guests', 1, scenarioLength, 0.9);
        this.RandomizeObjective('excitement', 1, scenarioLength, 0.3);
        this.RandomizeObjective('monthlyIncome', scenarioLength, 0.9);
        this.RandomizeObjective('parkValue', scenarioLength, 0.9);
        this.RandomizeObjective('length', scenarioLength, 0.5);

        //info(scenario);
        info(scenario.objective);
    }

    RandomizeObjective(name, difficulty, scenarioLength, scenarioLengthExp=1) {
        if(!scenario.objective[name]) return;

        const old = scenario.objective[name];
        if(settings.rando_goals) {
            scenario.objective[name] = randomize(scenario.objective[name], difficulty) * (scenarioLength ** scenarioLengthExp);
        } else {
            scenario.objective[name] *= (scenarioLength ** scenarioLengthExp);
        }
        this.AddChange(name, 'Objective '+name, old, scenario.objective[name]);
    }
}

registerModule(new RCTRScenario());
