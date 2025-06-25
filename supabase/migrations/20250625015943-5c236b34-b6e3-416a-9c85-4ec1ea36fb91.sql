
-- Criar tabela para armazenar os recebimentos dos tripeiros
CREATE TABLE public.recebimentos (
  id SERIAL PRIMARY KEY,
  id_tripeiro INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  id_equipe INTEGER NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL CHECK (valor >= 0),
  data DATE NOT NULL,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_recebimentos_tripeiro ON recebimentos(id_tripeiro);
CREATE INDEX idx_recebimentos_equipe ON recebimentos(id_equipe);
CREATE INDEX idx_recebimentos_data ON recebimentos(data);

-- Adicionar trigger para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recebimentos_updated_at 
    BEFORE UPDATE ON recebimentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
