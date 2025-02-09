
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
        button: "Get $1000"
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