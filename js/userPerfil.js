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
    // 1. Obtener ID y Token del almacenamiento local
    const userId = obtenerIdDesdeJWT(token); // Deberías guardarlo al hacer login       

    if (!userId || !token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
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
        document.getElementById('perfilEmail').value = user.email || '';
        
        document.getElementById('perfilId').innerText = user.id || '0';

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

/**
 * Cambia los inputs de readonly a editables
 */
function habilitarEdicion() {
    const campos = ['perfilNombre', 'perfilApellido', 'perfilEmail'];
    campos.forEach(id => {
        document.getElementById(id).readOnly = false;
    });

    // Mostrar botón guardar, ocultar botón modificar
    document.getElementById('btnGuardar').classList.remove('d-none');
    event.target.closest('button').classList.add('d-none');
}

function obtenerIdDesdeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.userId;; // O payload.sub, depende de tu backend
    } catch (e) {
        return null;
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
            console.log("Sesión cerrada, eliminando token...");
            window.location.href = "index.html";
        });
    }
});