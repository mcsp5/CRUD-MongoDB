class Auth {
    static async login(email, password) {
        try {
            const data = await fetchAPI('/usuarios/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            updateAuthUI();
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async registro(userData) {
        try {
            const data = await fetchAPI('/usuarios/registro', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        updateAuthUI();
        window.location.href = '/';
    }

    static getUsuario() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
}

// Event Listeners
document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
});

// Actualizar UI al cargar
document.addEventListener('DOMContentLoaded', updateAuthUI); 