const http = require('http');
const { Worker } = require('worker_threads');
const { createWorker, createScheduler } =require('tesseract.js');
const convertImage = require('./imageProcess.js');
const { writeFileSync } = require("fs-extra");
const express = require('express');

const app = express();
let scheduler;

app.use(async (req, res) => {
  const { filePath } = req.query; 
 /*    const originalArray = ["312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas","312","3123","312e3","3123cas"]; // Large array
    // Create a worker thread and pass to it the originalArray
      const thworker = new Worker('./worker.js', { 
          workerData: originalArray
      });
    // Receive messages from the worker thread
      thworker.once('message', (hashedArray) => {
       
        //console.log('Received the hashedArray from the worker thread!', hashedArray);
        
      }); */
      try {
        if(!filePath) {
          return res.send('no file');
        }
        const output = await convertImage(filePath);
        let fileName = filePath.split('/');
        fileName = fileName[fileName.length-1];
        fileName = fileName.split('.')[0];
        writeFileSync(`base64-${fileName}.png`, output, "base64");
        let imageBuffer = Buffer.from(output, "base64");
        const worker = createWorker();
        scheduler.addWorker(worker);
        console.log(scheduler.getNumWorkers());
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const pdfData = await scheduler.addJob('recognize', imageBuffer);
        const { data } = await worker.getPDF("Tesseract OCR Result");
        //writeFileSync("tesseract-ocr-result.pdf", Buffer.from(data));
        res.send(`<h1>${pdfData.data.confidence}</h1>`+pdfData.data.hocr);
      } catch (error) {
          res.send(error);
      }
  })
app.listen(4000,()=>{
  scheduler = createScheduler();
})