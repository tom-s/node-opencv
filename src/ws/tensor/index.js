import cv from 'opencv4nodejs'
import fs from 'fs'

if (!cv.xmodules.dnn) {
  throw new Error('exiting: opencv4nodejs compiled without dnn module')
}

const MODEL_FILE = `${__dirname}/data/tensorflow_inception_graph.pb`
const CLASSNAMES_FILES = `${__dirname}/data/imagenet_comp_graph_label_strings.txt`

if (!fs.existsSync(MODEL_FILE) || !fs.existsSync(CLASSNAMES_FILES)) {
  console.log('could not find inception model')
  console.log('download the model from: https://storage.googleapis.com/download.tensorflow.org/models/inception5h.zip')
  throw new Error('exiting')
}

// read classNames and store them in an array
const classNames = fs.readFileSync(CLASSNAMES_FILES).toString().split('\n')

// initialize tensorflow inception model from modelFile
const net = cv.readNetFromTensorflow(MODEL_FILE)

const classifyImg = (img) => {
  // inception model works with 224 x 224 images, so we resize
  // our input images and pad the image with white pixels to
  // make the images have the same width and height
  const maxImgDim = 224
  const white = new cv.Vec(255, 255, 255)
  const imgResized = img.resizeToMax(maxImgDim).padToSquare(white)

  // network accepts blobs as input
  const inputBlob = cv.blobFromImage(imgResized)
  net.setInput(inputBlob)

  // forward pass input through entire network, will return
  // classification result as 1xN Mat with confidences of each class
  const outputBlob = net.forward()

  // find all labels with a minimum confidence
  const minConfidence = 0.05
  const locations =
    outputBlob
      .threshold(minConfidence, 1, cv.THRESH_BINARY)
      .convertTo(cv.CV_8U)
      .findNonZero()

  const result =
    locations.map(pt => ({
      confidence: parseInt(outputBlob.at(0, pt.x) * 100) / 100,
      className: classNames[pt.x]
    }))
      // sort result by confidence
      .sort((r0, r1) => r1.confidence - r0.confidence)
      .map(res => `${res.className} (${res.confidence})`)

  return result
}

const detect = async(img) => {
  const predictions = classifyImg(img)
  console.log("predictions", predictions)
  predictions.forEach(p => console.log(p))

  const alpha = 0.4
  cv.drawTextBox(
    img,
    { x: 0, y: 0 },
    predictions.map(p => ({ text: p, fontSize: 0.5, thickness: 1 })),
    alpha
  )
  cv.imshowWait('img', img)
}

export default detect
