const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function inicializarCategorias() {
    try {
        const categoriasExistentes = await db.collection('categorias').countDocuments();
        
        if (categoriasExistentes === 0) {
            const categoriasIniciales = [
                { nombre: 'Desayunos', descripcion: 'Recetas para el desayuno' },
                { nombre: 'Almuerzos', descripcion: 'Platos principales' },
                { nombre: 'Cenas', descripcion: 'Recetas ligeras para la cena' },
                { nombre: 'Postres', descripcion: 'Dulces y postres' },
                { nombre: 'Bebidas', descripcion: 'Bebidas y cócteles' },
                { nombre: 'Snacks', descripcion: 'Aperitivos y bocadillos' }
            ];

            await db.collection('categorias').insertMany(categoriasIniciales);
            console.log('Categorías inicializadas correctamente');
        }
    } catch (error) {
        console.error('Error al inicializar categorías:', error);
    }
}

client.connect(async err => {
    if (err) {
        console.error('Error conectando a MongoDB:', err);
        return;
    }
    db = client.db('recetas');
    console.log('Conectado a la base de datos MongoDB');
    
    // Inicializar categorías
    await inicializarCategorias();
});

// Proteger rutas que requieren autenticación
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    try {
        const id_usuario = parseInt(Buffer.from(token, 'base64').toString().split('-')[0]);
        req.usuario = { id: id_usuario };
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token inválido' });
    }
};

// RUTAS DE RECETAS
app.post('/api/recetas', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion, id_categoria, tiempo_preparacion, dificultad, ingredientes } = req.body;
        const id_usuario = req.usuario.id;

        const receta = {
            id_usuario,
            id_categoria,
            nombre,
            descripcion,
            tiempo_preparacion,
            dificultad,
            ingredientes,
            fecha_creacion: new Date()
        };

        const result = await db.collection('recetas').insertOne(receta);
        res.status(201).json({ id: result.insertedId, mensaje: 'Receta creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las recetas
app.get('/api/recetas', async (req, res) => {
    try {
        const { categoria, dificultad } = req.query;
        const query = {};
        if (categoria) query.id_categoria = categoria;
        if (dificultad) query.dificultad = dificultad;

        const recetas = await db.collection('recetas').find(query).toArray();
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener receta por ID
app.get('/api/recetas/:id', async (req, res) => {
    try {
        const receta = await db.collection('recetas').findOne({ _id: new ObjectId(req.params.id) });
        if (!receta) {
            return res.status(404).json({ mensaje: 'Receta no encontrada' });
        }
        res.json(receta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTAS DE USUARIOS
// Registro de usuario
app.post('/api/usuarios/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const usuario = { nombre, email, password, fecha_registro: new Date() };
        const result = await db.collection('usuarios').insertOne(usuario);
        res.status(201).json({ id: result.insertedId, mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await db.collection('usuarios').findOne({ email, password });
        if (usuario) {
            const token = Buffer.from(`${usuario._id}-${Date.now()}`).toString('base64');
            res.json({ 
                token,
                usuario,
                mensaje: 'Login exitoso'
            });
        } else {
            res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar usuario
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        await db.collection('usuarios').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { nombre, email, password } }
        );
        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.collection('usuarios').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTAS DE CATEGORÍAS
// Crear categoría
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const categoria = { nombre, descripcion };
        const result = await db.collection('categorias').insertOne(categoria);
        res.status(201).json({ id: result.insertedId, mensaje: 'Categoría creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await db.collection('categorias').find().toArray();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener categoría por ID
app.get('/api/categorias/:id', async (req, res) => {
    try {
        const categoria = await db.collection('categorias').findOne({ _id: new ObjectId(req.params.id) });
        if (categoria) {
            res.json(categoria);
        } else {
            res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar categoría
app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        await db.collection('categorias').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { nombre, descripcion } }
        );
        res.json({ mensaje: 'Categoría actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar categoría
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        await db.collection('categorias').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ mensaje: 'Categoría eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTAS DE VALORACIONES
// Crear valoración
app.post('/api/valoraciones', async (req, res) => {
    try {
        const { id_usuario, id_receta, puntuacion, comentario } = req.body;
        const valoracion = { id_usuario, id_receta, puntuacion, comentario, fecha_creacion: new Date() };
        const result = await db.collection('valoraciones').insertOne(valoracion);
        res.status(201).json({ id: result.insertedId, mensaje: 'Valoración creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener valoraciones por receta
app.get('/api/valoraciones/receta/:id_receta', async (req, res) => {
    try {
        const valoraciones = await db.collection('valoraciones').find({ id_receta: req.params.id_receta }).toArray();
        res.json(valoraciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar valoración
app.put('/api/valoraciones/:id', async (req, res) => {
    try {
        const { puntuacion, comentario } = req.body;
        await db.collection('valoraciones').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { puntuacion, comentario } }
        );
        res.json({ mensaje: 'Valoración actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar valoración
app.delete('/api/valoraciones/:id', async (req, res) => {
    try {
        await db.collection('valoraciones').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ mensaje: 'Valoración eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTAS DE INGREDIENTES
// Crear ingrediente
app.post('/api/ingredientes', async (req, res) => {
    try {
        const { nombre } = req.body;
        const ingrediente = { nombre };
        const result = await db.collection('ingredientes').insertOne(ingrediente);
        res.status(201).json({ id: result.insertedId, mensaje: 'Ingrediente creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los ingredientes
app.get('/api/ingredientes', async (req, res) => {
    try {
        const ingredientes = await db.collection('ingredientes').find().toArray();
        res.json(ingredientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener ingrediente por ID
app.get('/api/ingredientes/:id', async (req, res) => {
    try {
        const ingrediente = await db.collection('ingredientes').findOne({ _id: new ObjectId(req.params.id) });
        if (ingrediente) {
            res.json(ingrediente);
        } else {
            res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar ingrediente
app.put('/api/ingredientes/:id', async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.collection('ingredientes').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { nombre } }
        );
        res.json({ mensaje: 'Ingrediente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar ingrediente
app.delete('/api/ingredientes/:id', async (req, res) => {
    try {
        await db.collection('ingredientes').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ mensaje: 'Ingrediente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTAS DE RECETAS_INGREDIENTES
// Agregar ingrediente a receta
app.post('/api/recetas/:id_receta/ingredientes', async (req, res) => {
    try {
        const { id_ingrediente, cantidad } = req.body;
        const recetaIngrediente = { id_receta: req.params.id_receta, id_ingrediente, cantidad };
        await db.collection('recetas_ingredientes').insertOne(recetaIngrediente);
        res.status(201).json({ mensaje: 'Ingrediente agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar cantidad de ingrediente en receta
app.put('/api/recetas/:id_receta/ingredientes/:id_ingrediente', async (req, res) => {
    try {
        const { cantidad } = req.body;
        await db.collection('recetas_ingredientes').updateOne(
            { id_receta: req.params.id_receta, id_ingrediente: req.params.id_ingrediente },
            { $set: { cantidad } }
        );
        res.json({ mensaje: 'Cantidad de ingrediente actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar ingrediente de receta
app.delete('/api/recetas/:id_receta/ingredientes/:id_ingrediente', async (req, res) => {
    try {
        await db.collection('recetas_ingredientes').deleteOne({
            id_receta: req.params.id_receta,
            id_ingrediente: req.params.id_ingrediente
        });
        res.json({ mensaje: 'Ingrediente eliminado de la receta exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}); 