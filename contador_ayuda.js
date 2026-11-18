// contador de cuantas personas tocan los botones de ayuda (whatsapp y 106)
// debajo de cada uno aparece un mensaje con cuantas personas lo tocaron
(function () {
    const BOTONES = {
        '.btn-whatsapp': 'whatsapp',
        '.btn-106': 'linea106'
    };
    const totales = { whatsapp: 0, linea106: 0 };
    const etiquetas = {};

    function yaContado(boton) {
        try { return localStorage.getItem('ayuda_contada_' + boton) === '1'; }
        catch (e) { return false; }
    }

    function marcarContado(boton, valor) {
        try {
            if (valor) localStorage.setItem('ayuda_contada_' + boton, '1');
            else localStorage.removeItem('ayuda_contada_' + boton);
        } catch (e) { /* sin almacenamiento disponible */ }
    }

    // Texto debajo de cada boton
    function crearEtiquetas() {
        for (const selector in BOTONES) {
            const btn = document.querySelector(selector);
            if (!btn || !btn.parentNode) continue;
            const p = document.createElement('span');
            p.className = 'ayuda-contador';
            p.setAttribute('aria-live', 'polite');
            p.hidden = true;
            btn.parentNode.insertBefore(p, btn.nextSibling);
            etiquetas[BOTONES[selector]] = p;
        }
    }

    function pintar(boton) {
        const p = etiquetas[boton];
        if (!p) return;
        const n = totales[boton];
        if (n < 1) { p.hidden = true; return; } // con 0 no se muestra nada
        const num = n.toLocaleString('es-CO');
        p.textContent = n === 1
            ? 'Ya 1 persona dio el paso más difícil 💜'
            : 'Ya ' + num + ' personas dieron el paso más difícil 💜';
        p.hidden = false;
    }

    function cargarTotales() {
        return fetch('phh/ver_contador_ayuda.php', { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d || !d.ok) return;
                totales.whatsapp = d.whatsapp | 0;
                totales.linea106 = d.linea106 | 0;
                pintar('whatsapp');
                pintar('linea106');
            })
            .catch(function () { /* si falla, simplemente no se muestra el texto */ });
    }

    // Envía el conteo. sendBeacon sigue funcionando aunque la página se cierre o pase
    // a segundo plano al abrir tel: o WhatsApp (en el celular fetch suele cancelarse).
    function enviarConteo(boton) {
        const cuerpo = JSON.stringify({ boton: boton });

        if (navigator.sendBeacon) {
            const encolado = navigator.sendBeacon(
                'phh/contar_ayuda.php',
                new Blob([cuerpo], { type: 'text/plain' })
            );
            if (encolado) { marcarContado(boton, true); return; }
        }

        // Respaldo si el navegador no soporta sendBeacon
        fetch('phh/contar_ayuda.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: cuerpo,
            keepalive: true
        }).then(function (r) {
            if (r.ok) { marcarContado(boton, true); return; }
            totales[boton] = Math.max(0, totales[boton] - 1);
            pintar(boton);
        }).catch(function () {
            totales[boton] = Math.max(0, totales[boton] - 1);
            pintar(boton);
        });
    }

    // Conteo
    document.addEventListener('click', function (e) {
        for (const selector in BOTONES) {
            if (!e.target.closest(selector)) continue;

            const boton = BOTONES[selector];
            if (yaContado(boton)) return;

            // Se refleja de inmediato en pantalla
            totales[boton] += 1;
            pintar(boton);

            enviarConteo(boton);
            return;
        }
    }, true);

    function iniciar() {
        crearEtiquetas();
        cargarTotales();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
