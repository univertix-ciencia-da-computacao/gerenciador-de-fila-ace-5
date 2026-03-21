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
├── README.md
└── requirements.txt
```

### O papel de cada pasta/arquivo principal

- `app/core/`: configurações centrais, exceções da aplicação e tratamento padronizado de erros.
- `app/routes/`: endpoints HTTP e endpoint WebSocket expostos para o front.
- `app/schemas/`: contratos de entrada e saída da API, usados para validação e documentação.
- `app/services/`: regras de negócio da fila, gerenciamento de conexões WebSocket e integração com Supabase.
- `app/main.py`: montagem da aplicação FastAPI e registro das rotas.
- `supabase/`: SQL inicial para criar as tabelas usadas pelo projeto.
- `.env.example`: exemplo de configuração para copiar como `.env`.
- `Dockerfile`: imagem da aplicação para container.
- `docker-compose.yml`: sobe a API com a configuração do projeto.
- `requirements.txt`: dependências Python do back-end.

## Configuração de ambiente

Para começar, o `.env` pode ter apenas:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-key
```

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

4. Se for usar Supabase de verdade, ajuste pelo menos:

- `SUPABASE_URL`
- `SUPABASE_KEY`

5. Execute a aplicação:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Execução com Docker

```bash
cp .env.example .env
# ajuste SUPABASE_URL e SUPABASE_KEY se necessário
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

Payload:

```json
{
  "person_name": "Maria da Silva",
  "unit_id": "default",
  "priority": false,
  "category": "clinico-geral"
}
```

Resposta resumida:

```json
{
  "success": true,
  "message": "Pessoa adicionada à fila com sucesso.",
  "data": {
    "entry": {
      "ticket": "A001",
      "person_name": "Maria da Silva",
      "unit_id": "default",
      "priority": false,
      "category": "clinico-geral",
      "status": "waiting",
      "position_token": "TOKEN_GERADO",
      "position_path": "/api/v1/position/TOKEN_GERADO",
      "created_at": "2026-03-21T00:00:00+00:00",
      "called_at": null,
      "finished_at": null
    },
    "position": {
      "token": "TOKEN_GERADO",
      "unit_id": "default",
      "ticket": "A001",
      "status": "waiting",
      "position": 1,
      "people_ahead": 0,
      "current_ticket": null,
      "position_path": "/api/v1/position/TOKEN_GERADO"
    },
    "queue": {
      "unit_id": "default",
      "current_ticket": null,
      "current_entry": null,
      "last_called": null,
      "waiting_count": 1,
      "queue": [
        {
          "ticket": "A001",
          "person_name": "Maria da Silva",
          "priority": false,
          "category": "clinico-geral",
          "status": "waiting"
        }
      ]
    }
  }
}
```

### Chamar próxima senha

```http
POST /api/v1/queue/call-next
Content-Type: application/json
```

Payload:

```json
{
  "unit_id": "default"
}
```

### Finalizar atendimento atual

```http
POST /api/v1/queue/finish-current
Content-Type: application/json
```

Payload:

```json
{
  "unit_id": "default"
}
```

### Consultar posição de uma senha

```http
GET /api/v1/position/{token}
```

Exemplo:

```http
GET /api/v1/position/TOKEN_GERADO
```

## Contrato WebSocket

### Endpoint

```text
ws://127.0.0.1:8000/api/v1/ws
```

### Regras

- um único endpoint WebSocket
- cliente envia apenas `subscribe`, `unsubscribe` e `ping`
- servidor responde com `connected`, `subscribed`, `unsubscribed`, `pong`, `queue.snapshot`, `position.snapshot` e `error`
- após qualquer mudança via HTTP, o backend publica novos snapshots para os inscritos

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

Servidor envia `subscribed` e depois `position.snapshot`.

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

- `queue_entries`: estado atual das senhas
- `queue_events`: auditoria das ações da fila
- `qr_links`: mapeamento entre token e consulta de posição

Se as credenciais do Supabase não estiverem configuradas, a API continua funcionando localmente com estado em memória, e a saúde da API indica que o Supabase não está configurado.

## Observação importante

Nesta versão inicial:

- o estado da fila fica em memória no backend
- o Supabase é usado como persistência inicial/auditoria quando configurado
- a comunicação em tempo real foi simplificada para snapshots completos
