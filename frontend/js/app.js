document.addEventListener('DOMContentLoaded', async function() {
    // Cargar categorías en el filtro
    try {
        const categorias = await RecetasService.getCategorias();
        const categoriaSelect = document.getElementById('categoria-filter');
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria._id;
            option.textContent = categoria.nombre;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }

    // Event listeners para filtros
    document.getElementById('categoria-filter').addEventListener('change', aplicarFiltros);
    document.getElementById('dificultad-filter').addEventListener('change', aplicarFiltros);
    
    let timeoutId;
    document.getElementById('busqueda').addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            aplicarFiltros();
        }, 300);
    });

    // Cargar recetas iniciales
    await aplicarFiltros();
});

async function aplicarFiltros() {
    try {
        const categoria = document.getElementById('categoria-filter').value;
        const dificultad = document.getElementById('dificultad-filter').value;
        const busqueda = document.getElementById('busqueda').value;

        const filtros = {};
        if (categoria) filtros.categoria = categoria;
        if (dificultad) filtros.dificultad = dificultad;
        if (busqueda) filtros.busqueda = busqueda;

        const recetas = await RecetasService.getRecetas(filtros);
        const recetasList = document.getElementById('recetas-list');
        recetasList.innerHTML = recetas.map(receta => renderReceta(receta)).join('');
    } catch (error) {
        showAlert('Error al cargar las recetas: ' + error.message, 'danger');
    }
}

// Funciones para editar y eliminar recetas
async function editarReceta(id) {
    window.location.href = `/pages/nueva-receta.html?id=${id}`;
}

async function eliminarReceta(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
        try {
            await RecetasService.eliminarReceta(id);
            showAlert('Receta eliminada exitosamente', 'success');
            aplicarFiltros();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    }
}