-- Swasthya Setu production data model for Supabase.
-- Apply this file in Supabase SQL Editor before enabling real-data mode.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  full_name text not null default '',
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null default '',
  phone text,
  avatar_url text,
  specialty text not null default 'Ayurveda',
  sub_specialty text,
  qualifications text,
  experience_years integer not null default 0 check (experience_years >= 0),
  hospital text,
  location text,
  consultation_fee numeric(10, 2),
  available_timings text,
  languages text[] not null default '{}',
  expertise text[] not null default '{}',
  about text,
  registration_number text,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.doctor_profiles add column if not exists display_name text not null default '';
alter table public.doctor_profiles add column if not exists phone text;
alter table public.doctor_profiles add column if not exists avatar_url text;

create table if not exists public.patient_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  age integer check (age is null or age between 0 and 120),
  gender text,
  abha_id text,
  prakriti text,
  concerns text[] not null default '{}',
  duration_of_symptoms text,
  diet_preference text,
  blood_group text,
  emergency_contact text,
  preferred_health_center text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  scheduled_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'confirmed', 'completed', 'cancelled', 'in_progress')),
  reason text not null default '',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid references public.profiles(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  visited_at timestamptz not null default timezone('utc', now()),
  specialty text,
  reason text not null default '',
  prescription_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  prescribed_by uuid references public.profiles(id) on delete set null,
  name text not null,
  dosage text not null default '',
  frequency text not null default '',
  timing text not null default '',
  duration text,
  instructions text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_adherence (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  dose_date date not null,
  dose_time time,
  taken_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'taken', 'missed', 'skipped')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (medication_id, dose_date, dose_time)
);

create table if not exists public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  document_type text not null default 'PDF' check (document_type in ('PDF', 'Image', 'Lab')),
  storage_path text not null,
  file_size_bytes bigint,
  mime_type text,
  ai_summary text,
  analyzed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_intake_summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  symptoms text[] not null default '{}',
  severity integer check (severity is null or severity between 1 and 10),
  description text,
  duration text,
  medicine_ids uuid[] not null default '{}',
  report_ids uuid[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed')),
  submitted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_queue (
  id uuid primary key,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_name text not null default '',
  payload jsonb not null default '{}'::jsonb,
  summary_pdf_url text,
  summary_pdf_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists doctor_queue_doctor_idx on public.doctor_queue(doctor_id, created_at desc);

create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at timestamptz not null default timezone('utc', now()),
  weight_kg numeric(6, 2),
  height_cm numeric(6, 2),
  systolic integer,
  diastolic integer,
  blood_sugar numeric(6, 2),
  heart_rate integer,
  sleep_hours numeric(4, 2),
  steps integer,
  wellness_score integer check (wellness_score is null or wellness_score between 0 and 100),
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  language text not null default 'English',
  region text not null default 'India',
  appointment_reminders boolean not null default true,
  medicine_reminders boolean not null default true,
  report_updates boolean not null default true,
  doctor_messages boolean not null default true,
  wellness_tips boolean not null default false,
  promotional_offers boolean not null default false,
  share_data_with_doctors boolean not null default true,
  anonymous_research boolean not null default false,
  two_factor_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists appointments_patient_idx on public.appointments(patient_id, scheduled_at desc);
create index if not exists appointments_doctor_idx on public.appointments(doctor_id, scheduled_at desc);
create index if not exists visits_patient_idx on public.visits(patient_id, visited_at desc);
create index if not exists medications_patient_idx on public.medications(patient_id, is_active);
create index if not exists reports_patient_idx on public.medical_reports(patient_id, created_at desc);
create index if not exists intake_patient_idx on public.ai_intake_summaries(patient_id, created_at desc);
create index if not exists metrics_patient_idx on public.health_metrics(patient_id, recorded_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- Keep updated_at values consistent for mutable records.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'doctor_profiles', 'patient_profiles', 'appointments', 'visits', 'medications', 'medication_adherence', 'medical_reports', 'ai_intake_summaries', 'health_metrics', 'conversations', 'notifications', 'user_settings'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

-- New auth users get a profile row; role/profile details are completed by the app.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.patient_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.visits enable row level security;
alter table public.medications enable row level security;
alter table public.medication_adherence enable row level security;
alter table public.medical_reports enable row level security;
alter table public.ai_intake_summaries enable row level security;
alter table public.doctor_queue enable row level security;
alter table public.health_metrics enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

-- Patient owns their records. Doctors can access records for assigned appointments.
create or replace function public.is_assigned_doctor(patient_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.appointments
    where patient_id = patient_uuid and doctor_id = auth.uid()
  );
$$;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_published_doctor_read on public.profiles;
create policy profiles_published_doctor_read on public.profiles for select using (
  exists (
    select 1 from public.doctor_profiles
    where doctor_profiles.user_id = profiles.id
      and doctor_profiles.is_published = true
  )
);
drop policy if exists doctors_public_read on public.doctor_profiles;
create policy doctors_public_read on public.doctor_profiles for select using (is_published = true or user_id = auth.uid());
drop policy if exists doctors_self_write on public.doctor_profiles;
create policy doctors_self_write on public.doctor_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists patient_profile_owner on public.patient_profiles;
create policy patient_profile_owner on public.patient_profiles for all using (user_id = auth.uid() or public.is_assigned_doctor(user_id)) with check (user_id = auth.uid());
drop policy if exists appointments_participant on public.appointments;
create policy appointments_participant on public.appointments for all using (patient_id = auth.uid() or doctor_id = auth.uid()) with check (patient_id = auth.uid() or doctor_id = auth.uid());
drop policy if exists visits_owner_or_doctor on public.visits;
create policy visits_owner_or_doctor on public.visits for all using (patient_id = auth.uid() or doctor_id = auth.uid() or public.is_assigned_doctor(patient_id)) with check (patient_id = auth.uid() or doctor_id = auth.uid());
drop policy if exists medications_owner_or_doctor on public.medications;
create policy medications_owner_or_doctor on public.medications for all using (patient_id = auth.uid() or public.is_assigned_doctor(patient_id)) with check (patient_id = auth.uid() or prescribed_by = auth.uid());
drop policy if exists adherence_owner on public.medication_adherence;
create policy adherence_owner on public.medication_adherence for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());
drop policy if exists reports_owner_or_doctor on public.medical_reports;
create policy reports_owner_or_doctor on public.medical_reports for all using (patient_id = auth.uid() or public.is_assigned_doctor(patient_id)) with check (patient_id = auth.uid() or uploaded_by = auth.uid());
drop policy if exists intake_owner_or_doctor on public.ai_intake_summaries;
create policy intake_owner_or_doctor on public.ai_intake_summaries for all using (patient_id = auth.uid() or public.is_assigned_doctor(patient_id)) with check (patient_id = auth.uid());
drop policy if exists doctor_queue_patient_insert on public.doctor_queue;
create policy doctor_queue_patient_insert on public.doctor_queue for insert with check (patient_id = auth.uid());
drop policy if exists doctor_queue_patient_read on public.doctor_queue;
create policy doctor_queue_patient_read on public.doctor_queue for select using (patient_id = auth.uid() or doctor_id = auth.uid());
drop policy if exists doctor_queue_doctor_update on public.doctor_queue;
create policy doctor_queue_doctor_update on public.doctor_queue for update using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
drop policy if exists metrics_owner_or_doctor on public.health_metrics;
create policy metrics_owner_or_doctor on public.health_metrics for all using (patient_id = auth.uid() or public.is_assigned_doctor(patient_id)) with check (patient_id = auth.uid());
drop policy if exists conversation_member_read on public.conversations;
create policy conversation_member_read on public.conversations for select using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid()));
drop policy if exists conversation_member_write on public.conversations;
create policy conversation_member_write on public.conversations for insert with check (true);
drop policy if exists member_read on public.conversation_members;
create policy member_read on public.conversation_members for select using (user_id = auth.uid() or exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));
drop policy if exists member_insert on public.conversation_members;
create policy member_insert on public.conversation_members for insert with check (user_id = auth.uid() or exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));
drop policy if exists messages_member_read on public.messages;
create policy messages_member_read on public.messages for select using (exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()));
drop policy if exists messages_member_insert on public.messages;
create policy messages_member_insert on public.messages for insert with check (sender_id = auth.uid() and exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()));
drop policy if exists notifications_owner on public.notifications;
create policy notifications_owner on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists settings_owner on public.user_settings;
create policy settings_owner on public.user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', false)
on conflict (id) do nothing;

drop policy if exists medical_reports_storage_read on storage.objects;
create policy medical_reports_storage_read on storage.objects for select using (
  bucket_id = 'medical-reports'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.doctor_queue
      where doctor_queue.doctor_id = auth.uid()
        and doctor_queue.patient_id::text = (storage.foldername(name))[1]
    )
  )
);
drop policy if exists medical_reports_storage_insert on storage.objects;
create policy medical_reports_storage_insert on storage.objects for insert with check (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists medical_reports_storage_delete on storage.objects;
create policy medical_reports_storage_delete on storage.objects for delete using (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
