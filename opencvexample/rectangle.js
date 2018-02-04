/* Inspired from
https://pythontips.com/2015/03/11/a-guide-to-finding-books-in-images-using-python-and-opencv/
*/

import cv from 'opencv4nodejs'

const GAUSSIAN_SIZE = new cv.Size(3, 3)
const KERNEL_SIZE = new cv.Size(7, 7)
const CONTOUR_COLOR = new cv.Vec(0, 255, 0)
const KERNEL = cv.getStructuringElement(cv.MORPH_RECT, KERNEL_SIZE)
const BG_SUB = new cv.BackgroundSubtractorKNN()

const rectangleHandler = async (req, res) => {
  console.time('start')
  const img = await cv.imreadAsync(`${__dirname}/example.jpg`)
  let gray = await img.cvtColor(cv.COLOR_BGR2GRAY )
  gray = await gray.gaussianBlurAsync(GAUSSIAN_SIZE, 0)
  const edged = await gray.cannyAsync(10, 250)
  const closed = await edged.morphologyExAsync(KERNEL, cv.MORPH_CLOSE)
  const contours = await closed.copy().findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  const result = contours.reduce((memo, contour) => {
    const peri = contour.arcLength(true)
    const approx = contour.approxPolyDP(0.02 * peri, true)
    return approx.length === 4
      ? {
        total: memo.total + 1,
        contours: [...memo.contours, approx]
      } : memo
  }, {total: 0, contours: []})

  // Write result image
  await cv.imwriteAsync(`${__dirname}/result.jpg`, gray)
  console.timeEnd('start')
  res.send(result)
}

export default rectangleHandler
