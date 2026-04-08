//oculta botones de usuarios no logeados
document.addEventListener("DOMContentLoaded", () => {    
    const elementosPrivados = document.querySelectorAll('.menu-privado');
    const token = localStorage.getItem('token'); 

    if (token) {        
        elementosPrivados.forEach(el => {
            el.classList.remove('d-none');
        });
    } else {
        elementosPrivados.forEach(el => {
            el.classList.add('d-none');
        });
    }
});

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