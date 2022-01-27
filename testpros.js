 const fs = require('fs')
  , gm = require('gm');
/*
const readStream = fs.createReadStream('../test.pdf');
let pageSize = 0;
gm(readStream)
.identify((err, data) => {
    if(err) {
        console.error("not able to identify", err);
    } else {
        pageSize = data.Format.length;
    }
});

for(var i = 0; i < pageSize; i++){

}

gm(readStream).append(readStream).resize(1200).quality(100).density(300, 300).type('Grayscale').sharpen(10, 2)
.write(`testgm.png`, function (err) {
    if (!err) console.log('done');
    else {console.error(err)}
  });

 */

  var readStream = fs.createReadStream('../test.pdf');
gm(readStream)
.identify({bufferStream: true}, function(err, size) {
    this.append(readStream)
  .resize(size.width / 2, size.height / 2)
  .stream( function (err, stdout, stderr) {
    var writeStream = fs.createWriteStream('reformatted.jpg');
    stdout.pipe(writeStream);
  });
});