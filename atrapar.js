const emotions = [
    { emoji: "⚡", name: "Euforia", color: "linear-gradient(135deg, #f59e0b, #ea580c)" },
    { emoji: "😎", name: "Orgullo", color: "linear-gradient(135deg, #06b6d4, #0891b2)" },
    { emoji: "🔥", name: "Furia", color: "linear-gradient(135deg, #ef4444, #b91c1c)" },
    { emoji: "👾", name: "Ansiedad", color: "linear-gradient(135deg, #a855f7, #7e22ce)" },
    { emoji: "😴", name: "empatía", color: "linear-gradient(135deg, #64748b, #475569)" },
    { emoji: "💖", name: "Amor", color: "linear-gradient(135deg, #ec4899, #be185d)" }
];

let score = 0;
let combo = 1;
let timeLeft = 30;
let gameInterval;
let spawnInterval;
let currentTarget;
let spawnSpeed = 900; // Milisegundos entre apariciones

const scoreTxt = document.getElementById("score");
const comboTxt = document.getElementById("combo");
const timeTxt = document.getElementById("time");
const targetEmoji = document.getElementById("target-emoji");
const targetName = document.getElementById("target-name");
const targetBubble = document.querySelector(".target-bubble");
const stage = document.getElementById("stage");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", startGame);

function startGame() {
    score = 0;
    combo = 1;
    timeLeft = 30;
    spawnSpeed = 900;
    
    scoreTxt.textContent = score;
    comboTxt.textContent = `x${combo}`;
    timeTxt.textContent = timeLeft;
    
    startScreen.style.display = "none";
    
    changeTarget();
    // Cambia el objetivo cada 4 segundos para mantener la agilidad
    targetInterval = setInterval(changeTarget, 4000);

    // Reloj principal del juego
    gameInterval = setInterval(() => {
        timeLeft--;
        timeTxt.textContent = timeLeft;

        // Aumentar dificultad a mitad de partida
        if (timeLeft === 15) {
            clearInterval(spawnInterval);
            spawnInterval = setInterval(spawnEmotion, 600); // Más rápido
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    spawnInterval = setInterval(spawnEmotion, spawnSpeed);
}

function changeTarget() {
    // Animación de pulso al cambiar de objetivo
    targetBubble.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        currentTarget = emotions[Math.floor(Math.random() * emotions.length)];
        targetEmoji.textContent = currentTarget.emoji;
        targetName.textContent = currentTarget.name;
        targetBubble.style.background = currentTarget.color;
        targetBubble.style.transform = "scale(1)";
    }, 150);
}

function spawnEmotion() {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const bubble = document.createElement("div");
    
    bubble.classList.add("bubble");
    bubble.textContent = randomEmotion.emoji;

    // Posicionamiento seguro en el área del Stage
    const maxX = stage.clientWidth - 80;
    const maxY = stage.clientHeight - 80;
    bubble.style.left = `${Math.floor(Math.random() * Math.max(10, maxX))}px`;
    bubble.style.top = `${Math.floor(Math.random() * Math.max(10, maxY))}px`;

    // Interacción (Clis / Toque)
    bubble.addEventListener("pointerdown", (e) => {
        e.stopPropagation(); // Evita clicks fantasmas
        
        if (randomEmotion.name === currentTarget.name) {
            // ¡ACIERTO!
            score += 10 * combo;
            combo++;
            scoreTxt.textContent = score;
            comboTxt.textContent = `x${combo}`;
            
            // Efecto visual flash verde rápido al combo
            comboTxt.style.color = "#4ade80";
            setTimeout(() => comboTxt.style.color = "", 200);

            bubble.remove();
        } else {
            // ¡ERROR!
            combo = 1; // Pierdes el multiplicador
            comboTxt.textContent = `x${combo}`;
            score = Math.max(0, score - 15);
            scoreTxt.textContent = score;

            // Feedback visual de error sacudiendo el escenario
            stage.classList.add("shake");
            comboTxt.style.color = "#f43f5e";
            setTimeout(() => {
                stage.classList.remove("shake");
                comboTxt.style.color = "";
            }, 300);

            bubble.remove();
        }
    });

    stage.appendChild(bubble);

    // Auto-eliminar si el jugador no la atrapa
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    }, 2200);
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(targetInterval);
    
    if (score > 0) enviarPuntaje('diana', score, 30);

    // Limpiar burbujas sobrantes
    const activeBubbles = stage.querySelectorAll(".bubble");
    activeBubbles.forEach(b => b.remove());

    // Mostrar pantalla de Game Over incorporada en el botón
    startBtn.innerHTML = `¡TIEMPO!<br>Puntaje: ${score}<br><br>¿REINTENTAR?`;
    startScreen.style.display = "flex";
}