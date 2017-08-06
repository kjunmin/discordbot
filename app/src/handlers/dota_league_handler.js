var http = require('http');
const LeagueModel = require('../../../models/dota_leagues_model.js');

let apiKey = 'C21791F6D196C05D08EED5FE79AFC674';
let leagueStore = [];

const LeagueHandler = module.exports;



module.exports.displayLeagues = (message, leagueIds) => {
    http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetLeagueListing/v0001/?key=' + apiKey
    }, (response) => {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
            var leagueList = [];
            
            console.log("JSON data parsed!");
            for (i=0; i<jsondata.result.leagues.length; i++) {
                if (leagueIds.includes(jsondata.result.leagues[i].leagueid)) {
                    leagueList.push(jsondata.result.leagues[i].name + " " + jsondata.result.leagues[i].leagueid);
                }
            }
            message.channel.send("Current Ongoing Live Leagues:");
            message.channel.send(String(leagueList).replace(/,/g, "\n"));
        });
    });
}

module.exports.getLeague = (leagueId, callback) => {
    http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetLeagueListing/v0001/?key=' + apiKey
    }, (response) => {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
            callback(jsondata.result.leagues);
        });
    });
}

module.exports.addLeague = (message) => {
    let j = message.content.split(" ");
    let leagueId = j[1];
    LeagueHandler.getLeague(leagueId, res => {
        for (i = 0; i < res.length; i++) {
            if (leagueId == res[i].leagueid) {
                let leagueId = res[i].leagueid;
                let leagueName = res[i].name;
                LeagueModel.addLeague(leagueName, leagueId, res => {
                    if (res) {
                        message.channel.send(res);
                    } else {
                        message.channel.send("failed")
                    }
                });
            }
        }
    });
}

module.exports.getMatchDetails = (callback) => {
    http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=' + apiKey
    }, (response) => {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
            callback(jsondata.result.games);
        });
    });
}

module.exports.getPastMatchDetails = (matchId, callback) => {
    http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetMatchDetails/V001/?match_id=' + matchId + '&key=' + apiKey
    }, (response) => {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
            callback(jsondata.result);
        });
    });
}

module.exports.startBet = (message) => {
    let j = message.content.split(" ");
    let matchId = j[1];
    let radiantOdds = j[2];
    let direOdds = j[3];
    if (isNaN(matchId)) {
        message.channel.send("Please input a proper match ID!");
    } else if (isNaN(radiantOdds) || isNaN(direOdds)) {
        message.channel.send("Please enter proper odds for Radiant/dire!");
    } else {
        LeagueHandler.getMatchDetails(res => {
            for (i=0; i < res.length; i++) {
                if (matchId == res[i].match_id) {
                    var radiantTeam;
                    var direTeam;
                    if ( res[i].radiant_team == undefined ) {
                        radiantTeam = "Radiant";
                    } else {
                        radiantTeam = res[i].radiant_team.team_name;
                    }
                    if ( res[i].dire_team == undefined ) {
                        direTeam = "Dire";
                    } else {
                        direTeam = res[i].dire_team.team_name;
                    } 
                    LeagueModel.startBet(matchId, radiantTeam, direTeam, radiantOdds, direOdds, res => {
                        message.channel.send(res);
                    });
                }
            }
        });
    }
}

module.exports.getDotaApi = (message) => {
   
    http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=' + apiKey
    }, (response) => {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
            var leagueList = [];
            
            console.log("JSON data parsed!");
            for (i=0; i<jsondata.result.games.length; i++) {
                if (!leagueList.includes(jsondata.result.games[i].league_id)) {
                    leagueList.push(jsondata.result.games[i].league_id);
                }
            }
            //message.channel.send(String(leagueList).replace(/,/g, "\n"));
            LeagueHandler.displayLeagues(message, leagueList);

        });
    });
}

module.exports.testbed = (message) => {
    LeagueModel.isBetActive(res => {
        console.log(res);
    })
}

module.exports.addBet = (message) => {
    var j = message.content.split(" ");
    var betTeam = j[1];
    var betAmount = j[2];
    var authorId = message.author.id;
    var authorUsername = message.author.username;
    LeagueModel.addBet(authorId, authorUsername, betTeam, betAmount, res => {
        if (res) {
            message.channel.send(res);
        }
    })
}

module.exports.decideWinner = (message) => {
    LeagueModel.isBetActive(isActive => {
        if (isActive) {
            LeagueModel.getActiveBet( res => {
                var matchId = res.match_id;
                LeagueHandler.getPastMatchDetails(matchId, res => {
                    var radiantWin = res.radiant_win;
                    //Match is in progress. No winner has been decided
                    if (radiantWin == undefined) {
                        message.channel.send("The match is still ongoing!");
                    } else {
                        LeagueModel.finalizeBet(radiantWin, res => {
                            message.channel.send(res);
                        })
                    }
                })
            })
        } else {
            message.channel.send("There are no currently active bets!")
        }
    })
    
}

//Displays a list of current ongoing games in a league
module.exports.displayMatches = (message) => {
    var j = message.content.split(" ");
		var gamesList = [];
		if (j[1] == null || parseInt(Number(j[1])) != j[1]) {
			message.channel.sendMessage("Please insert league id. [m!getleaguedata *(leagueid)*].");
			return;
		}
		return http.get({
        host: 'api.steampowered.com',
        path: '/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=' + apiKey
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var radiantTeamName;
            var direTeamName;
            var jsondata = JSON.parse(body);
            console.log("JSON data parsed!");
            for (i=0; i<jsondata.result.games.length; i++) {
                if (jsondata.result.games[i].league_id == j[1]) {
                    if (jsondata.result.games[i].radiant_team == undefined) {
                        radiantTeamName = 'Radiant';
                    }
                    else {
                        radiantTeamName = jsondata.result.games[i].radiant_team.team_name;
                    }
                    if (jsondata.result.games[i].dire_team == undefined) {
                        direTeamName = 'Dire';
                    }
                    else {
                        direTeamName = jsondata.result.games[i].dire_team.team_name;
                    }
                    gamesList.push("Match id: " + jsondata.result.games[i].match_id + "\n**" + radiantTeamName + "** vs **" + direTeamName + "**\n");
                    // message.channel.sendMessage("http://www.trackdota.com/matches/" +  jsondata.result.games[i].match_id);
                }
            }
            message.channel.sendMessage("Matches from league id: " + j[1] + "\n\n" + String(gamesList).replace(/,/g, "\n"));
        });
    });
}


