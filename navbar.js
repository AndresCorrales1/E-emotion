/* ============================================================
   Barra de navegación inteligente (móvil)
   - Al bajar por la página, la barra se oculta para no tapar el contenido.
   - Al subir un poco, vuelve a aparecer para poder navegar.
   - Siempre se muestra cuando estás arriba del todo.
   El efecto visual solo se aplica en pantallas <= 768px (ver style.css).
   ============================================================ */
(function () {
    'use strict';

    var header = document.querySelector('.header');
    if (!header) return;

    var CLASE_OCULTO = 'header--oculto';
    var UMBRAL = 8;           // px mínimos de movimiento para reaccionar (evita parpadeos)
    var ultimoScroll = window.pageYOffset || 0;
    var enEspera = false;

    function mostrar() { header.classList.remove(CLASE_OCULTO); }
    function ocultar() { header.classList.add(CLASE_OCULTO); }

    function actualizar() {
        enEspera = false;

        var actual = window.pageYOffset || document.documentElement.scrollTop || 0;
        var alturaHeader = header.offsetHeight;

        // Arriba del todo (o rebote de iOS con valores negativos): siempre visible
        if (actual <= alturaHeader) {
            mostrar();
            ultimoScroll = Math.max(actual, 0);
            return;
        }

        var diferencia = actual - ultimoScroll;
        if (Math.abs(diferencia) < UMBRAL) return;

        if (diferencia > 0) {
            ocultar();   // bajando
        } else {
            mostrar();   // subiendo
        }
        ultimoScroll = actual;
    }

    window.addEventListener('scroll', function () {
        if (!enEspera) {
            enEspera = true;
            window.requestAnimationFrame(actualizar);
        }
    }, { passive: true });

    // Accesibilidad: si alguien navega con teclado hacia un enlace del menú, que se vea
    header.addEventListener('focusin', mostrar);

    // Si se gira el celular o cambia el tamaño, volver a mostrarla
    window.addEventListener('resize', mostrar);
})();
