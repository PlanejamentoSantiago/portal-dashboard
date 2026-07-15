-- Contador de acessos por dashboard + função segura de incremento.
-- Alimenta o destaque "mais usado" no carrossel.

alter table public.dashboards add column if not exists total_acessos bigint default 0;

-- Registra um acesso, apenas se o usuário tem permissão de ver o BI.
create or replace function public.registrar_acesso(dash uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dashboards d
     set total_acessos = coalesce(d.total_acessos, 0) + 1
   where d.id = dash
     and (
       public.is_gerencia()
       or lower(trim(d.permission_role)) = 'publico'
       or lower(trim(d.permission_role)) = (
         select lower(trim(role)) from public.perfis where id = auth.uid()
       )
     );
end;
$$;

revoke all on function public.registrar_acesso(uuid) from public;
grant execute on function public.registrar_acesso(uuid) to authenticated;
