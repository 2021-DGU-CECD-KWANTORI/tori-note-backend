var express = require('express');
var request = require('request');
var multer = require('multer');
var imageService = require('../services/ImageProcessingService');
var sttService = require('../services/STTService');
var summaryService = require('../services/SummaryService');
var fs = require('fs');
const AWS = require('aws-sdk');
const objectkey = require('../properties/objectKey');
const fileDirPath = require('../properties/diskDir');
const Script = require('../models/Script');
const Image = require('../models/Image');
const Summary = require('../models/Summary');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		if (file.mimetype === 'video/webm') {
			cb(null, 'uploads/audios');
		} else if (file.mimetype === 'image/png') {
			cb(null, 'uploads');
		} else {
			console.log(file.mimetype);
			cb({ error: 'Mime type not supported' });
		}
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

var router = express.Router();
var upload = multer({ storage: storage });

var previousInfo = new Map();
previousInfo.set("content", "");

var starter = 1;
var script = "";

/* POST image, audio */
router.post('/', upload.any(), async function (req, res, next) {
	//[0]:image, [1]:audio
	// console.log(req.files); 
	// console.log(req.body);
	res.send("done");

	// audio
	try {
		const { stdout, stderr } = await exec("node --experimental-wasm-threads --experimental-wasm-bulk-memory services/Transcode.js ");
		console.log('stdout:', stdout);
		console.log('stderr:', stderr);
	} catch (e) {
		console.error(e);
	}

	// 여기서 uploads/audios에 있는 파일 storage에 올려야 함. 
	const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
	const region = 'kr-standard';
	const access_key = objectkey.accessKey;
	const secret_key = objectkey.secretKey;


	const S3 = new AWS.S3({
		endpoint: endpoint,
		region: region,
		credentials: {
			accessKeyId: access_key,
			secretAccessKey: secret_key
		}
	});

	const bucket_name = 'tori';

	await (async () => {
		object_name = req.files[1].filename.split(".")[0] + ".mp3";
		console.log(">>>>>> object_name : ", object_name);

		// upload file
		await S3.putObject({
			Bucket: bucket_name,
			Key: "audio/" + object_name,
			Body: fs.createReadStream(fileDirPath.diskDir + "audios/" + object_name),
			ContentType: 'audio/mpeg'
		}).promise();

	})();


	// image
	var previous = new Image({
		lecture_name: previousInfo.get("lecture_name"),
		date: previousInfo.get("date"),
		id: previousInfo.get("id"),
		image: previousInfo.get("image")
	});

	var prevScript = new Script({
		lecture_name: previousInfo.get("lecture_name"),
		date: previousInfo.get("date"),
		id: previousInfo.get("id"),
		content: previousInfo.get("content"),
		start: previousInfo.get("start")
	});

	var prevSummary = new Summary({
		lecture_name: previousInfo.get("lecture_name"),
		date: previousInfo.get("date"),
		id: previousInfo.get("id"),
		summary: "",
		start: previousInfo.get("start")
	});

	

	if (previous.id != null) {
		starter = await imageService.classfiyImage(previous, req.files[0].filename);
		console.log("starter returned: " + starter);

		if (starter != prevScript.start) {
			
			try{
				summaryResult = await summaryService.summary(prevScript.content);
				console.log("KR-WORDRANK RESULT >>>>> ", summaryResult);
				prevSummary.summary = summaryResult;
				prevSummary.save().then((prevSummary) => {
					console.log("Summary " + prevSummary.id + " saved");
				}).catch((err) => {
					console.log(err);
				});
			} catch(error) {
				console.log(error);
			}


			await prevScript.save().then((prevScript) => {
				console.log("Script " + prevScript.id + " saved");
			}).catch((err) => {
				console.log(err);
			});
			previousInfo.set("content", "");
		}
	}

	var sttFileName = req.files[0].filename.split(".")[0];
	console.log("sttFileName : " + sttFileName);

	try {
		script = await sttService.speechToText(sttFileName); // 지금 스크립트 결과 
	} catch (error) {
		console.log(error);
	}
	// 현재 정보를 previous에 저장
	previousInfo.set("lecture_name", req.body.lecture_name);
	previousInfo.set("date", req.body.date);
	previousInfo.set("id", req.files[0].filename);
	previousInfo.set("start", starter);
	previousInfo.set("content", previousInfo.get("content") + script);

	var img = fs.readFileSync(fileDirPath.diskDir + previousInfo.get("id"));
	var encode_image = img.toString('base64');

	previousInfo.set("image", encode_image);


});

module.exports = router;