import cv from 'opencv4nodejs'
import fs from 'async-file'

const DEBUG_FILE_PATH = `${__dirname}/rectangle.jpg`

const detect = async(img) => {
  img = img.copy()

  let gray = await img.cvtColorAsync(cv.COLOR_BGR2GRAY )
  gray = await gray.medianBlurAsync(5)
  let canny = await gray.cannyAsync(75, 200)
  const contours = await canny.findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  // Write result image
  await cv.imwriteAsync(DEBUG_FILE_PATH, canny)

  // Find rectangles
  const result = contours.reduce((memo, contour) => {
    const peri = contour.arcLength(true)
    const approx = contour.approxPolyDP(0.01 * peri, true)
    const rect = contour.boundingRect()
    const isPlausibleTarget = rect.width > 50 && rect.height > 50
    return isPlausibleTarget && approx.length >= 4 && approx.length <= 6
      ? {
        total: memo.total + 1,
        contours: [...memo.contours, approx]
      } : memo
  }, {total: 0, contours: []})

  return result
}


export default detect