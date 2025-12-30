/* ===============================
   GLOBAL
================================ */
window.lastLandmarks = null;

/* ===============================
   CAMERA (shared)
================================ */
const video = document.getElementById("video");
const video3 = document.getElementsByClassName("input_video3")[0];

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video3.srcObject = stream;
});

/* ===============================
   OPENCV (Normal + Edges)
================================ */
const normal = document.getElementById("normal");
const edges = document.getElementById("edges");
const ctxNormal = normal.getContext("2d");

function processCV() {
  if (video.readyState === 4) {
    normal.width = edges.width = video.videoWidth;
    normal.height = edges.height = video.videoHeight;

    ctxNormal.drawImage(video, 0, 0);

    let src = cv.imread(normal);
    let gray = new cv.Mat();
    let edge = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edge, 100, 200);

    cv.imshow("edges", edge);

    src.delete();
    gray.delete();
    edge.delete();
  }
  requestAnimationFrame(processCV);
}

cv.onRuntimeInitialized = processCV;

/* ===============================
   CSV + VIDEO RECORDER
================================ */
class CSVRecorder {
  constructor() {
    this.isRecording = false;
    this.data = [];
    this.timer = null;
    this.elapsed = 0;
    this.headerGenerated = false;
    this.mediaRecorder = null;
    this.recordedBlobs = [];
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      this.data = [];
      this.elapsed = 0;
      this.headerGenerated = false;
      document.getElementById("collectBtn").textContent = "Stop Collecting";
      this.startVideoRecording();
      this.startTimer();
    } else {
      this.stopAll();
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (!this.isRecording) return;

      if (window.lastLandmarks) {
        this.collectLandmarks(window.lastLandmarks);
      }

      this.elapsed += 0.25;
      if (this.elapsed >= 15) this.stopAll();
    }, 250);
  }

  stopAll() {
    clearInterval(this.timer);
    this.isRecording = false;
    this.exportCSV();
    this.stopVideoRecording();
    document.getElementById("collectBtn").textContent = "Collect Data";
  }

  collectLandmarks(landmarks) {
    if (!this.headerGenerated) {
      const header = ["time"];
      landmarks.forEach((_, i) => header.push(`x${i}`, `y${i}`));
      this.data.push(header.join(","));
      this.headerGenerated = true;
    }

    const row = [this.elapsed.toFixed(2)];
    landmarks.forEach(lm => {
      row.push(lm.x.toFixed(6), lm.y.toFixed(6));
    });
    this.data.push(row.join(","));
  }

  exportCSV() {
    if (!this.data.length) return;
    const blob = new Blob([this.data.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hand_landmarks.csv";
    a.click();
  }

  startVideoRecording() {
    const canvas = document.querySelector(".output3");
    const stream = canvas.captureStream(30);
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = e => this.recordedBlobs.push(e.data);
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedBlobs, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mediapipe_hand.webm";
      a.click();
      this.recordedBlobs = [];
    };
    this.mediaRecorder.start();
  }

  stopVideoRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }
}

const recorder = new CSVRecorder();
document.getElementById("collectBtn").onclick = () => recorder.toggleRecording();

/* ===============================
   MEDIAPIPE HANDS (Canvas 3)
================================ */
const out3 = document.getElementsByClassName("output3")[0];
const ctx3 = out3.getContext("2d");

function onResultsHands(results) {
  out3.width = results.image.width;
  out3.height = results.image.height;

  ctx3.save();
  ctx3.clearRect(0, 0, out3.width, out3.height);
  ctx3.drawImage(results.image, 0, 0, out3.width, out3.height);

  if (results.multiHandLandmarks) {
    const landmarks = results.multiHandLandmarks[0];
    window.lastLandmarks = landmarks;

    drawConnectors(ctx3, landmarks, HAND_CONNECTIONS, { color: "#00FF00" });
    drawLandmarks(ctx3, landmarks, { color: "#FF0000", radius: 3 });
  }

  ctx3.restore();
}

const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${f}`
});

hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResultsHands);

const camera = new Camera(video3, {
  onFrame: async () => await hands.send({ image: video3 }),
  width: 480,
  height: 480
});

camera.start();
