var express = require('express');
var router = express.Router();
const Script = require('../models/Script');
const Image = require('../models/Image');
const Summary = require('../models/Summary');
const Keyword = require('../models/Keyword');

router.get('/', async function (req, res) {
	var imagesAllCollections = await Image.aggregate([{$group:{"_id":{"lecture_name":"$lecture_name", "date":"$date"},image:{$first:"$id"}}}] );
	var keywordAllCollections = await Keyword.find()
	var resultCollections = [];

	imagesAllCollections.forEach(element => resultCollections.push({
		'lecture_name': element._id.lecture_name,
		'date':element._id.date,
		'image': element.image
	}));

	keywordAllCollections.forEach(function (currentValue, index, array) {
		try{
			var index = resultCollections.findIndex(i => i.lecture_name == currentValue.lecture_name && i.date==currentValue.date); 
			resultCollections[index]['keyword'] = currentValue.keyword;
		}catch{
			console.log('keyword error');
		}
	});
	
	res.send(resultCollections);
});


router.get('/note', async function (req, res) {

	var lecture_name = req.query.lecture_name; // 컴퓨터네트워크 
	var date = req.query.date; // 20211011


	var imagesAllCollections = await Image.find({ "lecture_name": lecture_name, "date": date });

	var scriptsAllCollections = await Script.find({ "lecture_name": lecture_name, "date": date });

	var summaryAllCollections = await Summary.find({ "lecture_name": lecture_name, "date": date });



	var resultCollections = [];

	imagesAllCollections.forEach(element => resultCollections.push({
		'imgURL': 'data:image/jpeg;base64',
		'id': element.id.split("_")[0] + "_",
		'lecture_name': element.lecture_name,
		'date': element.date,
		'image': element.image
	}));


	scriptsAllCollections.forEach(function (currentValue, index, array) {
		resultCollections[index]['start'] = currentValue.start;
		resultCollections[index]['end'] = currentValue.id.split("_")[1].split(".")[0]
		resultCollections[index]['script'] = currentValue.content;
	})

	summaryAllCollections.forEach(function (currentValue, index, array) {
		resultCollections[index]['summary'] = currentValue.summary;
	})


	res.send(resultCollections);
});

module.exports = router;