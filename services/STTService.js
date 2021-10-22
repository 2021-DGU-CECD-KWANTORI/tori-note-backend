var request = require('request');
var clovaKey = require('../properties/clovaKey');
const fs = require('fs');
const fileDirPath = require('../properties/diskDir');


module.exports.speechToText = function (script) {
	var header = {
		'content-type': 'application/json',
		'X-CLOVASPEECH-API-KEY': clovaKey.secretKey
	};

	var requestBody = {
		"dataKey": "audio/" + script + ".mp3",
		"language": "ko-KR",
		"completion": "sync",
		"fullText": true
	};

	console.log("speechToText Before");

	return new Promise(function (resolve, reject) {
		request.post({
			headers: header,
			url: clovaKey.invokeUrl + '/recognizer/object-storage',
			body: requestBody,
			json: true
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("STT clova post complete");
				resolve(body.text);
				console.log(body.text);
				
				fs.unlink(fileDirPath.diskDir + "audios/" + script + ".mp3", function (err) {
					if (err) throw err;
					console.log('mp3 file deleted!!');
				})
			} else {
				reject(error);
			}
		});
	});
}