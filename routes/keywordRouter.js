var express = require('express');
var router = express.Router();
var keywordService = require('../services/keywordService');
const Summary = require('../models/Summary');
const Keyword = require('../models/Keyword');
const fs = require('fs');


router.post('', async function (req, res) {
	res.send("request Keyword");

	var summaries = "";
	var summariesCollections = await Summary.find({ lecture_name: req.body.lecture_name, date: req.body.date},{_id:0, summary:1});

	summariesCollections.forEach(element => {
		var inner = "";
		for (var i = 0; i < element.summary.length; i++) {
			inner += element.summary[i];
		}
		summaries += inner;
	});

	try{
		var keywords = await keywordService.keyword(summaries);
	} catch(error) {
		console.log(error);
	}
	
	if(keywords.length>6){
		keywords = keywords.slice(0,6);
	}

	var keyword = new Keyword({
		lecture_name: req.body.lecture_name,
		date: req.body.date,
		id: req.body.id,
		keyword:keywords
	});

	await keyword.save().then((keyword) => {
		console.log("Keyword saved");
	}).catch((err) => {
		console.log(err);
	});

});


module.exports = router;