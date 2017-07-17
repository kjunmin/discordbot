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
    }
});

const ProfileStats = module.exports = mongoose.model('ProfileStats', ProfileStatsSchema);

//API Query Functions
module.exports.getProfileById = (discord_id, callback) => {
    ProfileStats.findById(discord_id, callback);
};

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

module.exports.getCredits = (discord_id, credits) => {
    let query = {discord_id: discord_id};
    ProfileStats.findOne(query, (err, record) => {
        if (record) {
            credits(record.credits);
        } else {
            //Error, record does not exist
            credits(false);
        }
    });
}

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
                rank: "Novice"
            });

            newUser.save();
            callback(true);
        }
    })

    
};

module.exports.delProfile = (discord_id, callback) => {
   
};

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
