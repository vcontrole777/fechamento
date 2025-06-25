
-- Adicionar foreign key constraint para id_responsavel
ALTER TABLE recebimentos 
ADD CONSTRAINT recebimentos_id_responsavel_fkey 
FOREIGN KEY (id_responsavel) REFERENCES pessoas(id);
