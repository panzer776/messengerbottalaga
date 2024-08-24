var http = require('http');
const { send } = require('q');
const axios = require("axios")

//create a server object:
http.createServer(function (req, res) {
  res.write('buhay sha'); //write a response to the client
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080


async function sendSignal(){
    await new Promise(r=>setTimeout(r,30000))
    axios({method:"GET",url:"https://messengerbottalaga-zmyx.onrender.com/"}).catch(err=>{console.log(err)})
    sendSignal()
}
sendSignal()
