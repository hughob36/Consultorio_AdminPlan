$(document).ready(function() {
    
    const tablaEspecialistas = $('#dataTable').DataTable();
    
    function cargarEspecialistas() {
        
        const token = localStorage.getItem('token'); 

        if (!token) {
            alert("Sesión no encontrada. Por favor, inicia sesión.");
            window.location.href = 'login.html';
            return;
        }

        fetch('http://localhost:8080/api/specialist', {
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
            if (!response.ok) throw new Error('Error al obtener especialistas.');
            return response.json();
        })
        .then(usuarios => {
            tablaEspecialistas.clear();

            usuarios.forEach(user => {       
                
                const botones = `
                    <div class="text-center">
                        <button class="btn btn-warning btn-sm shadow-sm" onclick="editarUsuario(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarUsuario(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-info btn-sm shadow-sm" onclick="infoEspecialista(${user.id})">
                             <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                `;

                tablaEspecialistas.row.add([
                    user.name,
                    user.lastname,
                    user.specialty,
                    user.active,                    
                    botones
                ]);
            });

            tablaEspecialistas.draw();
        })
        .catch(error => {
            console.error('Error:', error);
            // alert(error.message);
        });
    }

    cargarEspecialistas();
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

function infoEspecialista(id) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/specialist/${id}`, {
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
        document.getElementById('modalEspecialidad').textContent = user.specialty;
        const elActive = document.getElementById('modalActive');
        if (elActive) {
            elActive.textContent = user.active ? "Activo" : "Inactivo";
            elActive.className = user.active ? "text-success fw-bold" : "text-danger fw-bold";
        }          
        
        const myModal = new bootstrap.Modal(document.getElementById('especialistaModal'));
        myModal.show();
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Error al cargar los datos del especialista.");
    });
}