const multer = require('multer');

// Configuración básica: Guardar en memoria temporalmente
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('⛔ Solo se permiten imágenes (JPG, PNG)'), false);
        }
    }
});

module.exports = upload;