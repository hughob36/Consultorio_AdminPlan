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
        const especialidad = document.getElementById('exampleSpecialist').value;             

        // Estructura idéntica a tu JSON de ejemplo
        const usuario = {
            name: nombre,            
            lastname: apellido,
            specialty: especialidad,
            active: true   
        };       

        try {
            const response = await fetch('https://consultorio-turnos.onrender.com/api/specialist', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',                    
                    'Authorization': 'Bearer ' + token 
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                alert("¡Especialista registrado con éxito!");
                window.location.href = 'tablaEspecialistas.html'; 
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