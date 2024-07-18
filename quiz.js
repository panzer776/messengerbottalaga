const fs = require("fs")
var quizlist = JSON.parse(fs.readFileSync("quiz.json","utf-8"))
var categories = [18,12,17,20,27]
const axios = require("axios")
lp()
async function lp(){
	try{
	r = await axios({url:"https://opentdb.com/api.php?amount=15&category=19&difficulty=medium&type=multiple",method:"GET"})
	for(i = 0;i<r.data.results.length;i++){quizlist.push(r.data.results[i])}
	fs.writeFileSync("quiz.json",JSON.stringify(quizlist))
	}catch(err){console.log(err)}
}