document.addEventListener('DOMContentLoaded', function () {

    const registroForm = document.querySelector('form.user');

    registroForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('exampleFirstName').value;
        const apellido = document.getElementById('exampleLastName').value;
        const nombreUsuario = document.getElementById('exampleInputUserName').value;
        const email = document.getElementById('exampleInputEmail').value;
        const password = document.getElementById('exampleInputPassword').value;
        const repeatPassword = document.getElementById('exampleRepeatPassword').value;

        if (password !== repeatPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        
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
                    "id": 2          
                }              
            ]
        };

        try {
            const response = await fetch('https://consultorio-turnos.onrender.com/api/user', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'                    
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                alert("¡Usuario registrado con éxito!");
                window.location.href = 'login.html'; 
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