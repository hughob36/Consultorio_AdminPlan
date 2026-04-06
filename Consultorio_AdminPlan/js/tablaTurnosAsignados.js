$(document).ready(function() {
    // 1. Inicializar DataTable
    const tablaUsuarios = $('#dataTable').DataTable();

    // 2. Función para cargar los datos
    function cargarUsuarios() {
        // Obtenemos el JWT guardado en el Login
        const token = localStorage.getItem('token'); 

        if (!token) {
            alert("Sesión no encontrada. Por favor, inicia sesión.");
            window.location.href = 'login.html';
            return;
        }

        fetch('http://localhost:8080/api/appointment', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token, // IMPORTANTE: Enviamos el token
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No tienes permisos o tu sesión expiró.');
            }
            if (!response.ok) throw new Error('Error al obtener turnos.');
            return response.json();
        })
        .then(turnos => {
            tablaUsuarios.clear();

            turnos.forEach(turno => {
                
            // Como 'user' y 'specialist' son objetos (no listas), 
            // accedemos directamente a sus propiedades. 
            // Nota: Asegúrate si en tu JS la propiedad es 'username', 'nombre', etc.
            const nombreUsuario = turno.user ? `${turno.user.name} ${turno.user.lastname}` : 'N/A';
            const nombreEspecialista = turno.specialist ? `${turno.specialist.name} ${turno.specialist.lastname}` : 'N/A';

            const botones = `
                <div class="text-center">                

                    <button class="btn btn-primary btn-sm shadow-sm" onclick="cambiarEstado(${turno.id}, 'IN_PROGRESS')" 
                        title="Iniciar Turno">
                        <i class="fas fa-play"></i>
                    </button>

                    <button class="btn btn-success btn-sm shadow-sm" 
                            onclick="cambiarEstado(${turno.id}, 'COMPLETED')" title="Finalizar Turno">
                        <i class="fas fa-check-double"></i>
                    </button>
                </div>
            `;

            tablaUsuarios.row.add([
                turno.date,
                turno.time,                
                nombreUsuario,
                nombreEspecialista,
                turno.appointmentStatus,
                botones
            ]);
        });
            

            tablaUsuarios.draw();
        })
        .catch(error => {
            console.error('Error:', error);
            // alert(error.message);
        });
    }

    cargarUsuarios();
});

function cambiarEstado(id, nuevoEstado) {
    // 1. Mensaje de confirmación personalizado
    const accion = nuevoEstado === 'IN_PROGRESS' ? 'iniciar' : 'completar';
    if (!confirm(`¿Estás seguro de que deseas ${accion} este turno?`)) {
        return;
    }

    // 2. Obtener el token de seguridad
    const token = localStorage.getItem('token'); // Ajusta según donde guardes tu JWT

    // 3. Petición al endpoint @PatchMapping("/{id}")
    fetch(`http://localhost:8080/api/appointment/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // Enviamos el String del Enum directamente en el cuerpo
        body: JSON.stringify(nuevoEstado) 
    })
    .then(response => {
        if (response.status === 202) {
            return response.json();
        } else if (response.status === 403) {
            throw new Error("No tienes permisos suficientes (se requiere rol ADMIN).");
        } else if (response.status === 404) {
            throw new Error("El turno no fue encontrado en la base de datos.");
        } else {
            throw new Error("Error inesperado al cambiar el estado.");
        }
    })
    .then(data => {
        console.log("Éxito:", data);
        alert(`Turno actualizado a: ${nuevoEstado}`);
        
        // 4. Refrescar los datos (si tienes una función cargarUsuarios o similar)
        if (typeof cargarUsuarios === 'function') {
            cargarUsuarios(); 
        } else {
            location.reload(); // Recarga la página como plan B
        }
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert(error.message);
    });
}