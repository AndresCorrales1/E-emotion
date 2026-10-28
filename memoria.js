const emotionsPool = [
    { emoji: "😊", name: "Alegría", color: "#fff9db" },
    { emoji: "😢", name: "Tristeza", color: "#e7f5ff" },
    { emoji: "😡", name: "Enojo", color: "#fff5f5" },
    { emoji: "😱", name: "Miedo", color: "#f3f0ff" },
    { emoji: "😎", name: "Calma", color: "#ebfbee" },
    { emoji: "🥳", name: "Entusiasmo", color: "#fff0f6" },
    { emoji: "🤔", name: "Curiosidad", color: "#eef2f7" },
    { emoji: "🥰", name: "Amor", color: "#fff0f6" },
    { emoji: "🤯", name: "Asombro", color: "#fff9db" },
    { emoji: "😌", name: "Gratitud", color: "#ebfbee" }
];

// DETALLE: 10 Consejos emocionales bien distribuidos
const levelAdvices = {
    1: " 💙 <b>Consejo:</b> Comparte tu bienestar con alguien hoy. La alegría crece cuando se contagia.",
    2: " 💙 <b>Consejo:</b> Llorar o sentir desánimo es natural. Date permiso de procesar tus días grises sin juzgarte.",
    3: " 💙 <b>Consejo:</b> El enojo nos avisa que un límite fue cruzado. Respira hondo antes de actuar para decidir con claridad.",
    4: " 💙 <b>Consejo:</b> El miedo te cuida, pero a veces exagera. Pregúntate: ¿Qué es lo peor que podría pasar y cómo lo resolvería?",
    5: " 💙 <b>Consejo:</b> La calma es la paz interior que te permite detenerte, respirar y encontrar claridad incluso en medio del caos.",
    6: " 💙<b>Consejo:</b> ¡Usa esa energía positiva! Es el momento ideal para iniciar un proyecto o aprender algo nuevo.",
    7: " 💙 <b>Consejo:</b> Cuestiona las cosas con amabilidad. Mantener una mente abierta te ayuda a descubrir nuevas perspectivas.",
    8: " 💙 <b>Consejo:</b> El afecto hacia los demás comienza en ti mismo. Trátate hoy con la misma paciencia que tratas a tu mejor amigo.",
    9: " 💙 <b>Consejo:</b> La magia está en lo cotidiano: un atardecer, una canción… no dejes de sorprenderte con esos pequeños instantes..",
    10: "💙 <b>Mensaje de Bienestar Integral:</b> ¡Increíble! Completaste los 10 niveles. Cuidar de tu mente y escuchar cómo te sientes es el acto de amor propio más grande."
};

let currentLevel = 1;
let moves = 0;
let matchesFound = 0;
let totalPairsNeeded = 2;
let timeLeft = 0;
let timerInterval = null;
let isGameOver = false;
let scoreTotal = 0;
let tiempoTotal = 0;
let limiteNivel = 0;

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

const board = document.getElementById('board');
const movesDisplay = document.getElementById('moves-val');
const levelDisplay = document.getElementById('level-val');
const timeDisplay = document.getElementById('time-val');
const progressBar = document.getElementById('progress-bar');
const modal = document.getElementById('modal-next');
const modalAdvice = document.getElementById('modal-advice');
const modalStars = document.getElementById('modal-stars');

const welcomeScreen = document.getElementById('welcome-screen');
const gameContent = document.getElementById('game-content');

function initGame() {
    welcomeScreen.style.display = 'none';
    gameContent.style.opacity = '1';
    gameContent.style.pointerEvents = 'all';
    startGame();
}

// Configuración de la curva de dificultad para 10 niveles
function startGame() {
    isGameOver = false;
    timeDisplay.classList.remove('time-critical');

    switch(currentLevel) {
        case 1:
            totalPairsNeeded = 2; timeLeft = 20;
            board.style.gridTemplateColumns = "repeat(2, 1fr)";
            break;
        case 2:
            totalPairsNeeded = 3; timeLeft = 30;
            board.style.gridTemplateColumns = "repeat(3, 1fr)";
            break;
        case 3:
            totalPairsNeeded = 4; timeLeft = 40;
            board.style.gridTemplateColumns = "repeat(3, 1fr)";
            break;
        case 4:
            totalPairsNeeded = 5; timeLeft = 50;
            board.style.gridTemplateColumns = "repeat(4, 1fr)";
            break;
        case 5:
            totalPairsNeeded = 6; timeLeft = 60;
            board.style.gridTemplateColumns = "repeat(4, 1fr)";
            break;
        case 6:
            totalPairsNeeded = 7; timeLeft = 70;
            board.style.gridTemplateColumns = "repeat(4, 1fr)";
            break;
        case 7:
            totalPairsNeeded = 8; timeLeft = 80;
            board.style.gridTemplateColumns = "repeat(4, 1fr)";
            break;
        case 8:
            totalPairsNeeded = 9; timeLeft = 90;
            board.style.gridTemplateColumns = "repeat(5, 1fr)";
            break;
        case 9:
            totalPairsNeeded = 10; timeLeft = 105;
            board.style.gridTemplateColumns = "repeat(5, 1fr)";
            break;
        case 10:
            totalPairsNeeded = 10; timeLeft = 80; // El nivel final repite el máximo de cartas pero con menos tiempo
            board.style.gridTemplateColumns = "repeat(5, 1fr)";
            break;
    }

    limiteNivel = timeLeft;
    moves = 0;
    matchesFound = 0;
    movesDisplay.innerText = moves;
    levelDisplay.innerText = currentLevel;
    
    updateProgressBar();
    updateTimerDisplay();
    
    clearInterval(timerInterval);
    startTimer();

    resetVariables();
    generateBoard();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 10) {
            timeDisplay.classList.add('time-critical');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleGameOver();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
    const percentage = (matchesFound / totalPairsNeeded) * 100;
    progressBar.style.width = `${percentage}%`;
}

function generateBoard() {
    board.innerHTML = "";
    // Tomamos las emociones necesarias del pool disponible
    const selectedEmotions = emotionsPool.slice(0, totalPairsNeeded);
    let deck = [...selectedEmotions, ...selectedEmotions];
    deck.sort(() => Math.random() - 0.5);

    deck.forEach(emotion => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.emotion = emotion.name;

        card.innerHTML = `
            <div class="card-front" style="background-color: ${emotion.color}">
                <div class="card-emoji">${emotion.emoji}</div>
                <div style="font-size: 0.85rem; color: #444; font-weight: 600;">${emotion.name}</div>
            </div>
            <div class="card-back"></div>
        `;

        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || isGameOver) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    moves++;
    movesDisplay.innerText = moves;

    let isMatch = firstCard.dataset.emotion === secondCard.dataset.emotion;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    matchesFound++;
    updateProgressBar();

    if (matchesFound === totalPairsNeeded) {
        clearInterval(timerInterval);
        setTimeout(showWinModal, 500);
    }

    resetVariables();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetVariables();
    }, 1000);
}

function resetVariables() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function calculateStars() {
    const minMovesPossible = totalPairsNeeded;
    if (moves <= minMovesPossible + 2) return 3;
    if (moves <= minMovesPossible + 5) return 2;
    return 1;
}

function showWinModal() {
    // Puntaje acumulado de la partida (se guarda en la base de datos)
    scoreTotal += Math.max(50, currentLevel * 100 + timeLeft * 5 - moves * 3);
    tiempoTotal += Math.max(0, limiteNivel - timeLeft);
    enviarPuntaje('memoria', scoreTotal, tiempoTotal);

    confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
    });

    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalBtn = document.querySelector('.btn-next');

    modalAdvice.innerHTML = levelAdvices[currentLevel];

    const starsCount = calculateStars();
    let starsHTML = '';
    for (let i = 1; i <= 3; i++) {
        if (i <= starsCount) {
            starsHTML += `<span class="gold" style="--i: ${i}">★</span>`;
        } else {
            starsHTML += `<span>★</span>`;
        }
    }
    modalStars.innerHTML = starsHTML;

    // DETALLE: Validación de victoria final ajustada a 10 niveles
    if (currentLevel < 10) {
        modalTitle.innerText = `¡Nivel ${currentLevel} Completado! 🌟`;
        modalText.innerText = `Lo lograste en ${moves} movimientos.`;
        modalBtn.innerText = "Siguiente Nivel";
    } else {
        modalTitle.innerText = "¡Mente Maestra Emocional! 🏆";
        modalText.innerText = `¡Espectacular! Completaste los 10 niveles con éxito.`;
        modalBtn.innerText = "Volver a Empezar";
    }
    modal.style.display = 'flex';
}

function handleGameOver() {
    isGameOver = true;
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalBtn = document.querySelector('.btn-next');

    modalStars.innerHTML = ''; 
    modalAdvice.innerHTML = "⏳ <b>¡El tiempo se agotó!</b> Monitorear nuestras emociones requiere paciencia. ¡Inténtalo de nuevo para mejorar tu marca!";
    
    modalTitle.innerText = "¡Tiempo Agotado! 💔";
    modalText.innerText = `Te quedaste en el Nivel ${currentLevel}.`;
    modalBtn.innerText = "Reintentar Nivel";
    
    modal.style.display = 'flex';
}

function advanceLevel() {
    modal.style.display = 'none';
    if (!isGameOver) {
        if (currentLevel < 10) {
            currentLevel++;
        } else {
            currentLevel = 1;
            scoreTotal = 0;
            tiempoTotal = 0;
        }
    }
    startGame();
}