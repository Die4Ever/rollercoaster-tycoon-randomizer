class RCTRResearch extends ModuleBase {
    FirstEntry(): void {
        if(!settings.rando_research)
            return;

        setLocalSeed('ShuffleResearch');

        const origNumResearched = park.research.inventedItems.length;
        let numResearched = origNumResearched;
        // difficulty is -0.7 for Very Easy and 0.4 for Extreme
        numResearched -= Math.round(settings.difficulty/2 * numResearched);
        let researchItems = park.research.inventedItems.concat(park.research.uninventedItems);
        for(let i=0; i<researchItems.length; i++) {
            let a = researchItems[i];
            let slot = rng(0, researchItems.length - 1);
            researchItems[i] = researchItems[slot];
            researchItems[slot] = a;
        }
        park.research.inventedItems = researchItems.slice(0, numResearched);
        park.research.uninventedItems = researchItems.slice(numResearched);
        this.AddChange('ShuffledResearch', 'Shuffled research items', null, null, null);
        this.AddChange('NumInventedItems', 'Invented items', origNumResearched, numResearched);
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRResearch());
