const SECTOR_COUNT = 4;
const SHOW_DELAY = 500;
const PAUSE_BETWEEN = 300;

let sequence = [];
let playerIndex = 0;
let isShowing = false;
let isPlaying = false;
let abortShow = false;
let bestScore = 0;

const startBtn = document.getElementById('startBtn');
const levelDisplay = document.getElementById('levelDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const messageEl = document.getElementById('message');
const sectors = [];

for (let i = 0; i < SECTOR_COUNT; i++) {
    sectors.push(document.getElementById('btn' + i));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomSector() {
    return Math.floor(Math.random() * SECTOR_COUNT);
}

function setSectorsDisabled(disabled) {
    sectors.forEach(s => {
        if (disabled) {
            s.classList.add('disabled');
        } else {
            s.classList.remove('disabled');
        }
    });
}

function activateSector(index) {
    sectors[index].classList.add('active');
}

function deactivateSector(index) {
    sectors[index].classList.remove('active');
}

function deactivateAll() {
    sectors.forEach(s => s.classList.remove('active', 'wrong'));
}

function updateLevel() {
    levelDisplay.textContent = sequence.length;
}

async function showSequence() {
    isShowing = true;
    abortShow = false;
    setSectorsDisabled(true);

    for (let i = 0; i < sequence.length; i++) {
        if (abortShow) return;

        activateSector(sequence[i]);
        await sleep(SHOW_DELAY);

        if (abortShow) return;

        deactivateSector(sequence[i]);

        if (i < sequence.length - 1) {
            await sleep(PAUSE_BETWEEN);
        }
    }

    isShowing = false;
    setSectorsDisabled(false);
}

function handleSectorClick(index) {
    if (isShowing || !isPlaying) return;

    deactivateAll();
    activateSector(index);
    setTimeout(() => deactivateSector(index), 200);

    if (sequence[playerIndex] !== index) {
        gameOver(index);
        return;
    }

    playerIndex++;

    if (playerIndex === sequence.length) {
        nextRound();
    }
}

function nextRound() {
    playerIndex = 0;
    sequence.push(getRandomSector());
    updateLevel();
    messageEl.textContent = '';

    setTimeout(() => showSequence(), 800);
}

function gameOver(wrongIndex) {
    isPlaying = false;
    isShowing = false;
    abortShow = true;
    setSectorsDisabled(true);

    if (wrongIndex !== undefined && wrongIndex !== null) {
        sectors[wrongIndex].classList.add('wrong');
    }

    const level = sequence.length;
    if (level > bestScore) {
        bestScore = level;
        bestDisplay.textContent = bestScore;
    }

    messageEl.textContent = 'Игра окончена! Вы дошли до уровня ' + level;
    startBtn.disabled = false;
}

function startGame() {
    abortShow = true;

    setTimeout(() => {
        sequence = [];
        playerIndex = 0;
        isShowing = false;
        isPlaying = true;
        abortShow = false;

        deactivateAll();
        messageEl.textContent = '';
        startBtn.disabled = true;
        updateLevel();

        sequence.push(getRandomSector());
        updateLevel();

        setTimeout(() => showSequence(), 500);
    }, 100);
}

sectors.forEach((sector, index) => {
    sector.addEventListener('click', () => handleSectorClick(index));
});

startBtn.addEventListener('click', startGame);

setSectorsDisabled(true);
