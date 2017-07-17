const helpHandler = require('./handlers/info_handler.js');
const registerHandler = require('./handlers/register_handler.js');
const creditHandler = require('./handlers/credit_handler.js');
const config = require('../../config.js');

module.exports.startMessageService = function(bot) {
	bot.on('message', message => {

		if (message.content.startsWith(config.prefix + "help")  && !message.author.bot) {
			helpHandler.helpLists(message);
		}

		if (message.content.startsWith(config.prefix + "changecolour") && !message.author.bot) {
			helpHandler.changeColor(message);
		}

		if (message.content.startsWith(config.prefix + "alarm")  && !message.author.bot) {
			message.channel.send("ring ring ring, its a telephone, the lights are on but there's no one home", {tts: true});
		}

		if (message.content.startsWith(config.prefix + "register") && !message.author.bot) {
			registerHandler.registerUser(message);
		}

		if (message.content.startsWith(config.prefix + "dailies")  && !message.author.bot) {
			creditHandler.claimCredits(message);
		}

		if (message.content.startsWith(config.prefix + "bank")  && !message.author.bot) {
			creditHandler.getCredits(message);
		}
	})
}

