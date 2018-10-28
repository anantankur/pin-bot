const discord = require('discord.io');
const exp = require('express');
const urlMetadata = require('url-metadata');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const app = exp();
app.use(bodyParser.json());
const port = process.env.PORT || 3001;
const channelA1 = process.env.CHANNELA1;
const channelT = process.env.CHANNELT;
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

let preCat = ["general", "webDesign", "random"];

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

	let url, category, url_text, desc;

	if (message === "~help") {
		helpMessage = {
			'title': "Help List",
			"fields": [
		      {
		        "name": "~category",
		        "value": "Available url categories"
		      },
		      {
		        "name": "~pin ~ category ~ url",
		        "value": "Add url to website"
		      }
	      	],
			'color': 12991759
		}
		bot.sendMessage({
			to: channelID,
			embed: helpMessage
		});
	}else if (message === "~category") {
		catMessage = {
			'description': `There are ${preCat.length} categories \n ${preCat.join(", ")}`,
			'color': 15277667
		}
		bot.sendMessage({
			to: channelID,
			embed: catMessage
		});
	}else if(message.startsWith('~') && (user !== botName) && (channelID === "504977712792731680" || channelID === "447279735198973961" || channelID==="505053573579669505" )) {

		try{
			tMessage = message.substr(1);
			category = tMessage.split('~')[1].trim();
			url = tMessage.split('~')[2].trim();
			console.log(url);
			console.log("category: "+ category);

			urlMetadata(url).then(
			function (metadata) { // success handler
				url_text = metadata.title;
				desc = metadata.description;
				urlSavedMessage = {
				    color: 1507110,
				    footer: { 
				      text: 'added by '+user
				    },
				    thumbnail:
				    {
				      url: metadata.image
				    },
				    title: url_text,
				    description: desc,
				    url: url
				  }
				bot.sendMessage({
					to: channelID,
					message: "Link added successfully",
					embed: urlSavedMessage
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
				errMessage = {
					'description': 'whoops! '+'message format is ```!pin ~ category ~ url``` no need to wrap url in inverted-commas or brackets\n'
					+'use `~category` to check available categories :smiley:',
					'color': 13373992
				}
				bot.sendMessage({
					to: channelID,
					embed: errMessage
				});
				console.log(error)
			})

	  	} catch(err) {
	  		console.log(err)
	  		networkMessage = {
				'description': 'whoops! '+'either you have entered message in wrong format or you have network issues\n use `~help`',
				'color': 13373992
			}
			bot.sendMessage({
				to: channelID,
				embed: networkMessage
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