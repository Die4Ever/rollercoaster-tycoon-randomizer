var challenges = [
    {//Pick a pony
        colors: [5,18], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"I used to wonder what friendship could be...",
        label2: "but beware, this comes at a great price. Who is your favorite pony?",
        label2_tooltip: "But then you all shared its magic with me!",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Twilight Sparkle',
                tooltip: 'The nerdiest of the bunch, which goes a pretty long way.',
                onClick: function() {
                    archipelago_send_message("Say", "Guys, I have a confession. Twilight Sparkle is my favorite pony!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Rainbow Dash',
                tooltip: 'This park needs to be about 20% cooler.',
                onClick: function() {
                    archipelago_send_message("Say", "My dudes, Rainbow Dash is the best pony.");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Pinkie Pie',
                tooltip: "Cause I love to make you smile, smile, smile! Yes I do!",
                onClick: function() {
                    archipelago_send_message("Say", "I love to party. That's why me and Pinkie Pie are spiritually connected.");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                    text: 'Fluttershy',
                    tooltip: "She's not scared of everything... just a lot of things.",
                    onClick: function() {
                        archipelago_send_message("Say", "Um, excuse me everypony. I just wanted to say I really appreciate Fluttershy :)");
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Applejack',
                tooltip: "Do y'all's think a diet of exclusively apples is bad for her health?",
                onClick: function() {
                    archipelago_send_message("Say", "Well, bless my heart, but Applejack's my absolute favorite pony, y'all! Ain't nothin' beats her down-home charm and good ol' country spirit in Ponyville!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Rarity',
                tooltip: "It's really weird that Spike has a crush on her, right? That's actually weird.",
                onClick: function() {
                    archipelago_send_message("Say", "I must say, of all the ponies in Ponyville, Rarity is absolutely the most fabulous!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//Book of Mormon Quiz
        colors: [6,19], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"If anybody asks, I 100% count this as missionary work.",
        label2: "but beware, this comes at a great price. Who is Mormon's son, the final prophet in the Book of Mormon?",
        label2_tooltip: "If you need to read the book, just look for the missionaries! LDS Missionaries specifically.",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Nephi',
                tooltip: '"I Nephi, having been born of goodly parents..."',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'King Benjamin',
                tooltip: 'Preaching atop the wall since 124 BC!',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Moroni',
                tooltip: 'This is the guy you see on top of our temples!',
                onClick: function() {
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: '{TINYFONT}Samuel the Lamanite',
                tooltip: 'Preaching atop the wall, this time while dodging arrows!',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//Degree quiz
        colors: [38,8], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"To be honest, I've never even seen Yugioh. Or Beyblades. What show is the {PALELAVENDER}shadow realm from?.",
        label2: "but beware, this comes at a great price. What is the best degree out of all of these?",
        label2_tooltip: "No, I have no bias at all.",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Physics',
                tooltip: 'What goes up must come down. Except when it doesn\'t',
                onClick: function() {
                    ui.showError("Incorrect","Seriously? Who would suffer through that?");
                }
            },
            {
                text: 'Music',
                tooltip: 'Trombone is the best insturment. Fight me.',
                onClick: function() {
                    ui.showError("Incorrect","I'd prefer a pizza. It can at least feed a family of four.");
                }
            },
            {
                text: 'Buisness',
                tooltip: 'I sell propane and propane accessories!',
                onClick: function() {
                    ui.showError("Incorrect","Some buisness graduate was behind every microtransaction in gaming.")
                }
            },
            {
                text: '{TINYFONT}Electrical Engineering',
                tooltip: 'Technically immune to lightning!',
                onClick: function() {
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//SCUBA Quiz
        colors: [38,7], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"SCUBA: Self Contained Underwater Breathing Apparatus",
        label2: "but beware, this comes at a great price. What is the least likely problem while SCUBA Diving?",
        label2_tooltip: "TUBA: Terrible Underwater Breathing Apparatus",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: '{TINYFONT}Nitrogen Narcosis',
                tooltip: 'Us pros call it "Narked"',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: '{TINYFONT}Oxygen Toxicity',
                tooltip: 'Toxic Oxygen? In *MY* SCUBA tank? It\s more likely than you think!',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: '{TINYFONT}Decompression Sickness',
                tooltip: 'Such little bubbles, so much pain.',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Silt Out',
                tooltip: '"They\'re tiny rocks! How problematic could they be?"',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Hypothermia',
                tooltip: 'Not a problem for me. My Nordic blood gives me 50% immunity to cold damage.',
                onClick: function() {
                    explodeGuests(50);
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Anchor Lesion',
                tooltip: 'Anchors away me boys! Anchors away!',
                onClick: function() {
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    }
]

function returnChallenge(){
    return challenges[Math.floor(Math.random() * challenges.length)];
}