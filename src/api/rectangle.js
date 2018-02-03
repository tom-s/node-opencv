import cv from 'opencv4nodejs'

const GAUSSIAN_SIZE = new cv.Size(3, 3)

const rectangleHandler = async (req, res) => {
  const img = await cv.imreadAsync(`${__dirname}/example.jpg`)
  let gray = await img.cvtColorAsync (cv.COLOR_BGR2HLS)
  gray = await gray.gaussianBlurAsync(GAUSSIAN_SIZE, 0)
  const edged = await gray.cannyAsync(10, 250)

  res.send({
    edged
  })
}

export default rectangleHandler

/*
https://pythontips.com/2015/03/11/a-guide-to-finding-books-in-images-using-python-and-opencv/
# load the image, convert it to grayscale, and blur it
image = cv2.imread("example.jpg")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
gray = cv2.GaussianBlur(gray, (3, 3), 0)
cv2.imshow("Gray", gray)
cv2.waitKey(0)

# detect edges in the image
edged = cv2.Canny(gray, 10, 250)
cv2.imshow("Edged", edged)
cv2.waitKey(0)

# construct and apply a closing kernel to 'close' gaps between 'white'
# pixels
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel)
cv2.imshow("Closed", closed)
cv2.waitKey(0)

# find contours (i.e. the 'outlines') in the image and initialize the
# total number of books found
(cnts, _) = cv2.findContours(closed.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
total = 0

# loop over the contours
for c in cnts:
# approximate the contour
peri = cv2.arcLength(c, True)
approx = cv2.approxPolyDP(c, 0.02 * peri, True)

# if the approximated contour has four points, then assume that the
# contour is a book -- a book is a rectangle and thus has four vertices
if len(approx) == 4:
cv2.drawContours(image, [approx], -1, (0, 255, 0), 4)
total += 1

# display the output
print "I found {0} books in that image".format(total)
cv2.imshow("Output", image)
cv2.waitKey(0)
*/