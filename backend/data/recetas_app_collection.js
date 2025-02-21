// Colección de datos de ejemplo para la aplicación de recetas
db = {
    usuarios: [
        {
            "_id": ObjectId(),
            "nombre": "Juan Pérez",
            "email": "juan@example.com",
            "password": "password123",
            "fecha_registro": new Date("2024-01-15")
        },
        // ... más usuarios (1000 registros)
    ],
    
    categorias: [
        {
            "_id": ObjectId(),
            "nombre": "Desayunos",
            "descripcion": "Recetas para el desayuno"
        },
        // ... más categorías
    ],
    
    recetas: [
        {
            "_id": ObjectId(),
            "nombre": "Tortilla Española",
            "descripcion": "Deliciosa tortilla de patatas tradicional",
            "id_usuario": ObjectId(), // referencia a usuario
            "id_categoria": ObjectId(), // referencia a categoría
            "tiempo_preparacion": 45,
            "dificultad": "medio",
            "ingredientes": [
                "6 huevos",
                "1kg de patatas",
                "2 cebollas",
                "Aceite de oliva",
                "Sal"
            ],
            "fecha_creacion": new Date("2024-03-15")
        },
        // ... más recetas (1000 registros)
    ],
    
    valoraciones: [
        {
            "_id": ObjectId(),
            "id_usuario": ObjectId(), // referencia a usuario
            "id_receta": ObjectId(), // referencia a receta
            "puntuacion": 5,
            "comentario": "¡Excelente receta! Muy fácil de seguir",
            "fecha_creacion": new Date("2024-03-16")
        },
        // ... más valoraciones (1000 registros)
    ],
    
    ingredientes: [
        {
            "_id": ObjectId(),
            "nombre": "Huevos"
        },
        // ... más ingredientes (1000 registros)
    ]
}; 