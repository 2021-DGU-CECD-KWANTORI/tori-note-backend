var express = require("express");
var app = express();
var multer, storage, path, fs;
path = require('path');
multer = require('multer');
fs = require('fs');

const { MongoClient, ObjectId } = require('mongodb')
const url = 'mongodb://tori:1234@localhost:27017/tori'
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) return console.log(err)
  console.log('Successful connection to mongodb');
  db = client.db('tori') //사용할 데이터베이스 : DatabaseUploads
})

//test on web
var form = "<!DOCTYPE HTML><html><body>" +
  "<form method='post' action='/upload' enctype='multipart/form-data'>" +
  "<input type='file' name='upload'/>" +
  "<input type='submit' /></form>" +
  "</body></html>";

app.get('/', function (req, res) {
  //test on web
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(form);

});

var nowDay;
var fs = require('fs');
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Post
app.post(
  "/upload",
  multer({
    storage: storage
  }).single('upload'), function (req, res) {
    console.log(req.file);
    console.log(JSON.stringify(req.body));    
    
    var data;

    const ext = path.extname(req.file.originalname);

    if (ext == ".jpg" || ext == ".png") {
      //이미지 업로드

      //이미지 저장을 위해 base64로 인코딩
      var img = fs.readFileSync(req.file.path);
      var encode_image = img.toString('base64');

      //이미지 저장 json객체 생성
      data = {
        _id:req.file.filename,
        contentType: req.file.mimetype, // MIME 타입
        fileName: req.file.filename, // 파일명
        fileSize: req.file.size, //파일사이즈
        image: Buffer.from(encode_image, 'base64'), //이미지
      };

      //컬렉션에 저장
      db.collection('image_test').insertOne(data, (err, result) => {
        //console.log(result)
        if (err) return console.log(err)
        console.log('\nImage saved\n')
      })
      fs.unlink(req.file.path, function () { });

    } else {
      //음성 저장을 위해 base64로 인코딩
      var audio = fs.readFileSync(req.file.path);
      var encode_audio = audio.toString('base64');      

      //정보 저장 json객체 생성
      data = {
        _id:req.file.filename,
        contentType: req.file.mimetype, // MIME 타입
        fileName: req.file.filename, // 파일명
        fileSize: req.file.size, //파일사이즈
        audio: Buffer.from(encode_audio, 'base64'), //이미지
      };
      //console.log("data : %j", data);

      //uploads컬렉션에 데이터 저장
      db.collection('audio_test').insertOne(data, (err, result) => {
        //console.log(result)
        if (err) return console.log(err)
        console.log('\nAudio saved\n')
      })
    }
   //console.log("data : %j", data);

    res.redirect('/')
    return res.status(200).end();
  });

// Get all audio
app.get('/uploads', (req, res) => {
    // db.collection('audio_test').find({},{contentType:'audio/*'}).toArray((err, result) => {
    db.collection('audio_test').find({},{ projection:{_id: 1, fileName:1, contentType:1}}).toArray((err, result) => {
        //const imgArray = result.map(element => element._id);
      const audioArray = result.map(doc => doc._id);
      // console.log(audioArray);
      if (err) return console.log(err)
      res.send(audioArray)
    })
  });
  

app.listen(3000, () => console.log('Server started on port 3000 '));