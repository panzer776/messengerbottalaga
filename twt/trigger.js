(function() {
  var Jimp, ninvoke;
  ninvoke = require('q').ninvoke;
  Jimp = require('jimp');

function wrap(text, maxLength) {
    var result = [], line = [];
    var length = 0;
    text.split(" ").forEach(function(word) {
        if ((length + word.length) >= maxLength) {
            result.push(line.join(" "));
            line = []; length = 0;
        }
        length += word.length + 1;
        line.push(word);
    });
    if (line.length > 0) {
        result.push(line.join(" "));
    }
    return result;
};

  module.exports = function(arg) {
    var color, font, path, quality, text;
    path = arg.path, text = arg.text, color = "black", quality = 60, fontSize = 32;

    font = Jimp["FONT_SANS_" + fontSize + "_BLACK"];
    return ninvoke(Jimp, 'loadFont', font).then(function(font) {
      return Jimp.read(path).then(function(image) {
        return {
          image: image,
          font: font
        };
      });
    }).then(function(arg1) {
      var chain, first, font, image, last, ref, x, y;
      image = arg1.image, font = arg1.font;
      y = image.bitmap.height - 240;
      x = 30;
      wrapped = wrap(text,40);
	switch(true){
	case (wrapped.length == 1):
		 chain = image.print(font, x, y, wrapped[0]).quality(60);
      		 return ninvoke(chain, 'getBuffer', Jimp.MIME_JPEG);
	case (wrapped.length == 2):
	 	 chain = image.print(font, x, y-fontSize/2, wrapped[0]).print(font, x, y+fontSize/2, wrapped[1]).quality(60);
      		 return ninvoke(chain, 'getBuffer', Jimp.MIME_JPEG);
	case (wrapped.length == 3): 
		chain = image.print(font, x, y-fontSize, wrapped[0]).print(font, x, y, wrapped[1]).print(font, x, y+fontSize, wrapped[2]).quality(60);
      		 return ninvoke(chain, 'getBuffer', Jimp.MIME_JPEG);
	case (wrapped.length >=4):
		chain = image.print(font, x, y-fontSize, "ayaw ko n magsulat").quality(60);
      		 return ninvoke(chain, 'getBuffer', Jimp.MIME_JPEG);
	}
	
	
    });
  };

}).call(this);