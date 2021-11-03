var express = require('express');
var router = express.Router();
var keywordService = require('../services/keywordService');
const Summary = require('../models/Summary');
const fs = require('fs');


/* GET 슬라이드에 맞는 스크립트 조회 */
router.get('', async function (req, res) {
	var summaries = "";
    var lecture_id = req.body.id; // choi
	var summariesCollections = await Summary.find({ id: { $regex: lecture_id + "_*" } },{_id:0, summary:1});

	summariesCollections.forEach(element => {
		var inner = "";
		for (var i = 0; i < element.summary.length; i++) {
			inner += element.summary[i];
		}
		summaries += inner;
	});

	try{
		var wordcloud = await keywordService.keyword(summaries);
	} catch(error) {
		console.log(error);
	}

	res.send({
		'imgURL': 'data:image/jpeg;base64',
		'image': wordcloud
	});
});


module.exports = router;
