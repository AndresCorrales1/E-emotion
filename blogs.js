// ===== TARJETAS DE DESAHOGO =====
const COLORES_NOTA = ['nota-azul', 'nota-rosa', 'nota-lavanda'];
let ultimoId = null;          // id del último mensaje cargado (para "Ver más")
let cargandoMuro = false;
let mostrandoEjemplos = true; // true mientras se ven las notas de ejemplo del HTML

document.addEventListener('DOMContentLoaded', () => {
    cargarMuro(true);
});

function mostrarMuroGuias() {
    const contenidoEstatico = document.getElementById('contenido-estatico-guias');
    const muroInteractivo = document.getElementById('muro-ansiedad');
    const botonMaster = document.getElementById('btn-master-guias');

    if (muroInteractivo.classList.contains('despliegue-oculto')) {
        contenidoEstatico.classList.add('despliegue-oculto');
        muroInteractivo.classList.remove('despliegue-oculto');
        botonMaster.innerText = "VER MENOS";
    } else {
        muroInteractivo.classList.add('despliegue-oculto');
        contenidoEstatico.classList.remove('despliegue-oculto');
        botonMaster.innerText = "LEER MAS";
    }
}

// Crea una tarjeta del muro (textContent evita que alguien inyecte HTML)
function crearNota(m) {
    const nota = document.createElement('div');
    nota.className = `tarjeta-nota ${COLORES_NOTA[m.id % COLORES_NOTA.length]}`;

    const texto = document.createElement('span');
    texto.textContent = `"${m.contenido}"`;

    const reportar = document.createElement('button');
    reportar.type = 'button';
    reportar.textContent = '⚑ Reportar';
    reportar.title = 'Reportar este mensaje como inapropiado';
    reportar.style.cssText =
        'display:block;margin:8px 0 0 auto;background:none;border:none;color:inherit;' +
        'opacity:.45;font-size:.72rem;cursor:pointer;';
    reportar.addEventListener('click', () => reportarNota(m.id, reportar));

    nota.append(texto, reportar);
    return nota;
}

// Carga mensajes reales desde la base de datos
async function cargarMuro(inicial) {
    if (cargandoMuro) return;
    cargandoMuro = true;

    const contenedor = document.getElementById('contenedor-muro');
    try {
        const url = 'phh/mensajes_listar.php' + (!inicial && ultimoId ? `?antes=${ultimoId}` : '');
        const resp = await fetch(url, { credentials: 'same-origin' });
        const datos = await resp.json();
        if (!datos.ok) return;

        if (inicial && datos.mensajes.length > 0) {
            contenedor.innerHTML = ''; // se quitan las notas de ejemplo
            mostrandoEjemplos = false;
        }
        datos.mensajes.forEach(m => {
            contenedor.appendChild(crearNota(m));
            ultimoId = m.id;
        });
        actualizarBotonMas(datos.siguiente !== null && datos.siguiente !== undefined);
    } catch (err) {
        // Si no hay conexión se dejan las notas de ejemplo
    } finally {
        cargandoMuro = false;
    }
}

function actualizarBotonMas(hayMas) {
    let boton = document.getElementById('btn-ver-mas-muro');
    if (!hayMas) {
        if (boton) boton.remove();
        return;
    }
    if (!boton) {
        boton = document.createElement('button');
        boton.id = 'btn-ver-mas-muro';
        boton.type = 'button';
        boton.className = 'btn-interactivo-enviar';
        boton.textContent = 'Ver más pensamientos';
        boton.style.cssText = 'display:block;margin:16px auto 0;';
        boton.addEventListener('click', () => cargarMuro(false));
        document.getElementById('contenedor-muro').after(boton);
    }
}

// ----- Avisos dentro del formulario -----
function zonaAvisos() {
    let zona = document.getElementById('avisos-desahogo');
    if (!zona) {
        zona = document.createElement('div');
        zona.id = 'avisos-desahogo';
        zona.style.cssText = 'margin-top:12px;';
        document.querySelector('.formulario-liberacion').appendChild(zona);
    }
    return zona;
}

function limpiarAvisos() {
    zonaAvisos().innerHTML = '';
}

function mostrarAviso(texto, tipo) {
    const p = document.createElement('p');
    p.textContent = texto;
    p.style.cssText =
        'margin:8px 0;padding:10px 14px;border-radius:12px;font-size:.92rem;' +
        (tipo === 'ok'
            ? 'background:#ecfdf5;color:#065f46;'
            : 'background:#fef2f2;color:#991b1b;');
    zonaAvisos().appendChild(p);
}

function avisoRegistro() {
    const p = document.createElement('p');
    p.style.cssText = 'margin:8px 0;padding:10px 14px;border-radius:12px;font-size:.92rem;background:#f5f3ff;color:#5b21b6;';
    p.append('Para soltar un pensamiento primero crea tu ID anónimo en la página de ');
    const enlace = document.createElement('a');
    enlace.href = 'juegos.html';
    enlace.textContent = 'Juegos';
    p.append(enlace, '. Tu texto se queda aquí mientras tanto 💜');
    zonaAvisos().appendChild(p);
}

function mostrarAyuda(ayuda) {
    const caja = document.createElement('div');
    caja.style.cssText = 'margin:10px 0;padding:14px 16px;border-radius:14px;background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;';

    const msg = document.createElement('p');
    msg.textContent = ayuda.mensaje;
    msg.style.margin = '0 0 8px';
    caja.appendChild(msg);

    ayuda.lineas.forEach(l => {
        const fila = document.createElement('p');
        fila.style.margin = '4px 0';
        const enlace = document.createElement('a');
        enlace.href = `tel:${l.tel}`;
        enlace.textContent = `${l.nombre}: ${l.texto}`;
        enlace.style.fontWeight = '600';
        fila.appendChild(enlace);
        caja.appendChild(fila);
    });

    zonaAvisos().appendChild(caja);
}

// ----- Publicar -----
async function soltarPensamiento() {
    const textarea = document.getElementById('nota-usuario');
    const boton = document.querySelector('.formulario-liberacion .btn-interactivo-enviar');
    const texto = textarea.value.trim();

    limpiarAvisos();

    if (texto === "") {
        mostrarAviso('Por favor, escribe lo que te abruma antes de soltarlo.', 'error');
        return;
    }

    boton.disabled = true;
    try {
        const resp = await fetch('phh/mensajes_crear.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido: texto })
        });
        const datos = await resp.json().catch(() => ({}));

        if (resp.status === 401) {
            avisoRegistro();
            return;
        }
        if (!resp.ok || !datos.ok) {
            mostrarAviso(datos.error || 'No se pudo guardar tu pensamiento. Intenta de nuevo.', 'error');
            return;
        }

        textarea.value = '';

        if (datos.estado === 'visible') {
            const contenedor = document.getElementById('contenedor-muro');
            if (mostrandoEjemplos) {
                contenedor.innerHTML = '';
                mostrandoEjemplos = false;
            }
            const nota = crearNota({ id: datos.id, contenido: datos.contenido });
            nota.style.opacity = '0';
            nota.style.transition = 'opacity 0.4s ease';
            contenedor.insertBefore(nota, contenedor.firstChild);
            requestAnimationFrame(() => { nota.style.opacity = '1'; });
            mostrarAviso('Tu pensamiento fue soltado 💜', 'ok');
        } else {
            mostrarAviso('Tu mensaje fue recibido 💜. Por cuidado de todas las personas, una persona del equipo lo revisará antes de que aparezca en el muro.', 'ok');
        }

        if (datos.ayuda) mostrarAyuda(datos.ayuda);
    } catch (err) {
        mostrarAviso('No se pudo conectar con el servidor. Abre el sitio desde http://localhost/ y revisa que Apache y MySQL estén encendidos.', 'error');
    } finally {
        boton.disabled = false;
    }
}

// ----- Reportar -----
async function reportarNota(id, boton) {
    if (!confirm('¿Quieres reportar este mensaje como inapropiado?')) return;

    try {
        const resp = await fetch('phh/mensajes_reportar.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje_id: id })
        });
        const datos = await resp.json().catch(() => ({}));

        if (resp.status === 401) {
            alert('Para reportar un mensaje primero crea tu ID anónimo en la página de Juegos.');
            return;
        }
        if (!resp.ok || !datos.ok) {
            alert(datos.error || 'No se pudo enviar el reporte.');
            return;
        }
        boton.textContent = '✓ Reportado';
        boton.disabled = true;
    } catch (err) {
        alert('No se pudo conectar con el servidor.');
    }
}

// ===== AUTOAYUDA =====
function mostrarGeneradorAutoayuda() {
    const contenidoEstatico = document.getElementById('contenido-estatico-autoayuda');
    const generadorInteractivo = document.getElementById('generador-impulsos');
    const botonMaster = document.getElementById('btn-master-autoayuda');

    if (generadorInteractivo.classList.contains('despliegue-oculto')) {
        contenidoEstatico.classList.add('despliegue-oculto');
        generadorInteractivo.classList.remove('despliegue-oculto');
        botonMaster.innerText = "VER MENOS";
    } else {
        generadorInteractivo.classList.add('despliegue-oculto');
        contenidoEstatico.classList.remove('despliegue-oculto');
        botonMaster.innerText = "LEER MAS";
    }
}

const listaRecordatorios = [
    "Tu valor no disminuye por los errores del pasado. Hoy es una nueva oportunidad.",
    "Dedica un minuto completo a respirar de manera consciente antes de reaccionar.",
    "Sanar no es un proceso lineal. Respeta tu propio ritmo, lo estás haciendo bien.",
    "Está bien poner límites. Decir 'no' a otros a veces es un necesario 'sí' a ti misma.",
    "No tienes que controlarlo todo. Confía en tu proceso y enfócate en tu paso presente.",
    "Tu sensibilidad no es una debilidad, es una brújula que te muestra tu empatía."
];

function generarNuevaFrase() {
    const parrafoFrase = document.getElementById('texto-afirmacion');
    parrafoFrase.style.opacity = "0";

    setTimeout(() => {
        let fraseAleatoria;
        do {
            fraseAleatoria = listaRecordatorios[Math.floor(Math.random() * listaRecordatorios.length)];
        } while (`"${fraseAleatoria}"` === parrafoFrase.innerText);

        parrafoFrase.innerText = `"${fraseAleatoria}"`;
        parrafoFrase.style.opacity = "1";
    }, 250);
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
