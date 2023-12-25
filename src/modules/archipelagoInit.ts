
//Lists for Archipelago
interface archipelago_item {
    LocationID: number,
    Item: string,
    ReceivingPlayer: string
}
interface archipelago_objective {
    Guests: any[],
    ParkValue: any[],
    RollerCoasters: any[],
    RideIncome: any[],
    ShopIncome: any[],
    ParkRating: any[],
    LoanPaidOff: any[],
    Monopoly: any[]
}
interface archipelago_price{
    LocationID: number,
    Price: number,
    Lives: number,
    RidePrereq: any[]
}
var archipelago_locked_locations: archipelago_item[] = []; // List of 3 objects: Location ID, Item, and Receiving Player
var archipelago_unlocked_locations: archipelago_item[] = [];
var archipelago_location_prices: archipelago_price[] = []; // List of Location ID's and the requirements to unlock them
//In general, the objectives go [amount, parameters (optional), complete]

var archipelago_objectives: {Guests: [number, boolean], ParkValue: [number, boolean], RollerCoasters: [number, number, number, number, number, boolean], RideIncome: [number, boolean], ShopIncome: [number, boolean], ParkRating: [number, boolean], LoanPaidOff: [boolean, boolean], Monopoly: [boolean, boolean], UniqueRides: [any[], boolean] } = 
    {Guests: [7500, false], ParkValue: [0, false], RollerCoasters: [0,0,0,0,0,false], RideIncome: [0, false], ShopIncome: [0, false], ParkRating: [0, false], LoanPaidOff: [false, false], Monopoly: [false, false], UniqueRides: [[], false]};

const locationInfo = {None: 'None', Recipient: 'Recipient', Full: 'Full' }
const item_id_to_name: {[key: number]: any}  = {2000000: 'Spiral Roller Coaster', 2000001: 'Stand Up Roller Coaster', 2000002: 'Suspended Swinging Coaster', 2000003: 'Inverted Roller Coaster', 2000004: 'Junior Roller Coaster', 2000005: 'Miniature Railway', 2000006: 'Monorail', 2000007: 'Mini Suspended Roller Coaster', 2000008: 'Boat Hire', 2000009: 'Wooden Wild Mouse', 2000010: 'Steeplechase', 2000011: 'Car Ride', 2000012: 'Launched Freefall', 2000013: 'Bobsleigh Coaster', 2000014: 'Observation Tower', 2000015: 'Looping Roller Coaster', 2000016: 'Dinghy Slide', 2000017: 'Mine Train Coaster', 2000018: 'Chairlift', 2000019: 'Corkscrew Roller Coaster', 2000020: 'Maze', 2000021: 'Spiral Slide', 2000022: 'Go Karts', 2000023: 'Log Flume', 2000024: 'River Rapids', 2000025: 'Dodgems', 2000026: 'Swinging Ship', 2000027: 'Swinging Inverter Ship', 2000028: 'Food Stall', 2000029: 'Drink Stall', 2000030: 'Shop', 2000031: 'Merry Go Round', 2000032: 'Information Kiosk', 2000033: 'Toilets', 2000034: 'Ferris Wheel', 2000035: 'Motion Simulator', 2000036: '3d Cinema', 2000037: 'Top Spin', 2000038: 'Space Rings', 2000039: 'Reverse Freefall Coaster', 2000040: 'Lift', 2000041: 'Vertical Drop Roller Coaster', 2000042: 'Cash Machine', 2000043: 'Twist', 2000044: 'Haunted House', 2000045: 'First Aid', 2000046: 'Circus', 2000047: 'Ghost Train', 2000048: 'Twister Roller Coaster', 2000049: 'Wooden Roller Coaster', 2000050: 'Side Friction Roller Coaster', 2000051: 'Steel Wild Mouse', 2000052: 'Multidimension Roller Coaster', 2000053: 'Multidimension Roller Coaster (alt)', 2000054: 'Flying Roller Coaster', 2000055: 'Flying Roller Coaster (alt)', 2000056: 'Virginia Reel', 2000057: 'Splash Boats', 2000058: 'Mini Helicopters', 2000059: 'Lay Down Roller Coaster', 2000060: 'Suspended Monorail', 2000061: 'Lay Down Roller Coaster (alt)', 2000062: 'Reverser Roller Coaster', 2000063: 'Heartline Twister Coaster', 2000064: 'Mini Golf', 2000065: 'Giga Coaster', 2000066: 'Roto Drop', 2000067: 'Flying Saucers', 2000068: 'Crooked House', 2000069: 'Monorail Cycles', 2000070: 'Compact Inverted Coaster', 2000071: 'Water Coaster', 2000072: 'Air Powered Vertical Coaster', 2000073: 'Inverted Hairpin Coaster', 2000074: 'Magic Carpet', 2000075: 'Submarine Ride', 2000076: 'River Rafts', 2000077: 'Enterprise', 2000078: 'Inverted Impulse Coaster', 2000079: 'Mini Roller Coaster', 2000080: 'Mine Ride', 2000081: 'LIM Launched Roller Coaster', 2000082: 'Hypercoaster', 2000083: 'Hypertwister', 2000084: 'Monster Trucks', 2000085: 'Spinning Wild Mouse', 2000086: 'Classic Mini Roller Coaster', 2000087: 'Hybrid Coaster', 2000088: 'Single Rail Roller Coaster', 2000089: 'Alpine Roller Coaster', 2000090: 'Classic Wooden Roller Coaster', 2000091: 'scenery', 2000092: 'Rainstorm', 2000093: 'Thunderstorm', 2000094: 'Snowstorm', 2000095: 'Blizzard', 2000096: '$10,000', 2000097: '$5,000', 2000098: '$2,500', 2000099: '$1,000', 2000100: '$500', 2000101: '50 Guests', 2000102: '100 Guests', 2000103: '150 Guests', 2000104: '250 Guests', 2000105: 'Beauty Contest', 2000106: 'Land Discount', 2000107: 'Construction Rights Discount', 2000108: 'Easier Guest Generation', 2000109: 'Easier Park Rating', 2000110: 'Allow High Construction', 2000111: 'Allow Landscape Changes', 2000112: 'Allow Marketing Campaigns', 2000113: 'Allow Tree Removal', 2000114: 'Bathroom Trap', 2000115: 'Furry Convention Trap', 2000116: 'Spam Trap'}
var full_item_id_to_name:{[key:number]: any} = {}
var full_location_id_to_name:{[key:number]: any} = {}

var archipelago_connected_to_game = false;
var archipelago_connected_to_server = false;
var archipelago_init_received = false;
var archipelago_correct_scenario = true;
var archipelago_games_requested = 0;

var archipelago_settings: any = {
    deathlink: false,
    deathlink_timeout: false,
    location_information: locationInfo.None,
    park_message_chat: true,
    network_chat: true,
    rule_locations: [],
    purchase_land_checks: true,
    max_land_checks: 20,
    current_land_checks: 0,
    purchase_rights_checks: true,
    max_rights_checks: 20,
    current_rights_checks: 0,
    current_time: 0,
    monopoly_complete: false,
    monopoly_x: 1,
    monopoly_y: 1,
    multiworld_games: [],
    received_items: [],
    player: "",
    preferred_intensity: 1,
    started: false
};

function ArchipelagoSaveLocations(LockedLocations, UnlockedLocations) {
    try {
        context.setTimeout(() => {archipelago_send_message("LocationChecks", UnlockedLocations)}, 1500);
        context.getParkStorage().set('RCTRando.ArchipelagoLockedLocations', LockedLocations);
        context.getParkStorage().set('RCTRando.ArchipelagoUnlockedLocations', UnlockedLocations);
        console.log("Location lists updated!");
    } catch(e) {
        printException('error in ArchipelagoSaveLocations: ', e);
    }
}
