-- Adicionar colunas para sistema de indicação de atendentes
ALTER TABLE public.pessoas
ADD COLUMN id_indicador INTEGER REFERENCES public.pessoas(id) ON DELETE SET NULL,
ADD COLUMN porcentagem_indicacao NUMERIC DEFAULT 0 CHECK (porcentagem_indicacao >= 0 AND porcentagem_indicacao <= 100);

-- Adicionar índice para melhor performance
CREATE INDEX idx_pessoas_id_indicador ON public.pessoas(id_indicador);

-- Comentários para documentação
COMMENT ON COLUMN public.pessoas.id_indicador IS 'ID do atendente que indicou esta pessoa';
COMMENT ON COLUMN public.pessoas.porcentagem_indicacao IS 'Porcentagem que o indicador ganha sobre a comissão deste atendente';