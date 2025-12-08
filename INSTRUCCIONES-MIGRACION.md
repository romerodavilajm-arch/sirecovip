# 🔧 Instrucciones para Corregir Error 404 y Errores de Base de Datos

## 📋 Problemas Detectados y Solucionados

### 1. ❌ **Error: Columna `document_type` no existe en tabla `documents`**
```
Error guardando documentos: {
  code: 'PGRST204',
  message: "Could not find the 'document_type' column of 'documents' in the schema cache"
}
```

### 2. ❌ **Error: Coordenadas con demasiados decimales**
```
Error en createMerchant: {
  code: '22003',
  message: 'numeric field overflow'
}
```

---

## ✅ Soluciones Aplicadas

### **Backend - Archivos Modificados:**

1. ✅ **`merchantController.js`** - Limitado decimales de coordenadas a 6 dígitos
2. ✅ **`Database-Schema.sql`** - Actualizado schema con columnas faltantes
3. ✅ **`migration-add-document-type.sql`** - Script de migración creado

---

## 🚀 Pasos para Aplicar la Corrección

### **Paso 1: Ejecutar Migración SQL en Supabase**

1. **Ir al Dashboard de Supabase:**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto SIRECOVIP

2. **Abrir SQL Editor:**
   - En el menú lateral izquierdo, click en **"SQL Editor"**
   - Click en **"New query"**

3. **Copiar y Ejecutar el Script:**
   - Copia el contenido del archivo: `sirecovip-backend/migration-add-document-type.sql`
   - Pégalo en el editor SQL
   - Click en **"RUN"** (botón verde en esquina inferior derecha)

4. **Verificar que se ejecutó correctamente:**
   - Deberías ver mensaje: **"Success. No rows returned"**
   - Ir a **"Table Editor"** → tabla **"documents"**
   - Verificar que ahora tiene las columnas:
     - `document_type` (text)
     - `uploaded_at` (timestamptz)

---

### **Paso 2: Reiniciar el Backend**

El backend necesita reiniciarse para cargar los cambios en `merchantController.js`:

```bash
# Detener contenedores
docker-compose down

# Reiniciar
docker-compose up -d

# Ver logs del backend
docker logs sirecovip_api --tail 50 -f
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
```

---

### **Paso 3: Probar la Actualización**

1. **Ir a la aplicación:** http://localhost:5173/app/merchants

2. **Editar un comerciante existente:**
   - Click en **"Ver Detalles"** en cualquier comerciante
   - Click en **"Editar"** (botón superior derecho)
   - Modificar cualquier campo (ej: nombre, dirección)
   - Click en **"Guardar Cambios"**

3. **Ver en consola del navegador:**
   ```
   🔄 Iniciando guardado...
   📤 Enviando datos al servidor... UPDATE
   🔧 merchantService.updateMerchant called
   ✅ Update successful
   ✅ Comerciante actualizado
   ✅ Guardado exitoso, redirigiendo...
   ```

4. **Verificar éxito:**
   - No deberías ver error 404
   - Deberías ver mensaje verde: **"Comerciante Actualizado"**
   - Automáticamente te redirigirá a la lista de comerciantes

---

## 🐛 Si Aún Ves Error 404

Verifica que el endpoint esté registrado correctamente:

```bash
# Entrar al contenedor del backend
docker exec -it sirecovip_api sh

# Ver contenido del archivo de rutas
cat src/routes/merchantRoutes.js

# Deberías ver:
# router.put('/:id', requireAuth, uploadFields, merchantController.updateMerchant);
```

---

## 📊 Cambios en el Schema de Base de Datos

### **Tabla `documents` - Columnas Agregadas:**

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `document_type` | TEXT | 'general' | Tipo de documento |
| `uploaded_at` | TIMESTAMPTZ | now() | Timestamp de carga |

### **Tabla `merchants` - Sin Cambios Estructurales**

Las coordenadas ahora se limitan a 6 decimales en el backend antes de insertar/actualizar:
- `latitude`: DECIMAL(10,8) → Valores limitados a X.XXXXXX
- `longitude`: DECIMAL(11,8) → Valores limitados a X.XXXXXX

---

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado en Supabase
- [ ] Columnas `document_type` y `uploaded_at` existen en tabla `documents`
- [ ] Backend reiniciado con Docker
- [ ] Logs del backend sin errores
- [ ] Probado actualizar un comerciante
- [ ] No hay error 404
- [ ] Mensaje de éxito visible
- [ ] Redirección funciona correctamente

---

## 🆘 Soporte

Si sigues teniendo problemas, verifica:

1. **Backend logs:**
   ```bash
   docker logs sirecovip_api --tail 100
   ```

2. **Consola del navegador:**
   - Abre DevTools (F12)
   - Pestaña "Console"
   - Busca mensajes con 🔄, 📤, ✅ o ❌

3. **Network tab:**
   - Pestaña "Network"
   - Filtra por "merchants"
   - Verifica que `PUT /api/merchants/{id}` retorne 200 OK

---

**Última actualización:** 2025-12-08
