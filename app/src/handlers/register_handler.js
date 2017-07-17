const ProfileStats = require('../../../models/profile_stats_model.js');


module.exports.registerUser = function(message) {
    
    var id = message.author.id;
    var username = message.author.username;
    message.channel.send(id);
    ProfileStats.doesUserExist(id, userExists => {
        if (!userExists) {
            ProfileStats.addProfile(id, username, (isCreated) => {
                if (!isCreated) {
                    message.channel.send('Account registration failed!');
                } else {
                    message.channel.send('Account successfully registered!');
                }
            });
        } else {
            message.channel.send('User already exists!');
        }
    })
}