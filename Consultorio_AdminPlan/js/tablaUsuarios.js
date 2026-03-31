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
                        <button class="btn btn-warning btn-sm shadow-sm" onclick="editarUsuario(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarUsuario(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-info btn-sm shadow-sm" onclick="infoUsuario(${user.id})">
                             <i class="fas fa-info-circle"></i>
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

function editarUsuario(id) {
    // Por ahora solo logueamos, podrías abrir un modal aquí
    console.log("Redirigiendo a edición del usuario:", id);
    // window.location.href = `editarUsuario.html?id=${id}`;
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