const ProfileStats = require('../../../models/profile_stats_model.js');
const config = require('../../../config.js')

const dailyCredits = 100;

module.exports.claimCredits = function(message) {
    
    var discordId = message.author.id;
    var currDatetime = new Date();
    ProfileStats.getLastClaimedTimestamp(discordId, res => {
        console.log(res);
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
                message.channel.send("You have " + diffHrs + " Hours," + diffMins + " Mins, " + diffSecs + " Secs to go before you are able to claim another daily!")
            } else {
                // If more than 24 hours have passed since the last claim, add the daily credits to the account credit count
                ProfileStats.addCredits(discordId, dailyCredits, res => {
                    if (res) {
                        message.channel.send(dailyCredits + " have been credited to your account!");
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

//Retrieves the stored value in the account
module.exports.getCredits = function(message) {
    var discordId = message.author.id;
    ProfileStats.getCredits(discordId, res => {
        if (res) {
            message.channel.send("You have " + res + " credits in your bank!");
        } else {
            message.channel.send("An error occured while processing your request. Have you registered an account?");
        }
    })
}