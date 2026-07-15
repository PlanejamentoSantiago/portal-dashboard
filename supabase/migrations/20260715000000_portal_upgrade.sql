-- =============================================================
-- Portal Dashboards — upgrade Fase 1
-- Colunas novas em dashboards, tabelas favoritos e vitrine,
-- helper is_gerencia(), RLS e bucket de Storage.
-- Robusto quanto ao tipo de dashboards.id (uuid ou bigint/int).
-- =============================================================

-- ---------- 1. Extensões de colunas ----------
alter table public.dashboards add column if not exists descricao   text;
alter table public.dashboards add column if not exists image_url   text;
alter table public.dashboards add column if not exists ordem       integer default 0;
alter table public.dashboards add column if not exists ativo       boolean default true;
alter table public.dashboards add column if not exists created_at  timestamptz default now();

alter table public.perfis add column if not exists nome  text;
alter table public.perfis add column if not exists email text;

-- ---------- 2. Helper: usuário atual é gerência? ----------
create or replace function public.is_gerencia()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and lower(trim(role)) = 'gerencia'
  );
$$;

-- ---------- 3. Tabelas novas (FK com tipo dinâmico) ----------
do $$
declare
  id_type text;
begin
  select data_type into id_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name  = 'dashboards'
    and column_name = 'id';

  if id_type is null then
    raise exception 'Tabela public.dashboards não encontrada';
  end if;

  -- Favoritos por usuário
  execute format($f$
    create table if not exists public.favoritos (
      id           uuid primary key default gen_random_uuid(),
      user_id      uuid not null references auth.users(id) on delete cascade,
      dashboard_id %s   not null references public.dashboards(id) on delete cascade,
      created_at   timestamptz default now(),
      unique (user_id, dashboard_id)
    )
  $f$, id_type);

  -- Vitrine (slides do carrossel da home)
  execute format($v$
    create table if not exists public.vitrine (
      id           uuid primary key default gen_random_uuid(),
      titulo       text not null,
      subtitulo    text,
      image_url    text,
      dashboard_id %s references public.dashboards(id) on delete set null,
      link_externo text,
      ordem        integer default 0,
      ativo        boolean default true,
      created_at   timestamptz default now()
    )
  $v$, id_type);
end $$;

-- ---------- 4. RLS ----------
alter table public.dashboards enable row level security;
alter table public.perfis     enable row level security;
alter table public.favoritos  enable row level security;
alter table public.vitrine    enable row level security;

-- Remove policies legadas (substituídas abaixo por versões limpas).
-- Todas eram PERMISSIVE; a antiga de SELECT ignorava o campo `ativo`
-- e as `block *` bloqueavam escrita para todos (inclusive gerência).
drop policy if exists "dashboards_access_control" on public.dashboards;
drop policy if exists "block insert" on public.dashboards;
drop policy if exists "block update" on public.dashboards;
drop policy if exists "block delete" on public.dashboards;
drop policy if exists "read own profile" on public.perfis;

-- dashboards: leitura por role/publico + gerência vê tudo; CRUD só gerência
drop policy if exists dashboards_select on public.dashboards;
create policy dashboards_select on public.dashboards
  for select to authenticated
  using (
    public.is_gerencia()
    or (
      coalesce(ativo, true)
      and (
        lower(trim(permission_role)) = 'publico'
        or lower(trim(permission_role)) = (
          select lower(trim(role)) from public.perfis where id = auth.uid()
        )
      )
    )
  );

drop policy if exists dashboards_admin_write on public.dashboards;
create policy dashboards_admin_write on public.dashboards
  for all to authenticated
  using (public.is_gerencia())
  with check (public.is_gerencia());

-- perfis: cada um vê/edita o próprio; gerência gerencia todos
drop policy if exists perfis_select on public.perfis;
create policy perfis_select on public.perfis
  for select to authenticated
  using (id = auth.uid() or public.is_gerencia());

drop policy if exists perfis_admin_write on public.perfis;
create policy perfis_admin_write on public.perfis
  for all to authenticated
  using (public.is_gerencia())
  with check (public.is_gerencia());

-- favoritos: cada um gerencia os próprios; gerência enxerga todos
drop policy if exists favoritos_rw on public.favoritos;
create policy favoritos_rw on public.favoritos
  for all to authenticated
  using (user_id = auth.uid() or public.is_gerencia())
  with check (user_id = auth.uid() or public.is_gerencia());

-- vitrine: todos autenticados leem os ativos; gerência gerencia
drop policy if exists vitrine_select on public.vitrine;
create policy vitrine_select on public.vitrine
  for select to authenticated
  using (public.is_gerencia() or coalesce(ativo, true));

drop policy if exists vitrine_admin_write on public.vitrine;
create policy vitrine_admin_write on public.vitrine
  for all to authenticated
  using (public.is_gerencia())
  with check (public.is_gerencia());

-- ---------- 5. Storage: bucket bi-assets ----------
insert into storage.buckets (id, name, public)
values ('bi-assets', 'bi-assets', true)
on conflict (id) do nothing;

drop policy if exists "bi-assets read" on storage.objects;
create policy "bi-assets read" on storage.objects
  for select to public
  using (bucket_id = 'bi-assets');

drop policy if exists "bi-assets admin write" on storage.objects;
create policy "bi-assets admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'bi-assets' and public.is_gerencia())
  with check (bucket_id = 'bi-assets' and public.is_gerencia());
