document.addEventListener('DOMContentLoaded', function () {

    const token = localStorage.getItem('token');    
    
    if (!token) {
        alert("Sesión expirada o no iniciada. Por favor, inicia sesión.");
        window.location.href = 'login.html';
        return; 
    }

    const registroForm = document.querySelector('form.user');

    registroForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('exampleFirstName').value;
        const apellido = document.getElementById('exampleLastName').value;
        const nombreUsuario = document.getElementById('exampleInputUserName').value;
        const email = document.getElementById('exampleInputEmail').value;
        const password = document.getElementById('exampleInputPassword').value;
        const role = document.getElementById('exampleInputRole').value;
        const repeatPassword = document.getElementById('exampleRepeatPassword').value;

        if (password !== repeatPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        let id = 2;
        if(role === "ADMIN") id = 1;    

        // Estructura idéntica a tu JSON de ejemplo
        const usuario = {
            name: nombre,            
            lastname: apellido,
            email: email,
            userName: nombreUsuario,            
            password: password,
            enable: true,
            accountNotExpired: true,
            accountNotLocked: true,
            credentialNotExpired: true,
            roleList: [
                {
                    "id": id          
                }              
            ]
        };

        try {
            const response = await fetch('http://localhost:8080/api/user', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // ¡ESTO FALTABA! Enviar el token al servidor
                    'Authorization': 'Bearer ' + token 
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                alert("¡Usuario registrado con éxito!");
                window.location.href = 'tables.html'; 
            } else {
                // Si el error es 403 o 401, el token probablemente venció
                if(response.status === 403 || response.status === 401) {
                    alert("No tienes permisos o tu sesión caducó.");
                } else {
                    const errorData = await response.json();
                    alert("Error al registrar: " + (errorData.message || "Intente de nuevo"));
                }
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});