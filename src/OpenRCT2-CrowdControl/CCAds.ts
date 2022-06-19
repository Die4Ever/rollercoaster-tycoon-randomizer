
interface Ad {
    title: string,
    header: string,
    message: string,
    button: string
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
                    text: ad.button
                }
            ]
        });
    }
}

function showRandomAd(): void {
    const adId = context.getRandom(0, adPool.length);
    showAd(adPool[adId]);
}