-- Create enum for payment methods
CREATE TYPE metodo_pagamento_atendente AS ENUM ('dinheiro', 'pix', 'transferencia', 'outro');

-- Create enum for payment status
CREATE TYPE status_pagamento_atendente AS ENUM ('pendente', 'pago_parcial', 'pago_total');

-- Create table for attendant commission payments
CREATE TABLE public.pagamentos_atendentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_atendente INTEGER NOT NULL,
  id_equipe INTEGER NOT NULL,
  valor_comissao NUMERIC NOT NULL,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  data_pagamento DATE NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  metodo_pagamento metodo_pagamento_atendente NOT NULL,
  observacoes TEXT,
  status status_pagamento_atendente NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.pagamentos_atendentes ENABLE ROW LEVEL SECURITY;

-- Create policies for attendant payments
CREATE POLICY "Usuários podem visualizar pagamentos de atendentes (admin ou própria equipe)"
ON public.pagamentos_atendentes
FOR SELECT
USING (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem criar pagamentos de atendentes (admin ou própria equipe)"
ON public.pagamentos_atendentes
FOR INSERT
WITH CHECK (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem atualizar pagamentos de atendentes (admin ou própria equipe)"
ON public.pagamentos_atendentes
FOR UPDATE
USING (is_admin() OR id_equipe = get_user_equipe_id());

CREATE POLICY "Usuários podem deletar pagamentos de atendentes (admin ou própria equipe)"
ON public.pagamentos_atendentes
FOR DELETE
USING (is_admin() OR id_equipe = get_user_equipe_id());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pagamentos_atendentes_updated_at
BEFORE UPDATE ON public.pagamentos_atendentes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_pagamentos_atendentes_atendente ON public.pagamentos_atendentes(id_atendente);
CREATE INDEX idx_pagamentos_atendentes_equipe ON public.pagamentos_atendentes(id_equipe);
CREATE INDEX idx_pagamentos_atendentes_periodo ON public.pagamentos_atendentes(periodo_inicio, periodo_fim);