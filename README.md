# Gerenciador de Fila - ACE 5

Projeto acadêmico para gestão de filas em postos de saude, com interface web, backend em Python e persistencia em Supabase.

![Diagrama de arquitetura do projeto](image.png)

## Objetivo

Construir um sistema de filas com atualizacao em tempo real para:

- cadastro de pessoas na fila
- exibicao da fila em painel publico
- chamada do proximo atendimento
- geracao e leitura de QR para acesso rapido

## Arquitetura (com base no diagrama)

### Frontend (React)

Aplicacao separada em tres visoes principais:

- Admin: adiciona pessoas na fila e aciona a impressao/geracao de QR
- Painel: exibe a fila e permite chamar o proximo
- Position: le o link do QR e direciona para a informacao da posicao na fila

### Backend (Python)

Camada responsavel pelas regras de negocio e integracao entre tela e dados:

- Fila: controla entrada, ordenacao e chamada de atendimentos
- QR: gera e resolve links de acesso por QR code

### Comunicacao em tempo real

- WebSocket entre frontend e backend para manter as telas sincronizadas em tempo real

### Banco e servicos (Supabase)

Uso planejado do Supabase para:

- armazenar o link do QR
- CRUD de autenticacao e autorizacao de usuarios
- CR (consulta e registro) de auditoria das filas
- gerenciamento de categorias

## Fluxo principal

1. Admin adiciona uma pessoa na fila.
2. Backend registra a entrada e atualiza os dados.
3. Painel exibe a fila atualizada em tempo real.
4. Painel chama o proximo da fila.
5. Backend atualiza o estado e gera/resolve QR quando necessario.
6. Position le o link e mostra a posicao correspondente.

## Equipe

- Bruno
- Danilo
- Gabriela
- Derick
- Marco Wiliam
- Pedro
- Elias
- Joao Pedro
- Jardel
- Bernardo
- Alefe
- Dario
- Wiliam Valadares
- Josias
- Erik
- Raphael
- Joao Vitor
- Guilherme
- Kelly
- Davi

## Organizacao dos grupos

- Grupo 1: Kelly, Davi, Joao Vitor, Derick, Dario (Frontend)
- Grupo 2: Erik, Bruno, Guilherme, Josias, Elias (Frontend)
- Grupo 3: Gabriela, Alefe, Danilo, Pedro, Raphael (Backend)
- Grupo 4: Joao Pedro, Wiliam Valadares, Marco Wiliam, Bernardo, Jardel (Backend)

## Estrutura do repositorio

```text
.
|- backend/
|- frontend/
|- image.png
`- README.md
```

Atualmente as pastas backend e frontend estao reservadas para implementacao.

## Proximos passos sugeridos

1. Inicializar o frontend React com as tres telas (Admin, Painel, Position).
2. Estruturar o backend Python com endpoints e canal WebSocket.
3. Configurar projeto Supabase (auth, tabelas de fila, auditoria e categorias).
4. Implementar fluxo completo de QR code (geracao, armazenamento e leitura).