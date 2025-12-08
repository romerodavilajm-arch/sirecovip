-- ==============================================================================
-- 1. CONFIGURACIÓN INICIAL Y ENUMS
-- ==============================================================================

-- Habilitar extensión para geolocalización (si se requiere a futuro) y UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum: Roles de Usuario
CREATE TYPE user_role_enum AS ENUM ('inspector', 'coordinator');

-- Enum: Estatus del Comerciante (Semáforo)
CREATE TYPE merchant_status_enum AS ENUM ('sin-foco', 'en-observacion', 'prioritario');

-- Enum: Tipo de Puesto
CREATE TYPE stand_type_enum AS ENUM ('semifijo', 'fijo', 'rotativo');

-- Enum: Delegaciones de Querétaro
CREATE TYPE delegation_enum AS ENUM (
  'Centro Historico', 'Epigmenio Gonzalez', 'Santa Rosa Jáuregui',
  'Felix Osores Sotomayor', 'Felipe Carrillo Puerto',
  'Josefa Vergara y Hernandez', 'Villa Cayetano Rubio'
);

-- Enum: Estatus Organización
CREATE TYPE organization_status_enum AS ENUM ('activa', 'inactiva');

-- Enum: Tipos de Actividad (Auditoría)
CREATE TYPE activity_action_enum AS ENUM (
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'STATUS_CHANGE'
);

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- TABLA: USERS (Perfiles públicos vinculados a Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role_enum NOT NULL DEFAULT 'inspector',
  assigned_zone TEXT,
  department TEXT,
  total_registrations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  contact TEXT NOT NULL,
  legal_representative TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  sin_foco INTEGER DEFAULT 0,
  en_observacion INTEGER DEFAULT 0,
  prioritario INTEGER DEFAULT 0,
  status organization_status_enum DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: MERCHANTS (Central)
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business TEXT NOT NULL, -- Giro comercial
  status merchant_status_enum DEFAULT 'en-observacion',
  stand_type stand_type_enum DEFAULT 'semifijo',
  operating_days TEXT[] DEFAULT '{}', -- Array de días
  address TEXT NOT NULL,
  address_references TEXT,
  delegation delegation_enum NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  schedule_start TIME NOT NULL,
  schedule_end TIME NOT NULL,
  license_number TEXT,
  stall_photo_url TEXT, -- URL en Storage
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT,
  registered_by UUID REFERENCES public.users(id),
  registration_date DATE DEFAULT CURRENT_DATE,
  last_update DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT,
  document_type TEXT DEFAULT 'general',
  file_url TEXT NOT NULL,
  file_size INTEGER,
  upload_date DATE DEFAULT CURRENT_DATE,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: ACTIVITY_LOG (Auditoría RF-07)
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action_type activity_action_enum NOT NULL,
  entity_type TEXT NOT NULL, -- 'MERCHANT', 'ORGANIZATION', etc.
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. POLÍTICAS DE SEGURIDAD (RLS)
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Políticas BÁSICAS (Para desarrollo inicial, luego se pueden restringir más)

-- Lectura: Todos los usuarios autenticados pueden ver todo
CREATE POLICY "Enable read access for authenticated users" ON public.merchants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.documents FOR SELECT TO authenticated USING (true);

-- Escritura: Inspectores pueden crear
CREATE POLICY "Enable insert for authenticated users" ON public.merchants FOR INSERT TO authenticated WITH CHECK (auth.uid() = registered_by);
CREATE POLICY "Enable insert for authenticated users" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

-- ==============================================================================
-- 4. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ==============================================================================

-- 4.1 Función para manejar nuevos usuarios (Sync Auth -> Public Users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'inspector');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger al crear usuario en Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.2 Función para Auditoría Automática en Comerciantes
CREATE OR REPLACE FUNCTION log_merchant_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.activity_log (user_id, action_type, entity_type, entity_id, description, metadata)
    VALUES (NEW.registered_by, 'CREATE', 'MERCHANT', NEW.id, 'Registro nuevo comerciante: ' || NEW.name, jsonb_build_object('name', NEW.name));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.activity_log (user_id, action_type, entity_type, entity_id, description, metadata)
    VALUES (NEW.registered_by, 'UPDATE', 'MERCHANT', NEW.id, 'Actualización de datos', jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_merchant
AFTER INSERT OR UPDATE ON public.merchants
FOR EACH ROW EXECUTE FUNCTION log_merchant_changes();

-- ==============================================================================
-- 5. ÍNDICES DE RENDIMIENTO (Performance)
-- ==============================================================================
CREATE INDEX idx_merchants_geo ON public.merchants (latitude, longitude);
CREATE INDEX idx_merchants_status ON public.merchants (status);
CREATE INDEX idx_merchants_org ON public.merchants (organization_id);