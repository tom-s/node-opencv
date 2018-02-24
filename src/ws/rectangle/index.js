import cv from 'opencv4nodejs'
import fs from 'async-file'

const DEBUG_FILE_PATH = `${__dirname}/rectangle.jpg`
const KERNEL_SIZE =  new cv.Size(7, 7)
const detect = async(img) => {
  img = img.copy()

  let gray = await img.cvtColorAsync(cv.COLOR_BGR2GRAY )
  gray = await gray.medianBlurAsync(5)
  let canny = await gray.cannyAsync(10, 250)
  let kernel = cv.getStructuringElement(cv.MORPH_RECT, KERNEL_SIZE)
  let closed = await canny.morphologyExAsync(kernel, cv.MORPH_CLOSE)
  const contours = await closed.findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  // Write result image
  await cv.imwriteAsync(DEBUG_FILE_PATH, closed)

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