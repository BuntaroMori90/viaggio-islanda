-- FlorinGo Travel App · commercial multi-trip schema
-- Run this on a DEDICATED Supabase project, not on the Islanda production project.

create extension if not exists pgcrypto;

create table if not exists public.travel_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  destination text not null,
  start_date date,
  end_date date,
  cover_url text,
  accent_color text default '#ff5a1f',
  status text not null default 'planning' check (status in ('planning','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_trip_members (
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'traveler' check (role in ('owner','editor','traveler')),
  joined_at timestamptz not null default now(),
  primary key (trip_id,user_id)
);

create table if not exists public.travel_trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  code text not null unique,
  role text not null default 'traveler' check (role in ('editor','traveler')),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  max_uses integer not null default 20 check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.travel_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  day_date date,
  title text not null,
  subtitle text,
  location text,
  latitude double precision,
  longitude double precision,
  schedule jsonb not null default '[]'::jsonb,
  must_items jsonb not null default '[]'::jsonb,
  bonus_items jsonb not null default '[]'::jsonb,
  sacrificable_items jsonb not null default '[]'::jsonb,
  cutoffs jsonb not null default '[]'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id,day_number)
);

create table if not exists public.travel_lodgings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  day_number integer,
  name text not null,
  address text,
  phone text,
  check_in text,
  check_out text,
  parking text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.travel_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  starts_at timestamptz,
  title text not null,
  location text,
  provider text,
  status text not null default 'confirmed',
  reference text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.travel_checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  is_checked boolean not null default false,
  is_custom boolean not null default true,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  paid_by_user_id uuid references auth.users(id) on delete set null,
  paid_by_label text,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'onesignal',
  subscription_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id,user_id,subscription_id)
);

create index if not exists travel_members_user_idx on public.travel_trip_members(user_id);
create index if not exists travel_days_trip_idx on public.travel_days(trip_id,day_number);
create index if not exists travel_checklist_trip_user_idx on public.travel_checklist_items(trip_id,user_id);
create index if not exists travel_notes_trip_idx on public.travel_notes(trip_id,created_at desc);
create index if not exists travel_expenses_trip_idx on public.travel_expenses(trip_id,created_at desc);

create or replace function public.travel_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travel_profiles_touch on public.travel_profiles;
create trigger travel_profiles_touch before update on public.travel_profiles
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_trips_touch on public.travel_trips;
create trigger travel_trips_touch before update on public.travel_trips
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_days_touch on public.travel_days;
create trigger travel_days_touch before update on public.travel_days
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_checklist_touch on public.travel_checklist_items;
create trigger travel_checklist_touch before update on public.travel_checklist_items
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_notes_touch on public.travel_notes;
create trigger travel_notes_touch before update on public.travel_notes
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_expenses_touch on public.travel_expenses;
create trigger travel_expenses_touch before update on public.travel_expenses
for each row execute function public.travel_touch_updated_at();

drop trigger if exists travel_push_touch on public.travel_push_subscriptions;
create trigger travel_push_touch before update on public.travel_push_subscriptions
for each row execute function public.travel_touch_updated_at();

create or replace function public.travel_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.travel_profiles(id,display_name,avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',split_part(coalesce(new.email,''),'@',1)),
    coalesce(new.raw_user_meta_data->>'avatar_url',new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists travel_on_auth_user_created on auth.users;
create trigger travel_on_auth_user_created
after insert on auth.users
for each row execute function public.travel_handle_new_user();

create or replace function public.travel_is_member(p_trip_id uuid,p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.travel_trip_members
    where trip_id=p_trip_id and user_id=p_user_id
  );
$$;

create or replace function public.travel_role(p_trip_id uuid,p_user_id uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.travel_trip_members
  where trip_id=p_trip_id and user_id=p_user_id
  limit 1;
$$;

create or replace function public.travel_can_edit(p_trip_id uuid,p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.travel_role(p_trip_id,p_user_id) in ('owner','editor'),false);
$$;

revoke all on function public.travel_is_member(uuid,uuid) from public;
revoke all on function public.travel_role(uuid,uuid) from public;
revoke all on function public.travel_can_edit(uuid,uuid) from public;
grant execute on function public.travel_is_member(uuid,uuid) to authenticated;
grant execute on function public.travel_role(uuid,uuid) to authenticated;
grant execute on function public.travel_can_edit(uuid,uuid) to authenticated;

create or replace function public.travel_create_trip(
  p_title text,
  p_destination text,
  p_start_date date default null,
  p_end_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_trip uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if nullif(trim(p_title),'') is null or nullif(trim(p_destination),'') is null then raise exception 'missing_fields'; end if;

  insert into public.travel_trips(owner_id,title,destination,start_date,end_date)
  values(auth.uid(),trim(p_title),trim(p_destination),p_start_date,p_end_date)
  returning id into v_trip;

  insert into public.travel_trip_members(trip_id,user_id,role)
  values(v_trip,auth.uid(),'owner');

  return v_trip;
end;
$$;

create or replace function public.travel_create_invite(
  p_trip_id uuid,
  p_role text default 'traveler',
  p_expires_in_days integer default 30,
  p_max_uses integer default 20
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_code text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not public.travel_can_edit(p_trip_id,auth.uid()) then raise exception 'not_authorized'; end if;
  if p_role not in ('editor','traveler') then raise exception 'invalid_role'; end if;

  v_code := upper(substr(encode(gen_random_bytes(8),'hex'),1,10));
  insert into public.travel_trip_invites(trip_id,code,role,created_by,expires_at,max_uses)
  values(p_trip_id,v_code,p_role,auth.uid(),now() + make_interval(days => greatest(1,p_expires_in_days)),greatest(1,p_max_uses));
  return v_code;
end;
$$;

create or replace function public.travel_accept_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_inv public.travel_trip_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  select * into v_inv
  from public.travel_trip_invites
  where code=upper(trim(p_code))
  for update;

  if not found then raise exception 'invite_not_found'; end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then raise exception 'invite_expired'; end if;
  if v_inv.use_count >= v_inv.max_uses then raise exception 'invite_exhausted'; end if;

  insert into public.travel_trip_members(trip_id,user_id,role)
  values(v_inv.trip_id,auth.uid(),v_inv.role)
  on conflict (trip_id,user_id) do nothing;

  if found then
    update public.travel_trip_invites set use_count=use_count+1 where id=v_inv.id;
  end if;

  return v_inv.trip_id;
end;
$$;

revoke all on function public.travel_create_trip(text,text,date,date) from public;
revoke all on function public.travel_create_invite(uuid,text,integer,integer) from public;
revoke all on function public.travel_accept_invite(text) from public;
grant execute on function public.travel_create_trip(text,text,date,date) to authenticated;
grant execute on function public.travel_create_invite(uuid,text,integer,integer) to authenticated;
grant execute on function public.travel_accept_invite(text) to authenticated;

alter table public.travel_profiles enable row level security;
alter table public.travel_trips enable row level security;
alter table public.travel_trip_members enable row level security;
alter table public.travel_trip_invites enable row level security;
alter table public.travel_days enable row level security;
alter table public.travel_lodgings enable row level security;
alter table public.travel_bookings enable row level security;
alter table public.travel_checklist_items enable row level security;
alter table public.travel_notes enable row level security;
alter table public.travel_expenses enable row level security;
alter table public.travel_push_subscriptions enable row level security;

create policy "travel_profiles_self_select" on public.travel_profiles for select to authenticated using (id=auth.uid());
create policy "travel_profiles_self_update" on public.travel_profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

create policy "travel_trips_member_select" on public.travel_trips for select to authenticated using (public.travel_is_member(id,auth.uid()));
create policy "travel_trips_editor_update" on public.travel_trips for update to authenticated using (public.travel_can_edit(id,auth.uid())) with check (public.travel_can_edit(id,auth.uid()));
create policy "travel_trips_owner_delete" on public.travel_trips for delete to authenticated using (public.travel_role(id,auth.uid())='owner');

create policy "travel_members_member_select" on public.travel_trip_members for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));

create policy "travel_invites_editor_select" on public.travel_trip_invites for select to authenticated using (public.travel_can_edit(trip_id,auth.uid()));

create policy "travel_days_member_select" on public.travel_days for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_days_editor_insert" on public.travel_days for insert to authenticated with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_days_editor_update" on public.travel_days for update to authenticated using (public.travel_can_edit(trip_id,auth.uid())) with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_days_editor_delete" on public.travel_days for delete to authenticated using (public.travel_can_edit(trip_id,auth.uid()));

create policy "travel_lodgings_member_select" on public.travel_lodgings for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_lodgings_editor_insert" on public.travel_lodgings for insert to authenticated with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_lodgings_editor_update" on public.travel_lodgings for update to authenticated using (public.travel_can_edit(trip_id,auth.uid())) with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_lodgings_editor_delete" on public.travel_lodgings for delete to authenticated using (public.travel_can_edit(trip_id,auth.uid()));

create policy "travel_bookings_member_select" on public.travel_bookings for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_bookings_editor_insert" on public.travel_bookings for insert to authenticated with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_bookings_editor_update" on public.travel_bookings for update to authenticated using (public.travel_can_edit(trip_id,auth.uid())) with check (public.travel_can_edit(trip_id,auth.uid()));
create policy "travel_bookings_editor_delete" on public.travel_bookings for delete to authenticated using (public.travel_can_edit(trip_id,auth.uid()));

create policy "travel_checklist_member_select" on public.travel_checklist_items for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_checklist_own_insert" on public.travel_checklist_items for insert to authenticated with check (user_id=auth.uid() and public.travel_is_member(trip_id,auth.uid()));
create policy "travel_checklist_own_update" on public.travel_checklist_items for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid() and public.travel_is_member(trip_id,auth.uid()));
create policy "travel_checklist_own_delete" on public.travel_checklist_items for delete to authenticated using (user_id=auth.uid());

create policy "travel_notes_member_select" on public.travel_notes for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_notes_own_insert" on public.travel_notes for insert to authenticated with check (author_id=auth.uid() and public.travel_is_member(trip_id,auth.uid()));
create policy "travel_notes_own_update" on public.travel_notes for update to authenticated using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy "travel_notes_own_delete" on public.travel_notes for delete to authenticated using (author_id=auth.uid());

create policy "travel_expenses_member_select" on public.travel_expenses for select to authenticated using (public.travel_is_member(trip_id,auth.uid()));
create policy "travel_expenses_own_insert" on public.travel_expenses for insert to authenticated with check (created_by=auth.uid() and public.travel_is_member(trip_id,auth.uid()));
create policy "travel_expenses_own_update" on public.travel_expenses for update to authenticated using (created_by=auth.uid()) with check (created_by=auth.uid());
create policy "travel_expenses_own_delete" on public.travel_expenses for delete to authenticated using (created_by=auth.uid());

create policy "travel_push_own_select" on public.travel_push_subscriptions for select to authenticated using (user_id=auth.uid());
create policy "travel_push_own_insert" on public.travel_push_subscriptions for insert to authenticated with check (user_id=auth.uid() and public.travel_is_member(trip_id,auth.uid()));
create policy "travel_push_own_update" on public.travel_push_subscriptions for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "travel_push_own_delete" on public.travel_push_subscriptions for delete to authenticated using (user_id=auth.uid());
