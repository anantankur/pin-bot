const discord = require('discord.io');
const exp = require('express');
const urlMetadata = require('url-metadata');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const app = exp();
app.use(bodyParser.json());
const port = process.env.PORT || 3001;
const channel = process.env.CHANNELRT;
const channel = process.env.CHANNELT;
//bot name
const botName = "pinner";
//db url
let db_url = process.env.DBURL;
// let db_url = "mongodb://127.0.0.1:27017/test";

mongoose.connect(db_url, {useNewUrlParser: true});

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let linkSchema = new mongoose.Schema({
	category: String,
	url_text: String,
	url: String,
	desc: String
});

let Linky = mongoose.model('Linky', linkSchema);

app.get('/', (req, res) => {
	res.status(200).send('YAYYYYYYY! I am up');
});

console.log(Linky.db.name);

const bot = new discord.Client({
	autorun: true,
	token: process.env.DISCORD_TOKEN;
});

bot.on('ready', (event) => {
	console.log('logged in as ' + bot.username + ' ' + bot.id);
});

bot.on('message', (user, userID, channelID, message, event) => {

	let url, category, url_text, desc;

	if (message === "~help~") {
		bot.simulateTyping( channelID );
		bot.sendMessage({
			to: channelID,
			message: "message format -> `!pin url`"+"\n"
			+"`no need to wrap any text in commas/brackets`"+" :smiley:"
		});
	}	else if(message.startsWith('!pin') && (user !== botName) && (channelID === CHANNELT || channelID === CHANNELRT)) {

			try{
				url = message.substr(4).trim();
				console.log(url);

				urlMetadata(url).then(
				function (metadata) { // success handler
					category = "random";
					url_text = metadata.title;
					desc = metadata.description;
					bot.sendMessage({
						to: channelID,
						message: 'by ' + user + "\n" + url
					});

					Linky.create({category, url_text, url, desc}, function(err, newData){
					    if(err){
					      console.log(err);
					    } else {
					      console.log('data saved');
					    }
				  	});
					console.log(metadata.title)
				},
				function (error) { // failure handler
					bot.sendMessage({
						to: channelID,
						message: 'whoops '+'message format is ```!pin url``` no need to wrap in inverted-commas or brackets'
					});
					console.log(error)
				})

		  	} catch(err) {
		  		console.log(err)
				bot.simulateTyping( channelID );
				bot.sendMessage({
					to: channelID,
					message: 'error'
				});
			}
			
		}

});

//route for data
app.get('/data', (req, res) => {
	Linky.find({}, function (err, result) {
		if (err){
			throw err;
			res.status(500).send();
		};

		res.json(result);
	});
});

app.listen(port, (req, res) => {
	console.log("bot is listening on port " + port);
});