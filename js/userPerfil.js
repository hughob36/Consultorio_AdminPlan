document.addEventListener('DOMContentLoaded', function() {
    cargarDatosPerfil();

    // Escuchar el evento de guardado si es necesario
    const form = document.getElementById('formPerfil');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        guardarCambios();        
    });
});

/**
 * Obtiene los datos del usuario y los renderiza en la vista
 */
async function cargarDatosPerfil() {

    const token = localStorage.getItem('token');
    
    const userId = obtenerIdDesdeJWT(token);     

    if (!userId || !token) {
        window.location.href = 'login.html';
        return;
    }    

    try {
        const response = await fetch(`https://consultorio-turnos.onrender.com/api/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la información del perfil');
        }

        const user = await response.json();

        // 2. Mapear datos a los inputs del formulario
        document.getElementById('perfilNombre').value = user.name || '';
        document.getElementById('perfilApellido').value = user.lastname || '';
        document.getElementById('perfilUserName').value = user.userName || '';
        document.getElementById('perfilPassword').value = "**********" || '';
        document.getElementById('perfilEmail').value = user.email || '';
        
        document.getElementById('perfilId').innerText = userId || '0';
        document.getElementById('perfilId2').value = userId || '0';

        // 3. Mapear datos a los elementos visuales de la tarjeta lateral
        document.getElementById('txtNombreCompleto').innerText = `${user.name} ${user.lastname}`;
        document.getElementById('txtEmailSub').innerText = user.email;
        document.getElementById('txtNombreCabecera').innerText = user.name;

        // 4. Manejar roles si vienen en un array
        if (user.roleList && user.roleList.length > 0) {
            const rolesStr = user.roleList.map(r => r.role).join(', ');
            document.getElementById('badgeRoles').innerText = rolesStr;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos del perfil.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const btnToggle = document.getElementById('btnTogglePassword');
    const inputPass = document.getElementById('perfilPassword');
    const iconEye = document.getElementById('iconEye');

    if (btnToggle) {
        btnToggle.addEventListener('click', function () {
            // Cambiar el tipo de input
            const type = inputPass.getAttribute('type') === 'password' ? 'text' : 'password';
            inputPass.setAttribute('type', type);
            
            // Cambiar el icono del ojo
            iconEye.classList.toggle('fa-eye');
            iconEye.classList.toggle('fa-eye-slash');
        });
    }
});



/**
 * Cambia los inputs de readonly a editables
 */
function habilitarEdicion() {
    const campos = ['perfilNombre', 'perfilApellido', 'perfilEmail', 'perfilPassword'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.readOnly = false;
    });

    // Gestión de botones
    document.getElementById('btnModificar').classList.add('d-none'); // Ocultar modificar
    document.getElementById('btnGuardar').classList.remove('d-none'); // Mostrar guardar
    document.getElementById('btnCancelar').classList.remove('d-none'); // Mostrar cancelar
}

function cancelarEdicion() {
    const campos = ['perfilNombre', 'perfilApellido', 'perfilEmail', 'perfilPassword'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = true;
            //limpiar el campo password si escribieron algo
            if (id === 'perfilPassword') el.value = "";
        }
    });

    // Revertir botones
    document.getElementById('btnModificar').classList.remove('d-none'); // Mostrar modificar
    document.getElementById('btnGuardar').classList.add('d-none');    // Ocultar guardar
    document.getElementById('btnCancelar').classList.add('d-none');   // Ocultar cancelar

    // Opcional: Recargar los datos originales para deshacer cambios visuales no guardados
    cargarDatosPerfil(); 
}

function obtenerIdDesdeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.userId; // O payload.sub, depende de tu backend
    } catch (e) {
        return null;
    }
}

// 2. Event Listener para el envío del formulario EDITAR
function guardarCambios() {
    const formEditar = document.getElementById('formPerfil');
    
    if (formEditar) {
        formEditar.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitamos que la página se recargue

            const id = parseInt (document.getElementById('perfilId2').value);
            const token = localStorage.getItem('token');
            console.log(id);

            // Creamos el objeto con los datos actualizados
            const usuarioData = {
                name: document.getElementById('perfilNombre').value,
                lastname: document.getElementById('perfilApellido').value,
                email: document.getElementById('perfilEmail').value,                
                userName: document.getElementById('perfilUserName').value,
                password: document.getElementById('perfilPassword').value,                
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
            fetch(`https://consultorio-turnos.onrender.com/api/user/${id}`, {
                method: 'PUT', 
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
};

function eliminarUsuario() {
    const token = localStorage.getItem('token');
    const id = parseInt (document.getElementById('perfilId2').value)

    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch(`https://consultorio-turnos.onrender.com/api/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Usuario eliminado con éxito");
                localStorage.removeItem('token');
                localStorage.clear(); 
                window.location.href = 'index.html';
            } else {
                alert("No se pudo eliminar el usuario.");
            }
        })
        .catch(err => console.error("Error al eliminar:", err));
    }
}



/**
 * Lógica para cerrar sesión
 */
document.addEventListener('DOMContentLoaded', function() {
    const btnLogout = document.getElementById('btnConfirmarLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', function() {            
            localStorage.removeItem('token');
            localStorage.clear();            
            window.location.href = "index.html";
        });
    }
});