const forever = require('forever-monitor')
const appStateGetter = require("./getAppstate.js")
const fs = require("fs")
var restartAttempts = 0
var time;
async function timer(){
  time = 10
  while(time!=0){
    await new Promise(r=>setTimeout(r,1000))
    time-=1
  }
  restartAttempts = 0
}

var child = new (forever.Monitor)('main.js', {
  max: 1,
  silent: false,
});


child.on('exit', async function () {
  if(restartAttempts==0){timer()}
  if(restartAttempts>3&&time>0){
    return console.error("AYUSING MO NA CODE MO GAR\n".repeat(10))
    
  }
  await new Promise(r=>setTimeout(r,5000))
  restartAttempts+=1

  child.start()
});

child.start();