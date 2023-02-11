const Client = require("omegle-client")

var om = new Client()

om.on("waiting", () => {console.log("waiting")})

om.on("error", () => { console.log("err") })
om.start()