-- Unifica o nome do campo "quanto devo a essa pessoa no periodo" entre
-- pagamentos_atendentes (valor_comissao) e pagamentos_tripeiros (valor_a_receber).
ALTER TABLE public.pagamentos_atendentes RENAME COLUMN valor_comissao TO valor_devido;
ALTER TABLE public.pagamentos_tripeiros RENAME COLUMN valor_a_receber TO valor_devido;

-- Unifica o enum de metodo_pagamento do tripeiro ('outros') com o do atendente
-- ('outro'), eliminando a divergencia de nomenclatura entre os dois.
ALTER TYPE public.metodo_pagamento RENAME VALUE 'outros' TO 'outro';
