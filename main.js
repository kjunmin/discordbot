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

messageService.startMessageService(bot);




//log our bot in
bot.login(config.token);