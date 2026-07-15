-- Hierarquia de grupos: BSC é subgrupo de BRADESCO_SA.
-- Um usuário bradesco_sa também acessa os BIs bsc (além dos próprios e públicos).
-- A regra fica centralizada em pode_ver_dashboard(), usada pela RLS e pela
-- contagem de acessos, para não haver divergência.

create or replace function public.pode_ver_dashboard(perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_gerencia()
    or lower(trim(perm)) = 'publico'
    or lower(trim(perm)) = (select lower(trim(role)) from public.perfis where id = auth.uid())
    -- subgrupo: bradesco_sa enxerga bsc
    or (
      lower(trim(perm)) = 'bsc'
      and (select lower(trim(role)) from public.perfis where id = auth.uid()) = 'bradesco_sa'
    );
$$;

-- Política de leitura passa a usar a função (mantém o gate de "ativo").
drop policy if exists dashboards_select on public.dashboards;
create policy dashboards_select on public.dashboards
  for select to authenticated
  using (
    public.pode_ver_dashboard(permission_role)
    and (public.is_gerencia() or coalesce(ativo, true))
  );

-- Contagem de acesso usa a mesma regra + exige usuário autenticado.
create or replace function public.registrar_acesso(dash uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.dashboards d
     set total_acessos = coalesce(d.total_acessos, 0) + 1
   where d.id = dash
     and public.pode_ver_dashboard(d.permission_role);
end;
$$;
