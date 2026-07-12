-- Cria o tipo metodo_pagamento se não existir
DO $$ BEGIN
  CREATE TYPE metodo_pagamento AS ENUM ('dinheiro', 'pix', 'transferencia', 'outros');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Cria a tabela pagamentos_tripeiros
CREATE TABLE IF NOT EXISTS public.pagamentos_tripeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tripeiro INTEGER NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  id_equipe INTEGER NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  data_pagamento DATE NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  valor_a_receber NUMERIC NOT NULL,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  metodo_pagamento metodo_pagamento NOT NULL,
  status status_pagamento_atendente NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pagamentos_tripeiros ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Usuários podem visualizar pagamentos de tripeiros (admin ou própria equipe)"
  ON public.pagamentos_tripeiros
  FOR SELECT
  USING (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem criar pagamentos de tripeiros (admin ou própria equipe)"
  ON public.pagamentos_tripeiros
  FOR INSERT
  WITH CHECK (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem atualizar pagamentos de tripeiros (admin ou própria equipe)"
  ON public.pagamentos_tripeiros
  FOR UPDATE
  USING (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem deletar pagamentos de tripeiros (admin ou própria equipe)"
  ON public.pagamentos_tripeiros
  FOR DELETE
  USING (is_admin() OR id_equipe = get_user_equipe_id());

-- Trigger para atualizar atualizado_em
CREATE TRIGGER update_pagamentos_tripeiros_updated_at
  BEFORE UPDATE ON public.pagamentos_tripeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();