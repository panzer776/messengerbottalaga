const request = require("request")
const fs = require("fs")
var link = "https://i.imgur.com/"
var alphabet = "abcdefghijklmnopqrstuvwxyz123456789"
var path = ""
_()
async function _() {

    for (i = 0; i < 5; i++) {
        path = path.concat(Math.round(Math.random()) ? alphabet[Math.round(Math.random() * 34)] : alphabet[Math.round(Math.random() * 34)].toUpperCase())
    }
        r = await request(link + path + ".jpg")

        f = await r.pipe(fs.createWriteStream("./random.jpg"))
        f.on("close", () => {
            console.log(fs.statSync("./random.jpg").size / 1000 < 8)
            if (fs.statSync("./random.jpg").size / 1000 < 8) {
                path = ""
                _()
            } else {
                console.log(link + path + ".jpg")
            }
    
    })
}


