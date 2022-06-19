enum CCStatus {
    SUCCESS = 0,
    FAILED,
    NOT_AVAILABLE,
    RETRY
}

enum CCRequestType {
    START = 1,
    STOP
}

interface CCEffect {
    id: number;
    code: string;
    viewer: string;
    type: number;
    parameters?: any[];
    cost?: number;
}

interface CCResponse {
    id: number;
    status: CCStatus;
    msg?: string;
}

enum Cheat {
    SandboxMode = 0,
    DisableClearanceChecks,
    DisableSupportLimits,
    ShowAllOperatingModes,
    ShowVehiclesFromOtherTrackTypes,
    DisableTrainLengthLimit,
    EnableChainLiftOnAllTrack,
    FastLiftHill,
    DisableBrakesFailure,
    DisableAllBreakdowns,
    UnlockAllPrices,
    BuildInPauseMode,
    IgnoreRideIntensity,
    DisableVandalism,
    DisableLittering,
    NoMoney,
    AddMoney,
    SetMoney,
    ClearLoan,
    SetGuestParameter,
    GenerateGuests,
    RemoveAllGuests,
    GiveAllGuests,
    SetGrassLength,
    waterplants,
    DisablePlantAging,
    FixVandalism,
    RemoveLitter,
    SetStaffSpeed,
    RenewRides,
    MakeDestructible,
    fixrides,
    ResetCrashStatus,
    TenMinuteInspections,
    WinScenario,
    ForceWeather,
    freezeweather,
    OpenClosePark,
    HaveFun,
    SetForcedParkRating,
    NeverEndingMarketing,
    AllowArbitraryRideTypeChanges,
    OwnAllLand,
    DisableRideValueAging,
    IgnoreResearchStatus,
    EnableAllDrawableTrackPieces,
    CreateDucks,
    RemoveDucks,
    AllowTrackPlaceInvalidHeights,
    Count
}