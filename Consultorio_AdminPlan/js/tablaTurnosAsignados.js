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
                    <button class="btn btn-warning btn-sm shadow-sm" onclick="editarTurno(${turno.id})" title="Editar Turno">
                        <i class="fas fa-edit"></i>
                    </button>                

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

function editarEspecialista(id, nuevoEstado) {
    // 1. Mensaje de confirmación personalizado
    const accion = nuevoEstado === 'IN_PROGRESS' ? 'iniciar' : 'completar';
    if (!confirm(`¿Estás seguro de que deseas ${accion} este turno?`)) {
        return;
    }

    // 2. Obtener el token de seguridad
    const token = localStorage.getItem('token'); 

    // 3. Petición al endpoint @PatchMapping("/{id}")
    fetch(`http://localhost:8080/api/appointment/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        
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
        
        // 4. Refrescar los datos 
        if (typeof cargarUsuarios === 'function') {
            cargarUsuarios(); 
        } else {
            location.reload(); 
        }
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert(error.message);
    });
}

function editarTurno(id) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/appointment/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("No se pudo obtener la información del turno.");
        return response.json();
    })
    .then(turno => {
        // Llenamos los inputs del modal con los datos recibidos
        document.getElementById('editTurnoId').value = turno.id;
        document.getElementById('editDate').value = turno.date;
        document.getElementById('editTime').value = turno.time;
        document.getElementById('editAppointmentStatus').value = turno.appointmentStatus;        
        document.getElementById('editUserId').value = turno.user.id;
        document.getElementById('editSpecialistId').value = turno.specialist.id,
        document.getElementById('editSpecialist').value = turno.specialist.name  +" "+turno.specialist.lastname;        

        // Abrimos el modal programáticamente (Bootstrap 5)
        const modalElement = document.getElementById('editarTurnoModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    })
    .catch(error => {
        console.error("Error al cargar turno:", error);
        alert("Error al cargar los datos del turno.");
    });
}

// 2. Event Listener para el envío del formulario (fuera de la función anterior)
document.addEventListener('DOMContentLoaded', function() {    
    const formEditar = document.getElementById('formEditarTurno');   
    
    if (formEditar) {
        formEditar.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const id = document.getElementById('editTurnoId').value;
            const token = localStorage.getItem('token');

        console.log(token);

            // Creamos el objeto con los datos actualizados
            const turnoData = {
                date: document.getElementById('editDate').value,
                time: document.getElementById('editTime').value,
                appointmentStatus: "SCHEDULED",//document.getElementById('editSpecialist').value,
                user: { id: document.getElementById('editUserId').value },
                specialist: { id: document.getElementById('editSpecialistId').value }               
            };

            // Enviamos la petición PUT al backend
            fetch(`http://localhost:8080/api/appointment/${id}`, {
                method: 'PUT', 
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(turnoData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Turno actualizado con éxito");
                    location.reload(); 
                } else {
                    alert("Error al intentar actualizar el turno.");
                }
            })
            .catch(error => {
                console.error("Error en la petición:", error);
                alert("Hubo un problema con la conexión.");
            });
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