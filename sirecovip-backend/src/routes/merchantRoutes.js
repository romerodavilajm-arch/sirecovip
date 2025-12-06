const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const requireAuth = require('../middlewares/authMiddleware');   // Importar el middleware   
const upload = require('../middlewares/uploadMiddleware');


// Definir endpoints
// POST: Auth + Upload + Controller
// 'image' es el nombre del campo que enviaremos en el formulario
router.post('/', requireAuth, upload.single('image'), merchantController.createMerchant); // Crear
router.get('/', requireAuth, merchantController.getMerchants);    // Listar

module.exports = router;