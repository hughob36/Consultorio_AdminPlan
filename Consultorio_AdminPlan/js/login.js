
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
                    // Guardar el token que viene en tu AuthResponseDTO
                    localStorage.setItem('token', data.jwt); 
                    //alert("¡Login exitoso! Bienvenido " + data.userName);
                    
                    localStorage.setItem('nombreUsuario', data.username);

                    console.log("Token guardado con éxito.");
                    window.location.href = 'tables.html';
                } else {
                    // Manejo de errores del backend (401, 403, etc)
                    alert("Error: " + (data.message || "Credenciales incorrectas"));
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                alert("No se pudo conectar con el servidor.");
            }
        }
   