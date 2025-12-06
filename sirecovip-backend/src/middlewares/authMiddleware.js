const supabase = require('../config/supabase');

const requireAuth = async (req, res, next) => {
    try {
        // 1. Buscar el token en el Header 'Authorization'
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: '⛔ Acceso denegado: Falta el token de autenticación' });
        }

        // El formato es "Bearer <TOKEN>", así que quitamos la palabra "Bearer "
        const token = authHeader.replace('Bearer ', '');

        // 2. Preguntar a Supabase: "¿Este token es real?"
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: '⛔ Token inválido o expirado' });
        }

        // 3. ¡Pase usted! Guardamos al usuario en la petición para usarlo después
        req.user = user;

        next(); // Continúa al siguiente paso (el Controlador)

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno de autenticación' });
    }
};

module.exports = requireAuth;