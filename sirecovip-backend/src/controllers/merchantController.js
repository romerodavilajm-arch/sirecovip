const supabase = require('../config/supabase');

// POST: Crear un nuevo comerciante
const createMerchant = async (req, res) => {
    try {
        const {
            name, business, address, delegation,
            latitude, longitude, organization_id,
            schedule_start, schedule_end
        } = req.body;

        const userId = req.user.id;
        let photoUrl = null;

        // 1. ¿Viene foto del puesto?
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `puestos/${Date.now()}_${Math.round(Math.random() * 1000)}.${fileExt}`;

            // Subir a Supabase Storage (Bucket 'evidence')
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('evidence')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (storageError) throw new Error(`Error subiendo imagen: ${storageError.message}`);

            // Obtener URL pública
            const { data: { publicUrl } } = supabase
                .storage
                .from('evidence')
                .getPublicUrl(fileName);

            photoUrl = publicUrl;
        }

        // 2. Guardar en Base de Datos
        const { data, error } = await supabase
            .from('merchants')
            .insert([
                {
                    name, business, address, delegation,
                    latitude, longitude, organization_id,
                    schedule_start, schedule_end,
                    status: 'en-observacion',
                    stand_type: 'semifijo',
                    registered_by: userId,
                    stall_photo_url: photoUrl // <--- ¡AQUI GUARDAMOS LA FOTO!
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ message: '✅ Comerciante registrado con foto', merchant: data[0] });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createMerchant, getMerchants };