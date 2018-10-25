const discord = require('discord.io');
const exp = require('express');
const bodyParser = require('body-parser');

const app = exp();

const port = process.env.PORT || 3001;

const channel = process.env.PORT || 504977712792731680;

//bot name
const botName = "pinner";

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	res.status(200).send('YAYYYYYYY! I am up')
});

const bot = new discord.Client({
	autorun: true,
	token: process.env.DISCORD_TOKEN
});

bot.on('ready', (event) => {
	console.log('logged in as ' + bot.username + ' ' + bot.id);
});

bot.on('message', (user, userID, channelID, message, event) => {

	if(message.includes('pinner-pin~') && channelID === channel) {

		let url = message.split('~')[1].trim();
		bot.simulateTyping( channelID );
		bot.sendMessage({
			to: channelID,
			message: 'by ' + "<@!" + userID + ">" + "\n" + url
		});
	}

	if (event.d.author.username === botName) {
		bot.pinMessage({
		 	channelID: channelID,
		 	messageID: event.d.id
		});
		console.log(event.d.id)
	}
});

app.listen(port, (req, res) => {
	console.log("bot is listening on port " + port);
});