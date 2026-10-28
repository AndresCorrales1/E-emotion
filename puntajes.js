// Envía el puntaje al servidor y avisa al jugador. Se usa en los 4 juegos.
(function () {
    let avisoRegistroMostrado = false;

    function mostrarAviso(texto, bueno) {
        const div = document.createElement('div');
        div.textContent = texto;
        div.style.cssText =
            'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;' +
            'max-width:90vw;padding:12px 20px;border-radius:14px;font:600 14px system-ui,sans-serif;' +
            'box-shadow:0 6px 20px rgba(0,0,0,.25);color:#fff;text-align:center;' +
            'background:' + (bueno ? '#16a34a' : '#6d28d9') + ';';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    window.enviarPuntaje = async function (juego, puntaje, tiempo) {
        try {
            const resp = await fetch('phh/guardar_puntaje.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ juego, puntaje: Math.round(puntaje), tiempo: Math.round(tiempo) })
            });

            if (resp.status === 401) {
                if (!avisoRegistroMostrado) {
                    avisoRegistroMostrado = true;
                    mostrarAviso('Para guardar tu puntaje, regístrate primero en la página de Juegos.', false);
                }
                return;
            }

            const datos = await resp.json();
            if (!resp.ok || !datos.ok) {
                mostrarAviso('No se pudo guardar tu puntaje.', false);
                return;
            }
            mostrarAviso('✅ Puntaje guardado: ' + Math.round(puntaje) + ' pts (tu mejor: ' + datos.mejor + ')', true);
        } catch (e) {
            mostrarAviso('No se pudo conectar con el servidor.', false);
        }
    };
})();
