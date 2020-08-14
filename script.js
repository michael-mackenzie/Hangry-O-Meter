const video = document.getElementById('video')
const overlay = document.getElementById('overlay')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

navigator.getUserMedia = ( navgiatior.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  overlay.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections) // Draw the bounding boxes of all detected faces
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // Draw the facial landmarks
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // Draw the expressions value
    console.log(getFaceScore(detections));
    updatePizza(getFaceScore(detections));
  }, 100)
})

function updatePizza(score) {
  if (score > 0.75) {
    showPizza('pizza1')
    hidePizza('pizza2')
    hidePizza('pizza3')
    hidePizza('pizza4')
    hidePizza('pizza5')
  }
  else if (score > 0.25 & score < 0.75){
    showPizza('pizza1')
    showPizza('pizza2')
    hidePizza('pizza3')
    hidePizza('pizza4')
    hidePizza('pizza5')
  }
  else if (score < -0.75) {
    showPizza('pizza1')
    showPizza('pizza2')
    showPizza('pizza3')
    showPizza('pizza4')
    showPizza('pizza5')
  }
  else if (score > -0.75 & score < -0.25) {
    showPizza('pizza1')
    showPizza('pizza2')
    showPizza('pizza3')
    showPizza('pizza4')
    hidePizza('pizza5')
  }
  else {
    showPizza('pizza1')
    showPizza('pizza2')
    showPizza('pizza3')
    hidePizza('pizza4')
    hidePizza('pizza5')
  }
}

function hidePizza(pizzaName) {
  document.getElementById(pizzaName).style.visibility = 'hidden';
}

function showPizza(pizzaName) {
  document.getElementById(pizzaName).style.visibility = 'visible';
}

function getFaceScore(detections){
  return -detections[0].expressions.angry - detections[0].expressions.disgusted - detections[0].expressions.fearful - detections[0].expressions.sad + detections[0].expressions.happy + detections[0].expressions.surprised;
}
