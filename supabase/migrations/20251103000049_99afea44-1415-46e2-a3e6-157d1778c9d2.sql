-- Add category column to despesas table
ALTER TABLE public.despesas 
ADD COLUMN IF NOT EXISTS categoria TEXT;