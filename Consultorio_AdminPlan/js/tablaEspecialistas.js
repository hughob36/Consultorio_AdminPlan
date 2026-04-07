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
                        <button class="btn btn-warning btn-sm shadow-sm" onclick="editarUsuario(${user.id})" title="Editar Especialista">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarUsuario(${user.id})" title="Desactivar Especialista">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-info btn-sm shadow-sm" onclick="infoEspecialista(${user.id})"title="Info Especialista">
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

    if (confirm("¿Estás seguro de que deseas eliminar este Especialista?")) {
        fetch(`http://localhost:8080/api/specialist/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Especialista eliminado con éxito");
                location.reload(); 
            } else {
                alert("No se pudo eliminar el Especialista.");
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

// 1. Función que se activa al hacer clic en el botón de la tabla
function editarUsuario(id) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/specialist/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("No se pudo obtener la información del especialista.");
        return response.json();
    })
    .then(user => {
        // Llenamos los inputs del modal con los datos recibidos
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editLastname').value = user.lastname;
        document.getElementById('editSpecialist').value = user.specialty;
        document.getElementById('editActive').value = user.active;        

        // Abrimos el modal programáticamente (Bootstrap 5)
        const modalElement = document.getElementById('editarEspecialistaModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    })
    .catch(error => {
        console.error("Error al cargar especialistas:", error);
        alert("Error al cargar los datos del especialista.");
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
                specialty: document.getElementById('editSpecialist').value,
                active: document.getElementById('editActive').value,               
            };

            // Enviamos la petición PUT al backend
            fetch(`http://localhost:8080/api/specialist/${id}`, {
                method: 'PUT', 
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuarioData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Especialista actualizado con éxito");
                    location.reload(); 
                } else {
                    alert("Error al intentar actualizar el especialista.");
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
            console.log("Sesión cerrada, eliminando token...");
            window.location.href = "index.html";
        });
    }
});