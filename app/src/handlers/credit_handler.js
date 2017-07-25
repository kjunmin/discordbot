const ProfileStats = require('../../../models/profile_stats_model.js');
const config = require('../../../config.js')

const dailyCredits = 100;

module.exports.claimCredits = function(message) {
    
    var discordId = message.author.id;
    var discordUsername = message.author.username;
    var currDatetime = new Date();
    ProfileStats.getLastClaimedTimestamp(discordId, res => {
        if (res) {
            // Gets the difference in seconds between the current timestamp and the last claimed timestamp
            var diff = (currDatetime - res)/1000;
            // If the difference is less than 24 hours, display the time left before another claim is possible
            if (diff < 86400) {
                const dayInSeconds = 86400;
                diff = dayInSeconds - diff;
                diffSecs = Math.floor(diff%60);
                diffMins = Math.floor((diff%3600)/60);
                diffHrs = Math.floor(diff/3600);
                message.channel.send("You have " + diffHrs + " Hours," + diffMins + " Mins, " + diffSecs + " Secs to go before you are able to claim another daily! <:biblethump:337835033530466305>")
            } else {
                // If more than 24 hours have passed since the last claim, add the daily credits to the account credit count
                ProfileStats.addCredits(discordId, dailyCredits, res => {
                    if (res) {
                        message.channel.send(":moneybag: | **" + discordUsername +", " + dailyCredits + " credits have been deposited in your account!**");
                    } else {
                        message.channel.send("Uh oh. Something went wrong...");
                    }
                })
            }

        } else {
            message.channel.send("Please register before claiming your daily credits. Use **" + config.prefix + "register** to register an account.");
        }
        
    });
}

// TODO: Add functionality
module.exports.transferCredits = function(message) {
    let sourceId = message.author.id;
    let sourceUsername = message.author.username;
    let x = message.content.split(" ");
    let destinationUsername = x[1];
    let transferAmount = x[2];
    if (isNaN(transferAmount)) {
        console.log("Not a number");
    } else {
        console.log(transferAmount);
        ProfileStats.transferCredits(sourceId, destinationUsername, transferAmount, err => {
            if (err) {
                message.channel.send(err);
            } else {
                message.channel.send(sourceUsername + " has tipped " + destinationUsername + " " + transferAmount + " credits!");
            }
        });
    }
}

module.exports.setCredits = function(message) {
    let discordId = message.author.id;
    let x = message.content.split(" ");
    let creditsSet = x[1];
    ProfileStats.setCredits(discordId, creditsSet);
}

//Retrieves the stored value in the account
module.exports.getCredits = function(message) {
    var discordUsername = message.author.username;
    var discordId = message.author.id;
    ProfileStats.getCredits(discordId, res => {
        if (res) {
            message.channel.send("<:pogchamp:337835033874137108> You have " + res + " credits in your bank! <:kreygasm:337835033643450370>");
        } else {
            message.channel.send("An error occured while processing your request. Have you registered an account?");
        }
    })
}