const { sumAsync } = require('opencv4nodejs');
var request = require('request');


module.exports.keyword = function (summaries) {

	const header = {
		'content-type': 'application/json'
	};

    const url = 'http://127.0.0.1:5001/keyword';

	const requestBody = {
		"text" : summaries
	};

	return new Promise(function (resolve, reject) {
        request.post({
            headers: header,
            url : url,
            body : requestBody,
            json : true
        }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("keywords post complete");
				resolve(body.keywords);
			} else {
				reject(error);
			}
		});
    });
}