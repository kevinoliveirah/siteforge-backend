# SiteForge Backend API

Backend para o [Prompt Mestre](https://prompt-mestre.vercel.app) - Gerador de sites com IA.

## 🚀 Stack

- **Runtime:** Node.js 20
- **Framework:** Express
- **ORM:** Prisma
- **Database:** PostgreSQL
- **AI:** Google Gemini

## 📦 Deploy no Render

1. Conecte este repositório no [Render](https://render.com)
2. Selecione "Blueprint" e aponte para `render.yaml`
3. Configure `GEMINI_API_KEY` no dashboard do Render
4. Deploy automático!

## 🔧 Variáveis de Ambiente

| Variável         | Descrição                                          |
| ---------------- | -------------------------------------------------- |
| `DATABASE_URL`   | URL do PostgreSQL (gerado pelo Render)             |
| `JWT_SECRET`     | Chave secreta para tokens (gerado automaticamente) |
| `GEMINI_API_KEY` | Chave da API do Google Gemini                      |
| `PORT`           | Porta do servidor (padrão: 3000)                   |

## 📡 Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `POST /api/projects/:id/generate` - Gerar site com IA
- `POST /api/projects/:id/refine` - Refinar site com IA

## 🏗️ Desenvolvimento Local

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 📄 Licença

MIT
