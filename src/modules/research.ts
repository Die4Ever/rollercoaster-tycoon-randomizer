class RCTRResearch extends ModuleBase {
    FirstEntry(): void {
        if(!settings.rando_research)
            return;

        setLocalSeed('ShuffleResearch');

        let uninventedItems = [];//park.research.uninventedItems;// TODO: also change inventedItems? bring items in that normally are never in the scenario? or just randomly remove some?
        for(let i=0; i<uninventedItems.length; i++) {
            let a = uninventedItems[i];
            let slot = rng(0, uninventedItems.length - 1);
            uninventedItems[i] = uninventedItems[slot];
            uninventedItems[slot] = a;
        }
        info('uninventedItems: ', uninventedItems);
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRResearch());
