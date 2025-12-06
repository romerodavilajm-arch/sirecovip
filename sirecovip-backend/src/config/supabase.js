require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('❌ Faltan credenciales de Supabase en .env');
}

// Cliente exportable único
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;