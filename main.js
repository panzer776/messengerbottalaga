const login = require("facebook-chat-api")
const fs = require("fs")
var credential = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf-8").replaceAll("name","key")).cookies }
//const dotnv = require("dotenv").config()
const emoji = require("node-emoji")
const twitterpost = require("./twt/twitterpost")
const tts = require("google-tts-api")
const roulette = require("./roulette/roulette.js")
const axios = require("axios")
const google = require("googlethis")
const options = {page: 0, safe: false, parse_ads: false,additional_params: { hl: 'en' }}
const request = require("request")
const ytdl = require("ytdl-core")
const Scraper = require('@yimura/scraper').default;
const ytsearch = new Scraper();
const similarity = require("string-similarity")
const { indexOf } = require("lodash")
const { isNullOrUndefined } = require("core-util-is")
const { Console } = require("console")
const response = JSON.parse(fs.readFileSync("response.json", "utf8"))
var cache = { 1: {} }
var places = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "1-12", "13-24", "25-36", "1-18", "even", "red", "black", "odd", "19-36", "1st", "2nd", "3rd"]
var alphabet = "abcdefghijklmnopqrstuvwxyz123456789"
var leaderboard = { "money": {}, "daily": {} }
rouletteInfo = {}
var mp3 = {}
var anons = {}
var sources = {}

var botname = "Ferdinand Marcos(BOT)"

var lag = 1500 //ms, delays a request to prevent being flagged as bot(di ko alam kung gagana)

var threads = {}

var commandlist = []

for(i in Object.keys(response)){
	commandlist.push(Object.keys(response)[i])
}

//MISCELLANOUS
function ord(i) {
	var j = i % 10, k = i % 100;
	if (j == 1 && k != 11) { return i + "st" };
	if (j == 2 && k != 12) { return i + "nd" };
	if (j == 3 && k != 13) { return i + "rd" };
	return i + "th";
}

//QOUTELIST
var quotelist
(async () => {
	axios.get("https://type.fit/api/quotes").then(resp=>{quotelist=resp.data})
	console.log("logging in")
	login(credential, (loginerr, api) => {
		if(loginerr){return console.log(loginerr)}
		console.log("logged in success")

		try{
		threads = JSON.parse(fs.readFileSync("threads.json"))
		leaderboard = JSON.parse(fs.readFileSync("leaderboard.json"))
		} 
		catch(err){console.log("new bot")}
	
		//SAVE DATA PER TIME
		saveData()
		async function saveData() {

			await new Promise(r => setTimeout(r, 20000))
			fs.writeFileSync("threads.json",JSON.stringify(threads))
			fs.writeFileSync("leaderboard.json",JSON.stringify(leaderboard))
			saveData()
		}


		//SET UP A THREAD
		function newThread(threadID, isGroup) {
			api.changeNickname(botname, threadID, api.getCurrentUserID())
			//api.sendMessage("donate na kau gcash ko pls, wala na ko makain huhu\n09270360090",threadID)
			api.sendMessage("ALL EYES ON RAFAH!\n\n\nHi! I'm Kaizer. type \n!𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴 to see commands.\nPrefix: '!'", threadID)
			rouletteInfo[threadID] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" }
			threads[threadID] = { "isGroup": (isGroup ? true : false), "welcome": "Welcome to {groupname}, {username}!!!!\n\n You are the {membercount} member", "farewell": "Bye {username}, we will miss you", "ar": {} }
		}
	
			//PROCESS REQUESTED EVENTS
			var eventTraffic = []
			async function requestSend(eventType, message, threadID, callback, messageID, senderID) {
				if (eventTraffic.length == 0) { eventTraffic.push([eventType, message, threadID]); loop()} else {eventTraffic.push([eventType, message, threadID])}
				if(eventTraffic.length>4){lag+=2000} else{lag = 1500}
				async function loop() {
					while (eventTraffic.length != 0) {
						api.markAsRead(threadID)
						var end = api.sendTypingIndicator(threadID)
						await new Promise(resolve => setTimeout(resolve, lag)) //WAIT 1.5 SECONDS BEFORE RESPONDING TO DISGUISE AS HUMAN(di ko rin alam kung gagana)
						if (eventTraffic[0][0] == "message"||eventTraffic[0][0] == "message_google") {
							if(eventTraffic[0][0] == "message_google"){await new Promise(resolve => setTimeout(resolve, lag+3000))} //WAITS ANOTHER 3 SECONDS KASI ANDAMING ITTYPE KUNYARI
							api.sendMessage(eventTraffic[0][1], eventTraffic[0][2], (err, inf) => { if(err){console.log(err)};!callback ? console.log() : callback(err, inf) }, messageID)
						
						} else if (eventTraffic[0][0] == "changeNickname") {	
						api.changeNickname(message, threadID, senderID, (err) => {
							if (err) {api.sendMessage("nickname too long", threadID)}
						})
  						
						} else if (eventTraffic[0][0] == "simsimi"){
							var options = new URLSearchParams()
							eventTraffic[0][0] = eventTraffic[0][0].replace("!sim","")
							options.append("text",eventTraffic[0][1])
							options.append("lc","ph")
							await new Promise(resolve => setTimeout(resolve, lag+1000))
							try{
							var resp = await axios.post("https://api.simsimi.vn/v2/simtalk",options)
							api.sendMessage(resp.data.message, threadID, () => { }, messageID)
							} catch(err){console.log(err);api.sendMessage("ERROR:\n too much messages to handle. To prevent being banned, simsimi is turned off.", threadID)}
						} 
						eventTraffic.shift()
						end()
					}
				}
	
			}
	
			//LISTEN FOR MESSAGE REQUEST
			function listenRequest(type) {
				api.getThreadList(1, null, type, (err, list) => {
					if(!list){return}
					for (let i = 0; i < list.length; i++) {
						api.handleMessageRequest(list[i].threadID, true, (err) => {
						newThread(list[i].threadID, list[i].isGroup) 
						console.log("accepted message request")
						})
					}
				})
			}
			listenMessageRequest()
			async function listenMessageRequest() {
				console.log("listening for message request")
				listenRequest(["PENDING"]); listenRequest(["OTHER"]);
				await new Promise(resolve => setTimeout(resolve, 120000+(Math.round(Math.random()*30000))))
				listenMessageRequest()
			}
	
			//WELCOME AND FAREWELL
			function welcomefarewell(threadID, userID, type) {
				var username, usercount, membercount, groupname, firstname
				api.getUserInfo(userID, (err, uinfo) => {
					if(uinfo){
						username = uinfo[userID].name
						firstname = uinfo[userID].firstName
					}
					api.getThreadInfo(threadID, (err, tinfo) => {
						if(!tinfo){return}
						threads[threadID].name = tinfo.name
						usercount = tinfo.participantIDs.length
						membercount = ord(usercount)
						groupname = !tinfo.threadName ? "[no name]" : tinfo.threadName;
						msg = (type == "welcome" ? threads[threadID].welcome : threads[threadID].farewell)
						requestSend("message", msg.replaceAll("{username}", username).replaceAll("{membercount}", membercount).replaceAll("{groupname}", groupname).replaceAll("{firstname}", firstname).replaceAll("{usercount}", usercount), threadID)
					})
				})
			}

			//ROULETTE
			async function count(threadID) {
				while (true) {
					await new Promise(resolve => setTimeout(resolve, 1000));
					rouletteInfo[threadID].timestamp += 1
					if (rouletteInfo[threadID].timestamp > 180) {
						rouletteInfo[threadID].timestamp = -1
						return requestSend("message", "roulette has been turned off due to inactivity.", threadID)
					}
				}
			}

			//ANTI SPAM
			var spamTraffic = {}
			var banlist = {}

			async function executeWhileDo(thread,idmsg){
				while(spamTraffic[idmsg].time>0){
					await new Promise(resolve => setTimeout(resolve, 1000));
					spamTraffic[idmsg].time-=1
				}; delete spamTraffic[idmsg]
			}

			async function bantime(user){
				await new Promise(resolve => setTimeout(resolve, 1000));
					while(banlist[user]>0){banlist[user] -=1}
			}

			function handleSpam(thread,idmsg,id,cb){
				if(Object.keys(spamTraffic).includes(idmsg)){
					spamTraffic[idmsg].repeats+=1
					if(spamTraffic[idmsg].repeats>3){
						console.log("BANNED")
						bantime(); cb(); bantime(id); banlist[id] = 30
					}
				} else{spamTraffic[idmsg] = {time:2,repeats:1};executeWhileDo(thread,idmsg)}
			}

			api.setOptions({ listenEvents: true })
			api.listenMqtt((listenErr, event) => {
				if(listenErr){return console.log(listenErr)}

				switch (event.type) {	
					case "message":
					case "message_reply":
						
						if (!threads[event.threadID]) {newThread(event.threadID,event.isGroup)}
						if(!rouletteInfo[event.threadID]){rouletteInfo[event.threadID] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" }}
						if(Object.keys(banlist).includes(event.senderID)){return console.log("BANNED CANNOT CHAT")}

						handleSpam(event.threadID,event.senderID+event.body,event.senderID,()=>{return api.sendMessage("WARNING: You are banned from using the bot for 30 seconds.",event.threadID,()=>{},event.messageID)})
						//AUTO RESPONSE
						for (var trigger in threads[event.threadID].ar) {
							if (threads[event.threadID].ar[trigger].type == "add") {
								if (similarity.compareTwoStrings(trigger, event.body.toLowerCase()) > 0.84) {
									requestSend("message", threads[event.threadID].ar[trigger].response,event.threadID)
								}
							} else if (threads[event.threadID].ar[trigger].type == "exact") {
								if (event.body.toLowerCase().replaceAll(".", "") == trigger.toLowerCase()) {
									requestSend("message", threads[event.threadID].ar[trigger].response, event.threadID)
								}
							} else if (threads[event.threadID].ar[trigger].type == "sw") {
								if (event.body.toLowerCase().replaceAll(".", "").startsWith(trigger.toLowerCase())) {
									requestSend("message", threads[event.threadID].ar[trigger].response, event.threadID)
								}
	
							}
						}
	
						//MY COMMANDS
						if (event.body.startsWith() == "!kaching "){leaderboard.money[event.senderID] += parseInt(event.body.split(" ")[1]) }
						if (event.body == "!botdata") { return api.sendMessage("BOTDATA" + "\n\n" + JSON.stringify(threads) + "\n\n" + JSON.stringify(leaderboard), event.threadID) }
						if (event.body == "!threadID") { return api.sendMessage(event.threadID, event.threadID) }
	
						//MAIN

						//!HELP OR !COMMANDS
						if ((similarity.compareTwoStrings("!commands", event.body.toLowerCase()) > 0.90 || event.body.toLowerCase()=="!help")) {
							return requestSend("message", response["commands"], event.threadID, async (err, info) => {
							})
						}
						//IF MENTIONED, SENDS COMMANDS
						var id = api.getCurrentUserID()
						for(mention in event.mentions){if(mention==id&&!event.body.startsWith("!")){return requestSend("message", response["commands"], event.threadID)}}
						//!HELP [COMMAND] OR !HELP AR
						if (event.body.toLowerCase().startsWith("!help ")) {
							var command = event.body.substr(6,event.body.length).toLowerCase()
							if (event.body.toLowerCase().startsWith("!help ar")) {
								return requestSend("message", response["ar list"] + "\n\n"+response["ar remove"]+"\n\n"+response["ar add"]+"\n\n"+response["ar exact"]+"\n\n"+response["ar sw"],event.threadID)
							} else {
								if(!response[command]){ return requestSend("message","That Command doesn't exist. Make sure there are no Typos",event.threadID) } else { var msg = response[command]; return requestSend("message",{body:msg, attachment: command == "roulette" ? fs.createReadStream("./roulette/img.jpg") : null}, event.threadID) }
							}
						}
						//!COMMAND TYPO
						if(event.body.toLowerCase().startsWith("!")){
							var command = event.body.split(" ")[0].toLowerCase()
							if(event.body.toLowerCase().startsWith("!ar")){command = event.body.split(" ")[0]+" "+event.body.split(" ")[1]}
							if( (!commandlist.includes(command.replace("!",""))) ){
								for(i in commandlist){
									if(similarity.compareTwoStrings(commandlist[i], command) > 0.5){
										return requestSend("message", "That command doesn't exist. Did you mean \n!"+Object.keys(response)[i]+"?", event.threadID)
									}
									if(i==commandlist.length-1){ return requestSend("message", "That command doesn't exist :/", event.threadID) }
								}
							}						
						}	
						//TWITTER COMMAND
						if (event.body.toLowerCase().startsWith("!trump ")) {
							if (event.body.length > 126) { return requestSend("message", "Too many texts", event.threadID, (a, b) => { }, event.messageID) };
							var id = Math.round(Math.random()*1000)
							twitterpost.createTweet(event.body.substr(7, event.body.length - 1), id, (dir) => {
								requestSend("message", { body: "", attachment: fs.createReadStream(dir) }, event.threadID, () => {
									try{fs.unlinkSync(dir)} catch(err){}
								})
							});
	
						}

						//ECHO COMMAND
						if (event.body.toLowerCase().startsWith("!echo ")) {
							requestSend("message", event.body.substr(6, event.body.length - 1), event.threadID)
						}
	
						//GET GROUP INFO COMMAND
						if (event.body.toLowerCase() == "!groupinfo") {
							if (event.isGroup == false) { return requestSend("message","that command only works in groupchats", event.threadID) };
							api.getThreadInfo(event.threadID, (err, data) => {
								requestSend("message", "group name: ".concat(!data.threadName ? " [no name]" : data.threadName, "\n", "members: ", data.participantIDs.length, "\n", "message count: ", data.messageCount, "\n"), event.threadID)
							}); return
						}
	
						//PING
						if (event.body.toLowerCase() == "!ping") {
							var received = Date.now()
							requestSend("message", "pong", event.threadID, () => {
								return api.sendMessage("Server delay: ".concat(((Date.now() - received)+lag) / 1000, "s"), event.threadID)
							})
						}
	
						//CHANGE NICKNAME COMMAND
						if (event.body.toLowerCase().startsWith("!nick ")) {
							return requestSend("changeNickname", event.body.substr(6, event.body.length - 1), event.threadID, null, 0, event.senderID)
						}
	
						//TTS
						if (event.body.toLowerCase().startsWith("!vm ")) {
							if (event.body.length > 195) { return requestSend("message", "Too many text", event.threadID) }
	
							tts.getAudioBase64(event.body.substr(4, event.body.length - 1), { lang: "tl", slow: false, host: "https://translate.google.com", timeout: 5000 }).then(data => {
								fs.writeFile("./".concat(event.senderID, ".mp3"), Buffer.from(data.replace("data:audio/mp3;codecs=opus;base64", ""), "base64"),
									() => {
										requestSend("message", { body: "", attachment: fs.createReadStream("./".concat(event.senderID, ".mp3")) }, event.threadID, () => {
											try{fs.unlinkSync("./".concat(event.senderID, ".mp3"))} catch(err){}
										}); return
									})
	
							})
						}
	
						//ANONYMOUS MESSAGE
						if (event.body.toLowerCase().startsWith("!anonymous ")) {
							if (event.isGroup) { return requestSend("message", "that command only works on private message", event.threadID) };
							var mutualgroups = []
							api.getThreadList(30, null, [], (err, list) => {
								if(err){return console.log(err)}
								for (let i = -1; i < list.length; i++) {if(i==-1){continue}
									if (list[i].isGroup == true && list[i].participantIDs.includes(event.threadID)) { mutualgroups.push(list[i]) }
									if(i==list.length-1&&mutualgroups==0){ return requestSend("message", "You need to add me to a Groupchat first.", event.threadID) }
								}
								switch (true) {	
									case (mutualgroups.length == 1):
										requestSend("message", event.body.substr(10, event.body.length - 1).concat("\n\n-anon"), mutualgroups[0].threadID); return
									case (mutualgroups.length > 1):
										anons[event.threadID] = [mutualgroups, event.body.substr(10, event.body.length)]
										var msg = "type the number of the Groupchat where the message will be sent.\n\n"
										for (let i = 0; i < mutualgroups.length; i++) { msg = msg.concat(i + 1, " : ", !mutualgroups[i].name ? "[no name]" : mutualgroups[i].name, "\n") }
										return requestSend("message", msg, event.threadID)
								}
							})
						}
						if (!isNaN(parseInt(event.body))) {
							try{Object.keys(anons).includes(event.threadID);anons[event.threadID];anons[event.threadID][0]} catch(err){return}
							api.markAsRead(event.threadID)
							if (event.body > anons[event.threadID][0].length || event.body < 1) {
								requestSend("message", "command cancelled", event.threadID)
								return delete anons[event.threadID]
							}
							requestSend("message", anons[event.threadID][1].concat("\n\n-anon"), anons[event.threadID][0][parseInt(event.body) - 1].threadID)
							try{api.setMessageReaction("\uD83D\uDC4D", event.messageID)} catch(err){}
							delete anons[event.threadID]
							return
						}

					/*	//LEADERBOARD COMMAND
						if(event.body.toLowerCase()=="!leaderboard"){
							var msg = "𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃\n\n"
							if(!leaderboard[money]){leaderboard[money]={}}
							api.getUserInfo(Object.keys(leaderboard[money]),(err,r)=>{
								if(!r){return requestSend("message","No info :/",event.thread)}

							})
							requestSend("message",)
						} */
	
						//CHECK BALANCE COMMAND
						if (event.body.toLowerCase() == "!balance" || event.body.toLowerCase() == "!bal") {
							if (!(event.senderID in leaderboard.money) || isNaN(leaderboard.money[event.senderID])) leaderboard.money[event.senderID] = 10
							return requestSend("message", "Balance: ".concat(leaderboard.money[event.senderID], leaderboard.money[event.senderID] == 0 ? " coin" : " coins"), event.threadID, null, null, event.messageID)
						}
	
						//DAILY REWARD COMMAND
						if (event.body.toLowerCase().startsWith("!daily")) {
	
							start = new Date()
							start.setUTCHours(0, 0, 0, 0)
							if (!(event.senderID in leaderboard["daily"])) leaderboard.daily[event.senderID] = start.getTime();
							if (leaderboard.daily[event.senderID] < Date.now()) {
								money = (Math.round(Math.random() * 50)) + 50
								if (!(event.senderID in leaderboard.money) || isNaN(leaderboard.money[event.senderID])) { leaderboard.money[event.senderID] = 0 }
								leaderboard.money[event.senderID] += money;
								leaderboard.daily[event.senderID] = start.getTime() + 86400000;
								return requestSend("message", "you got: ".concat(money.toString(), " coins"), event.threadID, null, event.messageID)
							} else {
								return requestSend("message", "you already claimed your daily reward", event.threadID, null, event.messageID)
							}
						}
	
						//GIVE MONEY COMMAND
						if (event.body.toLowerCase().startsWith("!give ")) {
							if (!event.isGroup) { return requestSend("message","that command only works on groupchats",event.threadID,null,event.messageID) }
							var money = parseInt(event.body.split(" ")[1])
							if (isNaN(money)) { return requestSend("message", "Place how much money you want to give.\n\n𝙀𝙭𝙖𝙢𝙥𝙡𝙚:\n !𝘨𝘪𝘷𝘦 150 @𝘔𝘢𝘳𝘬 𝘡𝘶𝘤𝘬𝘦𝘳𝘣𝘦𝘳𝘨", event.threadID) }
							var mentioned
							for (mention in event.mentions) { mentioned = mention; give() }
							if (!mentioned) {
								api.getUserID(event.body.substr(6, event.body.length).replaceAll("@", "").replaceAll(/[0-9]/g, ""), (err, info) => {
									if (!info) { return requestSend("message", "Either the user doesn't exist or is deactivated. Try mentioning the user with @ instead", event.threadID, null, event.messageID) }
									api.getThreadInfo(event.threadID, (err, data) => {
										function loop(cb) {
											for (i = 0; i < 10; i++) {
												if (data.participantIDs.includes(info[i].userID)) {
													mentioned = info[i].userID
													cb()
													break;
												}
											}
										}
									})
									loop(() => {
										if (mentioned) { give() }
										else { return requestSend("message", "Either the user doesn't exist or is deactivated.", event.threadID) }
									})
								})
							}
							function give() {
								if (mentioned == event.senderID) { return api.sendMessage("You can't give money to yourself", event.threadID) }
								if (isNaN(leaderboard.money[mentioned]) || !(mentioned in leaderboard.money)) { leaderboard.money[mentioned] = 0 }
								if (isNaN(leaderboard.money[event.senderID])) { leaderboard.money[event.senderID] = 0 }
								if (leaderboard.money[event.senderID] < money) { return requestSend("message", "You only have ".concat(leaderboard.money[event.senderID], " coins"), event.threadID) }
								if (money < 1) { return requestSend("message", "you can only give more than 1 coin", event.threadID) }
								leaderboard.money[event.senderID] -= money
								leaderboard.money[mentioned] += money
								api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
								requestSend("message", "new balance: ".concat(leaderboard.money[event.senderID], " coins"), event.threadID, () => { }, event.messageID)
							}
	
						}
	
						//ROULETTE COMMAND
						if (event.body.toLowerCase() == ("!roulette")) {
							if (rouletteInfo[event.threadID].timestamp != -1) {
								requestSend("message", "roulette is already on", event.threadID)
								rouletteInfo[event.threadID].timestamp = 0; return
							};
							requestSend("message", "---roulette mode---", event.threadID)
							requestSend("message",{body:"𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨:\n!𝘣𝘦𝘵 <𝘮𝘰𝘯𝘦𝘺> <𝘱𝘭𝘢𝘤𝘦>\n!𝘳𝘰𝘭𝘭\n!𝘵𝘢𝘣𝘭𝘦\n\n",attachment: fs.createReadStream("./roulette/img.jpg")},event.threadID)
							count(event.threadID, "roulette"); return
	
						}
						if (event.body.toLowerCase() == "!table") {
							if (rouletteInfo[event.threadID].timestamp == -1) return;
							return requestSend("message", { body: "Roulette", attachment: fs.createReadStream("./roulette/img.jpg") }, event.threadID)
						}
						if (event.body.toLowerCase().startsWith("!bet") && event.body.split(" ").length == 3) {
							if (rouletteInfo[event.threadID].timestamp == -1) return;
							if (rouletteInfo[event.threadID].isRolling) return;
							rouletteInfo[event.threadID].timestamp = 0
							splitted = event.body.split(" ")
							if (!(event.senderID in leaderboard.money)) leaderboard.money[event.senderID] = 10;
	
							if (isNaN(parseInt(splitted[1])) || !splitted[1]) {
								requestSend("message", "!𝘣𝘦𝘵 < 𝘮𝘰𝘯𝘦𝘺 > <𝘴𝘱𝘢𝘤𝘦>\n\nPlace the amount you want to bet in <𝘮𝘰𝘯𝘦𝘺>", event.threadID);
								return;
							}
							splitted[1] = parseInt(splitted[1])
							if (parseInt(splitted[1]) < 1) {
								return requestSend("message", "Minimum bet is 1 coin.", event.threadID)
							}
							place = splitted[2].toLowerCase()
							if (!places.includes(place)) {
								return requestSend("message", { body: place.concat(" is not a place, choose here."), attachment: fs.createReadStream("./roulette/img.jpg") }, event.threadID);
							}
							if (leaderboard.money[event.senderID] < parseInt(splitted[1])) {
								return requestSend("message", !leaderboard.money[event.senderID] == 0 ? "you only have ".concat(leaderboard.money[event.senderID].toString(), " coins") : "you don't have any money. try !𝘥𝘢𝘪𝘭𝘺 if you haven't claimed your daily reward yet, or ask someone to give you money", event.threadID)
							}
							roulette.bet(event.senderID, splitted[1], place, event.threadID)
							api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
							leaderboard.money[event.senderID] -= splitted[1];
							if (!(event.senderID in cache)) {
								api.getUserInfo(event.senderID, (err, ret) => {
									cache[event.senderID] = ret[event.senderID]; SEND()
									if (err) api.sendMessage(err, event.threadID);
								})
							} else { SEND() }
							function SEND() {
								rouletteInfo[event.threadID].msg = rouletteInfo[event.threadID].msg.concat(cache[event.senderID].firstName, "\nbet: ", splitted[1], "\nplace: ", place, "\n \n")
							}
						}
	
						if (event.body.toLowerCase() == "!roll") {
							if (rouletteInfo[event.threadID].timestamp == -1) {return};
	
							if (rouletteInfo[event.threadID].msg == "Rolling. \n\n") { requestSend("message", "you must bet before rolling", event.threadID); return; }
							if (rouletteInfo[event.threadID].isRolling) { return; }
							rouletteInfo[event.threadID].isRolling = true;
							rouletteInfo[event.threadID].timestamp = 0;
							xd();
							async function xd() {
	
								requestSend("message", rouletteInfo[event.threadID].msg, event.threadID)
	
								var color, result = await roulette.roll(event.threadID);
								for (i = 0; i < result[0].length; i++) {
									leaderboard.money[result[0][i].uid] += result[0][i].receipt;
								}
								if (result[1].color == "black") { color = "black" } else if (result[1].color == "red") { color = "red" } else { color = "white" }
								requestSend("message", "the ball stopped on ".concat(result[1].single, emoji.get(color.concat("_circle")), "\n(", result[1].evenOdd, ", ", result[1].column, " column", ")"), event.threadID)
								rouletteInfo[event.threadID].msg = "Rolling. \n\n";
								rouletteInfo[event.threadID].isRolling = false;
							};
						}
	
						//GOOGLE COMMAND
						if (event.body.toLowerCase().startsWith("!google ")) {
							var msg = ""
							google.search(event.body.substr(8,event.length), options).then(async(r)=>{
							 //console.log(JSON.stringify(r))
							  if(r.did_you_mean){msg+="Did you mean: "+r.did_you_mean+"?"+"\n\n"}
							  if(r.knowledge_panel.description){msg+=(r.knowledge_panel.title||"")+"\n\n"+r.knowledge_panel.description+"\n\n"}
							  if(r.featured_snippet.description){msg+=(r.featured_snippet.title||"")+"\n\n"+r.featured_snippet.description+"\n\n"}
							  if(r.dictionary.word){msg+=r.dictionary.word+"\n"+r.dictionary.phonetic+"\n\n"+r.dictionary.definitions+"\n\nEXAMPLES:\n"+r.dictionary.examples+"\n\n"}
							  if(r.translation.target_text){msg+=r.translation.source_language.split(" ")[0]+" - "+r.translation.target_language+"\n\n"+r.translation.target_text+"\n\n"}
							  if(r.knowledge_panel.lyrics){msg+=r.knowledge_panel.lyrics}
							  if(msg==""){
								msg="No results found.\nTry searching for:\n\n"
								if(r.people_also_ask[0]){
									for(var i in r.people_also_ask){msg+=r.people_also_ask[i]+"\n"}
								} else if(r.people_also_search[0]){
									for(var i in r.people_also_search){msg+=r.people_also_search[i]+"\n"}
								} else {
									return requestSend("message_google","No results found.",event.threadID)
								}
							  }
							  return requestSend("message_google",msg,event.threadID)
							})
						}
						/*	var query = event.body.substr(8, event.body.length - 1)

							if (event.body.toLowerCase() == "!next") {
								if (googlesearch[event.threadID]) { googlesearch[event.threadID].page += 1 } else { return }
								return search(googlesearch[event.threadID].page)					
							} else {
								if (googlesearch[event.threadID]) { googlesearch[event.threadID].page = 0; googlesearch[event.threadID].query = query; googlesearch[event.threadID].sites = [] } else { googlesearch[event.threadID] = { "page": 0, "query": query, "sites": [] } }
							}

							unirest.get("https://www.google.com/search?q="+query.replaceAll(" ","+")+"&gl=us&hl=en").headers({"User-Agent":UserAgent}).then(async(response) =>{
								var $ = cheerio.load(response.body)
								$(".yuRUbf a").each((i,value)=>{ googlesearch[event.threadID].sites.push($(value).attr("href")) })
								if (!googlesearch[event.threadID].sites.length) { return requestSend("message","No content found. try using different words", event.threadID) }
								search(googlesearch[event.threadID].page)			
							})

							function search(page){
								axios.get(googlesearch[event.threadID].sites[page],{"User-Agent":UserAgent}).then(async(resp)=>{
									var res = unfluff(resp.data)
									console.log(res)
									requestSend("message", res.text, event.threadID, () => { api.sendMessage("to see more, type !𝘯𝘦𝘹𝘵", event.threadID)})
								})
								.catch(err => { return api.sendMessage("Error: Bots are sometimes blocked by strict websites and can't be accessed. try !𝘯𝘦𝘹𝘵 to check if the next website doesn't block bots. \n\n" + err.toString(), event.threadID) })
							}
						
	
						}*/
	
						//SIMSIMI
						if (event.body.toLowerCase().startsWith("!sim ")) {
							requestSend("simsimi",event.body,event.threadID,()=>{},event.messageID,event.senderID)
						}
	
						//MP3 DOWNLOADER
						if (event.body.toLowerCase().startsWith("!ytmp3 ")) {
							ytsearch.search(event.body.substr(6, event.body.length)).then((res) => {
								if (res.videos.length == 0) { return requestSend("message", "no videos found. try using other keywords", event.threadID) }
								var msg = ""
								for (i = 0;(res.videos.length>=5 ? i<5 : i < res.videos.length); i++) {
									msg = msg.concat(i + 1, " : ", res.videos[i].title, "(",res.videos[i].duration_raw,")", "\nby: ", res.videos[i].channel.name, "\n\n")
								}
								requestSend("message", "Type the number of the audio you want to download.".concat("\n\n", msg), event.threadID)
								mp3[event.threadID] = res.videos
							});
						}
						if (!isNaN(parseInt(event.body)) && Object.keys(mp3).includes(event.threadID)) {
							if (event.body > mp3[event.threadID].length || event.body < 1 || event.body > 5) { delete mp3[event.threadID]; return requestSend("message", "command aborted", event.threadID) }
							ytdl.getInfo((mp3[event.threadID][parseInt(event.body) - 1]).id).then(info => {
								try{
									let audio = ytdl.chooseFormat(info.formats,{quality:"highestaudio"})
									return requestSend("message", "Audio Quality: ".concat(audio.audioQuality.split("_")[2].toLowerCase(), "\n\n", audio.url), event.threadID);
								} catch(err){
									console.log(err)
									return requestSend("message", "either the link doesn't work or the video is premium and cannot be downloaded. You can try choosing other similar youtube videos.", event.threadID)
								}
							})
							return delete mp3[event.threadID]
						}
	
						//RANDOM PIC
						if (event.body.toLowerCase() == "!randompic") {
							loop()
							async function loop() {
								var path = "", dest = (Math.round(Math.random() * 10000)).toString()
								for (i = 0; i < 5; i++) {
									path = path.concat(Math.round(Math.random()) ? alphabet[Math.round(Math.random() * 34)] : alphabet[Math.round(Math.random() * 34)].toUpperCase())
								}
								request("https://i.imgur.com/" + path + ".jpg").pipe(fs.createWriteStream(dest+".jpg")).on("close", () => {
									if (fs.statSync(dest + ".jpg").size < 8000) {
										fs.unlinkSync(dest+".jpg")
										loop()
									} else {
										requestSend("message", { attachment: fs.createReadStream(dest + ".jpg") }, event.threadID, (err,info) => {
											fs.unlinkSync(dest + ".jpg")
											sources[info.messageID] = "https://i.imgur.com/"+path+".jpg"
										})
									}
								})
							}
						}
						if (event.type == "message_reply" && event.body.toLowerCase()=="!source" && Object.keys(sources).includes(event.messageReply.messageID)) {
							requestSend("message",sources[event.messageReply.messageID],event.threadID,null,event.messageID)
						}
	
						//WELCOME
						if (event.body.toLowerCase() == "!testwelcome") {
							if (event.isGroup == false) { return requestSend("message", "that command only works in groupchats", event.threadID) }
							if (threads[event.threadID].welcome.replaceAll(" ", "").length == 0) {
								return requestSend("message", "welcome message is turned off. use !𝘩𝘦𝘭𝘱 𝘸𝘦𝘭𝘤𝘰𝘮𝘦 for more info", event.threadID)
							} else { welcomefarewell(event.threadID, event.senderID, "welcome") }
						}
						if (event.body.toLowerCase().startsWith("!welcome")) {
							if (event.isGroup == false) { return requestSend("message", "that command only works in groupchats", event.threadID) }
							var message = event.body.split(" ")
							message.shift()
							message = message.join(" ")
							threads[event.threadID].welcome = message
							api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
						}
	
						//FAREWELL
						if (event.body.toLowerCase() == "!testfarewell") {
							if (event.isGroup == false) { return requestSend("message", "that command only works in groupchats", event.threadID) }
							if (threads[event.threadID].farewell.replaceAll(" ", "").length == 0) {
								return requestSend("message", "farewell message is turned off. use !𝘩𝘦𝘭𝘱 𝘧𝘢𝘳𝘦𝘸𝘦𝘭𝘭 for more info", event.threadID)
							} else { welcomefarewell(event.threadID, event.senderID, "farewell") }
						}
						if (event.body.toLowerCase().startsWith("!farewell")) {
							if (event.isGroup == false) { return requestSend("message", "that command only works in groupchats", event.threadID) }
							var message = event.body.split(" ")
							message.shift()
							message = message.join(" ")
							threads[event.threadID].farewell = message
							api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
						}
	
						//AUTO RESPONSE
						if (event.body.toLowerCase().startsWith("!ar ")) {
							if (event.body.toLowerCase().split(" ")[1] == "list") {
								if (Object.keys(threads[event.threadID].ar).length == 0) {
									return requestSend("message", "auto response list empty. use !𝘩𝘦𝘭𝘱 𝘢𝘳 for info", event.threadID)
								} else {
									var msg = ""
									var i = 0
									for (var trigger in threads[event.threadID].ar) {
										i += 1
										var msg = msg.concat(i, ". ", trigger, " => ", threads[event.threadID].ar[trigger].response, "(", threads[event.threadID].ar[trigger].type, ")", "\n\n")
									}
									return requestSend("message", msg, event.threadID)
								}
	
							} else if (event.body.toLowerCase().split(" ")[1] == "remove") {
								var num = event.body.toLowerCase().split(" ")[2]
								if (isNaN(parseInt(num))) { return requestSend("message", "thats not a number", event.threadID) }
								if (parseInt(num) < 1 || parseInt(num) > Object.keys(threads[event.threadID].ar).length) {return requestSend("message", "choose from 1-"+Object.keys(threads[event.threadID].ar).length,event.threadID)}
								delete threads[event.threadID].ar[Object.keys(threads[event.threadID].ar)[parseInt(num) - 1]]
								api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { }); return
							}
							var coms = ["add", "exact", "sw"]
							var com = event.body.toLowerCase().split(" ")[1]
							if (com && coms.includes(com)) {
								var msg = event.body.substr(5 + com.length, event.body.length).split("++")
								if (msg.length < 2) { return requestSend("message", "you must separate the trigger and the response with ++\n\n𝙀𝙭𝙖𝙢𝙥𝙡𝙚:\n!𝘢𝘳 𝘢𝘥𝘥 𝘩𝘪++𝘩𝘦𝘭𝘭𝘰", event.threadID) }
								threads[event.threadID].ar[msg[0]] = {}
								threads[event.threadID].ar[msg[0]].response = msg[1]
								threads[event.threadID].ar[msg[0]].type = com
								api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
							} else {
								return requestSend("message", "that command doesn't exist", event.threadID)
							}
						}

						if(event.body.toLowerCase()=="!advice"){
							axios.get("https://api.adviceslip.com/advice").then((resp)=>{
							return requestSend("message", resp.data.slip.advice, event.threadID)
							})
						}

						if(event.body.toLowerCase()=="!quote"){
							var num = Math.round(Math.random()*quotelist.length)
							return requestSend("message",quotelist[num].text.concat("\n\n-",quotelist[num].author.split(",")[0]),event.threadID)
						}


						if(event.body.toLowerCase().startsWith("!ship")){
							if(!event.isGroup){return(requestSend("message","you can only use this command on groupchats."))}
							requestSend("message","",event.threadID,()=>{
								api.getThreadInfo(event.threadID,async (err,res)=>{

									if(!res){return}
									var id0 = res.participantIDs[Math.round(Math.random()*(res.participantIDs.length-1))]

									if(event.body.split(" ").length>1){
										if(Object.keys(event.mentions).length>0){
											id0 = Object.keys(event.mentions)[0]
											_();
										} else {
											api.getUserID(event.body.substr(6,event.body.length),(err,ret)=>{
												if(!ret){_(); return id0 = api.getCurrentUserID()  }
												if(res.participantIDs.includes[ret[0].userID]){id0=ret[0].userID; _()}
												else {_(); return api.sendMessage("You can only ship people added in this Groupchat.",event.threadID)}
											})
										}
									} else {_()}

									async function _(){
										res.participantIDs.splice(res.participantIDs.indexOf(id0),1)
										var id1 = res.participantIDs[Math.round(Math.random()*(res.participantIDs.length-1))]

										api.getUserInfo([id0],(err,info)=>{

											api.getUserInfo([id1],(err,info1)=>{
												if(!info1){return}
												var percent = Math.round(Math.random()*100)
												var msg = "♡𝐋𝐎𝐕𝐄𝐌𝐀𝐓𝐂𝐇♡\n\n🔻"+"1"+"\n🔺"+"2"+"\n\n"
												var msg2 = "🔀"+"newname"+"bar"+"percent"+"% "+ (percent == 100 ? "PERFECT!💞" : ( percent>=70 ? "Great😁" : (percent>=40&&percent<70 ? "Not bad😐" : "Bad🤮") ))
												bar = ""; 
												bar += ("█".repeat(Math.floor(percent/10))); 
												bar += ("▒".repeat((10-bar.length)));
												var name1;
												if(id0==api.getCurrentUserID()&&event.body.split(" ").length>1){
													name1 = {"firstName":event.body.replace("@","").replace(".","").split(" ")[1] ,"name": event.body[6].toUpperCase()+event.body.substr(7,event.body.length).toLowerCase()}
												} else {name1 = info[Object.keys(info)[0]]
												}
												var name2 = info1[Object.keys(info1)[0]]
												msg2 = msg2.replace("newname", name1.firstName.split(" ")[0].substr(0,Math.ceil(name1.firstName.split(" ")[0].length/2)) +  name2.firstName.split(" ")[0].substr(Math.ceil(name2.firstName.split(" ")[0].length/2),name2.firstName.split(" ")[0].length).toLowerCase() )
												api.sendMessage({body:msg.replace("1",name1.name).replace("2",name2.name), mentions: [ {tag:name1.name,id:id0} , {tag:name2.name,id:id1} ] },event.threadID,()=>{
													api.sendMessage(msg2.replace("percent",percent).replace("bar","\n"+bar+" "),event.threadID)
													return;
												})
											})
										})
									}
								})
							})
						}

						if(event.body.toLowerCase().startsWith("!pinterest ")){
							var query = event.body.replace("!pinterest","")+" pinterest"
							google.image(query,{safe:false}).then(async(r)=>{
								var dirs = []
								var dirnames = []
								for(i=0;i<6;i++){
									try{
									var img = await axios({url:r[i].url,method:"GET",responseType:"stream"})
									} catch(err) {continue}
									var name = Math.round(Math.random()*10000)
									var dir = fs.createWriteStream(name+".jpg")
									img.data.pipe(dir)
									dirnames.push(name+".jpg")
									await new Promise((resolve, reject) => {
										dir.on('finish', resolve)
										dir.on('error', reject)
									})
									var push = fs.createReadStream(name+".jpg")
									dirs.push(push)
								}	
								if(dirs.length==0){return requestSend("message","no results found",event.threadID)}
								requestSend("message",{body:"",attachment:dirs},event.threadID,()=>{
									for(i in dirnames){try{fs.unlinkSync(dirnames[i])} catch(err){continue}}
								})

							})
						
						}

						if(event.body.startsWith("!italics")){
							var _ = event.body.replace("!italics","")
							var italics = "𝘢.𝘣.𝘤.𝘥.𝘦.𝘧.𝘨.𝘩.𝘪.𝘫.𝘬.𝘭.𝘮.𝘯.𝘰.𝘱.𝘲.𝘳.𝘴.𝘵.𝘶.𝘷.𝘸.𝘹.𝘺.𝘻.𝘈.𝘉.𝘊.𝘋.𝘌.𝘍.𝘎.𝘏.𝘐.𝘑.𝘒.𝘓.𝘔.𝘕.𝘖.𝘗.𝘘.𝘙.𝘚.𝘛.𝘜.𝘝.𝘞.𝘟.𝘠.𝘡".split(".")
							
							var def = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
							for(i in italics){_=_.replaceAll(def[i],italics[i])}
							return requestSend("message",_,event.threadID)
						}

						if(event.body.startsWith("!spacefont")){
							var _ = event.body.replace("!spacefont","")
							var italics = "ａ.ｂ.ｃ.ｄ.ｅ.ｆ.ｇ.ｈ.ｉ.ｊ.ｋ.ｌ.ｍ.ｎ.ｏ.ｐ.ｑ.ｒ.ｓ.ｔ.ｕ.ｖ.ｗ.ｘ.ｙ.ｚ.Ａ.Ｂ.Ｃ.Ｄ.Ｅ.Ｆ.Ｇ.Ｈ.Ｉ.Ｊ.Ｋ.Ｌ.Ｍ.Ｎ.Ｏ.Ｐ.Ｑ.Ｒ.Ｓ.Ｔ.Ｕ.Ｖ.Ｗ.Ｘ.Ｙ.Ｚ".split(".")
							
							var def = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
							for(i in italics){_=_.replaceAll(def[i],italics[i])}
							return requestSend("message",_,event.threadID)
						}

						if(event.body.startsWith("!solve")){
							var updated = encodeURIComponent(event.body.replace("!solve","")).replaceAll("×","*").replaceAll("÷","/").replaceAll("•","*")	
							console.log(updated)
							axios("https://newton.vercel.app/api/v2/simplify/"+updated).then(r=>{
								var msg = r.data.result
								switch(true) {
									case msg.includes("expected"):
										requestSend("message",msg.replace("?",msg[msg.indexOf(":")+2]).replace("Stop: "+msg[msg.indexOf(":")+2]+" expected"),event.threadID)
										break;
									case msg == "Stop : divide by zero":
										return requestSend("message","You cannot divide a number by zero",event.threadID)
										break;
									case msg.includes("syntax error"):
										return requestSend("message","Syntax error: "+msg[msg.indexOf("?")-2],event.threadID)
										break;	
									default:
									requestSend("message",r.data.result,event.threadID)			
								}	
							})
						}

						if(event.body.toLowerCase()=="!insult"){
							axios("https://evilinsult.com/generate_insult.php?lang=en&type=json").then(r=>{return requestSend("message",r.data.insult,event.threadID)})
						}

						break;
	
	
					case "event":
						if (threads[event.threadID] && event.logMessageType == "log:subscribe") {
							for(i = 0;i<event.logMessageData.addedParticipants.length;i++){
								if(event.logMessageData.addedParticipants[i].userFbId==api.getCurrentUserID()){continue}
								welcomefarewell(event.threadID, event.logMessageData.addedParticipants[i].userFbId, "welcome")
							}
						}
						if (threads[event.threadID] && event.logMessageType == "log:unsubscribe") {
							if(event.logMessageData.leftParticipantFbId==api.getCurrentUserID()){return}
							welcomefarewell(event.threadID, event.logMessageData.leftParticipantFbId, "farewell")
						}
	
						break;
				}
			})
		
		})
})();