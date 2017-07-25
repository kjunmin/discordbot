const ProfileStats = require('../../../models/profile_stats_model.js');
const config = require('../../../config.js');

module.exports.addExperience = function(message) {
    var discordId = message.author.id;
    var randExp = Math.floor((Math.random()*5)+10);
    ProfileStats.addExperience(discordId, randExp, res => {
        console.log(randExp + "exp added to "+ discordId);
    });
}