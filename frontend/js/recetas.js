class RecetasService {
    static async getRecetas(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        return await fetchAPI(`/recetas?${queryParams}`);
    }

    static async getReceta(id) {
        return await fetchAPI(`/recetas/${id}`);
    }

    static async crearReceta(receta) {
        return await fetchAPI('/recetas', {
            method: 'POST',
            body: JSON.stringify(receta)
        });
    }

    static async actualizarReceta(id, receta) {
        return await fetchAPI(`/recetas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(receta)
        });
    }

    static async eliminarReceta(id) {
        return await fetchAPI(`/recetas/${id}`, {
            method: 'DELETE'
        });
    }

    static async getCategorias() {
        try {
            const response = await fetchAPI('/categorias');
            console.log('Respuesta de categorías:', response);
            return response;
        } catch (error) {
            console.error('Error en getCategorias:', error);
            throw error;
        }
    }
}

// Función para renderizar una receta
function renderReceta(receta) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${receta.nombre}</h5>
                    <p class="card-text">${receta.descripcion.substring(0, 100)}...</p>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> ${receta.tiempo_preparacion} min
                            <span class="ml-2"><i class="fas fa-signal"></i> ${receta.dificultad}</span>
                        </small>
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="verReceta('${receta._id}')">
                        Ver Detalles
                    </button>
                    ${Auth.isAuthenticated() && Auth.getUsuario().id === receta.id_usuario ? `
                        <button class="btn btn-warning btn-sm" onclick="editarReceta('${receta._id}')">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarReceta('${receta._id}')">
                            Eliminar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Función para mostrar los detalles de una receta
async function verReceta(id) {
    try {
        const receta = await RecetasService.getReceta(id);
        const modal = $('#recetaModal');
        modal.find('.modal-title').text(receta.nombre);
        modal.find('.modal-body').html(`
            <div class="receta-detalles">
                <p><strong>Descripción:</strong> ${receta.descripcion}</p>
                <p><strong>Tiempo de preparación:</strong> ${receta.tiempo_preparacion} minutos</p>
                <p><strong>Dificultad:</strong> ${receta.dificultad}</p>
                <h5>Ingredientes:</h5>
                <ul>
                    ${receta.ingredientes.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
        `);
        modal.modal('show');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
} 