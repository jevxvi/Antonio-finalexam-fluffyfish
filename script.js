const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const offlineScreen = document.getElementById('offline');
const bgMusic = document.getElementById('bgMusic');
const flapSound = document.getElementById('flapSound');
const hitSound = document.getElementById('hitSound');

// Load background and fish images
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Placeholder underwater background
const fishImage = new Image();
fishImage.src = 'fish.png'; // Placeholder clownfish image

let fish = {
    x: 100,
    y: 300,
    width: 60, // Increase fish width
    height: 45, // Increase fish height
    velocity: 0,
    gravity: 0.5,
    jump: -10
};
let pipes = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
let pipeSpawnTimer = 0;

function drawBackground() {
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
}

function drawFish() {
    if (fishImage.complete) {
        ctx.drawImage(fishImage, fish.x - fish.width / 2, fish.y - fish.height / 2, fish.width, fish.height);
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#228b22';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
}

function updateFish() {
    fish.velocity += fish.gravity;
    fish.y += fish.velocity;
    if (fish.y + fish.height / 2 > canvas.height || fish.y - fish.height / 2 < 0) {
        endGame();
    }
}

function spawnPipe() {
    const minHeight = 100;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + pipeGap
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + pipeWidth < fish.x && !pipe.scored) {
            score++;
            pipe.scored = true;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        if (pipe.x < fish.x + fish.width / 2 &&
            pipe.x + pipeWidth > fish.x - fish.width / 2 &&
            (fish.y - fish.height / 2 < pipe.top || fish.y + fish.height / 2 > pipe.bottom)) {
            endGame();
        }
    });
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    pipeSpawnTimer++;
    if (pipeSpawnTimer > 90) {
        spawnPipe();
        pipeSpawnTimer = 0;
    }
}

function endGame() {
    gameOver = true;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = score;
    bgMusic.pause();
    hitSound.play();
}

function startGame() {
    startScreen.style.display = 'none';
    gameStarted = true;
    bgMusic.play().catch(() => console.log('Audio play failed'));
    spawnPipe();
    gameLoop();
}

function restartGame() {
    fish.y = 300;
    fish.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    pipeSpawnTimer = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => console.log('Audio play failed'));
    startScreen.style.display = 'block';
}

function checkOnlineStatus() {
    if (!navigator.onLine) {
        gameOver = true;
        offlineScreen.style.display = 'block';
        bgMusic.pause();
    } else {
        offlineScreen.style.display = 'none';
    }
}

function gameLoop() {
    if (gameOver || !gameStarted) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawFish();
    drawPipes();
    updateFish();
    updatePipes();
    checkOnlineStatus();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', () => {
    if (!gameOver && gameStarted) {
        fish.velocity = fish.jump;
        flapSound.play();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver && gameStarted) {
        fish.velocity = fish.jump;
        flapSound.play();
    }
});

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);

startScreen.style.display = 'block';