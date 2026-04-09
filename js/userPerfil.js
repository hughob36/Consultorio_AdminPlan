document.addEventListener('DOMContentLoaded', function() {
    const btnLogout = document.getElementById('btnConfirmarLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', function() {            
            localStorage.removeItem('token');
            localStorage.clear();                         
            console.log("Sesión cerrada, eliminando token...");
            window.location.href = "index.html";
        });
    }
});