create table public.trip_cost_overrides (
  key text primary key,
  amount numeric(12,2) check (amount >= 0 and amount <= 999999999),
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by text check (updated_by in ('Florindo','Maria Concetta','Emilio','Federica','Ruggero','Carmen'))
);
alter table public.trip_cost_overrides enable row level security;
-- Match this small group's existing name-based access model. Only seeded amounts are writable.
create policy read_trip_costs on public.trip_cost_overrides for select to anon, authenticated using (true);
create policy update_trip_costs on public.trip_cost_overrides for update to anon, authenticated using (true) with check (updated_by is not null);
revoke all on public.trip_cost_overrides from anon, authenticated;
grant select on public.trip_cost_overrides to anon, authenticated;
grant update(amount,updated_by) on public.trip_cost_overrides to anon, authenticated;
create function public.touch_trip_cost_override() returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.touch_trip_cost_override() from public;
create trigger trip_cost_override_revision before update on public.trip_cost_overrides for each row execute function public.touch_trip_cost_override();
insert into public.trip_cost_overrides(key) values
('site:parking:1:Parcheggio alloggio Reykjavík'),
('site:parking:2:Þingvellir · P1 Hakið'),
('site:parking:2:Brúarfoss · parcheggio nuovo'),
('site:parking:2:Geysir · parcheggio principale'),
('site:parking:2:Gullfoss · Upper Parking'),
('site:parking:2:Faxi / Faxafoss'),
('site:parking:2:Urriðafoss'),
('site:parking:3:Seljalandsfoss'),
('site:parking:3:Gljúfrabúi'),
('site:parking:3:Skógafoss'),
('site:parking:3:Kvernufoss'),
('site:parking:3:Sólheimasandur Plane Wreck'),
('site:parking:3:Dyrhólaey · Lower + Upper'),
('site:parking:3:Reynisfjara · P1 Lower'),
('site:parking:4:Fjaðrárgljúfur'),
('site:parking:4:Skaftafell'),
('site:parking:4:Jökulsárlón + Diamond Beach'),
('site:parking:4:Hornafjarðarfljót · nuovo ponte'),
('site:parking:5:Egilsstaðir'),
('site:parking:5:Seyðisfjörður'),
('site:parking:5:Goðafoss'),
('site:parking:6:Húsavík · porto'),
('site:parking:6:Dettifoss · lato ovest 862'),
('site:parking:6:Hverir'),
('site:parking:6:Dimmuborgir'),
('site:parking:6:Grjótagjá'),
('site:parking:6:Vaðlaheiðargöng ×2'),
('site:parking:7:Siglufjörður'),
('site:parking:7:Grafarkirkja / Gröf'),
('site:parking:7:Hvammstangi'),
('site:parking:7:Stykkishólmur · P1 porto'),
('site:parking:8:Kirkjufell / Kirkjufellsfoss'),
('site:parking:8:Rauðfeldsgjá'),
('site:parking:8:Arnarstapi · Cliff/Bárður area'),
('site:parking:8:Búðakirkja'),
('site:parking:8:Ytri Tunga'),
('site:entries:1:Harpa Concert Hall'),
('site:entries:2:Þingvellir National Park'),
('site:entries:2:Kerið'),
('site:entries:4:Stokksnes / Vestrahorn'),
('site:optional:1:Hallgrímskirkja · torre'),
('site:optional:1:Museo Fallologico'),
('site:optional:1:Perlan'),
('site:optional:3:Plane Wreck · navetta'),
('budget:volo'),
('budget:alloggi'),
('budget:trasporto'),
('budget:pasti'),
('budget:attivita'),
('budget:assicurazione');
