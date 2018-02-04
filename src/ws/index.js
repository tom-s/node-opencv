import io from 'socket.io'
import cv from 'opencv4nodejs'
import fs from 'async-file'

const FILE_PATH = `${__dirname}/canvas.jpg`
const GAUSSIAN_SIZE = new cv.Size(3, 3)
const KERNEL_SIZE = new cv.Size(7, 7)
const CONTOUR_COLOR = new cv.Vec(0, 255, 0)

const initializeSocket = server => {
  const ws = io(server)

  // WS
	ws.on('connection', client => {
    console.log('Client connected...');
    client.on('img', async(data) => {
      // Write file on disk
      const fileData = data.split(';base64,').pop()
      await fs.writeFile(FILE_PATH, fileData, {encoding: 'base64'})
      const img = await cv.imreadAsync(FILE_PATH)
      let gray = await img.bgrToGray()
      gray = await gray.gaussianBlurAsync(GAUSSIAN_SIZE, 0)
      const edged = await gray.cannyAsync(10, 250)
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, KERNEL_SIZE)
      const closed = await edged.morphologyExAsync(kernel, cv.MORPH_CLOSE)
      const contours = await closed.findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

      const result = contours.reduce((memo, contour) => {
        const peri = contour.arcLength(true)
        const approx = contour.approxPolyDP(0.02 * peri, true)
        return approx.length === 4
          ? {
            total: memo.total + 1,
            contours: [...memo.contours, approx]
          } : memo
      }, {total: 0, contours: []})
      client.emit('contours', result)
    })
  })
}

export default initializeSocket
