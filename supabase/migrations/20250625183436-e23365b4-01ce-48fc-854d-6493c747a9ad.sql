
-- Adicionar campos para organizar melhor os recebimentos
ALTER TABLE public.recebimentos 
ADD COLUMN conta_depositada TEXT,
ADD COLUMN numero_comprovante TEXT,
ADD COLUMN banco TEXT,
ADD COLUMN tipo_deposito TEXT DEFAULT 'deposito';

-- Criar índice para busca por conta
CREATE INDEX idx_recebimentos_conta ON recebimentos(conta_depositada);

-- Criar índice para busca por data e conta (para agrupamentos)
CREATE INDEX idx_recebimentos_data_conta ON recebimentos(data, conta_depositada);
