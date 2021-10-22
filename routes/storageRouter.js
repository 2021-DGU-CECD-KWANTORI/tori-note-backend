var express = require('express');
var router = express.Router();
const Script = require('../models/Script');
const Image = require('../models/Image');
const Summary = require('../models/Summary');


router.get('/', async function (req, res) {
	var imagesAllCollections = await Image.find();
	var imagesCollections = [];

	imagesAllCollections.forEach(element => imagesCollections.push({
		'lecture_name': element.lecture_name,
		'date': element.date,
	}));

	res.send(imagesCollections);
});


router.get('/note', async function (req, res) {

	var lecture_name = req.body.lecture_name; // 컴퓨터네트워크 
	var date = req.body.date; // 20211011


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
