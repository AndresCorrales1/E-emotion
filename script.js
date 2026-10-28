// Estructura completa de las 8 emociones principales de la rueda
const emotionsData = [
    { id: "enojo", title: "Enojo", emoji: "😡", color: "#ef5350", label: "ENFADO", causes: ["⚖️ Sientes que algo es injusto", "👂 Alguien no te escucha", "🔋 Te sientes frustrado o cansado"], actions: ["🫁 Respira profundo tres veces", "☕ Toma un descanso", "✏️ Escribe lo que sientes"], desc: "El enojo surge cuando sentimos que algo es injusto, no se respeta lo que pensamos o no podemos lograr lo que necesitamos." },
    { id: "anticipacion", title: "Anticipación", emoji: "👁️", color: "#ff9800", label: "ANTICIPACIÓN", causes: ["📅 Tienes un evento importante pronto", "🎁 Esperas una sorpresa", "🚀 Planeas un nuevo proyecto"], actions: ["📝 Organiza tus tareas paso a paso", "🧘 Haz una pausa para calmar la ansiedad", "🗣️ Expresa tus expectativas"], desc: "Es la emoción que nos ayuda a prepararnos para el futuro, manteniendo nuestra mente activa y lista." },
    { id: "alegria", title: "Alegría", emoji: "😀", color: "#fff176", label: "ALEGRÍA", causes: ["🎉 Lograste una meta deseada", "❤️ Compartiste con alguien querido", "☀️ Disfrutas de tu pasatiempo"], actions: ["✨ Comparte tu energía con otros", "🙏 Agradece por este momento", "📸 Atesora el recuerdo"], desc: "Aparece cuando experimentamos bienestar, logramos objetivos significativos o compartimos momentos agradables." },
    { id: "confianza", title: "Confianza", emoji: "🤝", color: "#81c784", label: "CONFIANZA", causes: ["🛡️ Te encuentras en un lugar seguro", "👥 Cuentas con apoyo real", "🌱 Crees en tus capacidades"], actions: ["🗣️ Expresa tus ideas libremente", "🤗 Ofrece tu ayuda a un compañero", "🚀 Sigue adelante con tus planes"], desc: "Sentimiento de seguridad en uno mismo o en los demás, que permite actuar con tranquilidad y apertura." },
    { id: "miedo", title: "Miedo", emoji: "😨", color: "#4db6ac", label: "MIEDO", causes: ["⚡ Te enfrentas a lo desconocido", "❌ Temes cometer un gran error", "🛑 Hay un peligro real o imaginario"], actions: ["😮‍💨 Evalúa el riesgo real con calma", "🤝 Pide soporte a alguien de confianza", "🚶 Ve dando pasos pequeños"], desc: "El miedo actúa como una alarma natural ante peligros, invitándonos a protegernos y buscar seguridad." },
    { id: "sorpresa", title: "Sorpresa", emoji: "😲", color: "#4fc3f7", label: "SORPRESA", causes: ["🎁 Recibiste un impacto imprevisto", "🔍 Descubriste algo curioso", "🔄 Un giro inesperado en tus planes"], actions: ["💡 Tómate un segundo para procesarlo", "💬 Haz preguntas para entenderlo", "🔄 Fluye con la nueva situación"], desc: "Una reacción breve y súbita ante lo inesperado. Suele transformarse rápido en alegría, curiosidad o asombro." },
    { id: "tristeza", title: "Tristeza", emoji: "😢", color: "#5c6bc0", label: "TRISTEZA", causes: ["💔 Sufriste una pérdida o despedida", "🌧️ Algo no salió como esperabas", "🔋 Te sientes solo o incomprendido"], actions: ["😢 Permítete llorar y desahogarte", "🫂 Habla de cómo te sientes", "🛌 Descansa y trátate con suavidad"], desc: "Aparece ante la pérdida o desilusión. Te invita a detenerte, reflexionar, sanar y buscar el cobijo de los demás." },
    { id: "asco", title: "Asco", emoji: "🤢", color: "#ba68c8", label: "ASCO", causes: ["🤢 Rechazo a olores o sabores", "🙅 Una acción que va contra tus valores", "🛑 Algo que rompe tu armonía"], actions: ["🚶 Aléjate del estímulo molesto", "🌬️ Busca aire fresco", "🗣️ Establece límites claros"], desc: "Nos protege de elementos que pueden dañar nuestra salud física o moral, generando un sano rechazo." }
];

const petalsContainer = document.getElementById("wheel-petals");
const slider = document.getElementById("intensitySlider");

const CX = 250;
const CY = 250;
const R = 210;

// Generador matemático de pétalos redondeados
function drawPlutchikWheel() {
    if (!petalsContainer) return; // Validación por si acaso
   
    emotionsData.forEach((emotion, index) => {
        const angleDeg = index * 45 - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
       
        const targetX = CX + R * Math.cos(angleRad + (22.5 * Math.PI) / 180);
        const targetY = CY + R * Math.sin(angleRad + (22.5 * Math.PI) / 180);
       
        const cp1X = CX + (R * 0.6) * Math.cos(angleRad - (5 * Math.PI) / 180);
        const cp1Y = CY + (R * 0.6) * Math.sin(angleRad - (5 * Math.PI) / 180);
       
        const cp2X = CX + (R * 0.6) * Math.cos(angleRad + (50 * Math.PI) / 180);
        const cp2Y = CY + (R * 0.6) * Math.sin(angleRad + (50 * Math.PI) / 180);

        const pathData = `
            M ${CX} ${CY}
            C ${cp1X} ${cp1Y}, ${targetX} ${targetY}, ${targetX} ${targetY}
            C ${targetX} ${targetY}, ${cp2X} ${cp2Y}, ${CX} ${CY} Z
        `;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", emotion.color);
        path.setAttribute("class", "petal-segment");
        path.setAttribute("id", `petal-${index}`);
        path.style.cursor = "pointer";
        path.addEventListener("click", () => selectEmotion(index));

        const textDist = R * 0.62;
        const textX = CX + textDist * Math.cos(angleRad + (22.5 * Math.PI) / 180);
        const textY = CY + textDist * Math.sin(angleRad + (22.5 * Math.PI) / 180) + 3;

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("class", "wheel-label");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#000"); // Asegurar visibilidad básica
        text.style.fontSize = "12px";
        text.style.pointerEvents = "none";
       
        text.setAttribute("transform", `rotate(${angleDeg + 112.5}, ${textX}, ${textY})`);
        text.textContent = emotion.label;

        petalsContainer.appendChild(path);
        petalsContainer.appendChild(text);
    });
}

// Función encargada de actualizar la vista dinámica de la tarjeta
function selectEmotion(index) {
    const emotion = emotionsData[index];
    if (!emotion) return;
   
    // Actualizar Header e información general con los IDs reales de tu HTML
    document.getElementById("emotionTitle").textContent = emotion.title;
    document.getElementById("mainEmoji").textContent = emotion.emoji;
    document.getElementById("emotionDescription").textContent = emotion.desc;

    // Actualizar causas
    const causesList = document.getElementById("causesList");
    causesList.innerHTML = emotion.causes.map(c => `<li>${c}</li>`).join("");

    // Actualizar acciones sugeridas
    const actionsList = document.getElementById("actionsList");
    actionsList.innerHTML = emotion.actions.map(a => `<li>${a}</li>`).join("");

    // Mover el Slider a la posición correspondiente
    if (slider) {
        slider.value = index;
    }

    // Resaltar visualmente el pétalo activo en el SVG
    document.querySelectorAll(".petal-segment").forEach(p => p.classList.remove("active"));
    const activePetal = document.getElementById(`petal-${index}`);
    if (activePetal) {
        activePetal.classList.add("active");
    }
}

// Función global que usan los botones del HTML (ej. cambiarEmocion('enojo'))
window.cambiarEmocion = function(idEmocion) {
    const index = emotionsData.findIndex(e => e.id === idEmocion);
    if (index !== -1) {
        selectEmotion(index);
    }
}

// Escuchar los movimientos del slider para actualizar la rueda
if (slider) {
    slider.addEventListener("input", (e) => {
        selectEmotion(parseInt(e.target.value));
    });
}

// Inicialización de la interfaz gráfica al cargar el archivo
drawPlutchikWheel();
selectEmotion(0); // Empezar por defecto en 'Enojo'

document.addEventListener('click', (e) => {
    const btn106 = e.target.closest('.btn-106');
    if (btn106) {
        e.preventDefault();
        alert('Para realizar la llamada directamente debes contar con un dispositivo móvil o tener tu celular vinculado al computador.');
    }
});