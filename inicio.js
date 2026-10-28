document.addEventListener('click', (e) => {
    const btn106 = e.target.closest('.btn-106');
    if (btn106) {
        e.preventDefault();
        alert('Para realizar la llamada directamente debes contar con un dispositivo móvil o tener tu celular vinculado al computador.');
    }
});