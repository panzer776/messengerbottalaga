const play = require('play-dl');

play.video_info("Xb85Sz28S8Q").then(r=>console.log(r.format))