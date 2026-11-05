-- Supplemental migration for the Agendamentos application.
-- The core RBAC tables and RLS policies are already provisioned in the linked project.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), nome text not null,
  telefone text, telefone_norm text, rua text, numero text, bairro text,
  cidade text, complemento text, criado_em timestamptz not null default now()
);
alter table public.appointments add column if not exists client_id uuid references public.clients(id) on delete restrict;
create unique index if not exists clients_telefone_norm_unique
  on public.clients(telefone_norm) where telefone_norm is not null and telefone_norm <> '';
alter table public.clients enable row level security;
revoke all on public.clients from anon, authenticated;
grant select, insert, update on public.clients to authenticated;
drop policy if exists clients_admin_manage on public.clients;
create policy clients_admin_manage on public.clients for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists clients_professional_read on public.clients;
create policy clients_professional_read on public.clients for select to authenticated
  using (exists (select 1 from public.appointments a where a.client_id=clients.id and a.professional_id=(select private.current_professional_id())));
create or replace function private.ensure_appointment_client()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_phone text; v_id uuid; v_name text;
begin
 v_phone := nullif(regexp_replace(coalesce(new.telefone,''),'[^0-9]','','g'),'');
 if v_phone is null then new.client_id:=null; return new; end if;
 select id,nome into v_id,v_name from public.clients where telefone_norm=v_phone limit 1;
 if v_id is not null then
  if lower(trim(v_name))<>lower(trim(new.cliente)) then raise exception 'Este telefone já está cadastrado para outro cliente. Confira o número informado.' using errcode='23505'; end if;
  update public.clients set telefone=new.telefone,rua=new.rua,numero=new.numero,bairro=new.bairro,cidade=new.cidade,complemento=new.complemento where id=v_id;
  new.client_id:=v_id;
 else
  insert into public.clients(nome,telefone,telefone_norm,rua,numero,bairro,cidade,complemento) values(new.cliente,new.telefone,v_phone,new.rua,new.numero,new.bairro,new.cidade,new.complemento) returning id into new.client_id;
 end if;
 return new;
end $$;
drop trigger if exists appointments_ensure_client on public.appointments;
create trigger appointments_ensure_client before insert or update of cliente,telefone,rua,numero,bairro,cidade,complemento on public.appointments for each row execute function private.ensure_appointment_client();
