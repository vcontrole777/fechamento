# Fechamento

App de reconciliação de fechamento de caixa: soma pagamentos e despesas de um período e distribui comissões entre quem participou da venda (tripeiro, atendente, e opcionalmente um indicador).

## Language

**Atendente**:
Pessoa que atende o cliente e recebe uma comissão sobre o pagamento, calculada sobre o valor que sobra depois da comissão do tripeiro.
_Avoid_: vendedor, colaborador

**Tripeiro**:
Pessoa associada a um pagamento que recebe a primeira fatia da comissão, antes de qualquer outra divisão.
_Avoid_: entregador, motorista

**Pagamento**:
Um valor recebido de um cliente, associado a um tripeiro e a um atendente, com os percentuais de comissão gravados no momento da criação.
_Avoid_: transação, venda

**Comissão do tripeiro**:
Fatia do valor do pagamento que cabe ao tripeiro.

**Valor a receber (do tripeiro)**:
O que sobra do pagamento depois de descontar a comissão do tripeiro; é a base sobre a qual a comissão do atendente é calculada.

**Pool do atendente**:
Fatia do valor a receber que cabe ao atendente, antes de descontar qualquer comissão de indicação.

**Indicador**:
Atendente que indicou outro atendente; recebe uma fatia do pool do atendente indicado como comissão de indicação.

**Comissão de indicação**:
Fatia do pool do atendente que vai para o indicador, quando o atendente foi indicado por outro atendente.
_Avoid_: bônus de indicação, comissão de referência

## Regras

**Percentuais são congelados no pagamento.** Os percentuais de comissão do tripeiro, do atendente e de indicação são fixados no momento em que o pagamento é criado e não mudam retroativamente, mesmo que o cadastro do tripeiro, do atendente ou do indicador seja alterado depois. Um fechamento de um período passado não muda porque um percentual foi atualizado hoje.
