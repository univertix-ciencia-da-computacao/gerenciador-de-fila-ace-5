# Gerenciador de Fila - ACE 5

Projeto acadêmico para gestão de filas em postos de saúde, com interface web, back-end em Python/FastAPI, integração com Supabase e comunicação em tempo real via WebSocket.

## Escopo desta etapa

Esta etapa está focada principalmente em:

- estrutura do projeto
- separação por camadas
- contratos iniciais da API
- integração base com Supabase
- base para comunicação via WebSocket

As regras de negócio mais completas da fila ficam para próximas PRs.

## Decisão de arquitetura para comunicação

Para manter o projeto simples e consistente, o backend segue a regra:

- **HTTP para comandos**
- **WebSocket para sincronização em tempo real**

### HTTP

Usado para ações de negócio, por exemplo:

- adicionar pessoa à fila
- chamar próxima senha
- finalizar atendimento atual
- consultar posição
- consultar snapshot da fila

### WebSocket

Usado apenas para:

- conectar clientes
- assinar atualizações de uma fila
- assinar atualizações da posição de uma senha
- receber snapshots atualizados
- ping/pong

## Tecnologias

- Python 3.10+
- FastAPI
- Uvicorn
- Supabase Python Client
- Pydantic Settings
- Docker
- Docker Compose
- Ruff

## Estrutura do projeto

```text
.
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── error_handlers.py
│   │   └── exceptions.py
│   ├── routes/
│   │   ├── health.py
│   │   ├── position.py
│   │   ├── queue.py
│   │   └── websocket.py
│   ├── schemas/
│   │   ├── common.py
│   │   ├── health.py
│   │   ├── position.py
│   │   ├── queue.py
│   │   └── websocket.py
│   ├── repositories/
│   │   └── queue_repository.py
│   ├── services/
│   │   ├── queue_service.py
│   │   ├── supabase_service.py
│   │   └── websocket_manager.py
│   └── main.py
├── supabase/
│   └── schema.sql
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── main.py
├── pyproject.toml
├── README.md
├── requirements-dev.txt
└── requirements.txt
```

### O papel de cada pasta/arquivo principal

- `app/core/`: configurações centrais, exceções da aplicação e tratamento padronizado de erros.
- `app/routes/`: endpoints HTTP e endpoint WebSocket expostos para o front.
- `app/schemas/`: contratos de entrada e saída da API, usados para validação e documentação.
- `app/repositories/`: acesso a dados e queries no Supabase.
- `app/services/`: regras de negócio da fila, provider do client Supabase e gerenciamento de conexões WebSocket.
- `app/main.py`: montagem da aplicação FastAPI e registro das rotas.
- `supabase/`: SQL inicial para criar as tabelas usadas pelo projeto.
- `.env.example`: exemplo de configuração para copiar como `.env`.
- `Dockerfile`: imagem da aplicação para container.
- `docker-compose.yml`: sobe a API com a configuração do projeto.
- `pyproject.toml`: configuração das ferramentas Python, incluindo o Ruff.
- `requirements-dev.txt`: dependências de desenvolvimento, como lint.
- `requirements.txt`: dependências Python do back-end.

## Configuração de ambiente

Para começar, o `.env` pode ter apenas:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-key
```

> Essas duas variáveis são obrigatórias para operar a fila, consultar posições e usar o WebSocket.

## Execução local com Python

1. Crie e ative um ambiente virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

4. Ajuste as credenciais obrigatórias do Supabase:

- `SUPABASE_URL`
- `SUPABASE_KEY`

5. Execute a aplicação:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Lint e formatação com Ruff

Instale as dependências de desenvolvimento:

```bash
pip install -r requirements-dev.txt
```

Executar lint:

```bash
ruff check .
```

Aplicar formatação:

```bash
ruff format .
```

## Execução com Docker

```bash
cp .env.example .env
# ajuste SUPABASE_URL e SUPABASE_KEY
docker compose up --build
```

Para rodar em segundo plano:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

## Swagger UI

Com a aplicação rodando:

- Swagger UI: `http://127.0.0.1:8000/docs`

> Observação: o Swagger mostra apenas os endpoints HTTP. O WebSocket é documentado manualmente neste README.

## Endpoints HTTP

### Health check

```http
GET /api/v1/health
```

### Consultar snapshot de uma fila

```http
GET /api/v1/queue/{unit_id}
```

Exemplo:

```http
GET /api/v1/queue/default
```

### Adicionar pessoa na fila

```http
POST /api/v1/queue/entries
Content-Type: application/json
```

Payload previsto:

```json
{
  "person_name": "Maria da Silva",
  "unit_id": "default",
  "priority": false,
  "category": "clinico-geral"
}
```

> O endpoint existe como scaffold e atualmente retorna `501 Not Implemented`.

### Chamar próxima senha

```http
POST /api/v1/queue/call-next
Content-Type: application/json
```

Payload previsto:

```json
{
  "unit_id": "default"
}
```

> O endpoint existe como scaffold e atualmente retorna `501 Not Implemented`.

### Finalizar atendimento atual

```http
POST /api/v1/queue/finish-current
Content-Type: application/json
```

Payload previsto:

```json
{
  "unit_id": "default"
}
```

> O endpoint existe como scaffold e atualmente retorna `501 Not Implemented`.

### Consultar posição de uma senha

```http
GET /api/v1/position/{token}
```

Exemplo:

```http
GET /api/v1/position/TOKEN_GERADO
```

> O endpoint existe como scaffold e atualmente retorna `501 Not Implemented`.

## Contrato WebSocket

### Endpoint

```text
ws://127.0.0.1:8000/api/v1/ws
```

### Regras

- um único endpoint WebSocket
- cliente envia apenas `subscribe`, `unsubscribe` e `ping`
- servidor responde com `connected`, `subscribed`, `unsubscribed`, `pong`, `queue.snapshot` e `error`
- O canal `queue` já funciona como scaffold estrutural
- o canal `position` está previsto no contrato, mas ainda não foi implementado

### Mensagem inicial do servidor

Ao conectar:

```json
{
  "type": "connected",
  "channel": "system",
  "resource_id": null,
  "timestamp": "2026-03-21T00:00:00+00:00",
  "data": {
    "client_id": "abc123"
  }
}
```

### Assinar uma fila

Cliente envia:

```json
{
  "type": "subscribe",
  "channel": "queue",
  "resource_id": "default"
}
```

Servidor responde com:

```json
{
  "type": "subscribed",
  "channel": "queue",
  "resource_id": "default",
  "timestamp": "2026-03-21T00:00:00+00:00",
  "data": {
    "ok": true
  }
}
```

E envia um snapshot da fila:

```json
{
  "type": "queue.snapshot",
  "channel": "queue",
  "resource_id": "default",
  "timestamp": "2026-03-21T00:00:00+00:00",
  "data": {
    "unit_id": "default",
    "current_ticket": null,
    "current_entry": null,
    "last_called": null,
    "waiting_count": 0,
    "queue": []
  }
}
```

### Assinar a posição de uma senha

Cliente envia:

```json
{
  "type": "subscribe",
  "channel": "position",
  "resource_id": "TOKEN_GERADO"
}
```

O servidor responde com erro `NOT_IMPLEMENTED`, deixando o contrato preparado para a próxima etapa.

### Ping/Pong

Cliente:

```json
{
  "type": "ping"
}
```

Servidor:

```json
{
  "type": "pong",
  "channel": "system",
  "resource_id": null,
  "timestamp": "2026-03-21T00:00:00+00:00",
  "data": {}
}
```

## Exemplo de cliente WebSocket no front

```javascript
const socket = new WebSocket("ws://127.0.0.1:8000/api/v1/ws");

socket.onopen = () => {
  socket.send(
    JSON.stringify({
      type: "subscribe",
      channel: "queue",
      resource_id: "default",
    }),
  );
};

socket.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```

## Persistência no Supabase

O arquivo `supabase/schema.sql` cria três tabelas iniciais:

- `queue_entries`: estrutura base para armazenar o estado atual das senhas
- `queue_events`: estrutura de auditoria das ações da fila
- `qr_links`: estrutura de mapeamento entre token e consulta de posição

As credenciais do Supabase são obrigatórias para operar a fila. Sem `SUPABASE_URL` e `SUPABASE_KEY`, a API ainda sobe para health check e documentação, mas as operações de fila, posição e WebSocket retornam erro de configuração.
