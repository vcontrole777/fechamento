
-- Adicionar coluna id_responsavel na tabela recebimentos
ALTER TABLE recebimentos 
ADD COLUMN id_responsavel integer;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN recebimentos.id_responsavel IS 'ID da pessoa responsável pela coleta quando tipo_deposito é "especie"';
