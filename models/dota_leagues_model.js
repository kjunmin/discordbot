const mongoose = require('mongoose'), Schema = mongoose.Schema;
const config = require('../config');
const ProfileStats = require('./profile_stats_model.js');


const UserBetsSchema = mongoose.Schema({
    discord_id: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    bet_team: {
        type: String,
        require: true
    },
    bet_amount: {
        type: Number,
        require: true
    }
});

const UserBets = mongoose.model('UserBets', UserBetsSchema);

const MatchBetsSchema = mongoose.Schema({
    match_id: {
        type: Number,
        require: true
    },
    radiant_team: {
        type: String,
        require: true
    },
    dire_team: {
        type: String,
        require: true
    },
    radiant_odds: {
        type: Number,
        require: true
    },
    dire_odds: {
        type: Number,
        require: true
    },
    active_status: {
        type: Boolean,
        require: true
    },
    match_winner: {
        type: String,
    },
    user_bets: [ UserBetsSchema ]
});

const MatchBets = mongoose.model('MatchBets', MatchBetsSchema);

const DotaLeaguesSchema = mongoose.Schema({
    league_name: {
        type: String,
        require: true
    },
    league_id: {
        type: String,
        require:true
    },
    active_status: {
        type: Boolean,
        require: true
    },
    matches: [ MatchBetsSchema ]
});

const DotaLeagues = module.exports = mongoose.model("DotaLeagues", DotaLeaguesSchema);

module.exports.addLeague = (leagueName, leagueId, callback) => {
    DotaLeagues.doesLeagueExist(leagueId, doesExist => {
        if (!doesExist) {
            let newLeague = new DotaLeagues ({
                league_name: leagueName,
                league_id: leagueId,
                active_status: true
            })
            newLeague.save(err => {
                if (err) throw err;
                else callback("League Successfully Added!");
            });
        } else {
            callback("League already exists!");
        };
    });
};

module.exports.doesLeagueExist = (leagueId, callback) => {
    let query = {league_id: leagueId};
    DotaLeagues.findOne(query, (err, record) => {
        if (err) throw err;
        if (record) {
            callback(true);
        } else {
            callback(false);
        };
    });
};

module.exports.getLeague = (callback) => {
    let query = {active_status: true}; 
    DotaLeagues.findOne(query, (err, record) => {
        if (err) throw err;
        if (record) {
            callback(record);
        } else {
            callback(null);
        };
    });
};

module.exports.getActiveBet = (callback) => {
    DotaLeagues.getLeague(record => {
        if (record) {
            for (i = 0; i < record.matches.length; i++) {
                if (record.matches[i].active_status == true) {
                    callback(record.matches[i]);
                } 
            }
        } else {
            callback("No current active leagues!");
        };
    });
};  

module.exports.isBetActive = (callback) => {
    DotaLeagues.getLeague(record => {
        let flag = false;
        if (record) {
            for (i = 0; i < record.matches.length; i++) {
                if (record.matches[i].active_status == true) {
                    callback(true);
                    flag = true;
                } 
            }
            if (!flag) {
                callback(false);
            };
        } else {
            callback(false);
        };
    });
};  

module.exports.startBet = (matchId, radiantTeam, direTeam, radiantOdds, direOdds, callback) => {
    DotaLeagues.isBetActive(isActive => {
        if (isActive) {
            callback("A betting match is currently ongoing!")
        } else {
            DotaLeagues.getLeague( record => {
                if (record) {
                    console.log(record);
                    let newMatch = new MatchBets({
                        match_id: matchId,
                        radiant_team: radiantTeam,
                        dire_team: direTeam,
                        radiant_odds: radiantOdds,
                        dire_odds: direOdds,
                        active_status: true
                    });
                    record.matches.push(newMatch);
                    record.save(err => {
                        if (err) throw err;
                        else {
                            callback("Betting has officially started for Match:" + matchId + ". " + radiantTeam + "(" + radiantOdds + ") vs " + direTeam + "(" + direOdds + ").");
                        };
                    });
                } else {
                    callback("Add match failed!");
                };
            });
        };
    });    
};


module.exports.addBet = (discordId, username, betTeam, betAmount, callback) => {
    if (betTeam == "radiant" || betTeam == "dire") {
        ProfileStats.removeCredits(discordId, betAmount, res => {
            if (res) {
                DotaLeagues.isBetActive( isActive => {
                    if (isActive) {
                        DotaLeagues.getActiveBet( res => {
                            matchId = res.match_id;
                            DotaLeagues.getLeague(record => {
                                for (i = 0; i<record.matches.length; i++) {
                                    if (record.matches[i].match_id == matchId) {
                                        var team;
                                        var flag = false;
                                        if (betTeam == "radiant") {
                                            team = record.matches[i].radiant_team;
                                        } else if (betTeam == "dire") {
                                            team = record.matches[i].dire_team;
                                        } 
                                        let newBet = new UserBets({
                                            discord_id: discordId,
                                            username: username,
                                            bet_team: team,
                                            bet_amount: betAmount,
                                        });
                                        record.matches[i].user_bets.push(newBet);
                                        record.save();
                                        callback("Successfully placed bet " + betAmount + "credits on " + team);
                                        
                                    };
                                };
                            });
                        });
                    } else {
                        callback("There are currently no betting matches ongoing!")
                    };
                });
            } else {
                callback("Not enough credits to place bet!");
            };
        });
    } else {
        callback("Please input a valid team!");
    };
};

module.exports.finalizeBet = (radiantWin, callback) => {
    var matchId;
    var radiantTeam;
    var direTeam
    var radiantOdds;
    var direOdds;
    var userBetArray;

    DotaLeagues.getActiveBet( res => {
        matchId = res.match_id;
        radiantTeam = res.radiant_team;
        direTeam = res.dire_team;
        radiantOdds = res.radiant_odds;
        direOdds = res.dire_odds;
        DotaLeagues.getLeague(record => {
            for (i = 0; i<record.matches.length; i++) {
                if (record.matches[i].match_id == matchId) {
                    record.matches[i].active_status = false;
                    userBetArray = record.matches[i].user_bets;
                    record.save();
                }
            }
            if (radiantWin) {
                var winnerList = [];
                winnerList.push("**" + radiantTeam + " is victorious over " + direTeam + "!**")
                for (i = 0; i < userBetArray.length; i++) {
                    if (userBetArray[i].bet_team == radiantTeam) {
                        var discordId = userBetArray[i].discord_id;
                        var winnings = parseInt(userBetArray[i].bet_amount) * radiantOdds;
                        winnerList.push(userBetArray[i].username + " has won a bet of " + winnings + " credits!");
                        ProfileStats.addCredits(discordId, winnings, res => {
                            if (!res) {
                                callback("Error");
                            }
                        });
                    }
                }
                callback(String(winnerList).replace(/,/g, "\n"));
            } else {
                var winnerList = [];
                winnerList.push("**" + direTeam + " is victorious over " + radiantTeam + "!**")
                for (i = 0; i < userBetArray.length; i++) {
                    if (userBetArray[i].bet_team == direTeam) {
                        var discordId = userBetArray[i].discord_id;
                        var winnings = parseInt(userBetArray[i].bet_amount) * direOdds;
                        winnerList.push(userBetArray[i].username + " has won a bet of " + winnings + " credits!");
                        ProfileStats.addCredits(discordId, winnings, res => {
                            if (!res) {
                                callback("An error occurred when crediting winnings");
                            }
                        });
                    }
                }
                callback(String(winnerList).replace(/,/g, "\n"));
            };
        });
    });
};