-- ADR 0001: congela id_indicador/porcentagem_indicacao no pagamento, igual a
-- porcentagem_tripeiro/porcentagem_atendente, para que um fechamento passado
-- nao mude se o indicador de um atendente for alterado depois.
ALTER TABLE public.pagamentos
  ADD COLUMN id_indicador INTEGER REFERENCES public.pessoas(id) ON DELETE SET NULL,
  ADD COLUMN porcentagem_indicacao NUMERIC NOT NULL DEFAULT 0
    CHECK (porcentagem_indicacao >= 0 AND porcentagem_indicacao <= 100);

-- Backfill: preenche os pagamentos existentes com o indicador/percentual
-- atuais do atendente, preservando os numeros de hoje sem mudar nada
-- retroativamente. Pagamentos novos gravam esses campos no momento da criacao.
UPDATE public.pagamentos p
SET id_indicador = a.id_indicador,
    porcentagem_indicacao = CASE
      WHEN a.id_indicador IS NOT NULL THEN COALESCE(a.porcentagem_indicacao, 0)
      ELSE 0
    END
FROM public.pessoas a
WHERE p.id_atendente = a.id;
