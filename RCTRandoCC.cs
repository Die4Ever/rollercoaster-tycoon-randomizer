using System;
using System.Collections.Generic;
using CrowdControl.Common;
using CrowdControl.Games.Packs;
using ConnectorType = CrowdControl.Common.ConnectorType;

public class RCTRando : SimpleTCPPack
{
    public override string Host { get; } = "0.0.0.0";

    public override ushort Port { get; } = 43385;

    public RCTRando(IPlayer player, Func<CrowdControlBlock, bool> responseHandler, Action<object> statusUpdateHandler) : base(player, responseHandler, statusUpdateHandler) { }

    public override Game Game { get; } = new Game(141, "RollerCoaster Tycoon Randomizer", "RCTRando", "PC", ConnectorType.SimpleTCPConnector);

    public override List<Effect> Effects => new List<Effect> {
            new Effect("Money", "money", ItemKind.Folder),
            new Effect("Give $100", "give100", "money"),
            new Effect("Give $1000", "give1000", "money"),
            new Effect("Take $100", "take100", "money"),
            new Effect("Take $1000", "take1000", "money"),
            new Effect("Clear Loan", "zeroloan", "money"),

            new Effect("Time Travel", "timetravel", ItemKind.Folder),
            new Effect("Go Back One Month", "minusonemonth", "timetravel"),
            new Effect("Go Back To March Year 1", "resetdate", "timetravel"),
            new Effect("Force Scenario Win", "forcewin", "timetravel"),

            new Effect("Weather", "_weather", ItemKind.Folder),
            new Effect("Make it Sunny", "forceweather0", "_weather"),
            new Effect("Make it Partly Cloudy", "forceweather1", "_weather"),
            new Effect("Make it Cloudy", "forceweather2", "_weather"),
            new Effect("Make it Rain", "forceweather3", "_weather"),
            new Effect("Make it Really Rain", "forceweather4", "_weather"),
            new Effect("Make it Storm", "forceweather5", "_weather"),
            new Effect("Make it Snow", "forceweather6", "_weather"),
            new Effect("Make it Really Snow", "forceweather7", "_weather"),
            new Effect("Make it Blizzard", "forceweather8", "_weather"),
            new Effect("Random Weather", "forceweatherrandom", "_weather"),
            new Effect("Freeze Weather", "freezeweather", "_weather"),

            new Effect("Rides", "rides", ItemKind.Folder),
            //new Effect("Unlock Random Ride", "unlockride", "rides"),
            //new Effect("Unlock Random Coaster", "unlockcoaster", "rides"),
            //new Effect("Unlock Random Shop", "unlockshop", "rides"),
            //new Effect("Fix a Ride", "fixride", "rides"),
            new Effect("Fix All Rides", "fixallrides", "rides"),
            //new Effect("Break a Ride", "breakRide", "rides"),
            new Effect("Fast Chain Lifts", "fastchainlift", "rides"),
            new Effect("Slow Chain Lifts", "slowchainlift", "rides"),

            new Effect("Peeps", "peeps", ItemKind.Folder),
            //new Effect("Name Peep After Me", "peepnameafterdonator", "peeps"),
            new Effect("Recolor Peeps", "peeprecolor", "peeps"),
            new Effect("Feed Peeps", "peepfeed", "peeps"),
            new Effect("Make Peeps Hungry", "peepunfeed", "peeps"),
            new Effect("Quench Peeps", "peepdrink", "peeps"),
            new Effect("Make Peeps Thirsty", "peepundrink", "peeps"),
            new Effect("Fill Peeps Bladders", "peepfillbladder", "peeps"),
            new Effect("Empty Peeps' Bladders", "peepemptybladder", "peeps"),
            new Effect("Give Peeps Money", "peepgivemoney", "peeps"),
            new Effect("Take Peeps' Money", "peeptakemoney", "peeps"),
            new Effect("Give Peeps Balloons", "peepgiveballoon", "peeps"),
            //new Effect("Release Peeps' Balloons", "peepreleaseballoon", "peeps"),

            new Effect("Scenery", "scenery", ItemKind.Folder),
            new Effect("Clean Paths", "cleanpaths", "scenery"),
            new Effect("Mow Grass", "mowgrass", "scenery"),
            new Effect("Unmow Grass", "unmowgrass", "scenery"),
            new Effect("Water Plants", "waterplants", "scenery"),
            new Effect("Burn Plants", "burnplants", "scenery"),
            new Effect("Smash Scenery", "smashscenery", "scenery"),
            new Effect("Fix Scenery", "fixscenery", "scenery"),

            new Effect("Spawn Ducks", "spawnducks"),
            new Effect("Clear Ducks", "clearducks"),
            new Effect("Open Random Windows", "openrandomwindows"),
            new Effect("Close All Windows", "closeallwindows")
        };

    //Slider ranges need to be defined
    /*public override List<ItemType> ItemTypes => new List<ItemType>(new[]
    {
        new ItemType("Money", "money1000", ItemType.Subtype.Slider, "{\"min\":1,\"max\":1000}")
    });*/
}
