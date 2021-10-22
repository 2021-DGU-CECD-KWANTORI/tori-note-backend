var express = require('express');
var router = express.Router();
const Script = require('../models/Script');
const Image = require('../models/Image');


/* GET 실시간 image 전송 */
router.get('/images', async function (req, res) {
	var lecture_id = req.body.id; // choi
	var imagesAllCollections = await Image.find({ id: { $regex: lecture_id + "_*" } });
	var imagesCollections = [];

	imagesAllCollections.forEach(element => console.log("가져온 이미지: " + element.id));

	imagesAllCollections.forEach(element => imagesCollections.push({
		'imgURL': 'data:image/jpeg;base64',
		'id': element.id,
		'lecture_name': element.lecture_name,
		'date': element.date,
		'image': element.image
	}));

	res.send(imagesCollections);
});

module.exports = router;
