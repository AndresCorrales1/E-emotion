document.addEventListener('DOMContentLoaded', function() {
    const boton = document.getElementById('btn-desplegar');
    const texto = document.getElementById('texto-presentacion');

    if (boton && texto) {
        boton.addEventListener('click', function() {
            // Alterna la clase 'oculto'
            if (texto.classList.contains('oculto')) {
                texto.classList.remove('oculto');
            } else {
                texto.classList.add('oculto');
            }
        });
    }
});

document.addEventListener('click', (e) => {
    const btn106 = e.target.closest('.btn-106');
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (btn106 && !esMovil) {
        e.preventDefault();
        alert('Para realizar la llamada directamente debes contar con un dispositivo móvil o tener tu celular vinculado al computador.');
    }
});