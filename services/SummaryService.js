var request = require('request');


module.exports.summary = function (sttResult) {
	const header = {
		'content-type': 'application/json'
	};

    const url = 'http://127.0.0.1:5001/summary';

	const requestBody = {
		"text" : sttResult
	};

	console.log("speechToText Before");

	return new Promise(function (resolve, reject) {
        request.post({
            headers: header,
            url : url,
            body : requestBody,
            json : true
        }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("summary post complete");
				resolve(body.summary);
			} else {
				reject(error);
			}
		});
    });
}