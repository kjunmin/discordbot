const config = require('../../../config.js');

module.exports.helpLists =function(message) {
    var helpList = [];
    // helpList.push("**m!parseleaguedata**: 	Retrives updated Dota 2 league information and stores into database.\n");
    // helpList.push("**getleagues**: 	Get league name and league ids of currently ongoing Dota 2 leagues. \n");
    // helpList.push("**m!getleaguegames [league id]**: 	Retrieves the match id of the current ongoing league. \n");
    // helpList.push("**m!startbet [match id] [radiant odds] [dire odds]**: 	Starts a bet on the specified match. (Only 1 concurrent bet at a time)\n");
    // helpList.push("**m!placebet [radiant/dire] [bet amount]**: 	Places a bet on the match (Must initiate m!startbet first)\n");
    // helpList.push("**m!decidewinner [matchid]**:	 Analyses results of concluded match and awards bet winners. \n");
    helpList.push("**" + config.prefix + "register**:	 Create an account.\n")
    helpList.push("**" + config.prefix + "dailies**: 	Claim daily credits. Resets in 24 hours. \n")
    helpList.push("**" + config.prefix + "tip [User] [Amount]**:	 Tip a user an amount from your credits.\n")
    helpList.push("**" + config.prefix + "alarm**: 	Sends an alarm message to the entire chat. \n")
    helpList.push("**" + config.prefix + "setalarm [message]**: 	Sets custom tts alarm message. \n")
    helpList.push("**" + config.prefix + "changecolour [colour value]**: 	Changes current role colour. Colour value must be in hex or base 10 number. \n")
    helpList.push("**" + config.prefix + "bank**: 	Shows how many credits you have stashed away. \n")
    message.channel.send(String(helpList).replace(/,/g, " "));
}

module.exports.changeColour = function(message) {
    var j = message.content.split(" ");
    var memRole = [];
    if (j[1] == null) {
        message.channel.send("Please insert valid color, either a hex string or base 10 number. Format:  " + config.prefix + "changecolour *[colour value]*. Replace *[colour value]* with your colour value.");
        return;
    }
    memRole = message.member.roles.array();
    message.member.roles.find('id', memRole[1].id).setColor(j[1]);
    message.channel.send("Color Changed! " + message.author);
}