
-- Adicionar coluna titular na tabela contas_bancarias (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contas_bancarias' AND column_name='titular') THEN
        ALTER TABLE contas_bancarias ADD COLUMN titular TEXT;
    END IF;
END $$;

-- Criar trigger para contas_bancarias se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contas_bancarias_updated_at') THEN
        CREATE TRIGGER update_contas_bancarias_updated_at 
          BEFORE UPDATE ON contas_bancarias 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
