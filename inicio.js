document.addEventListener('click', (e) => {
    const btn106 = e.target.closest('.btn-106');
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (btn106 && !esMovil) {
        e.preventDefault();
        alert('Para realizar la llamada directamente debes contar con un dispositivo móvil o tener tu celular vinculado al computador.');
    }
});