const config = require('../../../config.js');

module.exports.helpLists = (message) => {
    var helpList = [];
    // helpList.push("**m!parseleaguedata**: 	Retrives updated Dota 2 league information and stores into database.\n");
    
    // helpList.push("**m!getleaguegames [league id]**: 	Retrieves the match id of the current ongoing league. \n");
    // helpList.push("**m!startbet [match id] [radiant odds] [dire odds]**: 	Starts a bet on the specified match. (Only 1 concurrent bet at a time)\n");
    // helpList.push("**m!placebet [radiant/dire] [bet amount]**: 	Places a bet on the match (Must initiate m!startbet first)\n");
    // helpList.push("**m!decidewinner [matchid]**:	 Analyses results of concluded match and awards bet winners. \n");
    helpList.push("**" + config.prefix + "getleagues**:	Gets a list of ongoing Dota 2 Leagues and their corresponding League ID.\n");
    helpList.push("**" + config.prefix + "getmatches [League Id]**:	Gets a list of ongoing Dota 2 Matches and their corresponding Match ID.\n");
    helpList.push("**" + config.prefix + "addleague [League Id]**:	Sets a league to active betting state.\n");
    helpList.push("**" + config.prefix + "startbet [Match Id] [Radiant Odds] [Dire Odds]**:	Starts a bet with the specified match and odds in the active league.\n");
    helpList.push("**" + config.prefix + "bet [radiant/dire] [Bet Amount]**: Places a bet on the active match (Must have started a bet using startbet).\n");
    helpList.push("**" + config.prefix + "decidewinner **: Ends the current betting session and pays out winnings to all participants.\n");
    helpList.push("**" + config.prefix + "rr**:	Rickrolls.\n");
    helpList.push("**" + config.prefix + "roll [dice faces]**:	 Rolls a n-sided die.\n");
    helpList.push("**" + config.prefix + "register**:	 Create an account.\n");
    helpList.push("**" + config.prefix + "dailies**: 	Claim daily credits. Resets in 24 hours. \n");
    helpList.push("**" + config.prefix + "tip [User] [Amount]**:	 Tip a user an amount from your credits.\n"); 
    helpList.push("**" + config.prefix + "alarm**: 	Sends an alarm message to the entire chat. \n");
    helpList.push("**" + config.prefix + "setalarm [message]**: 	Sets custom tts alarm message. \n");
    helpList.push("**" + config.prefix + "changecolour [colour value]**: 	Changes current role colour. Colour value must be in hex or base 10 number. \n");
    helpList.push("**" + config.prefix + "bank**: 	Shows how many credits you have stashed away. \n");
    message.channel.send(String(helpList).replace(/,/g, " "));
}

module.exports.changeColour = (message) => {
    var j = message.content.split(" ");
    var memRole = [];
    if (j[1] == null) {
        message.channel.send("Please insert valid color, either a hex string or base 10 number. Format:  " + config.
        
        
        prefix + "changecolour *[colour value]*. Replace *[colour value]* with your colour value.");
        return;
    }
    memRole = message.member.roles.array();
    message.member.roles.find('id', memRole[1].id).setColor(j[1]);
    message.channel.send("Color Changed! " + message.author);
}

module.exports.rickRoll = (message) => {
    
    let username = message.author.username;
    let rickLines = [
        ' is never gonna give you up',
        ' is never gonna let you down',
        ' is never gonna run around',
        ' is never gonna desert you',
        ' is never gonna tell a lie',
        ' is never gonna say goodbye',





        ' is never gonna make you cry',
        ' is never gonna hurt you'
    ]
    let count = rickLines.length;




    



    let randRickRoll = Math.floor((Math.random()*count));
    message.channel.send(username + rickLines[randRickRoll]);
}