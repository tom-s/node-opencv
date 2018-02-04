import cv from 'opencv4nodejs'
import fs from 'async-file'

const DEBUG_FILE_PATH = `${__dirname}/rectangle.jpg`

const detect = async(img) => {
  let gray = await img.cvtColorAsync(cv.COLOR_BGR2GRAY )
  gray = await gray.medianBlurAsync(5)
  const edged = await gray.cannyAsync(75, 200)
  const contours = await edged.findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  // Write result image
  await cv.imwriteAsync(DEBUG_FILE_PATH, edged)

  // Find rectangles
  const result = contours.reduce((memo, contour) => {
    const peri = contour.arcLength(true)
    const approx = contour.approxPolyDP(0.01 * peri, true)
    return approx.length === 4
      ? {
        total: memo.total + 1,
        contours: [...memo.contours, approx]
      } : memo
  }, {total: 0, contours: []})

  return result
}



export default detect