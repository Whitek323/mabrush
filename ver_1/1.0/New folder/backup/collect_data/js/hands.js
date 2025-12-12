window.lastLandmarks = null

class CSVRecorder {
  constructor() {
    this.isRecording = false;
    this.data = [];
    this.timer = null;
    this.headerGenerated = false;
    this.elapsed = 0;

    this.mediaRecorder = null;
    this.recordedBlobs = [];
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.data = [];
      this.headerGenerated = false;
      this.elapsed = 0;
      document.getElementById("collectBtn").textContent = "Stop Collecting";
       this.startVideoRecording(); 
      this.startTimer(() => {
      if (window.lastLandmarks) {
        this.collectLandmarks(window.lastLandmarks);
      }
    });
    } else {
      this._stopRecording();
    }
  }

  _stopRecording() {
    clearInterval(this.timer);
    this.isRecording = false;

    const timerDisplay = document.getElementById("timerDisplay");
if (timerDisplay) {
  timerDisplay.textContent = "Time: 0.00 s";
}

    this.exportCSV();
    this.stopVideoRecording();
    document.getElementById("collectBtn").textContent = "Collect Data";
  }
  startVideoRecording() {
    const canvas = document.querySelector(".output3");
    const stream = canvas.captureStream(30); // 30 FPS
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedBlobs, { type: 'video/webm' });
      const url = window.URL.createObjectURL(blob);

      const filenameInput = document.getElementById("filenameInput");
      let filename = filenameInput?.value?.trim() || "hand_landmarks";
      filename = filename.replace(/[<>:"/\\|?*]+/g, "_");

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.recordedBlobs = [];
    };

    this.mediaRecorder.start();
  }

  stopVideoRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }
  startTimer(callback) {
    this.timer = setInterval(() => {
      if (!this.isRecording) return;

        if (timerDisplay) {
        timerDisplay.textContent = `Time: ${this.elapsed.toFixed(2)} s`;
      }
      callback();
      this.elapsed += 0.25;

      if (this.elapsed > 10.00) {
        this._stopRecording();
      }
    }, 250);
  }

  collectLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return;

    if (!this.headerGenerated) {
      const headers = ['timestamp'];
      landmarks.forEach((_, i) => {
        headers.push(`x${i}`, `y${i}`, `z${i}`);
      });
      this.data.push(headers.join(','));
      this.headerGenerated = true;
    }

    const timestamp = this.elapsed.toFixed(2);
    const row = [timestamp];
    landmarks.forEach(lm => {
      row.push(lm.x.toFixed(6), lm.y.toFixed(6), lm.z.toFixed(6));
    });
    this.data.push(row.join(','));
  }

  exportCSV() {
  if (this.data.length === 0) return;

  const filenameInput = document.getElementById("filenameInput");
  let filename = filenameInput?.value?.trim() || "hand_landmarks";

  // sanitize filename (remove invalid characters)
  filename = filename.replace(/[<>:"/\\|?*]+/g, "_");

  const csvContent = "data:text/csv;charset=utf-8," + this.data.join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}

const recorder = new CSVRecorder();
const collectBtn = document.getElementById("collectBtn");
collectBtn.addEventListener("click", () => {
  recorder.toggleRecording();
});
// recorder.startTimer(() => {
//   if (lastLandmarks) {
//     recorder.collectLandmarks(lastLandmarks);
//   }
// });

const video3 = document.getElementsByClassName('input_video3')[0];
const out3 = document.getElementsByClassName('output3')[0];
const controlsElement3 = document.getElementsByClassName('control3')[0];
const canvasCtx3 = out3.getContext('2d');
const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

window.lastLandmarks = null;
function onResultsHands(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx3.save();
  canvasCtx3.clearRect(0, 0, out3.width, out3.height);
  canvasCtx3.drawImage(results.image, 0, 0, out3.width, out3.height);

  if (results.multiHandLandmarks && results.multiHandedness) {
    // เก็บเฉพาะมือแรกเท่านั้น สำหรับ LSTM
    const index = 0;
    const classification = results.multiHandedness[index];
    const isRightHand = classification.label === 'Right';
    const landmarks = results.multiHandLandmarks[index];
    window.lastLandmarks = landmarks;

    drawConnectors(canvasCtx3, landmarks, HAND_CONNECTIONS, {
      color: isRightHand ? '#00FF00' : '#FF0000'
    });
    drawLandmarks(canvasCtx3, landmarks, {
      color: isRightHand ? '#00FF00' : '#FF0000',
      fillColor: isRightHand ? '#FF0000' : '#00FF00',
      radius: (x) => lerp(x.from.z, -0.15, 0.1, 10, 1)
    });
  }

  canvasCtx3.restore();
}



const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});
hands.onResults(onResultsHands);

const camera = new Camera(video3, {
  onFrame: async () => {
    await hands.send({image: video3});
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElement3, {
      selfieMode: true,
      maxNumHands: 2,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: 'MediaPipe Hands'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider(
          {title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video3.classList.toggle('selfie', options.selfieMode);
      hands.setOptions(options);
    });