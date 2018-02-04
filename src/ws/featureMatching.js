import cv from 'opencv4nodejs'
import fs from 'async-file'

const DEBUG_FILE_PATH = `${__dirname}/feature.jpg`
const TARGET_FILE_PATH = `${__dirname}/target1.jpg`

// Make target grey
let targetMat = cv.imread(TARGET_FILE_PATH)
targetMat = targetMat.copy().cvtColor(cv.COLOR_BGR2GRAY)

const matchFeatures = ({ img1, img2, detector, matchFunc }) => {
  // detect keypoints
  const keyPoints1 = detector.detect(img1)
  const keyPoints2 = detector.detect(img2)

  // compute feature descriptors
  const descriptors1 = detector.compute(img1, keyPoints1)
  const descriptors2 = detector.compute(img2, keyPoints2)

  // match the feature descriptors
  const matches = matchFunc(descriptors1, descriptors2)

  // only keep good matches
  const bestN = 40
  const bestMatches = matches.sort(
    (match1, match2) => match1.distance - match2.distance
  ).slice(0, bestN)

  return cv.drawMatches(
    img1,
    img2,
    keyPoints1,
    keyPoints2,
    bestMatches
  )

  /*
  return {
    keyPoints1,
    keyPoints2,
    bestMatches
  }*/
};

const detect = async(img) => {
  // COpy and make it grey
  img = img.copy()
  img = await img.cvtColorAsync(cv.COLOR_BGR2GRAY)

  // Load result
  // Match template (the brightest locations indicate the highest match)
  const orbMatchesImg = matchFeatures({
    img1: img,
    img2: targetMat,
    detector: new cv.ORBDetector(),
    matchFunc: cv.matchBruteForceHamming
  })

  // Write result image
  await cv.imwriteAsync(DEBUG_FILE_PATH, orbMatchesImg)

  return orbMatchesImg
}



export default detect