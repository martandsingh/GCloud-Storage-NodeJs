const {Storage} = require('@google-cloud/storage');
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const app = express()

const port  = process.env.PORT || 3000;

const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
      // no larger than 5mb.
      fileSize: 5 * 1024 * 1024,
    },
  })

  // CONFIGURTION - CLOUD STORAGE
var bucket_name = "[BUCKET-NAME]"
var keyFilePath = "[KEY-FILE-PATH]";
var projectId = "[PROJECT ID]";

const options = {
    keyFilename: keyFilePath,
    projectId: projectId,
  };

// inline authentication
const storage = new Storage(options);

app.use(multerMid.single('file'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


app.get('/', (req, res) => res.send('Hello World!'))


// upload with the path 
app.post('/uploadimage', (req, res) => {
    console.log(req)

    storage.bucket(bucket_name).upload("pic2.png", {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: 'public, max-age=31536000',
        },
      });
      res.status(200).send({msg:"done"});
  
})

// upload as blob
app.post('/upload', async (req, res) => {
    console.log(req.file)
    var buck = storage.bucket(bucket_name);
    var blob = buck.file(req.file.originalname);
    var blobStream = blob.createWriteStream();
    blobStream.on('error', (err) => {
        res.send(err);
      });
    
      blobStream.on('finish', () => {
        // SUCCESS
        res.status(200).send("ok");
      });
    
      blobStream.end(req.file.buffer);
   
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

