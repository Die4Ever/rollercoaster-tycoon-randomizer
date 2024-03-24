class RCTRResearch extends ModuleBase {
    FirstEntry(): void {
        if(!settings.rando_research)
            return;

        setLocalSeed('ShuffleResearch');

        const origNumResearched = park.research.inventedItems.length;

        let rides = [];
        let scenery = [];

        // first just the inventedItems so we can count them and scale the amount
        SplitResearchItems(park.research.inventedItems, rides, scenery);

        // difficulty is -0.7 for Very Easy and 0.4 for Extreme
        let numRides = rides.length;
        numRides = Math.round(settings.difficulty/2 * numRides);
        let numScenery = scenery.length;
        numScenery = Math.round(settings.difficulty/2 * numScenery);

        // now add the uninventedItems and shuffle
        SplitResearchItems(park.research.uninventedItems, rides, scenery);
        shuffle(rides);
        shuffle(scenery);

        // write back new arrays
        park.research.inventedItems = rides.slice(0, numRides).concat(scenery.slice(0, numScenery));
        park.research.uninventedItems = rides.slice(numRides).concat(scenery.slice(numScenery));

        this.AddChange('ShuffledResearch', 'Shuffled research items', null, null, null);
        this.AddChange('NumInventedItems', 'Invented items', origNumResearched, park.research.inventedItems.length);
    }
}

function SplitResearchItems(items:Array<ResearchItem>, rides:Array<ResearchItem>, scenery:Array<ResearchItem>) {
    for(let i=0; i < items.length; i++) {
        let item = items[i];
        if(item.type == 'ride') {
            rides.push(item);
        } else {
            scenery.push(item);
        }
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRResearch());
