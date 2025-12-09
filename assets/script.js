const shieldLayers = [
    document.getElementById("shield1"),
    document.getElementById("shield2"),
    document.getElementById("shield3"),
]; // shield3 = outermost
const upperTooth = document.getElementById("upper_tooth");
const hud = document.getElementById("hud");
const lowerhud = document.getElementById("lowerhud");
const stackInput = document.getElementById("stackInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const endScreen = document.getElementById("endScreen");
const endText = document.getElementById("endText");
const game = document.getElementById("game");

let gameInterval, bacteriaInterval;
let totalTime = 0;
let brushingTime = 0;
let score = 0;
let stack = 0;
let paused = false;
let running = false;

const maxTime = 120;
const phaseDuration = 20; // 6 phases
const totalPhases = 6;

function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function updateShieldDisplay() {
    for (let i = 0; i < 3; i++) {
        shieldLayers[i].style.display = (stack > i) ? 'block' : 'none';
    }
}

function getCurrentPhase() {
    return Math.min(Math.floor(brushingTime / phaseDuration), totalPhases - 1);
}

function updatePhaseAssets() {
    const phase = getCurrentPhase();
    upperTooth.src = `tooth/${phase + 1}.png`;
}

function updateHUD() {
    hud.innerText = `เวลารวม: ${formatTime(totalTime)}s`;
    lowerhud.innerText = `เวลาแปรงฟัน: ${brushingTime}s | คะแนน: ${score} | Stack: ${stack}`;
    document.querySelector("#controls label").innerText = `(Stack ปัจจุบัน: ${stack})`;
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(bacteriaInterval);
    endScreen.style.display = 'flex';
    let rating = "⭐".repeat(score >= 300 ? 3 : score >= 200 ? 2 : score >= 100 ? 1 : 0);
    endText.innerHTML = `
        🎉 Congratulations!<br/>
        คะแนนรวม: ${score}<br/>
        เวลารวม: ${formatTime(totalTime)}<br/>
        Rating: ${rating}
    `;
}

function restartGame() {
    totalTime = 0;
    brushingTime = 0;
    score = 0;
    stack = parseInt(stackInput.value || 0);
    paused = false;
    running = false;
    document.querySelectorAll(".bacteria").forEach(e => e.remove());
    pauseBtn.innerText = "Pause";
    endScreen.style.display = "none";
    updateShieldDisplay();
    updateHUD();
}

startBtn.onclick = () => {
    if (running) return;
    running = true;
    updateShieldDisplay();
    updateHUD();
    updatePhaseAssets();

    gameInterval = setInterval(() => {
        if (!paused) {
            totalTime++;
            brushingTime++;
            updateHUD();
            updatePhaseAssets();
            if (totalTime >= maxTime) endGame();
        }
    }, 1000);

    bacteriaInterval = setInterval(() => {
        if (!paused) spawnBacteria();
    }, 1500);
};

pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

stackInput.oninput = () => {
    const val = Math.max(0, Math.min(3, parseInt(stackInput.value || 0)));
    stack = val;
    stackInput.value = val;
    updateShieldDisplay();
    updateHUD();
};

function spawnBacteria() {
    const phase = getCurrentPhase();
    const b = document.createElement("img");

    const enemies = [`bacteria/${phase + 1}.png`];
    if (phase === 5) enemies.push("bacteria/boss6.png");

    b.src = enemies[Math.floor(Math.random() * enemies.length)];
    b.className = "bacteria";
    game.appendChild(b);

    const gameW = game.clientWidth;
    const gameH = game.clientHeight;
    let x, y;

    const side = Math.floor(Math.random() * 4);
    if (side === 0) { x = Math.random() * gameW; y = -50; }
    if (side === 1) { x = Math.random() * gameW; y = gameH + 50; }
    if (side === 2) { x = -50; y = Math.random() * gameH; }
    if (side === 3) { x = gameW + 50; y = Math.random() * gameH; }

    b.style.left = `${x}px`;
    b.style.top = `${y}px`;

    const targetX = gameW / 2 - 25;
    const targetY = gameH / 2 - 25;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 2.5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    const interval = setInterval(() => {
        if (paused) return;
        x += vx;
        y += vy;
        b.style.left = `${x}px`;
        b.style.top = `${y}px`;

        const bRect = b.getBoundingClientRect();
        const tRect = upperTooth.getBoundingClientRect();

        let hit = false;
        for (let i = 2; i >= 0; i--) {
            const s = shieldLayers[i];
            if (stack > i && isColliding(bRect, s.getBoundingClientRect())) {
                score += 100;
                stack--;
                stackInput.value = stack;
                updateShieldDisplay();
                updateHUD();
                hit = true;
                break;
            }
        }

        if (hit) {
            clearInterval(interval);
            b.remove();
        } else if (stack <= 0 && isColliding(bRect, tRect)) {
            score -= 100;
            updateHUD();
            clearInterval(interval);
            b.remove();
        }
    }, 20);
}

function isColliding(r1, r2) {
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}
