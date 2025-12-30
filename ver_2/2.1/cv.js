
const video = document.getElementById("video");
const c1 = document.getElementById("normal");
const c2 = document.getElementById("edges");
const ctx1 = c1.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => video.srcObject = stream);

function startOpenCV() {
  function loop() {
    if (video.readyState === 4) {
      c1.width = c2.width = video.videoWidth;
      c1.height = c2.height = video.videoHeight;

      ctx1.drawImage(video, 0, 0);

      let src = cv.imread(c1);
      let gray = new cv.Mat();
      let edge = new cv.Mat();

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.Canny(gray, edge, 100, 200);
      cv.imshow("edges", edge);

      src.delete(); gray.delete(); edge.delete();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

cv.onRuntimeInitialized = startOpenCV;
