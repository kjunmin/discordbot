const ProfileStats = require('../../../models/profile_stats_model.js');

module.exports.setAlarm = function(message) {
    var discordId = message.author.id;
    var str = message.content;
    var j = str.substr(str.indexOf(' ')+1);
    ProfileStats.setAlarmMessage(discordId, j, res => {
        if (res) {
            message.channel.send("Alarm message saved!");
        } else {
            message.channel.send("Please register an account before using this function!");
        }
    })
}

module.exports.triggerAlarm = function(message) {
    var discordId = message.author.id;
    ProfileStats.getAlarmMessage(discordId, res => {
        if (res) {
            message.channel.send(res, {tts: true});
        } else {
            message.channel.send("Please register an account before using this function!");
        }
        
    })
    
}