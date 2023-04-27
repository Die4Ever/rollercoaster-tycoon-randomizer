class RCTRPark extends ModuleBase {
    FirstEntry(): void {
        setLocalSeed('RandomizeParkFlags');

        if(settings.rando_park_flags) {
            this.RandomizeParkFlag("difficultGuestGeneration", 1);
            this.RandomizeParkFlag("difficultParkRating", 1);
            //this.RandomizeParkFlag("forbidHighConstruction", 1); // TODO: put this back in when OpenRCT2 lets me adjust the max height
            //this.RandomizeParkFlag("forbidLandscapeChanges", 1); // TODO: put this behind a difficulty option?
            this.RandomizeParkFlag("forbidMarketingCampaigns", 1);
            //this.RandomizeParkFlag("forbidTreeRemoval", 1); // TODO: put this behind a difficulty option? or only on certain dates?
            this.RandomizeParkFlag("freeParkEntry", 1);
            this.RandomizeParkFlag("preferMoreIntenseRides", 1);
            this.RandomizeParkFlag("preferLessIntenseRides", -1);// TODO: maybe make these mutually exclusive? like roll a d3
            this.RandomizeParkFlag("unlockAllPrices", -1);// I think this allows the player to always set entry fees and ride fees? should be mutually exclusive with freeParkEntry or just remove this?
            //this.RandomizeParkFlag("noMoney", -1);// too easy?
        }

        setLocalSeed('RandomizeParkValues');
        if(settings.rando_park_values) {
            this.RandomizeField(park, 'maxBankLoan', -1);
            this.RandomizeField(park, 'landPrice', 1);
            this.RandomizeField(park, 'constructionRightsPrice', 1);
            this.RandomizeField(park, 'cash', -1);
            this.RandomizeField(park, 'bankLoan', 1);
        }
    }

    /*AnyEntry(): void {
        const self = this;
        self.SubscribeEvent("interval.day", function() {// random events on certain dates?
            info('date: ', date.year, date.month, date.day);
        });
    }*/

    RandomizeParkFlag(name, difficulty) {
        var val = park.getFlag(name);
        park.setFlag(name, RngBoolWithDifficulty(difficulty));
        this.AddChange(name, name, val, park.getFlag(name));
    }
}

registerModule(new RCTRPark());
