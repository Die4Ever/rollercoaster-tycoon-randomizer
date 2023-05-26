using System;
using CrowdControl.Common;
using CrowdControl.Games.Packs;
using ConnectorType = CrowdControl.Common.ConnectorType;

public class RCTRando : SimpleTCPPack
{
    public override string Host => "0.0.0.0";

    public override ushort Port => 43385;

    public override ISimpleTCPPack.MessageFormat MessageFormat => ISimpleTCPPack.MessageFormat.CrowdControlLegacy;

    public RCTRando(UserRecord player, Func<CrowdControlBlock, bool> responseHandler, Action<object> statusUpdateHandler) : base(player, responseHandler, statusUpdateHandler) { }

    public override Game Game { get; } = new(152, "RollerCoaster Tycoon Randomizer", "RCTRando", "PC", ConnectorType.SimpleTCPConnector);

    public override EffectList Effects { get; } = new Effect[]
    {
            //new Effect("Money", "money", ItemKind.Folder),
        new Effect("Give $100", "give100") { Category = "Money" },
        new Effect("Give $1000", "give1000") { Category = "Money" },
        new Effect("Take $100", "take100") { Category = "Money" },
        new Effect("Take $1000", "take1000") { Category = "Money" },
        new Effect("Clear Loan", "zeroloan") { Category = "Money" },

        //new Effect("Time Travel", "timetravel", ItemKind.Folder),
        new Effect("Go Back One Month", "minusonemonth") { Category = "Time Travel" },
        new Effect("Go Back To March Year 1", "resetdate") { Category = "Time Travel" },
        new Effect("Force Scenario Win", "forcewin") { Category = "Time Travel" },

        //new Effect("Weather", "_weather", ItemKind.Folder),
        new Effect("Make it Sunny", "forceweather0") { Category = "Weather" },
        new Effect("Make it Partly Cloudy", "forceweather1") { Category = "Weather" },
        new Effect("Make it Cloudy", "forceweather2") { Category = "Weather" },
        new Effect("Make it Rain", "forceweather3") { Category = "Weather" },
        new Effect("Make it Really Rain", "forceweather4") { Category = "Weather" },
        new Effect("Make it Storm", "forceweather5") { Category = "Weather" },
        new Effect("Make it Snow", "forceweather6") { Category = "Weather" },
        new Effect("Make it Really Snow", "forceweather7") { Category = "Weather" },
        new Effect("Make it Blizzard", "forceweather8") { Category = "Weather" },
        new Effect("Random Weather", "forceweatherrandom") { Category = "Weather" },
        new Effect("Freeze Weather", "freezeweather") { Category = "Weather" },

        //new Effect("Rides", "rides", ItemKind.Folder),
        //new Effect("Unlock Random Ride", "unlockride") { Category = "Rides" },
        //new Effect("Unlock Random Coaster", "unlockcoaster") { Category = "Rides" },
        //new Effect("Unlock Random Shop", "unlockshop") { Category = "Rides" },
        //new Effect("Fix a Ride", "fixride") { Category = "Rides" },
        new Effect("Fix All Rides", "fixallrides") { Category = "Rides" },
        //new Effect("Break a Ride", "breakRide") { Category = "Rides" },
        new Effect("Fast Chain Lifts", "fastchainlift") { Category = "Rides" },
        new Effect("Slow Chain Lifts", "slowchainlift") { Category = "Rides" },
        new Effect("Re-Randomize Rides", "rerollrides") { Category = "Rides" },

        //new Effect("Peeps", "peeps", ItemKind.Folder),
        new Effect("Name Peep After Me", "peepnameafterdonator") { Category = "Peeps" },
        new Effect("Recolor Peeps", "peeprecolor") { Category = "Peeps" },
        new Effect("Feed Peeps", "peepfeed") { Category = "Peeps" },
        new Effect("Make Peeps Hungry", "peepunfeed") { Category = "Peeps" },
        new Effect("Quench Peeps", "peepdrink") { Category = "Peeps" },
        new Effect("Make Peeps Thirsty", "peepundrink") { Category = "Peeps" },
        new Effect("Fill Peeps Bladders", "peepfillbladder") { Category = "Peeps" },
        new Effect("Empty Peeps' Bladders", "peepemptybladder") { Category = "Peeps" },
        new Effect("Give Peeps Money", "peepgivemoney") { Category = "Peeps" },
        new Effect("Take Peeps' Money", "peeptakemoney") { Category = "Peeps" },
        new Effect("Give Peeps Balloons", "peepgiveballoon") { Category = "Peeps" },
        //new Effect("Release Peeps' Balloons", "peepreleaseballoon") { Category = "Peeps" },

        //new Effect("Scenery", "scenery", ItemKind.Folder),
        new Effect("Clean Paths", "cleanpaths") { Category = "Scenery" },
        new Effect("Mow Grass", "mowgrass") { Category = "Scenery" },
        new Effect("Unmow Grass", "unmowgrass") { Category = "Scenery" },
        new Effect("Water Plants", "waterplants") { Category = "Scenery" },
        new Effect("Burn Plants", "burnplants") { Category = "Scenery" },
        new Effect("Smash Scenery", "smashscenery") { Category = "Scenery" },
        new Effect("Fix Scenery", "fixscenery") { Category = "Scenery" },

        new Effect("Spawn Ducks", "spawnducks"),
        new Effect("Clear Ducks", "clearducks"),
        new Effect("Open Random Windows", "openrandomwindows"),
        new Effect("Close All Windows", "closeallwindows"),

        new Effect("Extend Scenario Goal", "extendscenario")
    };
}
