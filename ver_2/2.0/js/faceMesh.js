const video2 = document.getElementsByClassName("input_video2")[0];
const out2 = document.getElementsByClassName("output2")[0];
const canvasCtx = out2.getContext("2d");

/* =========================
   LIP LANDMARK INDICES
   ========================= */
// เรียงซ้าย → ขวา
const UPPER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const LOWER_LIP = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

/* =========================
   UTILS
   ========================= */
function splitInto3(points) {
  const n = points.length;

  const leftEnd   = Math.round(n * 3 / 8);
  const midEnd    = Math.round(n * 5 / 8);

  return [
    points.slice(0, leftEnd),        // ซ้าย 3 ส่วน
    points.slice(leftEnd, midEnd),   // กลาง 2 ส่วน
    points.slice(midEnd)             // ขวา 3 ส่วน
  ];
}

function drawLine(points, color) {
  for (let i = 0; i < points.length - 1; i++) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(points[i].x * out2.width, points[i].y * out2.height);
    canvasCtx.lineTo(
      points[i + 1].x * out2.width,
      points[i + 1].y * out2.height
    );
    canvasCtx.strokeStyle = color;
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
  }
}

/* =========================
   MEDIAPIPE CALLBACK
   ========================= */
function onResultsFaceMesh(results) {
  canvasCtx.clearRect(0, 0, out2.width, out2.height);
  canvasCtx.drawImage(results.image, 0, 0, out2.width, out2.height);

  if (!results.multiFaceLandmarks) return;

  for (const landmarks of results.multiFaceLandmarks) {
    // ดึง landmark ปาก
    const upper = UPPER_LIP.map((i) => landmarks[i]);
    const lower = LOWER_LIP.map((i) => landmarks[i]);

    // แบ่ง 3 ช่อง
    const upper3 = splitInto3(upper);
    const lower3 = splitInto3(lower);

    // สี: ซ้าย / กลาง / ขวา
    const upperColors = ["red", "orange", "yellow"]; // ปากบน
    const lowerColors = ["lime", "cyan", "blue"]; // ปากล่าง

    // วาดปากบน
    // วาดปากบน (3 สี)
    upper3.forEach((part, i) => {
      drawLine(part, upperColors[i]);
    });

    // วาดปากล่าง (3 สี)
    lower3.forEach((part, i) => {
      drawLine(part, lowerColors[i]);
    });
  }
}

/* =========================
   FACEMESH SETUP
   ========================= */
const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults(onResultsFaceMesh);

/* =========================
   CAMERA
   ========================= */
const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({ image: video2 });
  },
  width: 480,
  height: 480,
});

camera.start();
