$(document).ready(function() {
    
    const tablaUsuarios = $('#dataTable').DataTable();
    
    function cargarUsuarios() {
        
        const token = localStorage.getItem('token');
        const userId = obtenerIdDesdeJWT(token); 

        console.log(userId);

        if (!token) {
            alert("Sesión no encontrada. Por favor, inicia sesión.");
            window.location.href = 'login.html';
            return;
        }

        fetch(`https://consultorio-turnos.onrender.com/api/appointment/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No tienes permisos o tu sesión expiró.');
            }
            if (!response.ok) throw new Error('Error al obtener turnos o no tiene turnos.');
            return response.json();
        })
        .then(turnos => {
            tablaUsuarios.clear();

            turnos.forEach(turno => {                
            
            const nombreUsuario = turno.user ? `${turno.user.name} ${turno.user.lastname}` : 'N/A';
            const nombreEspecialista = turno.specialist ? `${turno.specialist.name} ${turno.specialist.lastname}` : 'N/A';

            const botones = `
                <div class="text-center">
                    <button class="btn btn-danger btn-sm shadow-sm" onclick="cambiarEstado(${turno.id}, 'CANCELED')" 
                        title="Cancelar Turno">
                        <i class="fas fa-ban"></i>
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
        });
    }

    cargarUsuarios();
});


function cambiarEstado(id, nuevoEstado) {
        
    if (!confirm(`¿Estás seguro de que deseas CANCELAR este turno?`)) {
        return;
    }
    
    const token = localStorage.getItem('token'); 

    // 3. Petición al endpoint @PatchMapping("/{id}")
    fetch(`https://consultorio-turnos.onrender.com/api/appointment/${id}`, {
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
            throw new Error("No tienes permisos suficientes.");
        } else if (response.status === 404) {
            throw new Error("El turno no fue encontrado en la base de datos.");
        } else {
            throw new Error("Error inesperado al cambiar el estado.");
        }
    })
    .then(data => {       
        location.reload();         
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert(error.message);
    });
}

//obtener ID
function obtenerIdDesdeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.userId; 
    } catch (e) {
        return null;
    }
}

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