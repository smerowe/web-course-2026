let secretNumber = [];
let attempts = 0;
let history = [];
let gameOver = false;

const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const errorEl = document.getElementById('error');
const messageEl = document.getElementById('message');
const attemptCountEl = document.getElementById('attemptCount');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');

function generateSecretNumber() {
    const digits = [];
    while (digits.length < 4) {
        const d = Math.floor(Math.random() * 10);
        if (!digits.includes(d)) {
            digits.push(d);
        }
    }
    return digits;
}

function validateInput(value) {
    if (!/^\d{4}$/.test(value)) {
        return 'Введите ровно 4 цифры (без букв и символов).';
    }
    const unique = new Set(value.split(''));
    if (unique.size !== 4) {
        return 'Все цифры должны быть разными.';
    }
    return null;
}

function countBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}

function pluralize(n, one, few, many) {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 19) return many;
    if (lastOne === 1) return one;
    if (lastOne >= 2 && lastOne <= 4) return few;
    return many;
}

function renderHistory() {
    historyList.innerHTML = '';
    emptyHistory.style.display = history.length === 0 ? 'block' : 'none';
    for (const entry of history) {
        const li = document.createElement('li');

        const guessSpan = document.createElement('span');
        guessSpan.className = 'guess-value';
        guessSpan.textContent = entry.guess;

        const badges = document.createElement('div');
        badges.className = 'result-badges';

        const bullBadge = document.createElement('span');
        bullBadge.className = 'badge badge-bulls';
        bullBadge.textContent = '🐂 ' + entry.bulls + ' ' + pluralize(entry.bulls, 'бык', 'быка', 'быков');

        const cowBadge = document.createElement('span');
        cowBadge.className = 'badge badge-cows';
        cowBadge.textContent = '🐄 ' + entry.cows + ' ' + pluralize(entry.cows, 'корова', 'коровы', 'коров');

        badges.appendChild(bullBadge);
        badges.appendChild(cowBadge);

        li.appendChild(guessSpan);
        li.appendChild(badges);
        historyList.appendChild(li);
    }
    historyList.scrollTop = historyList.scrollHeight;
}

function updateAttemptCount() {
    attemptCountEl.textContent = attempts;
}

function handleCheck() {
    if (gameOver) return;

    const value = guessInput.value.trim();
    const error = validateInput(value);

    if (error) {
        errorEl.textContent = error;
        messageEl.textContent = '';
        messageEl.className = 'message';
        return;
    }

    errorEl.textContent = '';

    const guess = value.split('').map(Number);
    const { bulls, cows } = countBullsAndCows(guess, secretNumber);

    attempts++;
    updateAttemptCount();

    history.push({ guess: value, bulls, cows });
    renderHistory();

    if (bulls === 4) {
        gameOver = true;
        messageEl.textContent = '🎉 Победа! Угадано за ' + attempts + ' ' + pluralize(attempts, 'попытку', 'попытки', 'попыток') + '!';
        messageEl.className = 'message win';
        guessInput.disabled = true;
        checkBtn.disabled = true;
    } else {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }

    guessInput.value = '';
    guessInput.focus();
}

function startNewGame() {
    secretNumber = generateSecretNumber();
    attempts = 0;
    history = [];
    gameOver = false;

    guessInput.disabled = false;
    checkBtn.disabled = false;
    guessInput.value = '';
    errorEl.textContent = '';
    messageEl.textContent = '';
    messageEl.className = 'message';
    updateAttemptCount();
    renderHistory();
    guessInput.focus();

    console.log(secretNumber.join(''));
}

checkBtn.addEventListener('click', handleCheck);
newGameBtn.addEventListener('click', startNewGame);

guessInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        handleCheck();
    }
});

guessInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
});

startNewGame();
