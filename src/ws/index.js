import io from 'socket.io'
import cv from 'opencv4nodejs'
import fs from 'async-file'
import detectRectangles from './rectangle'
import detectFeatures from './feature'
import detectTensor from './tensor'

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

      // Perform different detections types
      const rectangleDetection = await detectRectangles(img)
      client.emit('rectangle_detection', rectangleDetection)

      const featureDetection = await detectFeatures(img)
      client.emit('feature_detection', featureDetection)

      /*
      const tensorDetection = await detectTensor(img)



      client.emit('tensor_detection', tensorDetection)
      */
    })
  })
}

export default initializeSocket
