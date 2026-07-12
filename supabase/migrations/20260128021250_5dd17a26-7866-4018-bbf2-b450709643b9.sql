-- Adicionar 'deposito' ao enum metodo_pagamento
ALTER TYPE public.metodo_pagamento ADD VALUE IF NOT EXISTS 'deposito';

-- Adicionar 'deposito' ao enum metodo_pagamento_atendente
ALTER TYPE public.metodo_pagamento_atendente ADD VALUE IF NOT EXISTS 'deposito';