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

    public override List<Effect> Effects => new List<Effect>
    {
        //General Effects
        new Effect("Something nice", "nice"),
        new Effect("Something mean", "mean")
    };

    //Slider ranges need to be defined
    /*public override List<ItemType> ItemTypes => new List<ItemType>(new[]
    {
        new ItemType("Money", "money1000", ItemType.Subtype.Slider, "{\"min\":1,\"max\":1000}")
    });*/
}
