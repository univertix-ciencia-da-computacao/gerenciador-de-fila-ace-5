create table if not exists public.queue_entries (
    id bigint generated always as identity primary key,
    unit_id text not null,
    ticket_sequence integer not null,
    ticket text not null,
    person_name text not null,
    priority boolean not null default false,
    category text,
    status text not null default 'waiting',
    qr_token text not null unique,
    created_at timestamptz not null default timezone('utc', now()),
    called_at timestamptz,
    finished_at timestamptz
);

alter table public.queue_entries
    add column if not exists ticket_sequence integer;

update public.queue_entries
set ticket_sequence = nullif(regexp_replace(ticket, '\D', '', 'g'), '')::integer
where ticket_sequence is null;

create table if not exists public.queue_events (
    id bigint generated always as identity primary key,
    unit_id text not null,
    event_type text not null,
    ticket text,
    qr_token text,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.qr_links (
    id bigint generated always as identity primary key,
    qr_token text not null unique,
    unit_id text not null,
    ticket text not null,
    position_path text not null,
    created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_queue_entries_unit_ticket_sequence
    on public.queue_entries (unit_id, ticket_sequence);
create index if not exists idx_queue_entries_unit_status
    on public.queue_entries (unit_id, status);
create index if not exists idx_queue_entries_waiting_order
    on public.queue_entries (unit_id, status, priority desc, ticket_sequence asc);
create index if not exists idx_queue_entries_ticket on public.queue_entries (ticket);
create index if not exists idx_queue_events_unit on public.queue_events (unit_id);
create index if not exists idx_queue_events_type on public.queue_events (event_type);
create index if not exists idx_queue_events_created_at on public.queue_events (created_at desc);
create index if not exists idx_qr_links_token on public.qr_links (qr_token);

comment on table public.queue_entries is 'Estado atual das senhas registradas na fila; esta tabela é a fonte principal da verdade da fila.';
comment on table public.queue_events is 'Histórico/auditoria das ações realizadas na fila.';
comment on table public.qr_links is 'Mapeamento entre tokens de QR e consulta de posição da senha.';
