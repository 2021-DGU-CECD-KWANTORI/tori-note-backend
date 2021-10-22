const fs = require('fs');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const path = require('../properties/diskDir').diskDir + 'audios/';
const ffmpeg = createFFmpeg({
	log: true,
});


var webmFileName = null;
var mp3FileName = null;

fs.readdir(path, function (err, filenames) {
	if (err) {
		onError(err);
		return;
	}
	filenames.forEach(function (filename) {
		fs.readFile(path + filename, 'utf-8', function (err, content) {
			if (err) {
				onError(err);
				return;
			}
			// onFileContent(filename, content);
			webmFileName = filename;
			mp3FileName = webmFileName.split('.')[0] + '.mp3';
			console.log(webmFileName);
		});
	});
});

(async () => {
	await ffmpeg.load();
	ffmpeg.FS('writeFile', webmFileName, await fetchFile(path + webmFileName));
	await ffmpeg.run('-i', webmFileName, mp3FileName);
	await fs.promises.writeFile(path + mp3FileName, ffmpeg.FS('readFile', mp3FileName));

	fs.unlink(path + webmFileName, function () { });
	process.exit(0);
})();
