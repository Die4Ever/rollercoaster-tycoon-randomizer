
interface Ad {
    title: string,
    header: string,
    message: string,
    button: string,
    onClick?: Function
}

const adPool: Ad[] = [
    {
        title: "Look Here!",
        header: "Centipedes? In My Park?",
        message: "It's more likely than you think.",
        button: "Find Out More"
    },
    {
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
    {
        title: "Great Product",
        header: "Hate Ads?",
        message: "Download Our Popup Blocker",
        button: "Download Now"
    },
    {
        title: "",
        header: "WARNING!",
        message: "Your PC is about to explode",
        button: "Fix Now"
    },
    {
        title: "Alert",
        header: "Your park is being attacked",
        message: " by bandits. We can help!",
        button: "HELP!"
    },
    {
        title: "Famous!",
        header: "Become Famous!",
        message: "Get 1,000 guests right now!",
        button: "Win"
    },
    {
        title: "Congrats!",
        header: "Congratulations",
        message: "You are the 100,000th player of OpenRCT2!",
        button: "Redeem Prize"
    },
    {
        title: "Free Rides",
        header: "Download Roller Coaster for your park!",
        message: "Excitement guaranteed!",
        button: "Download"
    },
    {
        title: "Invest",
        header: "Invest in RCT Stock",
        message: "Make $1000s!",
        button: "Take Me There"
    },
    {
        title: "Broke?",
        header: "Need a Lawyer?",
        message: "Sawyer Law Offices can help",
        button: "Call"
    },
    {
        title: "Did You Know?",
        header: "1% of Tycoons Don't Know",
        message: "These ten simple tricks!",
        button: "Click Here"
    },
    {
        title: "Survey",
        header: "Complete our survey",
        message: "You can win big bucks!",
        button: "Take Survey"
    },
    {
        title: "Advice",
        header: "Need Coaster Advice?",
        message: "",
        button: "Call Now"
    },
    {
        title: "CC",
        header: "Looking for excitement?",
        message: "Look to Crowd Control!",
        button: "https://crowdcontrol.live/"
    },
    {
        title: "RCT2",
        header: "Enjoying Yourself?",
        message: "Play OpenRCT2 Yourself!",
        button: "https://openrct2.org/"
    },
    {
        title: "Action Required",
        header: "You're Being Sued!",
        message: "",
        button: "View Details"
    },
    {
        title: "Popup",
        header: "",
        message: "Your Text Here",
        button: "Button"
    },
    {
        title: "Woah!!",
        header: "Looking for Rides?",
        message: "We have the best rides in %{location}",
        button: "See More"
    },
    {
        title: "Popups",
        header: "Make Your Own Popup!",
        message: "",
        button: "We Can Help"
    },
    {
        title: "Download",
        header: "Here is your download:",
        message: "openrct3.dat (43.5 mB)",
        button: "DOWNLOAD"
    },
    {
        title: "CLOSE THIS WINDOW!",
        header: "Tired of the buttons not closing these windows?",
        message: "Fix it today!",
        button: "Click here!"
    },
    {
        title: "Archipelago",
        header: "Have you checked your tracker?",
        message: "do it.",
        button: "Finish Sphere 1"
    },
    {
        title: "",
        header: "",
        message: "",
        button: ""
    },
    {
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
    {
        title: "Freedom!",
        header: "This game is sponsored by Linux Mint!",
        message: "Linux is vastly superior to Windows!",
        button: "Upgrade today!",
        onClick: () => {archipelago_print_message("Go to LinuxMint.com and click \"Download\"")}
    },
    {
        title: "Lorem ipsum",
        header: "Aliquam euismod, risus vel ultricies ornare",
        message: "Nam feugiat est in diam maximus consectetur.",
        button: "Phasellus imperdiet auctor nisi."
    },
    {
        title: "Uh oh!",
        header: "Something broke!",
        message: "TELL COLBY RIGHT NOW!",
        button: "CALL 1-800-FIX-IT-4-U!"
    },
    {
        title: "Ein deutscher Text",
        header: "Dieser Aufplopper ist nun Teil der Bundesrepublik Deutschland",
        message: "Jegliche Nutzung von Angelsächsich ist strengstens untersagt",
        button: "Sehr schön!"
    },
    {
        title: "ERROR",
        header: "The archipelago client has detected a desync.",
        message: "Tell the dev to make error reporting work better.",
        button: "Discord"
    },
    {
        title: "Typescript!",
        header: "Ever want to pull your hair out learning the dumbest language?.",
        message: "Try Typescript today!.",
        button: "[object Object]"
    },
    {
        title: "Guests Hate Him!",
        header: "See how this park owner earns millions",
        message: "each month with this one simple trick!",
        button: "You need to know!"
    },
    {
        title: "A Companion to the Bible?",
        header: "This book will change your life!",
        message: "Order your free copy of The Book of Mormon Today!",
        button: "Mormon.org"
    },
    {
        title: "Compy 386",
        header: "FLAGRANT SYSTEM ERROR",
        message: "COMPUTER OVER",
        button: "VIRUS = VERY YES",
        onClick: () => 
            {
                ui.showError("","That's not a good prize!")
            }
    },
    {
        title: "Compy 386",
        header: "Edgar the Virus Hunter",
        message: "Programmed entirely in Mom's basement",
        button: "Scan System",
        onClick: () => 
            {
                archipelago_print_message("Scanning...........................423,827 Viruses Found! A New Record!")
            }
    },
    {
        title: "Got Problem?",
        header: "Rat Biting Problem in your Car?",
        message: "It's extremely hazardous!",
        button: "Call Kumar Babu Today!",
    },
    {
        title: "Get Orange Pilled",
        header: "Cities aren't loud!",
        message: "CARS ARE LOUD!",
        button: "Remove Cars From Your City",
        onClick: () => 
            {
                ui.showError("Learn More!", "Look up 'Not Just Bikes' on YouTube!")
            }
    },
    {
        title: "A Conspiracy in the Greater Cosmere",
        header: "Money isn't actually money. Each guest is invested, roughly between .75 and 1.8 Breath Equivalent Units.",
        message: "Rides are powered by guests using investiture, measured in $$$. If a perpendicularity is opened in a park, the park will become an important part of the greater Cosmere.",
        button: "This is why ride costs $300 instead of $50,000.",
        onClick: () => 
            {
                ui.showError("We convert the guests essence directly into rides.", "Keep an eye out for Hoid!");
            }
    },
    {
        title: "DO NOT",
        header: "DO NOT CLICK THIS BUTTON. IT WILL MAKE YOUR PARK EXTREMELY UGLY",
        message: "I'M NOT EVEN JOKING, YOU WILL REGRET THIS",
        button: "RUIN PARK",
        onClick: () => 
            {
                var x = map.size.x;//Gets the size of the map
                var y = map.size.y;
                for(let i = 1; i < (x - 1); i++){//check the x's. Map.size gives a couple coordinates off the map, so we exclude those.
                    for(let j = 1; j < (y - 1); j++){//check the y's
                        var tile = map.getTile(i,j).elements;//get the tile data
                        for(let k = 0; k < tile.length; k++){//iterate through everything on the tile
                            if(tile[k].type == "surface"){//if it's a surface element
                                var surface = tile[k] as SurfaceElement;
                                surface.surfaceStyle = Math.floor(Math.random()*14);
                            }
                        }
                    }
                }
                ui.showError("I TOLD YOU!", "YOU WERE WARNED BUT CLICKED THE BUTTON ANYWAYS! Now you must live with the consequences of your hubris!")
            }
    },
    {
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
    {
        title: "--  ---  .-.  ...  . / -.-.  ---  -..  .  -.-.--",//Morse code!
        header: "..  ..-. / -.--  ---  ..- / -.-.  .-  -. / .-.  .  .-  -.. / --  .",//If you can read me
        message: "-.--  ---  ..- / --  ..  --.  ....  - / ....  .-  ...-  . / .-",//you might have a
        button: "-  ---  ..-  -.-.  .... / ---  ..-. / -  ....  . / -  ..  ...  --",//touch of the 'tism
    },
    {
        title: "I live in the depths of this Antarctic Winter",
        header: "The sun doesn't exist",
        message: "The Sun has Never Existed",
        button: "Colby shall return with a new Sun soon",
        onClick: () => 
            {
                ui.showError("","This message was written on June 27th 2025, while the developer was in the middle of the Antarctic Winter. I have forgotten the face on the sun...");
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