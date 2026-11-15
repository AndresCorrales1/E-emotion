document.addEventListener('DOMContentLoaded', () => {

    // Si ya está registrado en el, muestra saludo en lugar del formulario
    mostrarSesion();

    // Manejo del Formulario de Registro (Nombre + Año, Mes, Día)
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputNombre = document.getElementById('reg-nombre').value.trim();
            const nombre = inputNombre !== '' ? inputNombre : generarAliasAnonimo();

            const anio = document.getElementById('reg-anio').value;
            const mes = document.getElementById('reg-mes').value;
            const dia = document.getElementById('reg-dia').value;

            try {
                const resp = await fetch('phh/register.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre_usuario: nombre, anio, mes, dia })
                });
                const datos = await resp.json();

                if (!resp.ok || !datos.ok) {
                    alert(datos.error || 'No se pudo completar el registro.');
                    return;
                }

                alert(`¡Registro exitoso!\nUsuario: ${datos.usuario}`);
                mostrarSesion();
            } catch (err) {
                alert('No se pudo conectar con el servidor. Abre el sitio desde http://localhost/ (no como archivo) y revisa que Apache y MySQL estén encendidos.');
            }
        });
    }

    // 2. Evento para los botones de pestañas del ranking
    const tabButtons = document.querySelectorAll('.tabs-juegos .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const juego = e.target.getAttribute('data-juego');
            filtrarRanking(juego, e.target);
        });
    });

    // 3. Inicialización del ranking predeterminado
    filtrarRanking("memoria");
});

// Reemplaza el formulario por un saludo si el navegador ya tiene un ID registrado
async function mostrarSesion() {
    const seccion = document.querySelector('.login-section');
    if (!seccion) return;

    try {
        const resp = await fetch('phh/sesion.php', { credentials: 'same-origin' });
        const datos = await resp.json();
        if (!datos.usuario) return;

        seccion.innerHTML = '';

        const titulo = document.createElement('h2');
        titulo.textContent = `¡Hola, ${datos.usuario}!`;

        const texto = document.createElement('p');
        texto.textContent = 'Ya estás registrado/a en este dispositivo. Tus puntajes se guardan solos cuando juegas.';

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-submit';
        boton.textContent = 'Usar otro ID';
        boton.addEventListener('click', async () => {
            const seguro = confirm('Si cambias de ID no podrás volver a este, porque no hay forma de recuperarlo. ¿Quieres continuar?');
            if (!seguro) return;
            await fetch('phh/logout.php', { method: 'POST', credentials: 'same-origin' });
            location.reload();
        });

        seccion.append(titulo, texto, boton);
    } catch (err) {
        // Si falla la consulta, se deja el formulario visible
    }
}

// Función auxiliar para crear alias anónimos aleatorios si se necesita
function generarAliasAnonimo() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `Jugador #${num}`;
}

const titulosJuegos = {
    memoria: "Memoria",
    rompecabezas: "Rompecabezas",
    diana: "Atrapa la Emoción",
    escape: "Escape Room"
};

const medallas = ["🥇", "🥈", "🥉"];
let juegoActivo = "memoria";

function formatearTiempo(segundos) {
    const total = Number(segundos) || 0;
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function filaMensaje(tbody, texto) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = texto;
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
}

// Carga el ranking real desde la base de datos
async function filtrarRanking(juego, boton) {
    juegoActivo = juego;

    if (boton) {
        document.querySelectorAll(".tabs-juegos .tab-btn").forEach(btn => btn.classList.remove("active"));
        boton.classList.add("active");
    }

    const subtitulo = document.getElementById("subtitulo-juego");
    if (subtitulo) {
        subtitulo.innerText = `Los mejores puntajes de ${titulosJuegos[juego] || juego}`;
    }

    const tbody = document.getElementById("filas-ranking");
    if (!tbody) return;
    tbody.innerHTML = "";

    let lista = [];
    try {
        const resp = await fetch(`phh/ranking.php?juego=${encodeURIComponent(juego)}`, { credentials: 'same-origin' });
        const datos = await resp.json();
        lista = datos.ranking || [];
    } catch (err) {
        if (juego === juegoActivo) filaMensaje(tbody, 'No se pudo cargar la tabla de posiciones.');
        return;
    }

    // Si el usuario cambió de pestaña mientras cargaba, se descarta esta respuesta
    if (juego !== juegoActivo) return;

    if (lista.length === 0) {
        filaMensaje(tbody, 'Aún no hay puntajes. ¡Sé la primera persona en jugar!');
        return;
    }

    lista.forEach((jugador, index) => {
        const pos = index + 1;
        const esTop3 = pos <= 3;

        const tr = document.createElement('tr');
        if (esTop3) tr.className = `top-${pos}`;

        const tdPos = document.createElement('td');
        if (esTop3) {
            const med = document.createElement('span');
            med.className = 'medalla';
            med.textContent = medallas[index];
            tdPos.append(med, ' ');
        }
        tdPos.append(`#${pos}`);

        const tdNombre = document.createElement('td');
        const fuerte = document.createElement('strong');
        fuerte.textContent = jugador.nombre; // textContent: evita inyección de HTML
        tdNombre.appendChild(fuerte);

        const tdPuntaje = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'badge-puntaje';
        badge.textContent = `${Number(jugador.puntaje).toLocaleString()} pts`;
        tdPuntaje.appendChild(badge);

        const tdTiempo = document.createElement('td');
        tdTiempo.textContent = formatearTiempo(jugador.tiempo);

        tr.append(tdPos, tdNombre, tdPuntaje, tdTiempo);
        tbody.appendChild(tr);
    });
}

// Funciones para el Modal de Registro de Puntajes (sin uso por ahora)
function cerrarModal() {
    const modal = document.getElementById('modal-registro');
    if (modal) modal.style.display = 'none';
}

function guardarPuntaje(e) {
    e.preventDefault();
    cerrarModal();
}

// El aviso del 106 solo se muestra en computador; en celular se deja llamar
document.addEventListener('click', (e) => {
    const btn106 = e.target.closest('.btn-106');
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (btn106 && !esMovil) {
        e.preventDefault();
        alert('Para realizar la llamada directamente debes contar con un dispositivo móvil o tener tu celular vinculado al computador.');
    }
});
