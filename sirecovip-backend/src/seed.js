// src/seed.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

const organizacionesBase = [
    {
        name: 'Unión de Comerciantes Centro Histórico',
        contact: 'Juan Pérez',
        phone: '442-111-2222',
        address: 'Av. Corregidora 12, Centro',
        status: 'activa'
    },
    {
        name: 'Tianguis Nocturno Felipe Carrillo',
        contact: 'María López',
        phone: '442-333-4444',
        address: 'Calle Espuelas s/n',
        status: 'activa'
    },
    {
        name: 'Mercado Sobre Ruedas Satélite',
        contact: 'Pedro Sánchez',
        phone: '442-555-6666',
        address: 'Av. de la Luz',
        status: 'activa'
    }
];

async function sembrar() {
    console.log('🌱 Sembrando organizaciones...');

    const { data, error } = await supabase
        .from('organizations')
        .insert(organizacionesBase)
        .select();

    if (error) {
        console.error('❌ Error sembrando:', error);
    } else {
        console.log('✅ Organizaciones creadas con éxito:', data.length);
        console.log(data);
    }
}

sembrar();