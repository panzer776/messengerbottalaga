const fs = require('fs');

const writeText = require("./trigger.js");

async function createTweet(text,tweetID,callback){
	var editedImg = "./twt/traffic".concat(tweetID,".jpg");
	fs.copyFile("./twt/img.jpg",editedImg, (err) => {
		if(!err){

			writeText({path: editedImg, text: text}).then(function(result) {
			fs.writeFileSync(editedImg, result);
			return callback(editedImg);
			});
		} else {
			console.log(err)
		}
 	});
};

module.exports.createTweet = createTweet;