const login = require("facebook-chat-api")
const fs = require("fs")
const credential = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf-8")) }

const emoji = require("node-emoji")
const twitterpost = require("./twt/twitterpost")
const tts = require("google-tts-api")
const roulette = require("./roulette/roulette.js")
const google = require("googlethis")
const axios = require("axios")
const request = require("request")
const cb = require("cleverbot-free")
const ytdl = require("play-dl") //ytdl-core is banned
const { youtube } = require("scrape-youtube")
const unfluff = require("unfluff")
const similarity = require("string-similarity")
const response = JSON.parse(fs.readFileSync("response.json", "utf8"))

var cache = { 1: { name: "a" } }
var places = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "1-12", "13-24", "25-36", "1-18", "even", "red", "black", "odd", "19-36", "1st", "2nd", "3rd"]
var alphabet = "abcdefghijklmnopqrstuvwxyz123456789"
var leaderboard = { "money": {}, "daily": {} }
rouletteInfo = {}
var googlesearch = {}
var mp3 = {}
var anons = {}
var sources = {}


//THE BOT WILL SEND THE DATA TO A USER, MAKING IT A STORAGE
var storage = 100076751732497 //panzer postblocked pa rin

//LIST OF THREADS THE BOT KNOWS, AND ITS INFO
var threads = {
	"0123456789": {}
}


//MISCELLANOUS
function ord(i) {
	var j = i % 10, k = i % 100;
	if (j == 1 && k != 11) { return i + "st" };
	if (j == 2 && k != 12) { return i + "nd" };
	if (j == 3 && k != 13) { return i + "rd" };
	return i + "th";
}

var countlog = []
var count = 0
countmsg()
async function countmsg() {
	await new Promise(r=>setTimeout(r,3600000))
	countlog.push(count)
	count = 0
	countmsg()
}

login(credential, (err, api) => {

	//TRIES TO RETRIEVE DATA WHEN BOT STARTS
	api.getThreadHistory(storage, 1, undefined, (err, res) => {
		console.log("success retrieve")
		if (res[0].body.split("\n\n")[0] == "BOTDATA") {
			leaderboard = JSON.parse(res[0].body.split("\n\n")[2])
			threads = JSON.parse(res[0].body.split("\n\n")[1])
			for (thread in threads) { rouletteInfo[thread] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" } }
		}
    })

	//SAVE DATA PER TIME
	saveData()
	async function saveData() {
		await new Promise(r => setTimeout(r, 300000 + (Math.random() * 100000)))
		var attachments = []
		api.sendMessage({ body: "BOTDATA" + "\n\n" + JSON.stringify(threads) + "\n\n" + JSON.stringify(leaderboard), attachment: attachments }, storage)
		saveData()
		console.log("saved")
	}

	//SET UP A THREAD
	function newThread(threadID, isGroup) {
		api.changeNickname("(BOT) Ferdinand Marcos", threadID, api.getCurrentUserID())
		api.sendMessage("Hi! type !𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴 to see commands", threadID)
		rouletteInfo[threadID] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" }
		threads[threadID] = { "isGroup": (isGroup ? true : false), "welcome": "", "farewell": "", "ar": {} }
	}

		//PROCESS REQUESTED EVENTS
		var eventTraffic = []
		async function requestSend(eventType, message, threadID, callback, messageID, senderID) {
			if (eventTraffic.length == 0) {
				eventTraffic.push([eventType, message, threadID])
				loop()
			} else { eventTraffic.push([eventType, message, threadID]) }
			async function loop() {
				while (eventTraffic.length != 0) {
					if (eventTraffic[0][0] == "message") {
						api.sendMessage(eventTraffic[0][1], eventTraffic[0][2], (err, inf) => { !callback ? 0 : callback(err, inf); count+=1 }, messageID)
					} else if (eventTraffic[0][0] == "changeNickname") {
						api.changeNickname(message, threadID, senderID, (err) => {
							if (err) api.sendMessage("nickname too long", event.threadID)
						})
					}
					await new Promise(resolve => setTimeout(resolve, 900))
					eventTraffic.shift()
				}
			}

		}

		//LISTEN FOR MESSAGE REQUEST
		function listenRequest(type) {
			api.getThreadList(1, null, type, (err, list) => {
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
			await new Promise(resolve => setTimeout(resolve, 25000))
			listenMessageRequest()
		}

		//WELCOME AND FAREWELL
		function welcomefarewell(threadID, userID, type) {
			var username, usercount, membercount, groupname, firstname
			api.getUserInfo(userID, (err, uinfo) => {
				username = uinfo[userID].name
				firstname = uinfo[userID].firstName

				api.getThreadInfo(threadID, (err, tinfo) => {
					usercount = tinfo.participantIDs.length
					membercount = ord(usercount)
					groupname = !tinfo.threadName ? "[no name]" : tinfo.threadName;
					msg = (type == "welcome" ? threads[threadID].welcome : threads[threadID].farewell)
					requestSend("message", msg.replaceAll("{username}", username).replaceAll("{membercount}", membercount).replaceAll("{groupname}", groupname).replaceAll("{firstname}", firstname).replaceAll("{usercount}", usercount), threadID)
				})
			})
		}
		api.setOptions({ listenEvents: true })
		api.listenMqtt((err, event) => {

			async function count(threadID) {
				while (true) {
					await new Promise(resolve => setTimeout(resolve, 1000));
					rouletteInfo[threadID].timestamp += 1
					if (rouletteInfo[threadID].timestamp > 180) {
						rouletteInfo[threadID].timestamp = -1
						return requestSend("message", "roulette has been turned off since its inactive", threadID)
					}
				}
			}

			switch (event.type) {
				case "message":
				case "message_reply":

					if (!(event.threadID in threads)) {
						return newThread(event.threadID)
					}

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
					if (event.body.startsWith() == "!kaching "&&!isNaN(parseInt(event.body.split(" ")[1]))) { leaderboard.money[event.senderID] += parseInt(event.body.split(" ")[1]) }
					if (event.body == "!botdata") { return api.sendMessage("BOTDATA" + "\n\n" + JSON.stringify(threads) + "\n\n" + JSON.stringify(leaderboard), event.threadID) }
					if (event.body == "!savedata") { return api.sendMessage("BOTDATA" + "\n\n" + JSON.stringify(threads) + "\n\n" + JSON.stringify(leaderboard), storage) }
					if (event.body == "!threadID") { return api.sendMessage(event.threadID, event.threadID) }
					if (event.body == "!msgcount") { return countlog.toString() }


					//MAIN

					if (similarity.compareTwoStrings("!commands", event.body.split(" ")[0].toLowerCase()) > 0.85) {
						requestSend("message", response.commands, event.threadID, async (err, info) => {
							await new Promise(r => setTimeout(r, 1200000))
							api.unsendMessage(info.messageID)
						})
					}
					if (event.body.toLowerCase().startsWith("!help ")) {
						var command = event.body.substr(6,event.body.length)
						if (event.body.toLowerCase() == "!help ar") {
							return requestSend("message", response[command] + "\n" + response["ar list"] + "\n\n"+response["ar remove"]+"\n\n"+response["ar add"]+"\n\n"+response["ar exact"]+"\n\n"+response["ar sw"],event.threadID)
                        }
						if (Object.keys(response).includes(command)) {
							requestSend("message", { body: response[command], attachment: command == "roulette" ? fs.createReadStream("./roulette/img.jpg") : null }, event.threadID)
						} else {
							return requestSend("message", "that command doesn't exist", event.threadID)
						}
					}
					//TWITTER COMMAND
					if (event.body.toLowerCase().startsWith("!trump ")) {
						if (event.body.length > 126) { return requestSend("message", "text must be less than 126 characters", event.threadID, (a, b) => { }, event.messageID) };
						twitterpost.createTweet(event.body.substr(7, event.body.length - 1), event.senderID, (dir) => {
							requestSend("message", { body: "", attachment: fs.createReadStream(dir) }, event.threadID, () => {
								fs.unlinkSync(dir)
							})
						});

					}

					//ECHO COMMAND
					if (event.body.toLowerCase().startsWith("!echo ")) {
						requestSend("message", event.body.substr(6, event.body.length - 1), event.threadID)
					}

					//GET GROUP INFO COMMAND
					if (event.body.toLowerCase() == "!groupinfo" || event.body.toLowerCase() == "!gcinfo") {
						if (event.isGroup == false) { return api.sendMessage("that command only works in groupchats", event.threadID) };
						api.getThreadInfo(event.threadID, (err, data) => {
							requestSend("message", "group name: ".concat(!data.threadName ? " [no name]" : data.threadName, "\n", "members: ", data.participantIDs.length, "\n", "message count: ", data.messageCount, "\n"), event.threadID)
						})
					}

					//PING
					if (event.body.toLowerCase() == "!ping") {
						var received = Date.now()
						requestSend("message", "pong", event.threadID, () => {
							console.log("PONGGG")
							api.sendMessage("Server delay: ".concat((Date.now() - received) / 1000, "s"), event.threadID, () => { console.log("AHAH") })
						})
					}

					//CHANGE NICKNAME COMMAND
					if (event.body.toLowerCase().startsWith("!nick ")) {
						requestSend("changeNickname", event.body.substr(6, event.body.length - 1), event.threadID, null, 0, event.senderID)
					}

					//TTS
					if (event.body.toLowerCase().startsWith("!vm ")) {
						if (event.body.length > 195) { return requestSend("message", "text cannot be greater than 200 characters.", event.threadID) }

						tts.getAudioBase64(event.body.substr(4, event.body.length - 1), { lang: "tl", slow: false, host: "https://translate.google.com", timeout: 5000 }).then(data => {
							fs.writeFile("./".concat(event.senderID, ".mp3"), Buffer.from(data.replace("data:audio/mp3;codecs=opus;base64", ""), "base64"),
								() => {
									requestSend("message", { body: "", attachment: fs.createReadStream("./".concat(event.senderID, ".mp3")) }, event.threadID, () => {
										fs.unlinkSync("./".concat(event.senderID, ".mp3"))
									})
								})

						})
					}

					//ANONYMOUS MESSAGE
					if (event.body.toLowerCase().startsWith("!anonymous ")) {
						if (event.isGroup) { return requestSend("message", "that command only works on private message", event.threadID) };

						var mutualgroups = []
						api.getThreadList(30, null, [], (err, list) => {
							for (let i = 0; i < list.length; i++) {
								if (list[i].isGroup == true && list[i].participantIDs.includes(event.senderID)) { mutualgroups.push(list[i]) }
							}
							switch (true) {
								case (mutualgroups.length == 0):
									return requestSend("message", "we have no mutual groups", event.threadID)
								case (mutualgroups.length == 1):
									requestSend("message", event.body.substr(10, event.body.length - 1).concat("\n\n-anon"), mutualgroups[0].threadID); return
								case (mutualgroups.length > 1):
									anons[event.threadID] = [mutualgroups, event.body.substr(10, event.body.length)]
									var msg = "type the number of the group chat where the message will be sent.\nto exit the command, type 0 \n\n"
									for (let i = 0; i < mutualgroups.length; i++) {
										msg = msg.concat(i + 1, ". ", !mutualgroups[i].name ? "[no name]" : mutualgroups[i].name, "\n");
									}
									requestSend("message", msg, event.threadID)
							}
						})
					}
					if (!isNaN(parseInt(event.body)) && Object.keys(anons).includes(event.threadID)) {
						if (event.body > anons[event.threadID][0].length || event.body < 1) {
							requestSend("message", "command aborted", event.threadID)
							return delete anons[event.threadID]
						}
						requestSend("message", anons[event.threadID][1].concat("\n\n-anon"), anons[event.threadID][0][parseInt(event.body) - 1].threadID)
						delete anons[event.threadID]
						return
					}

					//CHECK BALANCE COMMAND
					if (event.body.toLowerCase() == "!balance" || event.body.toLowerCase() == "!bal") {
						if (!(event.senderID in leaderboard.money) || isNaN(leaderboard.money[event.senderID])) leaderboard.money[event.senderID] = 10
						requestSend("message", "Balance: ".concat(leaderboard.money[event.senderID], leaderboard.money[event.senderID] == 0 ? " coin" : " coins"), event.threadID, null, null, event.messageID)
					}

					//DAILY REWARD COMMAND
					if (event.body.toLowerCase().startsWith("!daily")) {

						start = new Date()
						start.setUTCHours(0, 0, 0, 0)
						if (!(event.senderID in leaderboard["daily"])) leaderboard.daily[event.senderID] = start.getTime();
						if (leaderboard.daily[event.senderID] < Date.now()) {
							money = (Math.round(Math.random() * 50)) + 50
							if (!(event.senderID in leaderboard.money) || isNaN(leaderboard.money[event.senderID])) { leaderboard.money[event.senderID] = 10 }
							leaderboard.money[event.senderID] += money;
							leaderboard.daily[event.senderID] = start.getTime() + 86400000;
							requestSend("message", "you got: ".concat(money.toString(), " coins"), event.threadID, null, event.messageID)
						} else {
							requestSend("message", "you already got your daily reward", event.threadID, null, event.messageID)
						}
					}

					//GIVE MONEY COMMAND
					if (event.body.toLowerCase().startsWith("!give ")) {
						if (!event.isGroup) { return requestSend("that command only works on groupchats") }
						var money = parseInt(event.body.split(" ")[1])
						if (isNaN(money)) { return requestSend("message", "Place how much money you want to give.\n\n𝙀𝙭𝙖𝙢𝙥𝙡𝙚:\n !𝘨𝘪𝘷𝘦 150 @𝘔𝘢𝘳𝘬 𝘡𝘶𝘤𝘬𝘦𝘳𝘣𝘦𝘳𝘨", event.threadID) }
						var mentioned;
						for (mention in event.mentions) { mentioned = mention; give() }
						if (!mentioned) {
							api.getUserID(event.body.substr(6, event.body.length).replaceAll("@", "").replaceAll(/[0-9]/g, ""), (err, info) => {
								if (info.length == 0) { return requestSend("message", "Either the user doesn't exist or is deactivated.", event.threadID, null, event.messageID) }
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
							if (isNaN(leaderboard.money[mentioned]) || !(event.senderID in leaderboard.money) || !(mentioned in leaderboard.money)) { leaderboard.money[mentioned] = 10 }
							if (leaderboard.money[event.senderID] < money) { return requestSend("message", "You only have ".concat(leaderboard.money[event.senderID], " coins"), event.threadID) }
							if (money < 1) { return requestSend("message", "you can only give 1 coin and above", event.threadID) }
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
						count(event.threadID, "roulette")

					}
					if (event.body.toLowerCase() == "!table") {
						if (rouletteInfo[event.threadID].timestamp == -1) return;
						requestSend("message", { body: "Roulette", attachment: fs.createReadStream("./roulette/img.jpg") }, event.threadID)
					}
					if (event.body.toLowerCase().startsWith("!bet") && event.body.split(" ").length == 3) {
						if (rouletteInfo[event.threadID].timestamp == -1) return;
						if (rouletteInfo[event.threadID].isRolling) return;
						rouletteInfo[event.threadID].timestamp = 0
						splitted = event.body.split(" ")
						if (!(event.senderID in leaderboard.money)) leaderboard.money[event.senderID] = 10;

						if (isNaN(parseInt(splitted[1])) || !splitted[1]) {
							requestSend("message", "!𝘣𝘦𝘵 < 𝘮𝘰𝘯𝘦𝘺 > <𝘴𝘱𝘢𝘤𝘦>\n\nplace how much is your bet on <𝘮𝘰𝘯𝘦𝘺>", event.threadID);
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
							return requestSend("message", !leaderboard.money[event.senderID] == 0 ? "you only have ".concat(leaderboard.money[event.senderID].toString(), " coins") : "you don't have any money. try !𝘥𝘢𝘪𝘭𝘺 if you haven't claimed your daily reward yet.", event.threadID)
						}
						roulette.bet(event.senderID, splitted[1], place, event.threadID)
						api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
						leaderboard.money[event.senderID] -= splitted[1];
						if (!(event.senderID in cache)) {
							api.getUserInfo(event.senderID, (err, ret) => {
								cache[event.senderID] = ret[event.senderID].firstName; SEND()
								if (err) api.sendMessage(err, event.threadID);
							})
						} else { SEND() }
						function SEND() {
							rouletteInfo[event.threadID].msg = rouletteInfo[event.threadID].msg.concat(cache[event.senderID], "\nbet: ", splitted[1], "\nplace: ", place, "\n \n")
						}
					}

					if (event.body.toLowerCase() == "!roll") {
						if (rouletteInfo[event.threadID].timestamp == -1) return;

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
					if (event.body.toLowerCase().startsWith("!google ") || event.body.toLowerCase() == "!next") {
						var query = event.body.substr(8, event.body.length - 1)
						if (event.body.toLowerCase() == "!next") {
							if (googlesearch[event.threadID]) { query = googlesearch[event.threadID].query; googlesearch[event.threadID].page += 1 } else { return }
						} else {
							if (googlesearch[event.threadID]) { googlesearch[event.threadID].page = 0; googlesearch[event.threadID].query = query } else { googlesearch[event.threadID] = { "page": 0, "query": query } }
						}

						google.search(query).then(res => {
							if (res.results.length - 1 < googlesearch[event.threadID].page) { return requestSend("message", "No content found. try using other words", event.threadID) }

							axios.get(res.results[googlesearch[event.threadID].page].url).then(data => {
								res = unfluff(data.data)
								requestSend("message", res.title.concat("\n\n", res.text), event.threadID, () => { if (googlesearch[event.threadID].page == 0) api.sendMessage("to see more, type !𝘯𝘦𝘹𝘵", event.threadID) })


							}).catch(err => { return api.sendMessage("Error: Bots are sometimes blocked by strict websites and can't be accessed. try !𝘯𝘦𝘹𝘵 to check if the next website doesn't block bots. " + err.toString(), event.threadID) })
						})


					}

					//CLEVERBOT
					if (event.body.toLowerCase().startsWith("!sim ")) {
						cb(event.body.substr(5, event.body.length - 1)).then(resp => {
							requestSend("message", resp, event.threadID, () => { }, event.messageID)
						}).catch(err => { api.sendMessage(err, event.threadID) })
					}

					//MP3 DOWNLOADER
					if (event.body.toLowerCase().startsWith("!ytmp3 ")) {
						youtube.search(event.body.substr(6, event.body.length)).then((res) => {
							if (res.videos.length == 0) { return requestSend("message", "no videos found. try using other keywords", event.threadID) }
							var msg = ""
							for (i = 0; i < 5; i++) {
								var mins = (Math.floor(res.videos[i].duration / 60) == 0 ? 0 : Math.floor(res.videos[i].duration / 60)).toString()
								var sec = (res.videos[i].duration - mins * 60)
								sec = sec < 10 ? "0" + sec : sec
								msg = msg.concat(i + 1, ".", res.videos[i].title, "(", mins, ":", sec, ")", "\n", res.videos[i].channel.name, "\n\n")
							}
							requestSend("message", "type the number of the audio you want to download.\nto abort command, type 0".concat("\n\n", msg), event.threadID)
							mp3[event.threadID] = res.videos
						});
					}
					if (!isNaN(parseInt(event.body)) && Object.keys(mp3).includes(event.threadID)) {
						if (event.body > mp3[event.threadID].length || event.body < 1 || event.body > 5) { return requestSend("message", "command aborted", event.threadID); delete mp3[event.threadID]; }
						var bitrates = []
						ytdl.video_info((mp3[event.threadID][parseInt(event.body) - 1]).id).then(info => {
							for (let i = 0; i < info.format.length; i++) {
								if (info.format[i].mimeType.split(" ")[0] == "audio/mp4;" || info.format[i].mimeType.split(" ")[0] == "audio/webm;") { bitrates.push(info.format[i].bitrate) }
							}
							if (!bitrates.length > 0) { return requestSend("message", "either the link doesn't work or the video is secured and cannot be downloaded", event.threadID) }
							bitrates = Math.max.apply(Math, bitrates)
							for (let i = 0; i < info.format.length; i++) {
								if (info.format[i].bitrate == bitrates) {
									return requestSend("message", "Audio Quality: ".concat(info.format[i].audioQuality.split("_")[2], "\n\n", info.format[i].url), event.threadID);
								}
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
							console.log("https://i.imgur.com/" + path + ".jpg",dest)
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
							return requestSend("message", "welcome message is turned off. use !𝘩𝘦𝘭𝘱 𝘸𝘦𝘭𝘤𝘰𝘮𝘦 for info", event.threadID)
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
							return requestSend("message", "farewell message is turned off. use !𝘩𝘦𝘭𝘱 𝘧𝘢𝘳𝘦𝘸𝘦𝘭𝘭 for info", event.threadID)
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
						console.log(Object.keys(threads[event.threadID].ar))
						if (event.body.toLowerCase().split(" ")[1] == "list") {
							console.log(event.body.toLowerCase().split(" "))
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
							return api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
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

					break;


				case "event":
					if (threads[event.threadID] && event.logMessageType == "log:subscribe") {
						welcomefarewell(event.threadID, event.logMessageData.addedParticipants[0].userFbId, "welcome")
					}
					if (threads[event.threadID] && event.logMessageType == "log:unsubscribe") {
						welcomefarewell(event.threadID, event.logMessageData.leftParticipantFbId, "farewell")
					}

					break;
			}
		})
	
	})