var express = require('express');
var router = express.Router();
const Script = require('../models/Script');

/* GET 슬라이드에 맞는 스크립트 조회 */
router.get('/slide', async function (req, res) {
	var contents = "";
	var scriptsCollections = await Script.find({ "id": req.query.id, "start": req.query.start });
	scriptsCollections.forEach(element => contents += element.content);
	res.send(contents);
});

/* POST client가 수정한 스크립트 저장 */
router.post('/modify', async function (req, res) {
	const filter = { id: req.body.id };
	const update = { content: req.body.content };

	await Script.findOneAndUpdate(filter, update).exec();
	res.end();
})

module.exports = router;
