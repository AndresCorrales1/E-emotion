// DICCIONARIO DE FRASES MOTIVACIONALES POR CADA EMOCIÓN Y SUS 3 NIVELES
const frases = {
    aburrimiento: ["El aburrimiento es el espacio en blanco donde tu mente descansa.", "Es una invitación a explorar tu propio mundo interior.", "Del aburrimiento nace la creatividad más pura."],
    asombro: ["Nunca pierdas la capacidad de sorprenderte.", "El asombro es la chispa que enciende la curiosidad.", "Mirar el mundo con ojos de niño nos recuerda lo mágico que es vivir."],
    alegria: ["La alegría se multiplica cuando se comparte.", "Tu sonrisa tiene el poder de iluminar tu día.", "La alegría es el combustible que nos da fuerza."],
    angustia: ["Sentir un nudo es difícil, pero recuerda que pasará.", "Has demostrado que puedes ir paso a paso.", "Lograste calmar la opresión. Estás a salvo aquí."],
    tristeza: ["Está bien llorar; las lágrimas limpian el alma.", "La tristeza nos invita a sanar despacio.", "Como la lluvia, la tristeza nos prepara para florecer."],
    miedo: ["Sentir miedo es natural; tu cuerpo intenta protegerte.", "Ser valiente es seguir adelante a pesar del miedo.", "Demostraste que eres más grande que tus temores."],
    enfado: ["El enfado te avisa que algo te parece injusto.", "Reaccionar con calma es donde vive tu poder.", "Transformaste el fuego en paciencia para resolver el reto."],
    disgusto: ["Nos ayuda a marcar límites y saber qué no queremos.", "Escuchar tus incomodidades ayuda a buscar bienestar.", "Encontraste el equilibrio con lo que te desagrada."],
    calma: ["En la quietud de la calma el corazón encuentra su hogar.", "La calma es la paz que mantienes en tu interior.", "Has construido un refugio de paz pieza por pieza."],
    satisfaccion: ["Reconoce tu esfuerzo; mantener orgullo es amor propio.", "Cada paso que das te acerca a donde quieres estar.", "Te propusiste un reto difícil y lo terminaste con maestría."],
    verguenza: ["Todos cometemos errores; es parte de ser humanos.", "Tu valor no cambia por sentirte expuesto.", "Superaste la incomodidad. ¡Eres una persona valiosa!"],
    ansiedad: ["Tu mente va rápido, pero tus pies están en suelo firme.", "Concéntrate solo en la pieza que tienes delante.", "Desaceleraste el ritmo y lo lograste."],
    frustracion: ["Intentar de nuevo es de valientes.", "Usa la frustración como impulso para aprender.", "No te rendiste. ¡Rompiste la barrera de la frustración!"],
    desesperacion: ["Es momento de parar, soltar el control y descansar.", "Incluso en la noche más oscura, amanecerá.", "Tu resiliencia es tu mayor superpoder."]
};

let emocionActual = "";
let nivelActual = 1;
let piezas = [];
let seleccionada = null;
let puntosTotal = 0;
let segundosTotal = 0;
let movimientos = 0;
let inicioNivel = 0;

// Se activa al hacer clic en un botón de emoción
function iniciarJuego(emocion) {
    emocionActual = emocion.toLowerCase().trim();
    nivelActual = 1;
    puntosTotal = 0;
    segundosTotal = 0;
    document.getElementById("pantalla-seleccion").classList.add("oculto");
    document.getElementById("pantalla-juego").classList.remove("oculto");
    cargarNivel();
}

// Configura y dibuja el rompecabezas
function cargarNivel() {
    const size = nivelActual + 2; // Nivel 1 = 3x3, Nivel 2 = 4x4, Nivel 3 = 5x5
    movimientos = 0;
    inicioNivel = Date.now();
    const tablero = document.getElementById("tablero");
    
    tablero.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    tablero.innerHTML = "";
    
    document.getElementById("titulo-emocion").innerText = emocionActual.toUpperCase();
    document.getElementById("nivel-actual").innerText = "Nivel " + nivelActual;

    piezas = [];
    for (let i = 0; i < size * size; i++) {
        piezas.push(i);
    }

    // Barajamos las piezas aleatoriamente
    piezas.sort(() => Math.random() - 0.5);

    // =========================================================================
    // LECTURA DIRECTA DE LA IMAGEN DESDE TU HTML
    // =========================================================================
    const idImagenHTML = `img-${emocionActual}-${nivelActual}`;
    const etiquetaImg = document.getElementById(idImagenHTML);
    
    let imageUrl = "";
    if (etiquetaImg) {
        imageUrl = etiquetaImg.getAttribute("src"); // Toma la ruta que escribiste en el HTML
    } else {
        console.error("No encontré la etiqueta <img> con ID: " + idImagenHTML);
    }

    // Crear cuadritos visuales en el tablero
    piezas.forEach((posOriginal, indexActual) => {
        const div = document.createElement("div");
        div.classList.add("pieza");
        div.dataset.index = indexActual;
        
        // Ponemos la imagen extraída del HTML
        div.style.backgroundImage = `url('${imageUrl}')`;
        
        const row = Math.floor(posOriginal / size);
        const col = posOriginal % size;
        const pSize = 400 / size;
        
        // Cortamos el fragmento de imagen correspondiente
        div.style.backgroundPosition = `-${col * pSize}px -${row * pSize}px`;
        div.style.backgroundSize = "400px 400px";

        div.onclick = () => clickPieza(indexActual);
        tablero.appendChild(div);
    });
}

// Controla el intercambio de las piezas
function clickPieza(index) {
    const divs = document.querySelectorAll(".pieza");
    
    if (seleccionada === null) {
        seleccionada = index;
        divs[index].classList.add("seleccionada");
    } else {
        if (seleccionada === index) {
            divs[index].classList.remove("seleccionada");
            seleccionada = null;
            return;
        }

        let aux = piezas[seleccionada];
        piezas[seleccionada] = piezas[index];
        piezas[index] = aux;
        movimientos++;

        divs[seleccionada].classList.remove("seleccionada");
        seleccionada = null;
        
        renderTablero();
        verificarVictoria();
    }
}

// Redibuja las posiciones tras un movimiento
function renderTablero() {
    const size = nivelActual + 2;
    const divs = document.querySelectorAll(".pieza");
    piezas.forEach((posOriginal, i) => {
        const row = Math.floor(posOriginal / size);
        const col = posOriginal % size;
        const pSize = 400 / size;
        divs[i].style.backgroundPosition = `-${col * pSize}px -${row * pSize}px`;
    });
}

// Comprueba si el rompecabezas está en orden
function verificarVictoria() {
    const ganado = piezas.every((val, index) => val === index);
    if (ganado) {
        const segundos = Math.round((Date.now() - inicioNivel) / 1000);
        puntosTotal += Math.max(50, nivelActual * 500 - movimientos * 5 - segundos * 2);
        segundosTotal += segundos;
        enviarPuntaje('rompecabezas', puntosTotal, segundosTotal);

        setTimeout(() => {
            document.getElementById("modal").classList.add("mostrar"); 
            document.getElementById("frase-ganadora").innerText = frases[emocionActual][nivelActual - 1];
            
            if (nivelActual < 3) {
                document.getElementById("btn-accion").innerText = "Siguiente Nivel";
            } else {
                document.getElementById("btn-accion").innerText = "Terminar Juego";
            }
        }, 300);
    }
}

// Avanza de nivel o regresa al menú
function manejarSiguiente() {
    document.getElementById("modal").classList.remove("mostrar");
    if (nivelActual < 3) {
        nivelActual++;
        cargarNivel();
    } else {
        irAlMenu();
    }
}

// Cancela el juego actual y vuelve a la pantalla inicial
function irAlMenu() {
    document.getElementById("pantalla-juego").classList.add("oculto");
    document.getElementById("pantalla-seleccion").classList.remove("oculto");
    document.getElementById("modal").classList.remove("mostrar");
}