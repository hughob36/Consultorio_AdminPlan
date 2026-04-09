
async function ejecutarLogin() {
    console.log("Iniciando proceso de login...");
    
    // 1. Obtener valores
    const emailValue = document.getElementById('exampleInputEmail').value;
    const passValue = document.getElementById('exampleInputPassword').value;

    // 2. Validación básica
    if (!emailValue || !passValue) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    console.log("Intentando conectar con Spring Boot...");

    try {
        // 3. Petición Fetch
        //direccion render: https://consultorio-turnos.onrender.com/auth/login
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: emailValue,
                password: passValue
            })
        });

        // 4. Procesar respuesta
        const data = await response.json();
        console.log("Respuesta recibida:", data);        

        if (response.ok) {
            localStorage.setItem('token', data.jwt);
            localStorage.setItem('nombreUsuario', data.username);
        
            // Decodificamos el token usando la función de arriba
            const payload = parseJwt(data.jwt);
        
            if (payload && payload.authorities) {
                // Como en tu imagen authorities es "CREATE, ROLE_ADMIN", 
                // usamos .includes() para verificar si contiene el rol de administrador
                const esAdmin = payload.authorities.includes("ROLE_ADMIN");
            
                if (esAdmin) {
                    console.log("Acceso concedido como ADMIN");
                    window.location.href = 'tables.html';
                } else {
                    console.log("Acceso como USER");
                    window.location.href = 'userProfile.html';
                }
            } else {
                console.error("No se encontraron permisos en el token.");                
                window.location.href = 'index.html';
            }
        }
      

    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}
   
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el JWT", e);
        return null;
    }
}