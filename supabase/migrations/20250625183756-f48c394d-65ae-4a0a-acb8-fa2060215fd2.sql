
-- Criar tabela para contas bancárias
CREATE TABLE public.contas_bancarias (
  id SERIAL PRIMARY KEY,
  banco TEXT NOT NULL,
  agencia TEXT NOT NULL,
  conta TEXT NOT NULL,
  nome TEXT NOT NULL,
  id_equipe INTEGER NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para busca por equipe
CREATE INDEX idx_contas_bancarias_equipe ON contas_bancarias(id_equipe);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_contas_bancarias_updated_at
  BEFORE UPDATE ON public.contas_bancarias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar constraint única para evitar contas duplicadas na mesma equipe
ALTER TABLE public.contas_bancarias 
ADD CONSTRAINT unique_conta_por_equipe 
UNIQUE (banco, agencia, conta, id_equipe);
