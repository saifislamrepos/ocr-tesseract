const fs = require('fs')
  , gm = require('gm');

const getStream = (path) => {
   try {
    return fs.createReadStream(path);
   } catch (error) {
     return false;
   }
}

const getImageData = (img) => {
    return new Promise((resolve, reject) => {
        gm(img)
        .identify({bufferStream: true}, function(err, data) {
            if(err) {
                console.log(err)
                reject(err);
            } else {
                resolve({size:data.Format.length, imgStream: this});
            }
        })
      });
}

const processImage = (img, inStream,  pageSize) => {
    return new Promise((resolve, reject) => {
        let outImgstream = img;
        for(var i = 1; i < pageSize; i++){
            outImgstream = outImgstream.append(inStream);
         }
         outImgstream
         .resize(1800)
         .quality(100)
         .density(300, 300)
         .type('Grayscale')
         .enhance()
         .filter('Sinc')
         .sharpen(15, 30)
         .contrast(+2)
         .stream('png', function (err, stdout, stderr) {
            try{ 
                let buffer = '';
                stdout.on("data", (data) => {
                    buffer += data.toString("binary");
                  })
                stdout.on('end', ()=> {
                    const binString = Buffer.from(buffer, "binary");
                    const result = binString.toString("base64");
                    resolve(result);
                });
                
            } catch(erorr) {
                reject(erorr)
            }
            
          });
        });
}

const convertImage = (path) => {
    return new Promise(async (resolve, reject) => {
        const inStream = getStream(path);
        if(!inStream) {
            reject('no file');
        }
        let convertedData = false;
        let outImgstream;
        let pageSize = 0;
        try {
            const imgData = await getImageData(inStream);
            if(imgData.imgStream) {
                outImgstream = imgData.imgStream;
                pageSize =imgData.size;
            }
        } catch (error) {
            console.log(error);
            pageSize = 0;
        }
        
        if(pageSize > 0) {
            try {
                convertedData = await processImage(outImgstream, inStream, pageSize);
            } catch (error) {
                console.log(error)
            }
            
            
        }
        resolve(convertedData);
    });
}
//convertImage('../test.pdf')
module.exports = convertImage;