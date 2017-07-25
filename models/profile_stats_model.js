const mongoose = require('mongoose');
const config = require('../config');

//Schema for profile stats
const ProfileStatsSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    discord_id: {
        type: String,
        require:true
    },
    credits: {
        type: Number,
        require: true
    },
    last_claimed_timestamp: {
        type: Date,
        require: true
    },
    experience: {
        type: Number,
        require: true
    },
    rank: {
        type: String,
        require: true
    },
    alarm_message: {
        type: String,
        require: true
    }
});

const ProfileStats = module.exports = mongoose.model('ProfileStats', ProfileStatsSchema);

//API Query Functions
module.exports.getProfileById = (discord_id, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            callback(record);
        } else {
            callback(err);
        }
        
    });
};

// *NOTE: Unreliable. Use getProfileById for accurate results 
module.exports.getProfileByUsername = (username, callback) => {
    let query = {username: username};
    ProfileStats.findOne(query, callback);
};

module.exports.getLastClaimedTimestamp = (discord_id, datetime) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            datetime(record.last_claimed_timestamp);
        } else {
            //Error, record does not exist
            datetime(false);
        }
    });
};

module.exports.doesUserExist = (discord_id, userExists) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            //Username already exists in database
            userExists(true);
        } else {
            //Username is untaken
            userExists(false);
        }
    });
};


// Experience Getters/Setters

module.exports.getExperience = (id, callback) => {
    ProfileStats.getProfileById(id, record => {
        if (record) {
            callback(record.credits);
        } else {
            callback(false);
        }
    })
}

module.exports.addExperience = (id, experience, callback) => {
    ProfileStats.getProfileById(id, record => {
        if (record) {
            record.experience += experience;
            record.save();
            callback(true);
        } else {
            callback(false);
        }
    })
}

//Register/ Remove/ Query Accounts

module.exports.addProfile = (id, username, callback) => {

    ProfileStats.doesUserExist(id, (userExists) => {
        if (userExists) {
            callback(false);
        } else {
            let newUser = new ProfileStats({
                discord_id: id,
                username: username,
                credits: 100,
                last_claimed_timestamp: new Date(2000, 1, 1 ,1 , 0, 0, 0),
                experience: 0,
                rank: "Novice",
                alarm_message: "ding dong ding dong"
            });

            newUser.save();
            callback(true);
        }
    })

    
};

module.exports.delProfile = (discord_id, callback) => {
   
};

// Credit Getters/setters

module.exports.getCredits = (discord_id, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            callback(record.credits);
        } else {
            //Error, record does not exist
            callback(false);
        }
    });
}

module.exports.isSameId = (discordId, usernameCheck, callback) => {
    let query = {discord_id: discordId};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            if (record.username == usernameCheck) {
                callback(true);
            } else {
                callback(false);
            }
        }
    })
}

module.exports.setCredits = (discordId, credits) => {
    let query = {discord_id: discordId};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            record.credits = credits;
            record.save();
        }
    })
}

// Transfers credits from source account to destination account
module.exports.transferCredits = (sourceId, destinationUsername, transferCredits, callback) => {
    let query = {discord_id: sourceId};
    let query2 = {username: destinationUsername};
    var x = ProfileStats.isSameId(sourceId, destinationUsername, isMatch => {
        if (!isMatch) {
            ProfileStats.findOne(query, (err, record) => {
                if (record) {
                    if (record.credits >= transferCredits) {
                        ProfileStats.findOne(query2, (err, record2) => {
                            if (record2) {
                                record.credits -= parseInt(transferCredits);
                                record2.credits += parseInt(transferCredits);
                                record.save();
                                record2.save();
                                callback(null);
                            } else {
                                callback("The person you are trying to tip does not exist. Please use the username they created the account with.");
                            }
                        });
                    } else {
                        callback("You do not have sufficient credits!");
                    }
                } else {
                    callback("Please register before you can perform this action");
                }
            });
        } else {
             callback("You cannot tip yourself!");
        }
    });
}

module.exports.addCredits = (discord_id, credits, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            record.credits += credits;
            record.last_claimed_timestamp = new Date();
            record.save();
            callback(true);
        } else {
            callback(false);
        }
    });
};

module.exports.removeCredits = (discord_id, credits, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            record.credits -= credits;
            record.last_claimed_timestamp = new Date();
            record.save();
            callback(true);
        } else {
            callback(false);
        }
    });
};

//Alarm Getters/Setters

module.exports.getAlarmMessage = (discord_id, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            callback(record.alarm_message);
        } else {
            //Error, record does not exist
            callback(false);
        }
    });
}

module.exports.setAlarmMessage = (discord_id, alarm_message, callback) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            record.alarm_message = alarm_message;
            record.save();
            callback(true);
        } else {
            //Error, record does not exist
            callback(false);
        }
    });
}