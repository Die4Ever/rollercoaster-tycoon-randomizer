enum ObjectCategory {
    "not a ride",
    "transport", // 0
    "gentle",
    "rollercoaster",
    "thrill",
    "water",
    "shop", //5
    "scenery"
}
enum ScenarioName {
    "forest frontiers",//0
    "dynamite dunes",
    "leafy lake",
    "diamond heights",
    "evergreen gardens",
    "bumbly beach",//5
    "trinity islands",
    "katie’s world",
    "dinky park",
    "aqua park",
    "millennium mines",//10
    "karts & coasters",
    "mel’s world",
    "mothball mountain",
    "pacific pyramids",
    "crumbly woods",//15
    "big pier",
    "lightning peaks",
    "ivory towers",
    "rainbow valley",
    "thunder rock",//20
    "mega park",
    "whispering cliffs",
    "three monkeys park",
    "canary mines",
    "barony bridge",//25
    "funtopia",
    "haunted harbor",
    "fun fortress",
    "future world",
    "gentle glen",//30
    "jolly jungle",
    "hydro hills",
    "sprightly park",
    "magic quarters",
    "fruit farm",//35
    "butterfly dam",
    "coaster canyon",
    "thunderstorm park",
    "harmonic hills",
    "roman village",//40
    "swamp cove",
    "adrenaline heights",
    "utopia park",
    "rotting heights",
    "fiasco forest",//45
    "pickle park",
    "giggle downs",
    "mineral park",
    "coaster crazy",
    "urban park",//50
    "geoffery gardens",
    "iceberg islands",
    "volcania",
    "arid heights",
    "razor rocks",//55
    "crater lake",
    "vertigo views",
    "big pier 2",
    "dragon’s cove",
    "good knight park",//60
    "wacky warren",
    "grand glacier",
    "crazy craters",
    "dusty desert",
    "woodworm park",//65
    "icarus park",
    "sunny swamps",
    "frightmare hills",
    "thunder rocks",
    "octagon park",//70
    "pleasure island",
    "icicle worlds",
    "southern sands",
    "tiny towers",
    "nevermore park",//75
    "pacifica",
    "urban jungle",
    "terror town",
    "megaworld park",
    "venus ponds",//80
    "micro park",
    "electric fields",
    "factory capers",
    "crazy castle",
    "dusty greens",//85
    "bumbly bazaar",
    "infernal views",
    "lucky lake",
    "botany breakers",
    "alpine adventures",//90
    "gravity gardens",
    "extreme heights",
    "amity airfield",
    "ghost town",
    "fungus woods",//95
    "rainbow summit",
    "over the edge",
    "great wall of china",
    "canyon calamities",
    "sugarloaf shores",//100
    "mines of africa",
    "park maharaja",
    "ayers adventure",
    "european extravaganza",
    "rollercoaster heaven",//105
    "lost city founder",
    "mirage madness",
    "icy adventures",
    "okinawa coast",
    "beach barbecue blast",//110
    "from the ashes",
    "wacky waikiki",
    "rainforest romp",
    "sherwood forest",
    "crater carnage",//115
    "alcatraz",
    "woodstock",
    "cliffside castle",
    "extraterrestrial extravaganza",
    "animatronic antics",//120
    "coastersaurus",
    "schneider shores",
    "gemini city",
    "mythological madness",
    "rocky rambles",//125
    "metropolis",
    "rock ‘n’ roll revival",
    "alton towers",
    "blackpool pleasure beach",
    "heide-park",//130
    "six flags belgium",
    "six flags great adventure",
    "six flags holland",
    "six flags magic mountain",
    "six flags over texas",//135
    "fort anachronism",
    "build your own six flags belgium",
    "build your own six flags great adventure",
    "build your own six flags holland",
    "build your own six flags magic mountain",//140
    "build your own six flags park",
    "build your own six flags over texas",
    "random RCT1",
    "random loopy landscapes",
    "random corkscrew follies",//145
    "random RCT2",
    "random wacky worlds",
    "random time twister",
    "random RCT1 expansions",
    "random RCT2 expansions",//150
    "archipelago madness (vanilla)",
    "archipelago madness (expansions)"//152

}

function convert_scenario_name_to_archipelago(scenarioName: string, fileName: string): string{
    if(ScenarioName[scenarioName])//If we already match, great!
        return scenarioName;
    switch(fileName.toLowerCase()){
        case "alton1.sc4": return "alton towers";
        case "bpb1.sc4": return "blackpool pleasure beach";
        case "fort1.sc4": return "fort anachronism";
        case "heide.sc4": return "heide-park";
        case "sc0.sc4": return "forest frontiers";
        case "sc1.sc4": return "dynamite dunes";
        case "sc2.sc4": return "leafy lake";
        case "sc3.sc4": return "diamond heights";
        case "sc4.sc4": return "evergreen gardens";
        case "sc5.sc4": return "bumbly beach";
        case "sc6.sc4": return "trinity islands";
        case "sc7.sc4": return "katie’s world";
        case "sc8.sc4": return "dinky park";
        case "sc9.sc4": return "aqua park";
        case "sc10.sc4": return "millennium mines";
        case "sc11.sc4": return "karts & coasters";
        case "sc12.sc4": return "mel’s world";
        case "sc13.sc4": return "mothball mountain";
        case "sc14.sc4": return "pacific pyramids";
        case "sc15.sc4": return "crumbly woods";
        case "sc16.sc4": return "big pier";
        case "sc17.sc4": return "lightning peaks";
        case "sc18.sc4": return "ivory towers";
        case "sc19.sc4": return "rainbow valley";
        case "sc20.sc4": return "thunder rock";
        case "sc21.sc4": return "mega park";
        case "sc22.sc4": return "iceberg islands";
        case "sc23.sc4": return "volcania";
        case "sc24.sc4": return "arid heights";
        case "sc25.sc4": return "razor rocks";
        case "sc26.sc4": return "crater lake";
        case "sc27.sc4": return "vertigo views";
        case "sc28.sc4": return "big pier 2";
        case "sc29.sc4": return "dragon’s cove";
        case "sc30.sc4": return "good knight park";
        case "sc31.sc4": return "wacky warren";
        case "sc40.sc4": return "whispering cliffs";
        case "sc41.sc4": return "three monkeys park";
        case "sc42.sc4": return "canary mines";
        case "sc43.sc4": return "barony bridge";
        case "sc44.sc4": return "funtopia";
        case "sc45.sc4": return "haunted harbor";
        case "sc46.sc4": return "fun fortress";
        case "sc47.sc4": return "future world";
        case "sc48.sc4": return "gentle glen";
        case "sc49.sc4": return "jolly jungle";
        case "sc50.sc4": return "hydro hills";
        case "sc51.sc4": return "sprightly park";
        case "sc52.sc4": return "magic quarters";
        case "sc53.sc4": return "fruit farm";
        case "sc54.sc4": return "butterfly dam";
        case "sc55.sc4": return "coaster canyon";
        case "sc56.sc4": return "thunderstorm park";
        case "sc57.sc4": return "harmonic hills";
        case "sc58.sc4": return "roman village";
        case "sc59.sc4": return "swamp cove";
        case "sc60.sc4": return "adrenaline heights";
        case "sc61.sc4": return "utopia park";
        case "sc62.sc4": return "rotting heights";
        case "sc63.sc4": return "fiasco forest";
        case "sc64.sc4": return "pickle park";
        case "sc65.sc4": return "giggle downs";
        case "sc66.sc4": return "mineral park";
        case "sc67.sc4": return "coaster crazy";
        case "sc68.sc4": return "urban park";
        case "sc69.sc4": return "geoffery gardens";
        case "sc80.sc4": return "grand glacier";
        case "sc81.sc4": return "crazy craters";
        case "sc82.sc4": return "dusty desert";
        case "sc83.sc4": return "woodworm park";
        case "sc84.sc4": return "icarus park";
        case "sc85.sc4": return "sunny swamps";
        case "sc86.sc4": return "frightmare hills";
        case "sc87.sc4": return "thunder rocks";
        case "sc88.sc4": return "octagon park";
        case "sc89.sc4": return "pleasure island";
        case "sc90.sc4": return "icicle worlds";
        case "sc91.sc4": return "southern sands";
        case "sc92.sc4": return "tiny towers";
        case "sc93.sc4": return "nevermore park";
        case "sc94.sc4": return "pacifica";
        case "sc95.sc4": return "urban jungle";
        case "sc96.sc4": return "terror town";
        case "sc97.sc4": return "megaworld park";
        case "sc98.sc4": return "venus ponds";
        case "sc99.sc4": return "micro park";
        case 'electric fields.sc6': return "electric fields";
        case 'factory capers.sc6': return "factory capers";
        case 'crazy castle.sc6': return "crazy castle";
        case 'dusty greens.sc6': return "dusty greens";
        case 'bumbly bazaar.sc6': return "bumbly bazaar";
        case 'infernal views.sc6': return "infernal views";
        case 'lucky lake.sc6': return "lucky lake";
        case 'botany breakers.sc6': return "botany breakers";
        case 'alpine adventures.sc6': return "alpine adventures";
        case 'gravity gardens.sc6': return "gravity gardens";
        case 'extreme heights.sc6': return "extreme heights";
        case 'amity airfield.sc6': return "amity airfield";
        case 'ghost town.sc6': return "ghost town";
        case 'fungus woods.sc6': return "fungus woods";
        case 'rainbow summit.sc6': return "rainbow summit";
        case 'africa - victoria falls.sc6': return "over the edge";
        case 'asia - great wall of china tourism enhancement.sc6': return "great wall of china";
        case 'north america - grand canyon.sc6': return "canyon calamities";
        case 'south america - rio carnival.sc6': return "sugarloaf shores";
        case 'africa - african diamond mine.sc6': return "mines of africa";
        case 'asia - maharaja palace.sc6': return "park maharaja";
        case 'australasia - ayers rock.sc6': return "ayers adventure";
        case 'europe - european cultural festival.sc6': return "european extravaganza";
        case 'north america - rollercoaster heaven.sc6': return "rollercoaster heaven";
        case 'south america - inca lost city.sc6': return "lost city founder";
        case 'africa - oasis.sc6': return "mirage madness";
        case 'antarctic - ecological salvage.sc6': return "icy adventures";
        case 'asia - japanese coastal reclaim.sc6': return "okinawa coast";
        case 'australasia - fun at the beach.sc6': return "beach barbecue blast";
        case 'europe - renovation.sc6': return "from the ashes";
        case 'n america - extreme hawaiian island.sc6': return "wacky waikiki";
        case 'south america - rain forest plateau.sc6': return "rainforest romp";
        case 'dark age - robin hood.sc6': return "sherwood forest";
        case 'prehistoric - after the asteroid.sc6': return "crater carnage";
        case 'roaring twenties - prison island.sc6': return "alcatraz";
        case "rock 'n' roll - flower power.sc6": return "woodstock";
        case 'dark age - castle.sc6': return "cliffside castle";
        case 'future - first encounters.sc6': return "extraterrestrial extravaganza";
        case 'mythological - animatronic film set.sc6': return "animatronic antics";
        case 'prehistoric - jurassic safari.sc6': return "coastersaurus";
        case 'roaring twenties - schneider cup.sc6': return "schneider shores";
        case 'future - future world.sc6': return "gemini city";
        case 'mythological - cradle of civilization.sc6': return "mythological madness";
        case 'prehistoric - stone age.sc6': return "rocky rambles";
        case 'roaring twenties - skyscrapers.sc6': return "metropolis";
        case "rock 'n' roll - rock 'n' roll.sc6": return "rock ‘n’ roll revival";
        case 'six flags belgium.sc6': return "six flags belgium";
        case 'six flags great adventure.sc6': return "six flags great adventure";
        case 'six flags holland.sc6': return "six flags holland";
        case 'six flags magic mountain.sc6': return "six flags magic mountain";
        case 'six flags over texas.sc6': return "six flags over texas";
        case 'build your own six flags belgium.sc6': return "build your own six flags belgium";
        case 'build your own six flags great adventure.sc6': return "build your own six flags great adventure";
        case 'build your own six flags holland.sc6': return "build your own six flags holland";
        case 'build your own six flags magic mountain.sc6': return "build your own six flags magic mountain";
        case 'build your own six flags park.sc6': return "build your own six flags park";
        case 'build your own six flags over texas.sc6': return "build your own six flags over texas";
    }
    return "P*ck off thing, I'm getting there"
}
// var reverseScenarioName = new Map<string, ScenarioName>();
// Object.keys(ScenarioName).forEach((scenarioName: ScenarioName) => {
//     const scenarioNameValue: string = ScenarioName[scenarioName as any];
//     reverseScenarioName.set(scenarioNameValue, scenarioName);
// });


