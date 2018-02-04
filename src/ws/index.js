import io from 'socket.io'
import cv from 'opencv4nodejs'
import fs from 'async-file'
import detectRectangles from './rectangleDetection'

const FILE_PATH = `${__dirname}/canvas.jpg`


const initializeSocket = server => {
  const ws = io(server)

  // WS
	ws.on('connection', client => {
    console.log('Client connected...');
    client.on('img', async(data) => {
      // Write file on disk
      const fileData = data.split(';base64,').pop()
      await fs.writeFile(FILE_PATH, fileData, {encoding: 'base64'})

      // Read with openCV
      const img = await cv.imreadAsync(FILE_PATH)

      // Perform different detections
      const rectangleDetection = await detectRectangles(img)
      const featureDetection = await detectRectangles(img)

      client.emit('rectangle_detection', rectangleDetection)
      client.emit('feature_detection', featureDetection)
    })
  })
}

export default initializeSocket
