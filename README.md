# Frango Fácil - Delivery de Frango Assado

Sistema de delivery online para pedidos de frango assado.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Deploy**: Vercel

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
```

## 📁 Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React (Auth, Cart)
├── hooks/          # Custom hooks
├── lib/            # Utilitários
├── pages/          # Páginas da aplicação
└── integrations/   # Integração com Supabase
```

## 🔐 Autenticação

O sistema possui autenticação completa com:
- Cadastro com validação de senha forte
- Login com rate limiting
- Recuperação de senha por email
- Logout seguro

## 📄 Licença

Projeto privado - Frango Fácil
