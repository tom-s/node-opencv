import io from 'socket.io-client'

// Polyfill
window.navigator.getMedia = (window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia)

// Variables
let socket, canvas, ctx, video, ticks = 0

// Constants
const BACK_URL = 'http://localhost:8080'
const JPG_QUALITY = 0.6
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480
const FRAMES_X = 10 // calculate every x frames
const CONSTRAINTS = {
  audio: false,
  video: true,
  advanced: [{
    facingMode: "environment"
  }]
}

const sortContours = (a, b) => {
  if (a.y == b.y) return a.x - b.x
  return a.y - b.y
}

// Init
window.addEventListener('load', () => {
  // Connect Web Socket
  socket = io.connect(BACK_URL)
  socket.on('connect', data => {
    console.log("Web Socket connected")

    // Start stream
    window.navigator.mediaDevices
      .getUserMedia(CONSTRAINTS)
      .then(handleSuccess)
      .catch(handleError)
  })

  socket.on('rectangle_detection', ({ total, contours: rectangles }) => {
    rectangles.forEach(rectangle => {
      rectangle.forEach(contour => {
        rectangle.forEach(contour2 => {
          ctx.beginPath()
          ctx.moveTo(contour.x,contour.y)
          ctx.lineTo(contour2.x,contour2.y)
          ctx.lineWidth = 3
          ctx.strokeStyle = '#ff0000'
          ctx.stroke()
        })
      })
    })
  })
})

const tick = () => {
  ticks++
  window.requestAnimationFrame(tick)
  if (ticks % FRAMES_X !== 0) return
  console.log("tick")

 	// Draw video to canvas
  ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Emit image
  const dataUrl = canvas.toDataURL('image/jpeg', JPG_QUALITY)
  socket.emit('img', dataUrl);
}


const handleSuccess = (stream) => {
  video = document.getElementById('video')
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  video.srcObject = stream
  window.requestAnimationFrame(tick)
}


const handleError = (error) => {
  console.log('navigator.getUserMedia error: ', error);
}
