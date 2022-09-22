class RCTRPark extends ModuleBase {
    FirstEntry(): void {
        setLocalSeed('RandomizeParkFlags');

        if(settings.rando_park_flags) {
            RandomizeParkFlag("difficultGuestGeneration", 1);
            RandomizeParkFlag("difficultParkRating", 1);
            //RandomizeParkFlag("forbidHighConstruction", 1); // TODO: put this back in when OpenRCT2 lets me adjust the max height
            RandomizeParkFlag("forbidLandscapeChanges", 1);
            RandomizeParkFlag("forbidMarketingCampaigns", 1);
            RandomizeParkFlag("forbidTreeRemoval", 1);
            RandomizeParkFlag("freeParkEntry", 1);
            RandomizeParkFlag("preferMoreIntenseRides", 1);
            RandomizeParkFlag("preferLessIntenseRides", -1);
            RandomizeParkFlag("unlockAllPrices", -1);// I think this allows the player to always set entry fees and ride fees?
            //RandomizeParkFlag("noMoney", -1);// too easy?
        }

        setLocalSeed('RandomizeParkValues');
        if(settings.rando_park_values) {
            RandomizeField(park, 'maxBankLoan', -1);
            RandomizeField(park, 'landPrice', 1);
            RandomizeField(park, 'constructionRightsPrice', 1);
            RandomizeField(park, 'cash', -1);
            RandomizeField(park, 'bankLoan', 1);
        }
    }
}

registerModule(new RCTRPark());

function RandomizeParkFlag(name, difficulty) {
    var val = park.getFlag(name);
    park.setFlag(name, RngBoolWithDifficulty(difficulty));
    AddChange(name, name, val, park.getFlag(name));
}
