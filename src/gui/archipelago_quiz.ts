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
        colors: [38,13], //Colors for the popup
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
                    ui.showError("Incorrect","Some buisness graduate was behind every microtransaction in gaming.");
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
                tooltip: 'Toxic Oxygen? In *MY* SCUBA tank? It\'s more likely than you think!',
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
    },
    {//The Game
        colors: [1,4], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"Some friends of mine started this thing called the competition. If you think about it, you win!",
        label2: "but beware, this comes at a great price. You just lost the game!",
        label2_tooltip: "They're no longer my friends.",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Dangit',
                tooltip: 'I\'ve been playing since 2009!',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Why?',
                tooltip: 'No, it hasn\'t gotten old yet.',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'You faltu!',
                tooltip: 'That was one of my favorite words from India!',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Junk fellow!',
                tooltip: 'Yes, I\'m trying to force my broken English onto you.',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Waste fellow!',
                tooltip: 'I will not apologize for my actions.',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'You p*ck n*ck!',
                tooltip: 'Here in OpenRCT2, we refrain from all swearing. Even the bird swears.',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: '{INLINE_SPRITE}{164}{20}{0}{0}',
                tooltip: '{INLINE_SPRITE}{164}{20}{0}{0}',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: '{INLINE_SPRITE}{194}{20}{0}{0}',
                tooltip: '{INLINE_SPRITE}{194}{20}{0}{0}',
                onClick: function() {
                    archipelago_send_message("Say", "I lost the game!");
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'The Game?',
                tooltip: 'Dude, the games been around since like, 1976. What do you mean you haven\'t heard of it?',
                onClick: function() {
                    ui.showError("The rules are simple: ","If you think about the game, you lose the game. Tell your friends and they\'ll lose too!")
                }
            }
        ]
    },
    {//Spelling
        colors: [50,4], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"I swear, some people don't know how to spell names",
        label2: "but beware, this comes at a great price. What is the correct spelling?",
        label2_tooltip: "It's a treal Tragedeigh",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Colby',
                tooltip: 'This is an old English word for "Coal Miner"',
                onClick: function() {
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Kolby',
                tooltip: 'This is an old English word for "Koal Miner"',
                onClick: function() {
                    park.cash -= 5000;
                    ui.showError("Incorrect:", "That there was a " + context.formatString("{CURRENCY2DP}", 5000) + " mistake!")
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Kobe',
                tooltip: "Isn't this like a basketball player or something?",
                onClick: function() {
                    park.cash -= 4200;
                    ui.showError("Incorrect:", "That there was a " + context.formatString("{CURRENCY2DP}", 4200) + " mistake!")
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Cobe',
                tooltip: "Isn't this like a football player or something?",
                onClick: function() {
                    park.cash -= 690;
                    ui.showError("Incorrect:", "That there was a " + context.formatString("{CURRENCY2DP}", 690) + " mistake!")
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Colbeigh',
                tooltip: 'I swear if you click this button...',
                onClick: function() {
                    park.cash -= 20000;
                    ui.showError("What the p*ck dude?", "I'm charging you " + context.formatString("{CURRENCY2DP}", 20000) + " for that offense against spelling.")
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//Sea Shanty
        colors: [38,4], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"Sea Shanties never should have gone out of style",
        label2: "but beware, this comes at a great price. Which of the following is a Longest Johns Original?",
        label2_tooltip: "Dude, they're such a good vocal group.",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'Wellerman',
                tooltip: 'Soon may the Wellerman come, to bring us sugar and tea and rum!',
                onClick: function() {
                    ui.showError("That is incorrect.", "So now you get ducks! (Maybe... they sometimes don't show up.")
                    context.executeAction("cheatset", {type: 46, param1: 50, param2: 0}, () => console.log("Added 50 ducks to the park."));
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Drunken Sailor',
                tooltip: 'What shall we do with a Drunken Sailor early in the morning?',
                onClick: function() {
                    ui.showError("That is incorrect.", "So now you get ducks! (Maybe... they sometimes don't show up.")
                    context.executeAction("cheatset", {type: 46, param1: 50, param2: 0}, () => console.log("Added 50 ducks to the park."));
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Santiana',
                tooltip: "Oh Santiana gained a day. Away Santiana!",
                onClick: function() {
                    ui.showError("That is incorrect.", "So now you get ducks! (Maybe... they sometimes don't show up.")
                    context.executeAction("cheatset", {type: 46, param1: 50, param2: 0}, () => console.log("Added 50 ducks to the park."));
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Old Maui',
                tooltip: "Rolling down to Old Maui me boys! Rolling down to Old Maui!",
                onClick: function() {
                    ui.showError("That is incorrect.", "So now you get ducks! (Maybe... they sometimes don't show up.")
                    context.executeAction("cheatset", {type: 46, param1: 50, param2: 0}, () => console.log("Added 50 ducks to the park."));
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Moby Duck',
                tooltip: 'Row ho! Row ho! And with any luck! We\'ll win the day and do away the dreaded Moby Duck!',
                onClick: function() {
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'Fish in the Sea',
                tooltip: 'And it\'s windy weather boys! Stormy weather boys! When the wind blows, we\'re all together boys!',
                onClick: function() {
                    ui.showError("That is incorrect.", "So now you get ducks! (Maybe... they sometimes don't show up.")
                    context.executeAction("cheatset", {type: 46, param1: 50, param2: 0}, () => console.log("Added 50 ducks to the park."));
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//Ohms Law
        colors: [57,4], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"You should have paid attention in ECEN 150!",
        label2: "but beware, this comes at a great price. Which of the following is Ohms Law??",
        label2_tooltip: "What do you mean you don't know what class that is?",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: 'P = IV',
                tooltip: 'In other words, P = V^2/R',
                onClick: function() {
                    ui.showError("That is incorrect.", "But I mean, you really shouldn't be expected to know that. We'll banish the furries anyways.")
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'V = IR',
                tooltip: 'Circuits go VIR',
                onClick: function() {
                    ui.showError("Correct!", "Because you're such a smart cookie, we'll give you some cash too!")
                    park.cash += 5000;
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'A^2 + B^2 = C^2',
                tooltip: "Pythagorean Ohm was his full name!",
                onClick: function() {
                    ui.showError("That is incorrect.", "You probably should have known that option was Pythogrians therom though.")
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'V = Q/C',
                tooltip: "Do you think OpenRCT2 will ever support LaTEX script?",
                onClick: function() {
                    ui.showError("That is incorrect.", "But I mean, you really shouldn't be expected to know that. We'll banish the furries anyways.")
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            },
            {
                text: 'q = CV',
                tooltip: 'Quantum = Current * Voltage (Trust me brah)',
                onClick: function() {
                    ui.showError("That is incorrect.", "But I mean, you really shouldn't be expected to know that. We'll banish the furries anyways.")
                    explodeFurries();
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
        ]
    },
    {//Dice Roll
        colors: [59,4], //Colors for the popup
        label1: "We can banish all your furries to the {PALELAVENDER} SHADOW REALM,",//First line
        label1_tooltip:"Roll for initiative.",
        label2: "but beware, this comes at a great price. Roll a d6.",
        label2_tooltip: "I'd do a d20, but these quiz windows can only support 9 options.",
        buttons: [//Each button will have a text, tooltip, and function. No more than 9 buttons per challenge
            {
                text: '0',
                tooltip: 'Wait, why is this option even here?',
                onClick: function() {
                    ui.showError("No", "I don't think you understand what a d6 is.");
                    ui.getWindow("archipelago-excorcize-furries").close();
                }
            }
            {
                text: '1',
                tooltip: 'A critical fail on most d20\'s.',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 1){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            },
            {
                text: '2',
                tooltip: 'Despite being the root of the base 2 number system, 2 never appears in base 2.',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 2){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            },
            {
                text: '3',
                tooltip: 'Despite its reputation as a magic number, 3 is actually inert. Pi on the other hand...',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 3){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            },
            {
                text: '4',
                tooltip: 'And here you are. You could be doing literally anything in the world, but instead you\'re reading a toolip for the number 4.',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 4){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            },
            {
                text: '5',
                tooltip: 'I\'ve never liked 5. It just feels a bit too pretentious. You know what I mean?',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 5){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            },
            {
                text: '6',
                tooltip: 'Go big or go home!',
                onClick: function() {
                    let dice_roll = Math.ceil(Math.random() * 6)
                    if(dice_roll == 6){
                        ui.showError("Correct!", ":D")
                        explodeFurries();
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                    else{
                        ui.showError("That is incorrect.", "The correct answer was actually " + String(dice_roll));
                        ui.getWindow("archipelago-excorcize-furries").close();
                    }
                }
            }
        ]
    }
]

function returnChallenge(){
    return challenges[Math.floor(Math.random() * challenges.length)];
}