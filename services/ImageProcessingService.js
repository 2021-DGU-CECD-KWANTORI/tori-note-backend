const pkg = require('opencv4nodejs');
const datatype = pkg.CV_32F;
const fs = require('fs');
const fileDirPath = require('../properties/diskDir');

// Ported from https://docs.opencv.org/2.4/doc/tutorials/gpu/gpu-basics-similarity/gpu-basics-similarity.html
function getStructureSimilarity(i1, i2) {
	const C1 = 6.5025, C2 = 58.5225;
	/***************************** INITS **********************************/
	const d = datatype;

	const I1 = i1.convertTo(d);    // cannot calculate on one byte large values
	const I2 = i2.convertTo(d);

	const I2_2 = I2.hMul(I2);     // I2^2
	const I1_2 = I1.hMul(I1);     // I1^2
	const I1_I2 = I1.hMul(I2);     // I1 * I2

	/*************************** END INITS **********************************/

	const mu1 = I1.gaussianBlur(new pkg.Size(11, 11), 1.5);
	const mu2 = I2.gaussianBlur(new pkg.Size(11, 11), 1.5);

	const mu1_2 = mu1.hMul(mu1);
	const mu2_2 = mu2.hMul(mu2);
	const mu1_mu2 = mu1.hMul(mu2);

	let sigma1_2 = I1_2.gaussianBlur(new pkg.Size(11, 11), 1.5);
	sigma1_2 = sigma1_2.sub(mu1_2);

	let sigma2_2 = I2_2.gaussianBlur(new pkg.Size(11, 11), 1.5);
	sigma2_2 = sigma2_2.sub(mu2_2);

	let sigma12 = I1_I2.gaussianBlur(new pkg.Size(11, 11), 1.5);
	sigma12 = sigma12.sub(mu1_mu2);

	///////////////////////////////// FORMULA ////////////////////////////////

	let t1 = mu1_mu2.convertTo(-1, 2, C1);
	let t2 = sigma12.convertTo(-1, 2, C2);
	let t3 = t1.hMul(t2);

	t1 = mu1_2.addWeighted(1.0, mu2_2, 1.0, C1);
	t2 = sigma1_2.addWeighted(1.0, sigma2_2, 1.0, C2);
	t1 = t1.hMul(t2);

	const ssim_map = t3.hDiv(t1);
	const { y, x, w } = ssim_map.mean();
	return [y, x, w].reduce((a, b) => a + b) / 3;
}

var temp = 1;
/*
	previous : 바로 앞에 들어온 사진
	now : 지금 들어온 사진
*/
module.exports.classfiyImage = async function (previous, now) {
	const diskDir = fileDirPath.diskDir;
	console.log("previous : " + diskDir + previous.id);
	console.log("now : " + diskDir + now);

	const i1 = pkg.imread(diskDir + previous.id);
	const i2 = pkg.imread(diskDir + now);

	const structureSimilarity = getStructureSimilarity(i1, i2);
	console.log(previous.id + ' VS ' + now);

	if (structureSimilarity > 0.9) { // 두 개의 사진이 같음 
		console.log("same");

	} else { // 두 개의 사진이 다름 
		console.log("different");
		await previous.save()
			.then((previous) => {
				console.log("Image " + previous.id + " saved");
				temp = now.split('_')[1].split(".")[0];
			})
			.catch((err) => {
				console.log(err);
			});

	}
	fs.unlink(diskDir + previous.id, function (err) {
		if (err) throw err;
		console.log('previous file deleted!!');
	})
	return temp; // 1 1 1 4 4 
}