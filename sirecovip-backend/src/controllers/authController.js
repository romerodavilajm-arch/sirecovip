const supabase = require('../config/supabase');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Supabase hace la magia de verificar el password hasheado
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) return res.status(401).json({ error: error.message });

    res.json({
        message: '✅ Login exitoso',
        token: data.session.access_token, // ¡Este es el pase VIP!
        user: {
            id: data.user.id,
            email: data.user.email
        }
    });
};

module.exports = { login };