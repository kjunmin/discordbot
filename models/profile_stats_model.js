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
module.exports.getProfileById = (discordId, callback) => {
    let query = {discord_id: discordId};
    ProfileStats.findOne(query, (err, record) => {
        if (err) throw err;
        if (record) {
            callback(record);
        } else {
            callback(null);
        }
        
    });
};

// *NOTE: Unreliable. Use getProfileById for accurate results 
module.exports.getProfileByUsername = (username, callback) => {
    let query = {username: username};
    ProfileStats.findOne(query, (err, record) => {
        if (err) throw err;
        if (record) {
            callback(record);
        } else {
            callback(null);
        }
    });
};

module.exports.getLastClaimedTimestamp = (discordId, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            callback(res.last_claimed_timestamp);
        } else {
            callback(false);
        }
    }) 
};

module.exports.doesUserExist = (discordId, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            //User already exists in database
            callback(true);
        } else {
            //User is unregistered
            callback(false);
        }
    })
};


// Experience Getters/Setters

module.exports.getExperience = (discordId, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            callback(record.credits);
        } else {
            callback(false);
        }
    })
}

module.exports.addExperience = (discordId, experience, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            res.experience += experience;
            res.save();
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

// Credit Getters/setters

module.exports.getCredits = (discordId, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            callback(res.credits);
        } else {
            callback(false);
        }
    });
}

module.exports.isSameId = (discordId, usernameCheck, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            if (res.username == usernameCheck) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

module.exports.setCredits = (discordId, credits) => {
    ProfileStats.getProfileById(discordId, res => {
        res.credits = credits;
        res.save();
    });
}

// Transfers credits from source account to destination account
module.exports.transferCredits = (sourceId, destinationUsername, transferCredits, callback) => {
    var x = ProfileStats.isSameId(sourceId, destinationUsername, isMatch => {
        if (!isMatch) {
            ProfileStats.getProfileById(sourceId, res1 => {
                if (res1) {
                    if (res1.credits >= transferCredits) {
                        ProfileStats.getProfileByUsername(destinationUsername, res2 => {
                            if (res2) {
                                res1.credits -= parseInt(transferCredits);
                                res2.credits += parseInt(transferCredits);
                                res1.save();
                                res2.save();
                                callback(null);
                            } else {
                                callback("The person you are trying to tip does not exist. Please use the username they created the account with.");
                            }
                        })
                    } else {
                        callback("You do not have sufficient credits!");
                    }
                }  else {
                    callback("Please register before you can perform this action");
                }
            });
        } else {
             callback("You cannot tip yourself!");
        }
    });
}

module.exports.claimDailies = (discordId, credits, callback) => {
    ProfileStats.getProfileById(discordId, res=> {
        if (res) {
            res.credits += credits;
            res.last_claimed_timestamp = new Date();
            res.save();  
            callback(true);
        } else {
            callback(false);
        }
    })
}

module.exports.addCredits = (discordId, credits, callback) => {
    console.log(discordId);
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            res.credits += credits;
            res.save();
            callback(true);
        } else {
            callback(false);
        }
    })
};

module.exports.removeCredits = (discordId, credits, callback) => {
    ProfileStats.getProfileById(discordId, res=> {
        if (res) {
            if (res.credits >= credits) {
                res.credits -= credits;
                res.save();
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
};

//Alarm Getters/Setters

module.exports.getAlarmMessage = (discordId, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            callback(res.alarm_message);
        } else {
             //Error, record does not exist
            callback(false);
        }
    });
}

module.exports.setAlarmMessage = (discordId, alarmMessage, callback) => {
    ProfileStats.getProfileById(discordId, res => {
        if (res) {
            res.alarm_message = alarmMessage;
            res.save();
            callback(true);
        } else {
             //Error, record does not exist
            callback(false);
        }
    });
}