const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayScore = document.getElementById('overlayScore');
const restartBtn = document.getElementById('restartBtn');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const MOVE_INTERVAL = 130;

const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

let snake = [];
let direction = DIRECTION.RIGHT;
let nextDirection = DIRECTION.RIGHT;
let apple = null;
let score = 0;
let bestScore = 0;
let gameOver = false;
let paused = false;
let lastMoveTime = 0;
let animationId = null;

function initSnake() {
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
}

function spawnApple() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    apple = pos;
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function moveSnake() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        score++;
        scoreDisplay.textContent = score;
        spawnApple();
    } else {
        snake.pop();
    }
}

function drawGrid() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const x = seg.x * CELL_SIZE;
        const y = seg.y * CELL_SIZE;
        const padding = 1;

        if (i === 0) {
            ctx.fillStyle = '#00e676';
            ctx.shadowColor = 'rgba(0, 230, 118, 0.5)';
            ctx.shadowBlur = 8;
        } else {
            const brightness = 1 - (i / snake.length) * 0.5;
            ctx.fillStyle = `rgba(0, ${Math.floor(200 * brightness)}, ${Math.floor(100 * brightness)}, 1)`;
            ctx.shadowBlur = 0;
        }

        const radius = 4;
        const size = CELL_SIZE - padding * 2;
        const rx = x + padding;
        const ry = y + padding;

        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + size - radius, ry);
        ctx.quadraticCurveTo(rx + size, ry, rx + size, ry + radius);
        ctx.lineTo(rx + size, ry + size - radius);
        ctx.quadraticCurveTo(rx + size, ry + size, rx + size - radius, ry + size);
        ctx.lineTo(rx + radius, ry + size);
        ctx.quadraticCurveTo(rx, ry + size, rx, ry + size - radius);
        ctx.lineTo(rx, ry + radius);
        ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    const head = snake[0];
    const hx = head.x * CELL_SIZE + CELL_SIZE / 2;
    const hy = head.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillStyle = '#1a1a2e';
    const eyeOffset = 4;
    const eyeSize = 3;

    if (direction === DIRECTION.RIGHT || direction === DIRECTION.LEFT) {
        const dx = direction === DIRECTION.RIGHT ? 3 : -3;
        ctx.beginPath();
        ctx.arc(hx + dx, hy - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx + dx, hy + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const dy = direction === DIRECTION.DOWN ? 3 : -3;
        ctx.beginPath();
        ctx.arc(hx - eyeOffset, hy + dy, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx + eyeOffset, hy + dy, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawApple() {
    if (!apple) return;

    const x = apple.x * CELL_SIZE + CELL_SIZE / 2;
    const y = apple.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 3;

    ctx.shadowColor = 'rgba(233, 69, 96, 0.6)';
    ctx.shadowBlur = 12;

    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(x + 2, y - radius + 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    drawGrid();
    drawApple();
    drawSnake();

    if (paused && !gameOver) {
        ctx.fillStyle = 'rgba(10, 10, 30, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
    }
}

function update(currentTime) {
    if (gameOver || paused) return;

    if (currentTime - lastMoveTime >= MOVE_INTERVAL) {
        lastMoveTime = currentTime;
        moveSnake();

        if (checkCollision()) {
            endGame();
            return;
        }
    }
}

function gameLoop(currentTime) {
    update(currentTime);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameOver = true;

    if (score > bestScore) {
        bestScore = score;
        bestDisplay.textContent = bestScore;
    }

    overlayTitle.textContent = 'Игра окончена';
    overlayScore.textContent = 'Счёт: ' + score;
    overlay.classList.remove('hidden');
}

function resetGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    initSnake();
    direction = DIRECTION.RIGHT;
    nextDirection = DIRECTION.RIGHT;
    score = 0;
    gameOver = false;
    paused = false;
    lastMoveTime = 0;

    scoreDisplay.textContent = score;
    overlay.classList.add('hidden');

    spawnApple();
    animationId = requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    if (gameOver) return;

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (direction !== DIRECTION.DOWN) nextDirection = DIRECTION.UP;
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (direction !== DIRECTION.UP) nextDirection = DIRECTION.DOWN;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (direction !== DIRECTION.RIGHT) nextDirection = DIRECTION.LEFT;
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (direction !== DIRECTION.LEFT) nextDirection = DIRECTION.RIGHT;
            break;
        case ' ':
            e.preventDefault();
            paused = !paused;
            break;
    }
}

document.addEventListener('keydown', handleKeyDown);
restartBtn.addEventListener('click', resetGame);

resetGame();
