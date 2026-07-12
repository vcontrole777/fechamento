
-- Remover as colunas que não estão sendo utilizadas
ALTER TABLE recebimentos DROP COLUMN conta_depositada;
ALTER TABLE recebimentos DROP COLUMN numero_comprovante;
