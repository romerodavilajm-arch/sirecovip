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

    // Consultar la tabla public.users para obtener el rol y nombre del usuario
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', data.user.id)
        .single();

    if (userError) {
        return res.status(500).json({
            error: 'Error al obtener datos del usuario',
            details: userError.message
        });
    }

    if (!userData) {
        return res.status(404).json({
            error: 'Usuario no encontrado en la base de datos'
        });
    }

    res.json({
        message: '✅ Login exitoso',
        token: data.session.access_token,
        user: {
            id: data.user.id,
            email: data.user.email,
            role: userData.role,
            name: userData.name
        }
    });
};

module.exports = { login };