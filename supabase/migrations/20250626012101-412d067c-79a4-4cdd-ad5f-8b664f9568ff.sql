
-- Primeiro, vamos adicionar uma nova coluna para o ID da conta bancária
ALTER TABLE recebimentos ADD COLUMN id_conta_bancaria INTEGER;

-- Adicionar foreign key constraint
ALTER TABLE recebimentos ADD CONSTRAINT fk_recebimentos_conta_bancaria 
FOREIGN KEY (id_conta_bancaria) REFERENCES contas_bancarias(id);

-- Opcional: Se quiser remover a coluna antiga depois de migrar os dados
-- ALTER TABLE recebimentos DROP COLUMN conta_depositada;
-- ALTER TABLE recebimentos DROP COLUMN banco;
