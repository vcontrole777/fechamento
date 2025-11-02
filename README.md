# FECHAMENTO.PRO

Sistema completo de gestão financeira e controle de comissões para equipes.

## Funcionalidades

- **Dashboard**: Visualização de métricas financeiras e KPIs em tempo real
- **Gestão de Pagamentos**: Controle completo de pagamentos PIX e Boleto
- **Gestão de Despesas**: Registro e controle de todas as despesas
- **Gestão de Recebimentos**: Acompanhamento de todos os recebimentos
- **Fechamento**: Relatórios de fechamento com cálculo de comissões
- **Gestão de Equipe**: Controle de atendentes e tripeiros
- **Painel Administrativo**: Gerenciamento de usuários e permissões
- **Sistema de Notificações**: Comunicação com todos os usuários
- **Contas Bancárias**: Gestão de contas bancárias da equipe

## Tecnologias

Este projeto utiliza:

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn-ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth
- **Hospedagem**: Deploy automático

## Como executar localmente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <SEU_REPO_URL>

# Entre na pasta do projeto
cd <NOME_DO_PROJETO>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── layouts/       # Layouts principais
├── contexts/      # Contextos React
├── utils/         # Funções utilitárias
└── integrations/  # Integrações (Supabase)

supabase/
├── functions/     # Edge Functions
└── migrations/    # Migrações do banco de dados
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run preview` - Visualiza o build de produção localmente

## Permissões e Roles

O sistema possui dois níveis de acesso:

- **Admin**: Acesso total ao sistema, incluindo painel administrativo
- **User**: Acesso às funcionalidades de gestão da própria equipe

## Suporte

Para questões e suporte, entre em contato através do sistema de notificações internas.
