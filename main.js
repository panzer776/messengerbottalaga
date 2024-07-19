const login = require("facebook-chat-api")
const fs = require("fs")
var credential = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf-8").replaceAll("name","key")) }
const appStateGetter = require("./getAppstate.js")
const keepAlive = require("./keep-alive.js")
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
const he = require("he")
const response = JSON.parse(fs.readFileSync("response.json", "utf8"))
var cache = { 1: {} }
var places = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "1-12", "13-24", "25-36", "1-18", "even", "red", "black", "odd", "19-36", "1st", "2nd", "3rd"]
var alphabet = "abcdefghijklmnopqrstuvwxyz123456789"
var leaderboard = { "money": {}, "daily": {} }
var quizlist = JSON.parse(fs.readFileSync("quiz.json","utf8"))
var quotelist = JSON.parse(fs.readFileSync("quotelist.json","utf8"))
rouletteInfo = {}
var mp3 = {}
var anons = {}
var sources = {}

var botname = "Ferdinand Marcos(BOT)"

var lag = 1500 //ms, delays a request to prevent being flagged as bot(di ko alam kung gagana)

var threads = {}
var commandlist = []

//baggypants123@hotmail.com, 7jwhdbtkdbtn

var messageHistory = []

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
	login(credential, (loginerr, api) => {	
		if(loginerr&&loginerr.error.toString().includes("Error retrieving userID")){
			appStateGetter.main()
			return
		}
		try{
		threads = JSON.parse(fs.readFileSync("threads.json"))
		leaderboard = JSON.parse(fs.readFileSync("leaderboard.json"))
		} 
		catch(err){console.log("new bot")}
	
		saveData()
		async function saveData() {
			await new Promise(r => setTimeout(r, 20000))
			if(Object.keys(threads).length>0){
				fs.writeFileSync("threads.json",JSON.stringify(threads))
			}
			if(Object.keys(leaderboard).length>0){
				fs.writeFileSync("leaderboard.json",JSON.stringify(leaderboard))
			}
			saveData()
		}


		//SET UP A THREAD
		function newThread(threadID, isGroup) {
			api.changeNickname(botname, threadID, api.getCurrentUserID())
			api.sendMessage("Hi! I'm Kaizer. type \n!𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴 to see commands.\nPrefix: '!'", threadID)
			rouletteInfo[threadID] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" }
			threads[threadID] = { "isGroup": (isGroup ? true : false), "welcome": "Welcome to {groupname}, {username}!!!!\n\n You are the {membercount} member to join.", "farewell": "Bye {username}, we will miss you", "ar": {},quiz:{status:false,time:0,answer:""} }
		}
	
			//PROCESS REQUESTED EVENTS
			var eventTraffic = []
			async function requestSend(eventType, message, threadID, callback, messageID, senderID) {
				if (eventTraffic.length == 0) { eventTraffic.push([eventType, message, threadID,messageID,senderID]); loop()} else {eventTraffic.push([eventType, message, threadID])}
				async function loop() {
					while (eventTraffic.length != 0) {
						api.markAsRead(threadID)
						var end = api.sendTypingIndicator(threadID)
						if(eventTraffic.length<=2){lag=100} else if(eventTraffic.length>=3&&eventTraffic.length<=5) {lag=2000} else {lag = 3000}
						console.log(lag)
						if (eventTraffic[0][0] == "message"||eventTraffic[0][0] == "message_google") {
							await new Promise(resolve => setTimeout(resolve, lag))// //WAIT 1.5 SECONDS BEFORE RESPONDING TO DISGUISE AS HUMAN(di ko rin alam kung gagana)
							if(!eventTraffic[0][1]){eventTraffic.shift(); callback ? callback() : "" ; end(); continue}
							if(eventTraffic[0][0] == "message_google"){await new Promise(resolve => setTimeout(resolve, lag+2000))} //WAITS ANOTHER 2 SECONDS KASI ANDAMING ITTYPE KUNYARI
							api.sendMessage(eventTraffic[0][1], eventTraffic[0][2], (err, inf) => { if(err){console.log(err)};!callback ? "" : callback(err, inf) },eventTraffic[0][3])
						
						} else if (eventTraffic[0][0] == "changeNickname") {	
						api.changeNickname(eventTraffic[0][1], eventTraffic[0][2], eventTraffic[0][4], (err) => {
							if (err) {api.sendMessage("nickname too long", threadID)}
						})
  						
						} else if (eventTraffic[0][0] == "simsimi"){
							var options = new URLSearchParams()
							eventTraffic[0][1] = eventTraffic[0][1].replace("!sim ","")
							options.append("text",eventTraffic[0][1])
							options.append("lc","ph")
							try{
							var resp = await axios.post("https://api.simsimi.vn/v1/simtalk",options)
							//if(eventTraffic[0][1].includes("president")){resp.data.message="Magresearch kayo kung ano talaga ang totoong nangyari sa panahon ni marcos. marami ang inosenteng pinatay."}
							api.sendMessage(resp.data.message, eventTraffic[0][2], () => { }, eventTraffic[0][3])
							await new Promise(resolve => setTimeout(resolve, 1000))
							} catch(err){console.log(err);api.sendMessage("Hindi ko alam pano sagutin.", threadID)}
						} 
						eventTraffic.shift()
						end()
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
	
			//WELCOME AND FAREWELL
			function welcomefarewell(threadID, userID, type) {
				var username, usercount, membercount, groupname, firstname
				api.getUserInfo(userID, (err, uinfo) => {
					if(uinfo){
						cache[userID] = uinfo[userID]
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
					while(banlist[user]>0){
						await new Promise(resolve => setTimeout(resolve, 1000));
						banlist[user] -=1
					}
					delete banlist[user]
			}

			function handleSpam(thread,idmsg,id,cb){
				if(Object.keys(spamTraffic).includes(idmsg)){
					spamTraffic[idmsg].repeats+=1
					if(spamTraffic[idmsg].repeats>2){
						cb(); banlist[id] = 30; bantime(id)
					}
				} else{spamTraffic[idmsg] = {time:10,repeats:1};executeWhileDo(thread,idmsg)}
			}

			api.setOptions({ listenEvents: true, autoMarkDelivery:false })
			var stop = api.listenMqtt((listenErr, event) => {
				if(listenErr||!event){console.error(listenErr.toString(),listenErr,"MQTT")}
				if(listenErr&&listenErr.toString().includes("refused:")){
					appStateGetter.main()
				}
				switch (event.type) {	
					case "message_unsend":
						console.log("unsent!")
						for(i in messageHistory){
							if(messageHistory[i].msgid == event.messageID){
								try{
									if(!(messageHistory[i].sid in cache)){
										api.getUserInfo(messageHistory[i].sid, (err, ret) => {
											if(err) {return console.log(err)}
											cache[messageHistory[i].sid] = ret[event.senderID];
											api.sendMessage(ret[event.senderID].name.toUpperCase()+" UNSINST A MISSAGE.\n\n\n"+messageHistory[i].msg,messageHistory[i].tid); 
										})
									} else {
										api.sendMessage(cache[event.senderID].name.toUpperCase()+" UNSINST A MISSAGE.\n\n\n"+messageHistory[i].msg,messageHistory[i].tid); 
									}

									return
								}
								catch(err){console.log(err)}
							}
						}
					break;

					case "message":
						
						messageHistory.push({msgid:event.messageID,tid:event.threadID,msg:event.body,sid:event.senderID})
						if(messageHistory.length>200){messageHistory.shift()}
						//if(event.senderID&&event.senderID!="100006584808963"){return}
						//MY COMMANDS
						if(event.body=="!id ko"){return api.sendMessage("568043549",event.threadID)}
						if (event.body.startsWith("!kach ! ")){leaderboard.money[event.senderID] += parseInt(event.body.split(" ")[1]) }
						if (event.body == "!botdata") { return api.sendMessage("BOTDATA" + "\n\n" + JSON.stringify(threads) + "\n\n" + JSON.stringify(leaderboard), event.threadID) }
						if (event.body == "!threadID") { return api.sendMessage(event.threadID, event.threadID) }
						if(event.body.startsWith("!r ")){ if(leaderboard.money[event.body.split(" ")[1]] ){ delete leaderboard.money[event.body.split(" ")[1]] } }
						if(event.body=="!getquiz"){quizlist = JSON.parse(fs.readFileSync("quiz.json"))}
						if(event.body=="!getquotes"){quotelist = JSON.parse(fs.readFileSync("quote.json"))}
						if(event.body.toLowerCase()=="!accept"){listenRequest(["PENDING"]); listenRequest(["OTHER"])}
	
					case "message_reply":

						if (!threads[event.threadID]) {newThread(event.threadID,event.isGroup)}
						if (!threads[event.threadID].quiz) {threads[event.threadID].quiz = {status:false,answer:"",time:0} }
						if(!rouletteInfo[event.threadID]){rouletteInfo[event.threadID] = { "timestamp": -1, "IsRolling": false, "msg": "Rolling.\n\n" }}
						if(Object.keys(banlist).includes(event.senderID)){return}

						if(event.body.startsWith("!")){
							console.log(threads[event.threadID].name+":"+event.body)
							handleSpam(event.threadID,event.senderID+event.body,event.senderID,()=>{return api.sendMessage("WARNING: You are banned from using the bot for 30 seconds.",event.threadID,()=>{},event.messageID)})
						}
						//AUTO RESPONSE
						for (var trigger in threads[event.threadID].ar) {
							if (threads[event.threadID].ar[trigger].type == "add") {
								if (similarity.compareTwoStrings(trigger, event.body.toLowerCase()) > 0.84||event.body.toLowerCase().includes(trigger.toLowerCase())) {
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
							if (event.body.length > 126) { return requestSend("message", "There are too many text.", event.threadID, 0, event.messageID) };
							var id = Math.round(Math.random()*1000)
							twitterpost.createTweet(event.body.substr(7, event.body.length - 1), id, (dir) => {
								requestSend("message", { body: "", attachment: fs.createReadStream(dir) }, event.threadID, () => {
									try{fs.unlinkSync(dir+".jpg")} catch(err){}
								})
							});
	
						}

						if(event.body.startsWith("!leaderboard ng mga cute")){
							api.sendMessage("𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 \n\n1.jear\n2.angel\n3.gwy\n4.rainiel.\n5.peby\n6.azume\n7.stroberi\n8.licht\n9.azeirej\n10.achie",event.threadID)
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
								return api.sendMessage("Server delay: ".concat(((Date.now() - received)) / 1000, "s"), event.threadID)
							})
						}
	
						//CHANGE NICKNAME COMMAND
						if (event.body.toLowerCase().startsWith("!nick ")) {
							return requestSend("changeNickname", event.body.substr(6, event.body.length - 1), event.threadID, null, 0, event.senderID)
						}
	
						//TTS
						if (event.body.toLowerCase().startsWith("!vm ")) {
							if (event.body.length > 195) { return requestSend("message", "There are too many text", event.threadID) }
	
							tts.getAudioBase64(event.body.substr(4, event.body.length - 1), { lang: "tl", slow: false, host: "https://translate.google.com", timeout: 10000 }).then(data => {
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
							try{Object.keys(anons).includes(event.threadID);anons[event.threadID];anons[event.threadID][0]
							api.markAsRead(event.threadID)
							if (event.body > anons[event.threadID][0].length || event.body < 1) {
								requestSend("message", "command cancelled", event.threadID)
								return delete anons[event.threadID]
							}
							requestSend("message", anons[event.threadID][1].concat("\n\n-anon"), anons[event.threadID][0][parseInt(event.body) - 1].threadID)
							try{api.setMessageReaction("\uD83D\uDC4D", event.messageID)} catch(err){}
							delete anons[event.threadID]
							return
						} catch(err){}
					}

						//LEADERBOARD COMMAND
						if(event.body.toLowerCase()=="!leaderboard"){
							var msg = "𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃\n-top 20!\n\n"
							var i = -1;
							forloop()
							async function forloop(){
								if((i==Object.keys(leaderboard.money).length-1)){return nowDoThis()} else {i+=1}
								if(!Object.keys(cache).includes(Object.keys(leaderboard.money)[i])){
									if(leaderboard.money[Object.keys(leaderboard.money)[i]]==0){return forloop()}
									if(i==0){requestSend("message","Please wait...",event.threadID,0,event.messageID)}
									api.getUserInfo(Object.keys(leaderboard.money)[i],(err,res)=>{
										if(!res){return forloop()}
										try{cache[Object.keys(leaderboard.money)[i]] = res[Object.keys(leaderboard.money)[i]]} catch(err){}
										if(i==Object.keys(leaderboard.money).length){nowDoThis()}
										forloop()
									})
								}
								else if(i==Object.keys(leaderboard.money).length-1){nowDoThis()} else {forloop()}
							
							}
							async function nowDoThis(){
								var ranking = Object.keys(leaderboard.money).map((key) => [key, leaderboard.money[key]]);
								ranking = ranking.sort((a,b)=>a[1]-b[1])
								var j = 1
								for(let i=ranking.length-1;i>=0;i--){
									try{
									msg+=j+". "+cache[ranking[i][0]].name+(j==1? "🔥" : "")+"\n"
									if(j==20){break}
									j+=1
									} catch(err){}
								}
								requestSend("message",msg,event.threadID)
							}
						} 
					
						//CHECK BALANCE COMMAND
						if (event.body.toLowerCase() == "!balance" || event.body.toLowerCase() == "!bal") {
							if (!(event.senderID in leaderboard.money) || isNaN(leaderboard.money[event.senderID])) leaderboard.money[event.senderID] = 0
							return requestSend("message", "Balance: ".concat(leaderboard.money[event.senderID].toLocaleString(), leaderboard.money[event.senderID] == 0 ? " coin" : " coins"), event.threadID, 0, event.messageID)
						}
	
						//DAILY REWARD COMMAND
						if (event.body.toLowerCase().startsWith("!daily")) {
	
							start = new Date()
							start.setUTCHours(0, 0, 0, 0)
							if (!(event.senderID in leaderboard["daily"])) leaderboard.daily[event.senderID] = start.getTime();
							if (leaderboard.daily[event.senderID] < Date.now()) {
								money = (Math.round(Math.random() * 100)) + 200
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
							var mentioned = Object.keys(event.mentions)[0]
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
										if (mentioned) { give(mentioned) }
										else { return requestSend("message", "Either the user doesn't exist or is deactivated.", event.threadID) }
									})
								})
							} else {give(mentioned)}
							function give(mnt) {
								if (mnt == event.senderID) { return api.sendMessage("You can't give money to yourself", event.threadID) }
								if (isNaN(leaderboard.money[mnt]) || !(mnt in leaderboard.money)) { leaderboard.money[mnt] = 0 }
								if (isNaN(leaderboard.money[event.senderID])) { leaderboard.money[event.senderID] = 0 }
								if (leaderboard.money[event.senderID] < money) { return requestSend("message", "You only have ".concat(leaderboard.money[event.senderID].toLocaleString(), " coins"), event.threadID) }
								if (money < 1) { return requestSend("message", "you can only give more than 1 coin", event.threadID) }
								leaderboard.money[event.senderID] -= money
								leaderboard.money[mnt] += money
								api.setMessageReaction("\uD83D\uDC4D", event.messageID, (err) => { })
								requestSend("message", "new balance: ".concat(leaderboard.money[event.senderID].toLocaleString(), " coins"), event.threadID, () => { }, event.messageID)
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
								return requestSend("message", { body: place.concat(" is not a space, choose here."), attachment: fs.createReadStream("./roulette/img.jpg") }, event.threadID);
							}
							if (leaderboard.money[event.senderID] < parseInt(splitted[1])) {
								return requestSend("message", !leaderboard.money[event.senderID] == 0 ? "you only have ".concat(leaderboard.money[event.senderID].toLocaleString(), " coins") : "you don't have any money. try !𝘥𝘢𝘪𝘭𝘺 if you haven't claimed your daily reward yet, or ask someone to give you money", event.threadID)
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
								rouletteInfo[event.threadID].msg = rouletteInfo[event.threadID].msg.concat(cache[event.senderID].firstName, "\nbet: ", splitted[1], "\nspace: ", place, "\n \n")
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
							try{
							google.search(event.body.substr(8,event.length), options).then(async(r)=>{
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
							} catch(err){return api.sendMessage("I didn't process that. Please try asking the question again.",event.threadID)}
						}
	
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

					
						if(event.body.toLowerCase().startsWith("!sing")){
							ytsearch.search(event.body.substr(6, event.body.length)).then((res) => {
								if (res.videos.length == 0) { return requestSend("message", "no sound found. try using other keywords", event.threadID) }
								ytdl.getInfo(res.videos[0].id).then(info => {
									async function f(){
										let audio = ytdl.chooseFormat(info.formats,{quality:"lowestaudio"})
										requestSend("message","Searching, Please wait...",event.threadID,0,event.messageID)
										axios({url:audio.url,method:"GET",responseType:"arraybuffer"}).then(data=>{
											fs.writeFileSync(event.senderID+".mp3",data.data)
											requestSend("message",{body:"",attachment:fs.createReadStream(event.senderID+".mp3")},event.threadID)	
										})		
										.catch((err)=>{console.log(err); requestSend("message","no result found",event.threadID)})	
									}
									f()
								})
							})
							

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
								if (isNaN(parseInt(num))) { return requestSend("message", "You must put the number of the ar you want to remove.", event.threadID) }
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

						if(event.body.toLowerCase().startsWith("!advice")){
							axios.get("https://api.adviceslip.com/advice").then((resp)=>{
							return requestSend("message", resp.data.slip.advice, event.threadID)
							}).catch(err=>{requestSend("message","grabe ha, ibang command naman",event.threadID)})
						}

						if(event.body.toLowerCase().startsWith("!quote")){
							var chosenOne = Math.round(Math.random()*(quotelist.length-1))
							requestSend("message",quotelist[chosenOne].content+"\n\n-"+quotelist[chosenOne].author,event.threadID)	
						}

						console
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
											id0 = api.getCurrentUserID()
										}
									} else {_()}

									async function _(){
										res.participantIDs.splice(res.participantIDs.indexOf(id0),1)
										var id1 = res.participantIDs[Math.round(Math.random()*(res.participantIDs.length-1))]

										api.getUserInfo([id0],(err,info)=>{
											if(err){return requestSend("message","You're using this command too much. Please try again later.",event.threadID)}
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
												api.sendMessage({body:msg.replace("1",name1.name).replace("2",name2.name)+"\n\n"+msg2.replace("percent",percent).replace("bar","\n"+bar+" "), mentions: [ {tag:name1.name,id:id0} , {tag:name2.name,id:id1} ] },event.threadID,()=>{
													return;
												})
											})
										})
									}
								})
							})
						}

						if(event.body.toLowerCase().startsWith("!pinterest ")){
							var query = encodeURIComponent(event.body.replace("!pinterest",""))
							requestSend("message","",event.threadID,async()=>{
								try{				
									var res = await axios("https://api.kenliejugarap.com/pinterestbymarjhun/?search="+query)
									var dirs = []
									for(i=0;i<5;i++){
										var img = await axios({url:res.data.data[i],method:'GET',responseType:'stream'})
										dirs.push(img.data)
									}
									api.sendMessage({body:"",attachment:dirs},event.threadID)
								} catch(err){console.log(err); return api.sendMessage("no results found or command is in cooldown.",event.threadID,()=>{},event.messageID)}
							})
										
						}

						if(event.body.toLowerCase().startsWith("!coinflip ")){
							try{
							var bet = parseInt(event.body.split(" ")[1])
							var space = event.body.split(" ")[2].toLowerCase().replaceAll("s","")
							console.log(["head","tail"].includes("head"))
							if(!(["head","tail"].includes(space))){return requestSend("message","engk "+space,event.threadID)}
							if(isNaN(bet)){return requestSend("message","engkk"+bet,event.threadID)}
							if(!leaderboard.money[event.senderID]){leaderboard.money[event.senderID] = 0; return requestSend("message","You don't have any money.",event.threadID)}
							if(bet>leaderboard.money[event.senderID]){return requestSend("message","You only have "+leaderboard.money[event.senderID]+" coins",event.threadID)}
							rand()
							} catch(err){console.log(err)}
							async function rand(){
								var spaces = ["head","tail"]
								var res = spaces[Math.round(Math.random())]
								api.setMessageReaction("",event.messageID)
								await new Promise(r=>setTimeout(r,1000))
								requestSend("message","The coin landed "+res+"!\n\n You "+(space==res?"won ":"lost ")+bet+" coins",event.threadID)
								if(space==res){leaderboard.money[event.senderID]+=bet} else {leaderboard.money[event.senderID]-=bet}
							}
							
						} 

						if(event.body.toLowerCase().startsWith("!quizcount")){return requestSend("message","there are "+quizlist.length+" quizzes.",event.threadID)}

						if(event.body.toLowerCase().startsWith("!quiz")||threads[event.threadID].quiz.status==true){
							async function timer(){
								while(threads[event.threadID].quiz.time!=0){
									if(threads[event.threadID].quiz.status==false){break}
									await new Promise(r=>setTimeout(r,1000))
									threads[event.threadID].quiz.time-=1
									if(threads[event.threadID].quiz.time==0){threads[event.threadID].quiz.status = false; return requestSend("message","You ran out of time. The correct answer is letter "+threads[event.threadID].quiz.answer,event.threadID)}
								}
							}
							if(!event.body.toLowerCase().startsWith("!quiz")){
								var ans = event.body.toUpperCase().split(" ")[0].replaceAll(".","")
								if(!["A","B","C","D"].includes(ans)){return}
								threads[event.threadID].quiz.status = false	
								threads[event.threadID].quiz.time=-10
								if(ans==threads[event.threadID].quiz.answer.replace(".","")){
									requestSend("message","Correct! You won 10 coins.",event.threadID,0,event.messageID)
									if(!leaderboard.money[event.senderID]){leaderboard.money[event.senderID]=0}
									leaderboard.money[event.senderID]+=10
									console.log(leaderboard.money[event.senderID])
								} else {return requestSend("message","Incorrect. The answer is "+threads[event.threadID].quiz.answer,event.threadID)}
							
							} else if(threads[event.threadID].quiz.status==false) {question()} else {return requestSend("message","You must answer the question first.",event.threadID)}

							async function question(){
								threads[event.threadID].quiz.status=true
								var res = Math.round(Math.random()*(quizlist.length-1))
								var answers = []
								for(i in quizlist[res].incorrect_answers){answers.push(quizlist[res].incorrect_answers[i])}
								answers.push(quizlist[res].correct_answer)
								var msg = he.decode(quizlist[res].question) + "\n\n"
								console.log(answers)
								var alph = ["A.","B.","C.","D."]
								for(var i = 0;i<4;i++){
									var chosenOne = Math.round(Math.random()*(answers.length-1))
									msg+=alph[i]+he.decode(answers[chosenOne])+"\n"
									if(answers[chosenOne]==quizlist[res].correct_answer){threads[event.threadID].quiz.answer=alph[i]}
									answers.splice(chosenOne,1)
								}
								threads[event.threadID].quiz.time = 15
								return requestSend("message",msg+"\n\nYou have 15 seconds to answer! ",event.threadID,()=>{timer()})
							}
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
							var updated = encodeURIComponent(event.body.replace("!solve","").replaceAll("×","*").replaceAll("÷","/").replaceAll("•","*").replaceAll("pi",3.141592653589793238462643383279502884197).replaceAll("÷","/").replaceAll("π","3.141592653589793238462643383279502884197"))
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

						if(event.body.toLowerCase().startsWith("!insult")){
							var insults = ["hindi mo alam na may putok ka, binabackstab ka na ng mga tao","ampanghe mo","gusto mo insulto ha? PUKINANG INA MO KA IWANAN KA SANA NG TATAY MO","tanginamo pakarat","manahimik ka nalang pwede?","ulol pakarat","POKPOK KA BA","tang ina mo rin e no","wala kang nanay","nakakapikon mukha mo","wala kang tatay","ampon ka lang","bobo ka","ang pangit mo","pabigat ka sa bahay nyo","iniisip ngayon ng mama mo na sana hindi ka nalang pinanganak","wala kang silbi","simula nung pinanganak ka naging malas pamilya mo","inutil ka","mangmang!","hayop ka","sana hindi ka nalang pinanganak","bangs mo hindi pantay","nagsisisi magulang mo at sana may anak din silang matalino","kaya ka iniiwan ng tatay mo","iniisip ng magulang mo na nasa may anak silang hindi pabigat sa bahay","sana pinutok ka nalang sa kumot","aksidente ka lang ginawa","tang ina mo","akala mo siguro cute ka sa pfp mong tanga ka","MAMATAY KA NA GAGO KA","pukinang ina kang hayop ka"]
							requestSend("message",insults[Math.round(Math.random()*(insults.length-1))],event.threadID)
						}

						if(event.body.toLowerCase().startsWith("!weather")){
							var a = ["malamig ata","lameg","so lamig","lamig lang","malameg gar","MALAMEG!!!!!","mya q sabihin bz p","lamig sana macuddle","malamig putanginamo","malamig baby","malamig putanginmo","it's cold po baby, make sure you have ur blankets po","lamig lng"]
							return requestSend("message",a[Math.round(Math.random()*(a.length-1))],event.threadID,0,event.messageID)
						}

						if(event.body.toLowerCase().startsWith("!ai")){
							requestSend("message","",event.threadID,async()=>{
								try{
									var res = await axios("https://api.kenliejugarap.com/freegpt4o8k/?question="+encodeURIComponent(event.body.replace("!ai","")))
									return api.sendMessage(res.data.response.split("Is this answer helpful to you?")[0].replaceAll("*",""),event.threadID,0,event.messageID)
								} catch(err){return api.sendMessage("No results found, try again.",event.threadID)}
							})
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