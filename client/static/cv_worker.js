self.importScripts('./opencv.js');
let loading = true;
let load_start = Date.now();

cv.then(openCV => {
  console.log(`Worker loaded :) in ${(Date.now() - load_start) / 1000}s`);
  cv = openCV;
  loading = false;
});

function getAPage(src) {
  // src.size().width
  // Create Mask stuff
  let dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
  let ksize = new cv.Size(5, 5);
  cv.GaussianBlur(dst, dst, ksize, 1);
  cv.Canny(dst, dst, 100, 200);
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

  M.delete();

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  hierarchy.delete();
  dst.delete();

  let cnts = []
  for (let i = 0; i < contours.size(); i++) {
    const tmp = contours.get(i);
    const peri = cv.arcLength(tmp, true);
    let approx = new cv.Mat();
    let result = {
      area: cv.contourArea(tmp),
      points: [],
      cnt: tmp
    };

    cv.approxPolyDP(tmp, approx, 0.02 * peri, true);
    const pointsData = approx.data32S;
    for (let j = 0; j < pointsData.length / 2; j++)
      result.points.push({
        x: pointsData[2 * j],
        y: pointsData[2 * j + 1]
      });

    approx.delete();

    if (result.points.length === 4) cnts.push(result);
  }

  contours.delete();

  if (cnts.length == 0) return false;
  cnts.sort((a, b) => b.area - a.area);
  let points = cnts[0].points;

  let rect = cv.minAreaRect(cnts[0].cnt);
  let boundingRect = cv.RotatedRect.boundingRect(rect);
  let target_width = Math.min(1000, boundingRect.width);
  let target_height = (boundingRect.width < boundingRect.height) ? target_width * (297 / 210) : target_width * (210 / 297);

  points = organize(points);

  const from = cv.matFromArray(4, 1, cv.CV_32FC2, [points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y]);
  const to = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, target_width, 0, 0, target_height, target_width, target_height]);
  const persTransform = cv.getPerspectiveTransform(from, to);

  let out = new cv.Mat();
  let size = new cv.Size();
  size.width = target_width;
  size.height = target_height;
  cv.warpPerspective(src, out, persTransform, size);

  return out;
}

function organize(points) {
  let res = [];
  left = points.sort((a, b) => a.x - b.x).splice(0, 2);
  right = points.sort((a, b) => a.y - b.y);

  left = left.sort((a, b) => a.y - b.y);

  return [left[0], right[0], left[1], right[1]];

}

function crop(src) {

  // cv.convertScaleAbs(src, src, 1.95, 0);

  let mask = new cv.Mat();
  let ksize = new cv.Size(5, 5);
  cv.cvtColor(src, mask, cv.COLOR_RGB2GRAY);
  cv.GaussianBlur(mask, mask, ksize, 1);
  cv.threshold(mask, mask, 200, 240, cv.THRESH_BINARY_INV);

  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.erode(mask, mask, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.dilate(mask, mask, M, anchor, 10, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  mask.delete();

  let poly = new cv.MatVector();
  for (let i = 0; i < contours.size(); i++) {
    let tmp = new cv.Mat();
    let cnt = contours.get(i);
    cv.approxPolyDP(cnt, tmp, 10, true);
    poly.push_back(tmp);
    cnt.delete();
    tmp.delete();
  }

  let contourMask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  for (let i = 0; i < poly.size(); ++i) {
    let cnt = poly.get(i);
    if (isOnBorder(cnt, src, 10)) continue;
    cv.drawContours(contourMask, poly, i, new cv.Scalar(255, 255, 255), cv.FILLED, 8, hierarchy, 1);
  }
  cv.cvtColor(contourMask, contourMask, cv.COLOR_RGB2GRAY);

  let transparent = new cv.Mat.zeros(src.rows, src.cols, src.type());
  let dst = new cv.Mat();
  cv.subtract(src, transparent, dst, contourMask, -1);

  contourMask.delete();
  transparent.delete();
  hierarchy.delete();

  return dst;
}

function isOnBorder(cnt, src, margin) {
  let {
    height,
    width
  } = src.size();
  for (let j = 0; j < cnt.data32S.length; j += 2) {
    let x = cnt.data32S[j],
      y = cnt.data32S[j + 1];
    if (y > height - margin || y < margin || x > width - margin || x < margin) return true;
  }
  return false;
}

let tricks = {
  "getAPage": getAPage,
  "crop": crop
}

/**
 * This function converts again from cv.Mat to ImageData
 */
function imageDataFromMat(mat) {
  // converts the mat type to cv.CV_8U
  const img = new cv.Mat()
  const depth = mat.type() % 8
  const scale =
    depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0
  const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0
  mat.convertTo(img, cv.CV_8U, scale, shift)

  // converts the img type to cv.CV_8UC4
  switch (img.type()) {
    case cv.CV_8UC1:
      cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA)
      break
    case cv.CV_8UC3:
      cv.cvtColor(img, img, cv.COLOR_RGB2RGBA)
      break
    case cv.CV_8UC4:
      break
    default:
      throw new Error(
        'Bad number of channels (Source image must have 1, 3 or 4 channels)'
      )
  }
  const clampedArray = new ImageData(
    new Uint8ClampedArray(img.data),
    img.cols,
    img.rows
  )
  img.delete()
  return clampedArray
}

onmessage = async function(e) {
  if (loading) await cv;
  let src = cv.matFromImageData(e.data.param.imageData);
  let {
    task
  } = e.data;
  for (let i = 0; i < task.length; i++) {
    let pass = tricks[task[i]](src);
    if (pass == false) break;
    src = pass;
  }
  postMessage(imageDataFromMat(src));
  src.delete();
}
