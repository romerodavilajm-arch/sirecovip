const supabase = require('../config/supabase');

// POST: Crear un nuevo comerciante (Con soporte para imagen)
const createMerchant = async (req, res) => {
  try {
    const {
      name, business, address, address_references, delegation,
      latitude, longitude, organization_id,
      schedule_start, schedule_end, stand_type,
      operating_days, license_number, notes
    } = req.body;

    // El ID viene del usuario autenticado (Token)
    const userId = req.user.id;
    let photoUrl = null;
    const documentUrls = [];

    // 1. ¿Viene foto del puesto?
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      const fileExt = file.originalname.split('.').pop();
      const fileName = `puestos/${Date.now()}_${Math.round(Math.random()*1000)}.${fileExt}`;

      // Subir a Supabase Storage (Bucket 'evidence')
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('evidence')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        });

      if (storageError) throw new Error(`Error subiendo imagen: ${storageError.message}`);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase
        .storage
        .from('evidence')
        .getPublicUrl(fileName);

      photoUrl = publicUrl;
    }

    // 2. ¿Vienen documentos adicionales?
    if (req.files && req.files.documents) {
      for (const doc of req.files.documents) {
        const fileExt = doc.originalname.split('.').pop();
        const fileName = `documentos/${Date.now()}_${Math.round(Math.random()*10000)}.${fileExt}`;

        const { error: docError } = await supabase
          .storage
          .from('evidence')
          .upload(fileName, doc.buffer, {
            contentType: doc.mimetype
          });

        if (!docError) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('evidence')
            .getPublicUrl(fileName);

          documentUrls.push(publicUrl);
        }
      }
    }

    // Parsear operating_days si viene como string JSON
    let operatingDaysArray = [];
    if (operating_days) {
      try {
        operatingDaysArray = typeof operating_days === 'string'
          ? JSON.parse(operating_days)
          : operating_days;
      } catch (e) {
        console.error('Error parsing operating_days:', e);
      }
    }

    // 2. Guardar en Base de Datos
    // Limitar decimales de coordenadas para evitar overflow (max 6 decimales)
    const latNumber = latitude ? parseFloat(parseFloat(latitude).toFixed(6)) : null;
    const lonNumber = longitude ? parseFloat(parseFloat(longitude).toFixed(6)) : null;

    const { data, error } = await supabase
      .from('merchants')
      .insert([
        {
          name,
          business,
          address,
          address_references: address_references || null,
          delegation,
          latitude: latNumber,
          longitude: lonNumber,
          organization_id: organization_id || null,
          schedule_start,
          schedule_end,
          status: 'en-observacion',
          stand_type: stand_type || 'semifijo',
          operating_days: operatingDaysArray,
          license_number: license_number || null,
          notes: notes || null,
          registered_by: userId,
          stall_photo_url: photoUrl
        }
      ])
      .select();

    if (error) throw error;

    const merchantId = data[0].id;

    // 3. Guardar documentos en la tabla documents si existen
    if (documentUrls.length > 0) {
      const documentsToInsert = documentUrls.map(url => ({
        merchant_id: merchantId,
        document_type: 'general',
        file_url: url,
        uploaded_by: userId
      }));

      const { error: docsError } = await supabase
        .from('documents')
        .insert(documentsToInsert);

      if (docsError) {
        console.error('Error guardando documentos:', docsError);
      }
    }

    res.status(201).json({
      message: '✅ Comerciante registrado correctamente',
      merchant: data[0]
    });

  } catch (error) {
     console.error('Error en createMerchant:', error);
     res.status(500).json({ error: error.message });
  }
};

// GET: Listar comerciantes
const getMerchants = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        *,
        organizations (name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET: Obtener un comerciante por ID
const getMerchantById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        *,
        organizations (name),
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Comerciante no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT: Actualizar un comerciante
const updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, business, address, address_references, delegation,
      latitude, longitude, organization_id,
      schedule_start, schedule_end, stand_type,
      operating_days, license_number, notes
    } = req.body;

    let photoUrl = null;
    const documentUrls = [];

    // Si viene una nueva foto del puesto
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      const fileExt = file.originalname.split('.').pop();
      const fileName = `puestos/${Date.now()}_${Math.round(Math.random()*1000)}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('evidence')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        });

      if (storageError) throw new Error(`Error subiendo imagen: ${storageError.message}`);

      const { data: { publicUrl } } = supabase
        .storage
        .from('evidence')
        .getPublicUrl(fileName);

      photoUrl = publicUrl;
    }

    // Si vienen nuevos documentos
    if (req.files && req.files.documents) {
      for (const doc of req.files.documents) {
        const fileExt = doc.originalname.split('.').pop();
        const fileName = `documentos/${Date.now()}_${Math.round(Math.random()*10000)}.${fileExt}`;

        const { error: docError } = await supabase
          .storage
          .from('evidence')
          .upload(fileName, doc.buffer, {
            contentType: doc.mimetype
          });

        if (!docError) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('evidence')
            .getPublicUrl(fileName);

          documentUrls.push(publicUrl);
        }
      }
    }

    // Parsear operating_days si viene como string JSON
    let operatingDaysArray = [];
    if (operating_days) {
      try {
        operatingDaysArray = typeof operating_days === 'string'
          ? JSON.parse(operating_days)
          : operating_days;
      } catch (e) {
        console.error('Error parsing operating_days:', e);
      }
    }

    // Construir objeto de actualización
    // Limitar decimales de coordenadas para evitar overflow (max 6 decimales)
    const latNumber = latitude ? parseFloat(parseFloat(latitude).toFixed(6)) : null;
    const lonNumber = longitude ? parseFloat(parseFloat(longitude).toFixed(6)) : null;

    const updateData = {
      name,
      business,
      address,
      address_references: address_references || null,
      delegation,
      latitude: latNumber,
      longitude: lonNumber,
      organization_id: organization_id || null,
      schedule_start,
      schedule_end,
      stand_type: stand_type || 'semifijo',
      operating_days: operatingDaysArray,
      license_number: license_number || null,
      notes: notes || null,
      last_update: new Date().toISOString().split('T')[0], // Actualizar fecha
    };

    // Solo actualizar foto si se subió una nueva
    if (photoUrl) {
      updateData.stall_photo_url = photoUrl;
    }

    const { data, error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Comerciante no encontrado' });
    }

    // Guardar nuevos documentos en la tabla documents si existen
    if (documentUrls.length > 0) {
      const userId = req.user.id;
      const documentsToInsert = documentUrls.map(url => ({
        merchant_id: id,
        document_type: 'general',
        file_url: url,
        uploaded_by: userId
      }));

      const { error: docsError } = await supabase
        .from('documents')
        .insert(documentsToInsert);

      if (docsError) {
        console.error('Error guardando nuevos documentos:', docsError);
      }
    }

    res.json({
      message: '✅ Comerciante actualizado correctamente',
      merchant: data[0]
    });

  } catch (error) {
     console.error('Error en updateMerchant:', error);
     res.status(500).json({ error: error.message });
  }
};

module.exports = { createMerchant, getMerchants, getMerchantById, updateMerchant };