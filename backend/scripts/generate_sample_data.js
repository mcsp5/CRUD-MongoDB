const { MongoClient } = require('mongodb');
const faker = require('faker');

const uri = 'mongodb://localhost:27017';
const dbName = 'recetas';

// Arrays de datos base para generar contenido aleatorio
const dificultades = ['facil', 'medio', 'dificil'];
const tiemposPreparacion = [15, 30, 45, 60, 90, 120];
const categoriasBase = [
    { nombre: 'Desayunos', descripcion: 'Recetas para el desayuno' },
    { nombre: 'Almuerzos', descripcion: 'Platos principales' },
    { nombre: 'Cenas', descripcion: 'Recetas ligeras para la cena' },
    { nombre: 'Postres', descripcion: 'Dulces y postres' },
    { nombre: 'Bebidas', descripcion: 'Bebidas y cócteles' },
    { nombre: 'Snacks', descripcion: 'Aperitivos y bocadillos' },
    { nombre: 'Sopas', descripcion: 'Sopas y cremas' },
    { nombre: 'Ensaladas', descripcion: 'Ensaladas frescas' },
    { nombre: 'Parrilla', descripcion: 'Platos a la parrilla' },
    { nombre: 'Vegano', descripcion: 'Recetas veganas' }
];

const ingredientesBase = [
    'Huevos', 'Harina', 'Azúcar', 'Leche', 'Mantequilla', 'Aceite de oliva',
    'Sal', 'Pimienta', 'Ajo', 'Cebolla', 'Tomate', 'Zanahoria', 'Papa',
    'Arroz', 'Pasta', 'Pollo', 'Carne molida', 'Pescado', 'Queso', 'Yogur'
];

async function generateSampleData() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Conectado a MongoDB');

        const db = client.db(dbName);

        // Limpiar colecciones existentes
        await Promise.all([
            db.collection('usuarios').deleteMany({}),
            db.collection('categorias').deleteMany({}),
            db.collection('recetas').deleteMany({}),
            db.collection('valoraciones').deleteMany({}),
            db.collection('ingredientes').deleteMany({})
        ]);

        // Generar categorías
        const categorias = await db.collection('categorias').insertMany(categoriasBase);
        console.log(`${categoriasBase.length} categorías creadas`);

        // Generar ingredientes base
        const ingredientes = await db.collection('ingredientes').insertMany(
            ingredientesBase.map(nombre => ({ nombre }))
        );
        console.log(`${ingredientesBase.length} ingredientes creados`);

        // Generar 1000 usuarios
        const usuarios = [];
        for (let i = 0; i < 1000; i++) {
            usuarios.push({
                nombre: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                fecha_registro: faker.date.past()
            });
        }
        const usuariosInsertados = await db.collection('usuarios').insertMany(usuarios);
        console.log('1000 usuarios creados');

        // Generar 1000 recetas
        const recetas = [];
        const usuariosIds = Object.values(usuariosInsertados.insertedIds);
        const categoriasIds = Object.values(categorias.insertedIds);

        for (let i = 0; i < 1000; i++) {
            const ingredientesReceta = [];
            const numIngredientes = faker.random.number({ min: 3, max: 10 });
            
            for (let j = 0; j < numIngredientes; j++) {
                ingredientesReceta.push(
                    `${faker.random.number({ min: 1, max: 500 })}${faker.random.arrayElement(['g', 'ml', 'unidades'])} de ${faker.random.arrayElement(ingredientesBase)}`
                );
            }

            recetas.push({
                nombre: `${faker.random.arrayElement(['Receta de', 'Preparación de', 'Cómo hacer'])} ${faker.random.words(2)}`,
                descripcion: faker.lorem.paragraph(),
                id_usuario: faker.random.arrayElement(usuariosIds),
                id_categoria: faker.random.arrayElement(categoriasIds),
                tiempo_preparacion: faker.random.arrayElement(tiemposPreparacion),
                dificultad: faker.random.arrayElement(dificultades),
                ingredientes: ingredientesReceta,
                fecha_creacion: faker.date.recent()
            });
        }
        const recetasInsertadas = await db.collection('recetas').insertMany(recetas);
        console.log('1000 recetas creadas');

        // Generar 1000 valoraciones
        const valoraciones = [];
        const recetasIds = Object.values(recetasInsertadas.insertedIds);

        for (let i = 0; i < 1000; i++) {
            valoraciones.push({
                id_usuario: faker.random.arrayElement(usuariosIds),
                id_receta: faker.random.arrayElement(recetasIds),
                puntuacion: faker.random.number({ min: 1, max: 5 }),
                comentario: faker.lorem.sentence(),
                fecha_creacion: faker.date.recent()
            });
        }
        await db.collection('valoraciones').insertMany(valoraciones);
        console.log('1000 valoraciones creadas');

        console.log('Generación de datos de ejemplo completada');

    } catch (error) {
        console.error('Error generando datos:', error);
    } finally {
        await client.close();
    }
}

generateSampleData(); 