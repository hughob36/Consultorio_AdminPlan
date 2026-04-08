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

        fetch('http://localhost:8080/api/user', {
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
            if (!response.ok) throw new Error('Error al obtener usuarios.');
            return response.json();
        })
        .then(usuarios => {
            tablaUsuarios.clear();

            usuarios.forEach(user => {
                // Mapear los roles. Si user.roleList viene como objetos:
                const rolesStr = user.roleList.map(r => r.role).join(', ');

                const botones = `
                    <div class="text-center">
                        <button class="btn btn-warning btn-sm shadow-sm" onclick="editarUsuario(${user.id})" title="Editar Usuario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarUsuario(${user.id})" title="Eliminar Usuario">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-info btn-sm shadow-sm" onclick="infoUsuario(${user.id})" title="Info Usuario">
                             <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="btn btn-primary btn-sm shadow-sm" onclick="asignarTurno(${user.id})" title="Asignar Turno">
                            <i class="fas fa-clock"></i>
                        </button>
                    </div>
                `;

                tablaUsuarios.row.add([
                    user.name,
                    user.lastname,
                    user.email,
                    user.userName,
                    rolesStr,
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


// --- FUNCIONES GLOBALES ---
function eliminarUsuario(id) {
    const token = localStorage.getItem('token');

    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch(`http://localhost:8080/api/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Usuario eliminado con éxito");
                location.reload(); // Recarga la página para refrescar la tabla
            } else {
                alert("No se pudo eliminar el usuario.");
            }
        })
        .catch(err => console.error("Error al eliminar:", err));
    }
}

function infoUsuario(id) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/user/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo obtener los datos");
        }
        return response.json(); // Convertimos la respuesta a JSON
    })
    .then(user => {
        // 1. Insertar los datos del DTO en el HTML
        document.getElementById('modalName').textContent = user.name;
        document.getElementById('modalLastname').textContent = user.lastname;
        document.getElementById('modalEmail').textContent = user.email;
        document.getElementById('modalUserName').textContent = user.userName;

        // 2. Mostrar el modal (Si usas Bootstrap 5)
        const myModal = new bootstrap.Modal(document.getElementById('userModal'));
        myModal.show();
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Error al cargar los datos del usuario.");
    });
}


// 1. Función que se activa al hacer clic en el botón de la tabla
function editarUsuario(id) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/user/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("No se pudo obtener la información del usuario.");
        return response.json();
    })
    .then(user => {
        // Llenamos los inputs del modal con los datos recibidos
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editLastname').value = user.lastname;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editUserName').value = user.userName;
        document.getElementById('editPassword').value = user.password;

        // Abrimos el modal programáticamente (Bootstrap 5)
        const modalElement = document.getElementById('editarUsuarioModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    })
    .catch(error => {
        console.error("Error al cargar usuario:", error);
        alert("Error al cargar los datos del usuario.");
    });
}

// 2. Event Listener para el envío del formulario (fuera de la función anterior)
document.addEventListener('DOMContentLoaded', function() {
    const formEditar = document.getElementById('formEditarUsuario');
    
    if (formEditar) {
        formEditar.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitamos que la página se recargue

            const id = document.getElementById('editUserId').value;
            const token = localStorage.getItem('token');

            // Creamos el objeto con los datos actualizados
            const usuarioData = {
                name: document.getElementById('editName').value,
                lastname: document.getElementById('editLastname').value,
                email: document.getElementById('editEmail').value,
                userName: document.getElementById('editUserName').value,
                password: document.getElementById('editPassword').value,
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

            // Enviamos la petición PUT al backend
            fetch(`http://localhost:8080/api/user/${id}`, {
                method: 'PUT', // Asegúrate de que tu backend use PUT para actualizaciones
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuarioData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Usuario actualizado con éxito");
                    location.reload(); // Refrescamos la tabla para ver los cambios
                } else {
                    alert("Error al intentar actualizar el usuario.");
                }
            })
            .catch(error => {
                console.error("Error en la petición:", error);
                alert("Hubo un problema con la conexión.");
            });
        });
    }
});


// Función asignar turnos
function asignarTurno(idUsuario) {
    const token = localStorage.getItem('token');
    // 1. Guardamos el ID del usuario en el input oculto
    document.getElementById('userIdTurno').value = idUsuario;
    
    // 2. Cargamos los especialistas desde tu API
    fetch('http://localhost:8080/api/specialist', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, 
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(especialistas => {
        const select = document.getElementById('selectEspecialista');
        select.innerHTML = '<option value="">Seleccione un especialista...</option>'; // Limpiar
        
        especialistas.forEach(e => {
            const option = document.createElement('option');
            option.value = e.id;
            // Mostramos Nombre, Apellido y Especialidad como pediste
            option.textContent = `${e.name} ${e.lastname} - ${e.specialty}`;
            select.appendChild(option);
        });

        // 3. Mostramos el modal (usando Bootstrap 5)
        const myModal = new bootstrap.Modal(document.getElementById('modalTurno'));
        myModal.show();
    })
    .catch(error => console.error('Error cargando especialistas:', error));
}

// Función para registrar el turno en la BD
function guardarTurno() {
    const token = localStorage.getItem('token');

    const data = {
        date: document.getElementById('fechaTurno').value,
        time: document.getElementById('horaTurno').value,
        user: { id: document.getElementById('userIdTurno').value },
        specialist: { id: document.getElementById('selectEspecialista').value }
    };

    fetch('http://localhost:8080/api/appointment', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert("Turno asignado con éxito");
            bootstrap.Modal.getInstance(document.getElementById('modalTurno')).hide();
            window.location.href = 'tablaTurnosAsignados.html';
            location.reload(); // Opcional: recargar para ver cambios
        } else {
            alert("Error al asignar el turno");
        }
    });
}

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