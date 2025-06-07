class CSVRecorder {
  constructor() {
    this.isRecording = false;
    this.data = [];
    this.timer = null;
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.data = []; // Reset for new recording session
      document.getElementById("collectBtn").textContent = "Stop Collecting";
    } else {
      clearInterval(this.timer);
      this.exportCSV();
      document.getElementById("collectBtn").textContent = "Collect Data";
    }
  }

  startTimer(callback) {
    this.timer = setInterval(() => {
      if (this.isRecording) callback();
    }, 250);
  }

  collectLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return;
    const row = [];
    landmarks.forEach(lm => {
      row.push(lm.x.toFixed(6), lm.y.toFixed(6), lm.z.toFixed(6));
    });
    this.data.push(row.join(","));
  }

  exportCSV() {
    if (this.data.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + this.data.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "hand_landmarks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
