const Discord = require("discord.js");
const mysql = require('mysql');
const bot = new Discord.Client();
const request = require('ajax-request');
const token = "<bot token>";
const apiKey = "<API_KEY>";
const http = require('http');


//flags and global variables for storing ongoing bets


var connection = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "password",
	database: "botdatabase"
});
connection.connect();

bot.on('ready', () => {
  console.log("Bot successfully connected!");
	bot.user.setStatus('status', 'with fire')
 .then(user => console.log('Changed status!'))
 .catch(console.log);
 return http.get({
 		host: 'api.steampowered.com',
 		path: `/IDOTA2Match_570/GetLeagueListing/v0001/?key=${apiKey}`
 }, function(response) {
 		// Continuously update stream with data
 		var body = '';
 		response.on('data', function(d) {
 				body += d;
 		});
 		response.on('end', function() {
 				// Data reception is done, do whatever with it!
 				var jsondata = JSON.parse(body);
 				console.log("JSON data parsed!");
 				for (m=0; m< jsondata.result.leagues.length; m++) {
 							var info = {
 								"leagueid": jsondata.result.leagues[m].leagueid,
 								"tournamentname": jsondata.result.leagues[m].name,
 								"desc": jsondata.result.leagues[m].description,
 								"tournamenturl": jsondata.result.leagues[m].tournament_url
 							}
 							connection.query("INSERT IGNORE INTO tournament_data SET ?", info, function(error) {
 								if (error) console.log(error);
 							})
 							console.log("leagueid "+ m +" inserted!");
 				}
 				console.log("Tournament data inserted into database!");
 		});
 });
});

bot.on('message', message => {

	if (message.content === "m!g" && !message.author.bot) {
		message.channel.sendMessage(message.author.id);
	}

	if (message.content === "m!help" && !message.author.bot) {
		var helpList = [];
		helpList.push("**m!createaccount**:	 Creates an account to be used for betting.\n")
		helpList.push("**m!parseleaguedata**: 	Retrives updated Dota 2 league information and stores into database.\n");
		helpList.push("**getleagues**: 	Get league name and league ids of currently ongoing Dota 2 leagues. \n");
		helpList.push("**m!getleaguegames [league id]**: 	Retrieves the match id of the current ongoing league. \n");
		helpList.push("**m!startbet [match id] [radiant odds] [dire odds]**: 	Starts a bet on the specified match. (Only 1 concurrent bet at a time)\n");
		helpList.push("**m!placebet [radiant/dire] [bet amount]**: 	Places a bet on the match (Must initiate m!startbet first)\n");
		helpList.push("**m!decidewinner [matchid]**:	 Analyses results of concluded match and awards bet winners. \n");
		helpList.push("**m!dailies**: 	Claim daily credits. Resets in 24 hours. \n")
		helpList.push("**m!leaderboard**: 	Shows the global leaderboard stats. \n")
		helpList.push("**m!changecolor [color value]**: 	Changes current role color. Color value must be in hex or base 10 number. \n")
		helpList.push("**m!roles**: 	Shows the current server roles. \n")
		message.channel.sendMessage(String(helpList).replace(/,/g, " "));
	}
	//Run before starting bets to update league ids in database
	if (message.content === "m!roles" && !message.author.bot) {
		//message.member.addRole("223417247467700225")
		var guildRoles = [];
		guildRoles = message.guild.roles.array();
		console.log(guildRoles[1]);
		for (i=0; i<guildRoles.length; i++) {
			message.channel.sendMessage(guildRoles[i].id + "    " + guildRoles[i].name);
		}
	}

	if (message.content === "m!register" && !message.author.bot) {
		connection.query("SELECT * FROM servers WHERE serverid = ?", message.guild.id, function(err, rows, fields) {
			if (err) console.log(err);
			else if (rows.length == 1) {
				message.channel.sendMessage("Server has already been registered!");
				return;
			}
			else {
				var info = {
			 	 "servername": message.guild.name,
			 	 "serverid": message.guild.id,
			 	 "ownerid": message.guild.owner.id
			  }
			  connection.query("INSERT IGNORE INTO servers SET ?", info, function(error) {
			 	 if (error) console.log(error);
				 console.log("New server registration added!");
				 message.channel.sendMessage("Server successfully registered!")
			  })
			}
		})
	}
	//Allows users to change color of their roles
	if (message.content.startsWith("m!changecolor") && !message.author.bot) {
		var j = message.content.split(" ");
		var memRole = [];
		if (j[1] == null) {
			message.channel.sendMessage("Please insert valid color, either a hex string or base 10 number. [m!changecolor *(color value)*].");
			return;
		}
		memRole =	message.member.roles.array();
		message.member.roles.find('id', memRole[1].id).setColor(j[1]);
		//console.log(message.member.roles.find('id', memRole[1].id));
		console.log("Color set!");
	}

	if (message.content === 'm!parseleaguedata' && !message.author.bot){
		return http.get({
        host: 'api.steampowered.com',
        path: `/IDOTA2Match_570/GetLeagueListing/v0001/?key=${apiKey}`
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
						console.log("JSON data parsed!");
						for (m=0; m< jsondata.result.leagues.length; m++) {
									var info = {
										"leagueid": jsondata.result.leagues[m].leagueid,
										"tournamentname": jsondata.result.leagues[m].name,
										"desc": jsondata.result.leagues[m].description,
										"tournamenturl": jsondata.result.leagues[m].tournament_url
									}
									connection.query("INSERT IGNORE INTO tournament_data SET ?", info, function(error) {
										if (error) console.log(error);
									})
									console.log("leagueid "+ m +" inserted!");
						}
						console.log("Tournament data inserted into database!");
        });
    });
	}
	//Get tournament names and ids currently
	if (message.content === 'm!getleagues' && !message.author.bot) {
		return http.get({
        host: 'api.steampowered.com',
        path: `/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=${apiKey}`
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
						var leagueListing = [];
            var jsondata = JSON.parse(body);
						var leagueList = [];
						console.log("JSON data parsed!");
						for (i=0; i<jsondata.result.games.length; i++) {
							if (!leagueList.includes(jsondata.result.games[i].league_id)) {
								leagueList.push(jsondata.result.games[i].league_id);
							}
						}
						connection.query("SELECT * FROM tournament_data", function(err, rows, fields) {
							for (k=0; k<leagueList.length; k++) {
								for (l=0; l< rows.length; l++) {
									if (leagueList[k] == rows[l].leagueid) {
										leagueListing.push(rows[l].tournamentname + "    league id: " + rows[l].leagueid);
										break;
									}
								}
							}
							message.channel.sendMessage(String(leagueListing).replace(/,/g, "\n"));
						})
				});
		});

	}
	//get games currently playing by league id
	if (message.content.startsWith('m!getleaguegames') && !message.author.bot) {
		var j = message.content.split(" ");
		var gamesList = [];
		if (j[1] == null || parseInt(Number(j[1])) != j[1]) {
			message.channel.sendMessage("Please insert league id. [m!getleaguedata *(leagueid)*].");
			return;
		}
		return http.get({
        host: 'api.steampowered.com',
        path: `/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=${apiKey}`
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
						var radiant_team_name;
						var dire_team_name;
            var jsondata = JSON.parse(body);
						console.log("JSON data parsed!");
						connection.query("SELECT * FROM tournament_data WHERE leagueid = ?", j[1], function(err, rows, fields) {
							if (err) console.log(err);
							if (rows.length == 0) {
								message.channel.sendMessage("Invalid league id");
								return;
							}
						})
						for (i=0; i<jsondata.result.games.length; i++) {
							if (jsondata.result.games[i].league_id == j[1]) {
								if (jsondata.result.games[i].radiant_team == undefined) {
									radiant_team_name = 'radiant';
								}
								else {
									radiant_team_name = jsondata.result.games[i].radiant_team.team_name;
								}
								if (jsondata.result.games[i].dire_team == undefined) {
									dire_team_name = 'dire';
								}
								else {
									dire_team_name = jsondata.result.games[i].dire_team.team_name;
								}
								gamesList.push("Match id: " + jsondata.result.games[i].match_id + "\n**" + radiant_team_name + "** vs **" + dire_team_name + "**\n");
							}
						}
						message.channel.sendMessage("Matches from league id: " + j[1] + "\n\n" + String(gamesList).replace(/,/g, "\n"));
				});
		});

	}
	//manual decidewinner
	if (message.content.startsWith('m!decidewinner') && !message.author.bot) {
		var j = message.content.split(" ");
		var decide_match_id = j[1];
		return http.get({
				host: 'api.steampowered.com',
				path: `/IDOTA2Match_570/GetMatchDetails/V001/?match_id='+decide_match_id+'&key=${apiKey}`
		}, function(response) {
				// Continuously update stream with data
				var body1 = '';
				response.on('data', function(d) {
						body1 += d;
				});
				response.on('end', function() {
						// Data reception is done, do whatever with it!

						message.channel.sendMessage("Match End! Analyzing results...");
						var jsondataresult = JSON.parse(body1);
						var winnerList = [];
						var str = JSON.stringify(jsondataresult);
						if(str.includes("Match ID not found") || str.includes("Practice matches are not available via GetMatchDetails") || str==" " || str.length == 0) {
							console.log("error parsing file");
							message.channel.sendMessage("Match ID not found, please enter a valid match_id");
							return;
						}
						if (jsondataresult.result.radiant_win == false) {
							message.channel.sendMessage("Dire Victory!");
							connection.query("UPDATE bet_stats SET match_concluded = 'yes' WHERE matchid = '"+ decide_match_id +"' AND serverid = ?", message.guild.id, function(error) {
								if (error) {console.log(error);}
							})
							connection.query("SELECT * FROM bet_stats WHERE bet_team='dire' AND matchid = '" + decide_match_id + "' AND serverid = ?", message.guild.id, function(err, rows) {
								if (err) console.log(err);
								else {
									for (i=0; i<rows.length; i++) {
										//update winnings
										var player_credit_won = Math.floor(rows[i].dire_odds*rows[i].bet_amount);
										winnerList.push(("Congratulations " + rows[i].playername + "! You have won "+ player_credit_won + " credits!"));
										connection.query("UPDATE game_stats SET playercredits = playercredits+"+player_credit_won+" WHERE playername = '" + rows[i].playername +"'", function(error) {
											if (error) {console.log(error);}
										})
									}
									console.log("Match concluded! Match Id: " + decide_match_id);
									connection.query("DELETE FROM server_bets WHERE serverid = ?", message.guild.id, function(err) {
										if (err) console.log(err);
									})
									message.channel.sendMessage(String(winnerList).replace(/,/g, "\n"));
								}
							});
						}
						else if (jsondataresult.result.radiant_win == true) {
							message.channel.sendMessage("Radiant Victory!");
							connection.query("UPDATE bet_stats SET match_concluded = 'yes' WHERE matchid = '"+ decide_match_id +"' AND serverid = ?", message.guild.id, function(error) {
								if (error) {console.log(error);}
							})
							connection.query("SELECT * FROM bet_stats WHERE bet_team='radiant' AND matchid = '" + decide_match_id + "' AND serverid = ?", message.guild.id, function(err, rows) {
								if (err) console.log(err);
								else {
									for (i=0; i<rows.length; i++) {
										//update winnings
										var player_credit_won = Math.floor(rows[i].radiant_odds*rows[i].bet_amount);
										winnerList.push(("Congratulations " + rows[i].playername + "! You have won "+ player_credit_won + " credits!"));
										connection.query("UPDATE game_stats SET playercredits = playercredits+"+player_credit_won+" WHERE playername = '" + rows[i].playername +"'", function(error) {
											if (error) {console.log(error);}
										})
									}
									console.log("Match concluded! Match Id: " + decide_match_id);
									connection.query("DELETE FROM server_bets WHERE serverid = ?", message.guild.id, function(err) {
										if (err) console.log(err);
									})
									message.channel.sendMessage(String(winnerList).replace(/,/g, "\n"));
								}
							});
						}
						else
							message.channel.sendMessage("Match has not concluded yet!");
				});
			});
	}

	if (message.content.startsWith('m!getgamedata') && !message.author.bot) {
		var j = message.content.split(" ");
		if (j[1] == null) {
			message.channel.sendMessage("Please input a game number!");
			return;
		}
		return http.get({
        host: 'api.steampowered.com',
        path: `/IDOTA2Match_570/GetLiveLeagueGames/v0001/?key=${apiKey}`
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var jsondata = JSON.parse(body);
						console.log("JSON data parsed!");
						if (j[1] > jsondata.result.games.length) {
							message.channel.sendMessage("Game value too big. Use a smaller value.");
							return;
						}
						connection.query("SELECT * FROM tournament_data WHERE leagueid = ?", jsondata.result.games[j[1]].league_id, function(err, rows, fields) {
							if (err) console.log(err);
							else {
								if (rows.length != 0) {
									var leaguename = rows[0].tournamentname;
									var leagueurl = rows[0].tournamenturl;
									ongoingLeagueId = jsondata.result.games[j[1]].league_id;
									ongoingMatchId = jsondata.result.games[j[1]].match_id;
									message.channel.sendMessage("Ongoing Match!");
									message.channel.sendMessage("Match Id: " + ongoingMatchId);
									console.log("Match id: " + ongoingMatchId);
									message.channel.sendMessage(leaguename);
									//message.channel.sendMessage(leagueurl);
									message.channel.sendMessage("http://www.trackdota.com/matches/" +  ongoingMatchId);
								}
							}
						})
				});
		});
	}

	if (message.content.startsWith('m!startbet') && !message.author.bot) {
		var bmesg = message.content.split(" ");
		if (bmesg[1] == null || isNaN(bmesg[1]) || bmesg[2] == null || isNaN(bmesg[2]) || bmesg[3] == null || isNaN(bmesg[3])) {
			message.channel.sendMessage("Please enter a valid match id.  [m!startbet *(match id)* *(radiant odds)* *(dire odds)*]  Use [m!getleaguegames *(leagueid)*] to retrieve match ids for a specified league.");
			return;
		}
		connection.query("SELECT * FROM server_bets WHERE serverid = ?", message.guild.id, function(err, rows, fields) {
			if (err) console.log(err);
			if (rows.length != 0) {
				message.channel.sendMessage("Ongoing match has not ended. Please wait till match conclusion before a new match can be started!");
				return;
			}
			else {
					return http.get({
			        host: 'api.steampowered.com',
			        path: `/IDOTA2Match_570/GetLiveLeagueGames/V001/?key=${apiKey}`
			    }, function(response) {
			        // Continuously update stream with data
			        var body = '';
			        response.on('data', function(d) {
			            body += d;
			        });
			        response.on('end', function() {
			            // Data reception is done, do whatever with it!
									var rad_odds = (Math.round((bmesg[2] * 100))) / 100;
									var dir_odds = (Math.round((bmesg[3] * 100))) / 100;
			            var jsondata = JSON.parse(body);
									var str = JSON.stringify(jsondata);
									var gameId = 500;
									for (i=0; i<jsondata.result.games.length; i++) {
										if (bmesg[1] == jsondata.result.games[i].match_id) {
											gameId = i;
											break;
										}
									}
									if (gameId == 500) {
										console.log("Game not found");
										message.channel.sendMessage("Please enter a valid match id.  [m!startbet *(match id)* *(radiant odds)* *(dire odds)*]  Use [m!getleaguegames *(leagueid)*] to retrieve match ids for a specified league.");
										return;
									}
									console.log("JSON data parsed!");
									connection.query("SELECT * FROM tournament_data WHERE leagueid = ?", jsondata.result.games[gameId].league_id, function(err, rows, fields) {
										if (err) console.log(err);
										else {
											if (rows.length != 0) {
												var leaguename = rows[0].tournamentname;
												var leagueurl = rows[0].tournamenturl;
												var radiant_team_name;
												var dire_team_name;
												if (jsondata.result.games[gameId].radiant_team == undefined) {
													radiant_team_name = 'radiant';
												}
												else {
													radiant_team_name = jsondata.result.games[gameId].radiant_team.team_name;
												}
												if (jsondata.result.games[gameId].dire_team == undefined) {
													dire_team_name = 'dire';
												}
												else {
													dire_team_name = jsondata.result.games[gameId].dire_team.team_name;
												}
												console.log("Match started " + [bmesg[1]]);
												message.channel.sendMessage(leaguename + "\nhttp://www.trackdota.com/matches/" +  [bmesg[1]] + "\nOngoing Match!\nMatch Id: " + [bmesg[1]] +"\n**" +radiant_team_name + "** vs **"+ dire_team_name+ "**\nBetting Odds:	 "+ rad_odds + " 	 :    "+ dir_odds + "\nYOU HAVE 3 mins to place your bets!\n");
											}
										}
									})
									var betinfo = {
										"serverid" : message.guild.id,
										"ongoingMatchId" : [bmesg[1]],
										"ongoingLeagueId" : jsondata.result.games[gameId].league_id,
										"radiant_odds" : rad_odds,
										"dire_odds" : dir_odds,
										"betting_open": "yes"
									}
									connection.query("INSERT INTO server_bets SET  ?", betinfo, function(err) {
										if (err) console.log(err);
									});
									setTimeout(function(){
										 message.channel.sendMessage("Betting period has closed!")
										 connection.query("UPDATE server_bets SET betting_open = 'no' WHERE serverid = ?", message.guild.id, function(err) {
											 if (err) console.log(err);
										 });
									 }, 3*60*1000);
			        });
			    });
			}
		});
	}
	//place bet methods

	if (message.content.startsWith('m!placebet') && !message.author.bot) {
		var bet = message.content.split(" ");
		var ongoingMatchId;
		var ongoingLeagueId;
		var radiant_odds1;
		var dire_odds1;
		connection.query("SELECT * FROM server_bets WHERE serverid = ?", message.guild.id, function(err, rows, fields) {
			if (rows[0].betting_open == 'no') {
				message.channel.sendMessage("Betting is closed. Please try again later.");
				return;
			}
			else {
				ongoingMatchId = rows[0].ongoingmatchid;
				ongoingLeagueId = rows[0].ongoingleagueid;
				radiant_odds1 = rows[0].radiant_odds;
				dire_odds1 = rows[0].dire_odds;
			}
		})
		setTimeout(function(){
			connection.query("SELECT * FROM bet_stats WHERE matchid = '" + ongoingMatchId + "' AND playerid = ?", message.author.id, function(err, rows) {
				if (err) console.log(err);
				if (rows.length > 0) {
					message.channel.sendMessage(message.author.username + " has already placed a bet!");
					return;
				}
				else {
					if (bet[1] == 'radiant' || bet[1] == 'dire') {
						connection.query("SELECT playercredits FROM game_stats WHERE playerid=?", message.author.id, function(err, rows, fields) {
							if (err) console.log(err);
							else if (rows[0].playercredits < bet[2]) {
								message.channel.sendMessage(message.author.username + ", you have too little swag in the bank!");
								return;
							}
							else {
								connection.query("UPDATE game_stats SET playercredits = playercredits-"+bet[2]+" WHERE playerid = '" + message.author.id +"'", function(error) {
									if (error) {
										console.log(error);
										return;
									}
								})
								var info = {
									"playerid": message.author.id,
									"playername": message.author.username,
									"bet_amount": bet[2],
									"leagueid": ongoingLeagueId,
									"bet_team": bet[1],
									"matchid": ongoingMatchId,
									"match_concluded": "no",
									"radiant_odds": radiant_odds1,
									"dire_odds": dire_odds1,
									"serverid": message.guild.id
								}
								connection.query("INSERT INTO bet_stats SET ?", info, function(err) {
									if (err) console.log(err);
									else {
										console.log(message.author.username + " bet placed!");
										message.channel.sendMessage(message.author.username + " has placed a bet of " + bet[2] + " credits on team " + bet[1]);
									}
								})
							}
						})
					}
					else
						message.channel.sendMessage(message.author.username + " please choose a valid team!");
				}
			});
		}, 2000);

	}


	if (message.content.startsWith('m!getmatchid') && !message.author.bot) {
		var res = message.content.split(" ");
		message.channel.sendMessage("http://www.dotabuff.com/matches/" + res[1]);
	}

	//create account event. Saves player data to mysql
	if (message.content === 'm!createaccount' && !message.author.bot) {
		connection.query("SELECT * FROM game_stats WHERE playername = ?",message.author.username, function(error, rows, fields) {
			if (error) console.log(error);
			for (i=0; i<rows.length; i++) {
				if (rows[i].playername == message.author.username) {
					message.channel.sendMessage("Player exists in database!");
					console.log("Username Found in database!");
					return;
				}
			}
			message.channel.sendMessage("Creating account, please wait...");
			var info = {
				"playerid": message.author.id,
				"playername": message.author.username,
				"playerxp": "0",
				"playerlevel": "1",
				"playercredits": "200",
				"dailytimer": "2016-1-1 00:00:00"
			}
				connection.query("INSERT INTO game_stats SET ?", info, function(error)	{
				if (error) console.log(error);
				console.log("Player inserted!");
				message.channel.sendMessage("Account created!\nWelcome " + message.author.username + "! You have been awarded 200 credits for signing up!");
			})
		})
  }

	//get players
	if (message.content === 'm!getplayers' && !message.author.bot) {
		connection.query("SELECT playername FROM game_stats", function(error, rows, fields) {
		var playerList = [];
			if (error) 	console.log(error);
			else {
				console.log("Query Success!");
				for (i=0; i<rows.length; i++)
					playerList.push(rows[i].playername);
			}
			message.channel.sendMessage(String(playerList).replace(/,/g, "\n"));
		})
	}
	//run special event
	if (message.content === 'm!runtreasure' && !message.author.bot) {
		(function loop() {
			console.log("timer loop initiated");
    	var rand = Math.round(Math.random() * (300000)) + 600000;
			var randpoke = Math.round(Math.random() * 151);
    	setTimeout(function() {
            message.channel.sendMessage("Interval: " + rand + "ms!");
						message.channel.sendMessage("Pokemon number " + randpoke + " has appeared!");
            loop();
    	}, rand);
		}());
	}

	//daily credits
	if  (message.content === 'm!dailies' && !message.author.bot) {
		connection.query("SELECT * FROM game_stats WHERE playerid = ?", message.author.id, function(error, rows, fields) {
			if (error) 	{console.log(error); return;}
			else {
				var date1 = message.timestamp;
				var date = date1.getFullYear() + '-' +
				    ('00' + (date1.getMonth()+1)).slice(-2) + '-' +
				    ('00' + date1.getDate()).slice(-2) + ' ' +
				    ('00' + date1.getHours()).slice(-2) + ':' +
				    ('00' + date1.getMinutes()).slice(-2) + ':' +
				    ('00' + date1.getSeconds()).slice(-2);
				console.log(date);
				console.log("Query Success!");
				var get_date_time = rows[0].dailytimer;
				var date_diff = date1 - get_date_time;
				var date_diff_hours = date_diff/(1000*60*60);
				var timeLeft = (Math.floor((24-date_diff_hours)*100))/100;
				if ((date_diff_hours - 24) > 0) {
					connection.query("UPDATE game_stats SET playercredits = playercredits+100 WHERE playerid = ?", message.author.id, function(error) {
						if (error) console.log(error);
						else {
							connection.query("UPDATE game_stats SET dailytimer = '" + date + "' WHERE playerid = ?", message.author.id, function(error) {
								if (error) console.log(error);
								else
									console.log("New daily timestamp inserted");
							})
							console.log("Daily credits awarded to "+ message.author.username);
							message.channel.sendMessage("**:moneybag: | Congratulations "+ message.author.username + "! You have gained 100 credits!**");
						}
					})
				}
				else {
					 message.channel.sendMessage(timeLeft + " hours left until daily reset!");
					 return;
				}

			}
		})
	}
	//retrive player credits
	if  (message.content === 'm!bank' && !message.author.bot) {
		connection.query("SELECT * FROM game_stats WHERE playername = ?", message.author.username, function(err, rows, fields) {
			if (err) console.log(err);
			message.channel.sendMessage(message.author.username + ", you have "+ rows[0].playercredits + " credits in the bank!");
		})
	}

	if 	(message.content === 'm!leaderboard' && !message.author.bot) {
		connection.query("SELECT * FROM game_stats ORDER BY playercredits DESC", function(err, rows, fields) {
			var leaderboardList = [];
			if (err) console.log(err);
			else {
				for (i=0; i<rows.length; i++) {
					leaderboardList.push(i+1 + ") " + rows[i].playername + "                        "+ rows[i].playercredits + " credits!");
				}
				message.channel.sendMessage("==============Current leaderboard rankings==============\n" + String(leaderboardList).replace(/,/g, "\n"));
			}
		})
	}
});

//log our bot in
bot.login(token);
