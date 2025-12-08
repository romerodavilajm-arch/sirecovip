-- Migración: Agregar columna document_type y uploaded_at a la tabla documents
-- Fecha: 2025-12-08
-- Descripción: Fix para permitir guardar el tipo de documento

-- Agregar columna document_type si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE public.documents
    ADD COLUMN document_type TEXT DEFAULT 'general';
  END IF;
END $$;

-- Agregar columna uploaded_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'uploaded_at'
  ) THEN
    ALTER TABLE public.documents
    ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Hacer la columna name nullable si no lo es
ALTER TABLE public.documents ALTER COLUMN name DROP NOT NULL;

-- Actualizar uploaded_at con valores de created_at para registros existentes
UPDATE public.documents
SET uploaded_at = created_at
WHERE uploaded_at IS NULL;
