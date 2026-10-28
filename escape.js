// --- PUNTAJE ---
let inicioEscape = 0;
let erroresEscape = 0;

function finalizarEscape() {
    if (!inicioEscape) return;
    const segundos = Math.round((Date.now() - inicioEscape) / 1000);
    const puntos = Math.max(500, 5000 - segundos * 10 - erroresEscape * 100);
    enviarPuntaje('escape', puntos, segundos);
    inicioEscape = 0;
}

// --- MANEJO DE PANTALLAS ---
function changeScreen(screenId) {
    if (screenId === 'sala1' && !inicioEscape) {
        inicioEscape = Date.now();
        erroresEscape = 0;
    }
    if (screenId === 'victory-screen') finalizarEscape();
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- SALA 1 ---
function checkSala1(answer) {
    const feedback = document.getElementById('feedback-sala1');
    if (answer === 'Miedo / Ansiedad') {
        feedback.className = "feedback success-text";
        feedback.innerText = "¡Correcto! Los cambios corporales indican activación protectora.";
        setTimeout(() => { changeScreen('transition1'); }, 1400);
    } else {
        feedback.className = "feedback error-text";
        feedback.innerText = "Respuesta incorrecta. Analiza los síntomas físicos de nuevo.";
        erroresEscape++;
    }
}

// --- SALA 2 ---
const emojis = ['😊', '😢', '😡', '😱', '😊', '😢', '😡', '😱'];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true;

function startSala2() {
    changeScreen('sala2');
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    matchedPairs = 0;
    flippedCards = [];
    document.getElementById('feedback-sala2').innerText = '';

    const shuffled = emojis.sort(() => 0.5 - Math.random());
    shuffled.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.innerHTML = `<span>${emoji}</span>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) return;
    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        canFlip = false;
        setTimeout(checkMatch, 600);
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;
    const f = document.getElementById('feedback-sala2');

    if (c1.dataset.emoji === c2.dataset.emoji) {
        c1.classList.add('matched'); c2.classList.add('matched');
        matchedPairs++;
        if (matchedPairs === emojis.length / 2) {
            f.className = "feedback success-text";
            f.innerText = "¡Empatía sincronizada!";
            setTimeout(() => { changeScreen('transition2'); }, 1300);
        }
    } else {
        c1.classList.remove('flipped'); c2.classList.remove('flipped');
    }
    flippedCards = [];
    canFlip = true;
}

// --- SALA 3 ---
let currentTemp = 100;

function coolDown(actionId, tempChange, element) {
    const feedback = document.getElementById('feedback-sala3');
    const fill = document.getElementById('thermo-fill');
    const text = document.getElementById('thermo-text');

    if (element.classList.contains('used')) return;

    if (tempChange > 0) {
        feedback.className = "feedback error-text";
        feedback.innerText = "¡La impulsividad elevó la tensión!";
        erroresEscape++;
        currentTemp = Math.min(100, currentTemp + tempChange);
    } else {
        feedback.className = "feedback success-text";
        feedback.innerText = "Estrategia de enfriamiento efectiva.";
        currentTemp = Math.max(0, currentTemp + tempChange);
        element.classList.add('used');
        element.style.background = "rgba(16, 185, 129, 0.15)";
        element.style.borderColor = "var(--c-green)";
    }

    fill.style.width = currentTemp + '%';
    text.innerHTML = currentTemp + '°C<br>' + (currentTemp > 60 ? 'Ira Elevada' : currentTemp > 20 ? 'Moderado' : 'Calma Total');

    if (currentTemp <= 20) {
        setTimeout(() => { changeScreen('transition3'); }, 1300);
    }
}

// --- SALA 4 ---
const correctSequence = ['Propósito', 'Acción', 'Persistencia', 'Logro'];
let userSequence = [];
const slotTexts = ["1. ¿Por qué lo hago?", "2. El primer paso", "3. No rendirse", "4. Meta alcanzada"];

function selectSequence(concept, element) {
    if (userSequence.includes(concept) || userSequence.length >= 4) return;

    userSequence.push(concept);
    element.classList.add('disabled');
    
    const index = userSequence.length - 1;
    const slots = document.querySelectorAll('.slot');
    slots[index].innerText = `${slotTexts[index]} ➔ [ ${concept} ]`;
    slots[index].classList.add('filled-slot');
}

function resetSequence() {
    userSequence = [];
    document.getElementById('feedback-sala4').innerText = '';
    document.querySelectorAll('.slot').forEach((slot, idx) => {
        slot.innerText = slotTexts[idx];
        slot.classList.remove('filled-slot');
    });
    document.querySelectorAll('.btn-seq').forEach(btn => btn.classList.remove('disabled'));
}

function checkSala4() {
    const feedback = document.getElementById('feedback-sala4');
    if (userSequence.length < 4) {
        feedback.className = "feedback error-text";
        feedback.innerText = "Asigna todos los pilares.";
        return;
    }

    const isCorrect = userSequence.every((val, i) => val === correctSequence[i]);

    if (isCorrect) {
        feedback.className = "feedback success-text";
        feedback.innerText = "Encajando llaves... Abriendo el Paraíso...";
        setTimeout(() => { changeScreen('victory-screen'); }, 1500);
    } else {
        feedback.className = "feedback error-text";
        feedback.innerText = "Secuencia incorrecta. El portón sigue bloqueado.";
        erroresEscape++;
        resetSequence();
    }
}

// --- RESET GENERAL ---
function resetGame() {
    inicioEscape = 0;
    currentTemp = 100;
    const fill = document.getElementById('thermo-fill');
    if (fill) fill.style.width = '100%';
    resetSequence();
    changeScreen('start-screen');
}