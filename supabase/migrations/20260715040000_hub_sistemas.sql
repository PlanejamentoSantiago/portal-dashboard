-- HUB da empresa: catálogo de sistemas + controle de acesso ao hub.
-- Compartilha o mesmo banco/usuários do Portal de BI.

-- Quem pode acessar o HUB (além da gerência, que sempre pode).
alter table public.perfis add column if not exists acesso_hub boolean default false;

-- Catálogo de sistemas exibidos no hub.
create table if not exists public.sistemas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  url         text,
  icone       text,            -- nome de ícone Lucide (ex.: 'BarChart3')
  image_url   text,            -- logo/imagem opcional (Storage bi-assets)
  cor         text,            -- cor de destaque opcional (hex)
  ordem       integer default 0,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

-- É membro do hub? (gerência ou flag acesso_hub)
create or replace function public.tem_acesso_hub()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and (coalesce(acesso_hub, false) or lower(trim(role)) = 'gerencia')
  );
$$;

-- RLS
alter table public.sistemas enable row level security;

drop policy if exists sistemas_select on public.sistemas;
create policy sistemas_select on public.sistemas
  for select to authenticated
  using (public.tem_acesso_hub() and (public.is_gerencia() or coalesce(ativo, true)));

drop policy if exists sistemas_admin_write on public.sistemas;
create policy sistemas_admin_write on public.sistemas
  for all to authenticated
  using (public.is_gerencia())
  with check (public.is_gerencia());
