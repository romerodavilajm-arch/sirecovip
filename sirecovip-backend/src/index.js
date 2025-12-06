require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// Importar rutas
const merchantRoutes = require('./routes/merchantRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas Base
app.get('/', (req, res) => res.json({ status: 'API SIRECOVIP Online 🚀' }));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de la API (Aquí montamos el módulo de comerciantes)
app.use('/api/merchants', merchantRoutes);

app.listen(port, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
});