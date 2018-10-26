const discord = require('discord.io');
const exp = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const app = exp();
app.use(bodyParser.json());
const port = process.env.PORT || 3001;
const channel = process.env.CHANNEL;
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
	token: process.env.DISCORD_TOKEN
});

bot.on('ready', (event) => {
	console.log('logged in as ' + bot.username + ' ' + bot.id);
});

bot.on('message', (user, userID, channelID, message, event) => {

	let url, category;

	if (message === "~help~") {
		bot.simulateTyping( channelID );
		bot.sendMessage({
			to: channelID,
			message: "message format -> `pinner-pin~ category ~ anchor_text ~  url ~ description`"+"\n"
			+"category: general, webdesign"+"\n"
			+"no need to wrap any text in commas/brackets"+" :smiley:"
		});
	}	else if(message.includes('pinner-pin~') && (user !== botName) && (channelID === channel )) {

			try{
				category = message.split('~')[1].trim();
				url_text = message.split('~')[2].trim();
				url = message.split('~')[3].trim();
				desc = message.split('~')[4].trim();
				console.log(category);
				console.log(url);
				bot.simulateTyping( channelID );
				if (ValidURL(url)) {
					bot.sendMessage({
						to: channelID,
						message: 'by ' + user + "\n" + url
					});
				} else{
					bot.sendMessage({
						to: channelID,
						message: 'please enter valid url'
					});
				}

			Linky.create({category, url_text, url, desc}, function(err, newData){
			    if(err){
			      console.log(err);
			    } else {
			      console.log('data saved');
			    }
		  	});
		  	} catch(err) {
		  		console.log(err)
				bot.simulateTyping( channelID );
				bot.sendMessage({
					to: channelID,
					message: 'wrong message format'
				});
			}
			
		}

});

//route for general
app.get('/data', (req, res) => {
	Linky.find({}, function (err, result) {
		if (err){
			throw err;
			res.status(500).send();
		};

		res.json(result);
	});
});

const ValidURL = (vUrl) => {
  let regex = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if(!regex.test(vUrl)) {
    return false;
  } else {
    return true;
  }
}

app.listen(port, (req, res) => {
	console.log("bot is listening on port " + port);
});