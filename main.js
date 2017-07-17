const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.js');
const mongoose = require('mongoose');

const messageService = require('./app/src/message_service.js');

//Connect to the database
mongoose.connect(config.database);
mongoose.connection.on('connected', () => {
    console.log('Connected to database '+ config.database);
});


bot.on("ready", () => {
  console.log("Ready and awaiting commands...");
});

// bot.on('message', message => {
// 	message.channel.
// })
bot.on("message", message => {
	if (message.content.startsWith("a")  && !message.author.bot) {
		message.guild.channels.find("name", "general").sendMessage("blabla");
	}
});

// bot.on("guildMemberAvailable", member => {
// 	// if (message.content.startsWith("a")  && !message.author.bot) {
// 		member.guild.channels.find("name", "general").sendMessage("blabla");
// 	// }
// });
messageService.startMessageService(bot);




//log our bot in
bot.login(config.token);