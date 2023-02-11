function range(start,end) {return new Array(end-start).fill().map((d,i)=> i+start)}
function sleep(ms){ return new Promise((resolve) => {setTimeout(resolve,ms)})}

var threads = {}

exports.bet = function(uid,bet,place,threadID){
	if(!threads[threadID]) {threads[threadID] = []};
	threads[threadID].push({"uid":uid,"bet":parseInt(bet),"place":place})
}

async function roll(threadID){
	var winningPlaces = {single:null,dozens:null,column:null,halves:null,color:null,evenOdd:null,}
	await sleep(3000)

	result = Math.round(Math.random()*36)

	playerResult = []
	for(i=0;i<threads[threadID].length;i++){

		var place = threads[threadID][i].place		
		var bet = threads[threadID][i].bet
		var cash = 0
		if(isNaN(parseInt(place))==false){if(result==place){cash = 36*bet}}
		if([4,10,13,22,28,31,2,8,11,17,20,26,29,35,6,15,24,33].includes(result)){winningPlaces.color="black"; if(place=="black"){ cash = 2*bet;}}
		if([1,7,16,19,25,34,5,14,23,32,3,9,12,18,21,27,30,36].includes(result)){winningPlaces.color="red"; if(place=="red"){cash = 2*bet;}}
		if(result==0){winningPlaces.color="white"}
		if(range(1,13).includes(result)){winningPlaces.dozens="1-12"; if(place=="1-12"){cash = 3*bet;}}
		if(range(13,25).includes(result)){winningPlaces.dozens="13-24"; if(place=="13-24"){ cash = 3*bet;}}
		if(range(25,37).includes(result)){winningPlaces.dozens="25-36"; if(place=="25-36"){ cash = 3*bet;}}
		if((result-1)%3===0){winningPlaces.column="1st"; if(place=="1st"){cash = 3*bet;}}
		if((result-2)%3===0){winningPlaces.column="2nd"; if(place=="2nd"){cash = 3*bet;}}
		if((result)%3===0){winningPlaces.column="3rd"; if(place=="3rd"){ cash = 3*bet;}}
		if(range(1,19).includes(result)){winningPlaces.halves="1-18"; if(place=="1-18"){cash = 2*bet;}}
		if(range(19,37).includes(result)){winningPlaces.halves="19-36"; if(place=="19-36"){cash = 2*bet;}}	
		if((result-1)%2===0){winningPlaces.evenOdd="odd"; if(place=="odd"){cash = 2*bet;}}
		if((result)%2==0){winningPlaces.evenOdd="even"; if(place=="even"){cash = 2*bet;}}
		if(place==result){cash = 36*bet}
		playerResult.push({"threadID":threadID, "uid":threads[threadID][i].uid, "receipt":cash,"bet":threads[threadID][i].bet,"place":threads[threadID][i].place})
	}
	threads[threadID] = []
	winningPlaces.single = result
	
	return [playerResult,winningPlaces];

}

module.exports.roll = roll;