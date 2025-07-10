
interface Ad {
    title: string,
    header: string,
    message: string,
    button: string,
    onClick?: Function
}

const adPool: Ad[] = [
    {//0
        title: "Look Here!",
        header: "Centipedes? In My Park?",
        message: "It's more likely than you think.",
        button: "Find Out More"
    },
    {//01
        title: "FREE!!!!!!!!!!!!!!!!",
        header: "Get Free Money!!",
        message: "Get Money Right Now!!",
        button: ("Get " + context.formatString("{CURRENCY2DP}", 10000)),
        onClick: () => 
            {
                park.cash += 10000;
                park.bankLoan += 10000;
            }
    },
    {//02
        title: "Great Product",
        header: "Hate Ads?",
        message: "Download Our Popup Blocker",
        button: "Download Now"
    },
    {//03
        title: "",
        header: "WARNING!",
        message: "Your PC is about to explode",
        button: "Fix Now"
    },
    {//04
        title: "Alert",
        header: "Your park is being attacked",
        message: " by bandits. We can help!",
        button: "HELP!"
    },
    {//05
        title: "Famous!",
        header: "Become Famous!",
        message: "Get 1,000 guests right now!",
        button: "Win"
    },
    {//06
        title: "Congrats!",
        header: "Congratulations",
        message: "You are the 100,000th player of OpenRCT2!",
        button: "Redeem Prize"
    },
    {//07
        title: "Free Rides",
        header: "Download Roller Coaster for your park!",
        message: "Excitement guaranteed!",
        button: "Download"
    },
    {//08
        title: "Invest",
        header: "Invest in RCT Stock",
        message: "Make $1000s!",
        button: "Take Me There"
    },
    {//09
        title: "Broke?",
        header: "Need a Lawyer?",
        message: "Sawyer Law Offices can help",
        button: "Call"
    },
    {//10
        title: "Did You Know?",
        header: "1% of Tycoons Don't Know",
        message: "These ten simple tricks!",
        button: "Click Here"
    },
    {//11
        title: "Survey",
        header: "Complete our survey",
        message: "You can win big bucks!",
        button: "Take Survey"
    },
    {//12
        title: "Advice",
        header: "Need Coaster Advice?",
        message: "",
        button: "Call Now"
    },
    {//13
        title: "CC",
        header: "Looking for excitement?",
        message: "Look to Crowd Control!",
        button: "https://crowdcontrol.live/"
    },
    {//14
        title: "RCT2",
        header: "Enjoying Yourself?",
        message: "Play OpenRCT2 Yourself!",
        button: "https://openrct2.org/"
    },
    {//15
        title: "Action Required",
        header: "You're Being Sued!",
        message: "",
        button: "View Details"
    },
    {//16
        title: "Popup",
        header: "",
        message: "Your Text Here",
        button: "Button"
    },
    {//17
        title: "Woah!!",
        header: "Looking for Rides?",
        message: "We have the best rides in %{location}",
        button: "See More"
    },
    {//18
        title: "Popups",
        header: "Make Your Own Popup!",
        message: "",
        button: "We Can Help"
    },
    {//19
        title: "Download",
        header: "Here is your download:",
        message: "openrct3.dat (43.5 mB)",
        button: "DOWNLOAD"
    },
    {//20
        title: "CLOSE THIS WINDOW!",
        header: "Tired of the buttons not closing these windows?",
        message: "Fix it today!",
        button: "Click here!",
        onClick: () => 
            {
                showRandomAd();
                ui.showError("Prankd!", "Haha. You got another one!")
            }
    },
    {//21
        title: "Archipelago",
        header: "Have you checked your tracker?",
        message: "do it.",
        button: "Finish Sphere 1"
    },
    {//22
        title: "",
        header: "",
        message: "",
        button: ""
    },
    {//23
        title: "DANGER",
        header: "Don't click this button!",
        message: "It's extremely hazardous!",
        button: "SEND DEATHLINK",
        onClick: () => 
            {try{
                var DeathLink = GetModule("RCTRArchipelago") as RCTRArchipelago;
                DeathLink.SendDeathLink(null,"A popup window with the text \"SEND DEATHLINK\"");}
            catch{ui.showError("Archipelago not open", "You should try this while playing Archipelago!")}
            ui.closeAllWindows()}//We don't know the ID, so close everything. Besides, it "Crashed"
    },
    {//24
        title: "Freedom!",
        header: "This game is sponsored by Linux Mint!",
        message: "Linux is vastly superior to Windows!",
        button: "Upgrade today!",
        onClick: () => {archipelago_print_message("Go to LinuxMint.com and click \"Download\"")}
    },
    {//25
        title: "Lorem ipsum",
        header: "Aliquam euismod, risus vel ultricies ornare",
        message: "Nam feugiat est in diam maximus consectetur.",
        button: "Phasellus imperdiet auctor nisi."
    },
    {//26
        title: "Uh oh!",
        header: "Something broke!",
        message: "TELL COLBY RIGHT NOW!",
        button: "CALL 1-800-FIX-IT-4-U!"
    },
    {//27
        title: "Ein deutscher Text",
        header: "Dieser Aufplopper ist nun Teil der Bundesrepublik Deutschland",
        message: "Jegliche Nutzung von Angelsächsich ist strengstens untersagt",
        button: "Sehr schön!"
    },
    {//28
        title: "ERROR",
        header: "The archipelago client has detected a desync.",
        message: "Tell the dev to make error reporting work better.",
        button: "Discord"
    },
    {//29
        title: "Typescript!",
        header: "Ever want to pull your hair out learning the dumbest language?.",
        message: "Try Typescript today!.",
        button: "[object Object]"
    },
    {//30
        title: "Guests Hate Him!",
        header: "See how this park owner earns millions",
        message: "each month with this one simple trick!",
        button: "You need to know!"
    },
    {//31
        title: "A Companion to the Bible?",
        header: "This book will change your life!",
        message: "Order your free copy of The Book of Mormon Today!",
        button: "Mormon.org"
    },
    {//32
        title: "Compy 386",
        header: "FLAGRANT SYSTEM ERROR",
        message: "COMPUTER OVER",
        button: "VIRUS = VERY YES",
        onClick: () => 
            {
                ui.showError("","That's not a good prize!")
            }
    },
    {//33
        title: "Compy 386",
        header: "Edgar the Virus Hunter",
        message: "Programmed entirely in Mom's basement",
        button: "Scan System",
        onClick: () => 
            {
                archipelago_print_message("Scanning...........................423,827 Viruses Found! A New Record!")
            }
    },
    {//34
        title: "Got Problem?",
        header: "Rat Biting Problem in your Car?",
        message: "It's extremely hazardous!",
        button: "Call Kumar Babu Today!",
    },
    {//35
        title: "Get Orange Pilled",
        header: "Cities aren't loud!",
        message: "CARS ARE LOUD!",
        button: "Remove Cars From Your City",
        onClick: () => 
            {
                ui.showError("Learn More!", "Look up 'Not Just Bikes' on YouTube!")
            }
    },
    {//36
        title: "A Conspiracy in the Greater Cosmere",
        header: "Money isn't actually money. Each guest is invested, roughly between .75 and 1.8 Breath Equivalent Units.",
        message: "Rides are powered by guests using investiture, measured in $$$. If a perpendicularity is opened in a park, the park will become an important part of the greater Cosmere.",
        button: "This is why ride costs $300 instead of $50,000.",
        onClick: () => 
            {
                ui.showError("We convert the guests essence directly into rides.", "Keep an eye out for Hoid!");
            }
    },
    {//37
        title: "DO NOT",
        header: "DO NOT CLICK THIS BUTTON. IT WILL MAKE YOUR PARK EXTREMELY UGLY",
        message: "I'M NOT EVEN JOKING, YOU WILL REGRET THIS",
        button: "RUIN PARK",
        onClick: () => 
            {
                var x = map.size.x;//Gets the size of the map
                var y = map.size.y;
                var surfaces = objectManager.getAllObjects("terrain_surface");
                for(let i = 1; i < (x - 1); i++){//check the x's. Map.size gives a couple coordinates off the map, so we exclude those.
                    for(let j = 1; j < (y - 1); j++){//check the y's
                        var tile = map.getTile(i,j).elements;//get the tile data
                        for(let k = 0; k < tile.length; k++){//iterate through everything on the tile
                            if(tile[k].type == "surface"){//if it's a surface element
                                var surface = tile[k] as SurfaceElement;
                                surface.surfaceStyle = Math.floor(Math.random()*surfaces.length);
                            }
                        }
                    }
                }
                ui.showError("I TOLD YOU!", "YOU WERE WARNED BUT CLICKED THE BUTTON ANYWAYS! Now you must live with the consequences of your hubris!")
            }
    },
    {//38
        title: "Feel the power of the dark side!",
        header: "Did you ever hear the tragedy of Darth Plagueis the Wise?",
        message: "It's not a story the Jedi would tell you.",
        button: "Kill 50 younglings",
        onClick: () => 
            {
                try{
                    explodeGuests(50);
                ui.closeAllWindows();}
                catch{ui.showError("Archipelago not open", "You should try this while playing Archipelago!")}
            }
    },
    {//39
        title: "--  ---  .-.  ...  . / -.-.  ---  -..  .  -.-.--",//Morse code!
        header: "..  ..-. / -.--  ---  ..- / -.-.  .-  -. / .-.  .  .-  -.. / --  .",//If you can read me
        message: "-.--  ---  ..- / --  ..  --.  ....  - / ....  .-  ...-  . / .-",//you might have a
        button: "-  ---  ..-  -.-.  .... / ---  ..-. / -  ....  . / -  ..  ...  --",//touch of the 'tism
    },
    {//40
        title: "I live in the depths of this Antarctic Winter",
        header: "The sun doesn't exist",
        message: "The Sun has Never Existed",
        button: "Colby shall return with a new Sun soon",
        onClick: () => 
            {
                ui.showError("","This message was written on June 27th 2025, while the developer of Archipelago was in the middle of the Antarctic Winter. I have forgotten the face on the sun...");
            }
    },
    {//41
        title: "Official Diplomatic Telegram from Shang Tu",
        header: "We shall establish",
        message: "a timtams currency exchange program.",
        button: "What?",
        onClick: () => 
            {
                ui.showError("","WE SHALL ESTABLISH. A TIMTAMS. CURRENCY EXCHANGE PROGRAM.");
            }
    },
    {//42
        title: "WARNING: THIS WILL P*CK UP YOUR PARK!",
        header: "WATCH WHAT HAPPENS WHEN",
        message: "I CAST A SPELL I DON'T KNOW!",
        button: "SNOWGRAVE",
        onClick: () => 
            {
                var x = map.size.x;//Gets the size of the map
                var y = map.size.y;
                var iceIndex = (objectManager.load("rct2.terrain_surface.ice")).index;
                console.log(iceIndex);
                var surfaces = objectManager.getAllObjects("terrain_surface");
                for(let i = 1; i < (x - 1); i++){//check the x's. Map.size gives a couple coordinates off the map, so we exclude those.
                    for(let j = 1; j < (y - 1); j++){//check the y's
                        var tile = map.getTile(i,j).elements;//get the tile data
                        for(let k = 0; k < tile.length; k++){//iterate through everything on the tile
                            if(tile[k].type == "surface"){//if it's a surface element
                                var surface = tile[k] as SurfaceElement;
                                surface.surfaceStyle = iceIndex;
                            }
                        }
                    }
                }
                ui.showError("I don't feel so good...", "I think... I'm going to go home...");
            }
    }
]

function showAd(ad: Ad): void {
    if (ui) {
        ui.openWindow({
            classification: "popup",
            title: ad.title,
            width: 300,
            height: 100,
            colours: [context.getRandom(0, 32), context.getRandom(0, 32)],
            widgets: [
                {
                    type: "label",
                    x: 0,
                    y: 25,
                    width: 300,
                    height: 25,
                    text: ad.header,
                    textAlign: "centred"
                },
                {
                    type: "label",
                    x: 0,
                    y: 50,
                    width: 300,
                    height: 25,
                    text: ad.message,
                    textAlign: "centred"
                }
                ,
                {
                    type: "button",
                    x: 0,
                    y: 75,
                    width: 300,
                    height: 25,
                    text: ad.button,
                    onClick: ad.onClick as () => void || (() => { console.log("No button code provided"); })
                }
            ]
        });
    }
}

function showRandomAd(): void {
    const adId = context.getRandom(0, adPool.length);
    showAd(adPool[adId]);
}