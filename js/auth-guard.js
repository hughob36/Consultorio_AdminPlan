(function() {
    const token = localStorage.getItem('token');    
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    //funcion decodifica
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch (e) {
            return null;
        }
    }

    const payload = parseJwt(token);

    // 3. Verificar si el token expiro(recomendado)
    const currentTime = Date.now() / 1000;
    if (!payload || payload.exp < currentTime) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }
    // 4. Proteccion ADM
    // Si la página actual es 'tables.html', solo entra si es ROLE_ADMIN

    const paginasAdmin = [
    'tables.html', 
    'tablaEspecialistas.html', 
    'tablaTurnosAsignados.html', 
    'registrarEspecialista.html'
    ];

    // Comprobamos si la URL actual coincide con alguna del array
    const esPaginaProtegida = paginasAdmin.some(pagina => window.location.pathname.includes(pagina));

    if (esPaginaProtegida) {
        const esAdmin = payload.authorities && payload.authorities.includes("ADMIN");
        if (!esAdmin) {            
            window.location.href = 'userPerfil.html';
        }
    }
})();

