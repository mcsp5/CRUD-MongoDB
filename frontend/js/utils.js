const API_URL = 'http://localhost:3000/api';

// Función para manejar las peticiones HTTP
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error en la petición');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// Función para mostrar mensajes de alerta
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Función para actualizar la UI según el estado de autenticación
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const authRequired = document.querySelectorAll('.auth-required');
    const authHidden = document.querySelectorAll('.auth-hidden');

    authRequired.forEach(el => {
        el.style.display = token ? 'block' : 'none';
    });

    authHidden.forEach(el => {
        el.style.display = token ? 'none' : 'block';
    });
} 