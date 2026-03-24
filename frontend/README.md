# Gerenciador de Fila — ACE / PSF Central

Sistema web de **gerenciamento de filas de atendimento** desenvolvido para o PSF Central da ACE Faculdade. A aplicação permite visualizar e gerenciar a fila de pacientes em tempo real, consumindo uma API REST construída em FastAPI (back-end separado).

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + TypeScript |
| Estilização | Tailwind CSS v4 |
| Roteamento | React Router v7 |
| Cache / Requisições | TanStack React Query v5 |
| Build | Vite 8 |

---

## 📁 Estrutura do Projeto

```
frontend/
├── .env.example          # Variáveis de ambiente — copie como .env e preencha
├── src/
│   ├── api/
│   │   ├── client.ts         # Função base de fetch (usa VITE_API_URL do .env)
│   │   └── types/
│   │       └── fila.ts       # Interface TypeScript dos dados da fila
│   ├── components/
│   │   ├── BotaoEntrar/      # Botão de login/entrada
│   │   └── BotaoVoltar/      # Botão de navegação de volta
│   │   └── Sidebar/          # Nova Sidebar 
│   │   └── Header/           # Novo Header
│   │   └── ActivityCard/     # Novo Card de atividades
│   ├── hooks/
│   │   └── useFila.ts        # Hook React Query para buscar a fila
│   ├── layouts/
│   │   └── DefaultLayout.tsx # Layout com sidebar (envolve rotas privadas)
│   ├── pages/
│   │   ├── Home/             # Página de login (pública)
│   │   └── Teste/            # Página de teste — exibe fila da API (privada)
│   │   └── TelaInicial/      # Página de Registro de novos pacientes (privada)
│   ├── routes/
│   │   └── index.tsx         # Definição de rotas (pública, privada, 404)
│   ├── App.tsx               # Componente raiz — monta o RouterProvider
│   ├── main.tsx              # Entrypoint — configura QueryClient e ReactDOM
│   └── index.css             # Estilos globais + Tailwind
```

> Cada página e componente vive em sua **própria pasta** com um `index.tsx`, facilitando adicionar arquivos relacionados (estilos, testes, subcomponentes) sem poluir outros diretórios.

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+ e npm

### Passos

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd gerenciador-de-fila-ace-5/frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL real da sua API (ex: http://localhost:8000/api)

# 4. Rode o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

---

## 🔐 Variáveis de Ambiente

O projeto usa Vite, então **todas as variáveis precisam do prefixo `VITE_`** para serem acessíveis no navegador.

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API FastAPI | `http://localhost:8000/api` |

> ⚠️ **Nunca commite o arquivo `.env`**. Ele está listado no `.gitignore`. Utilize sempre o `.env.example` para documentar as variáveis necessárias.

---

## 🗺️ Rotas

| Caminho | Tipo | Componente | Descrição |
|---|---|---|---|
| `/` | Pública | `Home` | Tela de login |
|/telainicial |	Privada	| `TelaInicial` | Cadastro de pacientes e visão geral |
| `/teste` | Privada | `Teste` | Visualização da fila de pacientes |
| `*` | — | inline | Página 404 |

As rotas **privadas** são encapsuladas pelo `DefaultLayout`, que exibe a sidebar de navegação.

---

## 📡 Camada de API

```
src/api/client.ts           → fetchClient<T>()  — wrapper de fetch com tratamento de erros
src/api/types/fila.ts       → interface PacienteFila
src/services/filaService.ts → filaService.getFila() / adicionarPaciente()
src/hooks/useFila.ts        → useFila()  — React Query hook
```

Para adicionar um novo endpoint:
1. Crie o método em `filaService.ts`
2. Se necessário, adicione o tipo em `src/api/types/`
3. Crie um hook em `src/hooks/` usando `useQuery` ou `useMutation`

---

## ➕ Como adicionar uma nova página

1. Crie a pasta e o componente em `src/pages/NomeDaPagina/index.tsx`
2. Registre a rota em `src/routes/index.tsx`:

```tsx
// rotas privadas (dentro do DefaultLayout)
{ path: '/nome-da-pagina', element: <NomeDaPagina /> }
```

3. Adicione o link na sidebar em `src/components/Sidebar/index.tsx`:

```tsx
<NavLink to="/nome-da-pagina">🏥 Nome da Página</NavLink>
```

---

## 🧹 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o bundle de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Roda o ESLint no projeto |

---
