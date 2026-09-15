# Supabase setup

The production data model is in `supabase/schema.sql`.

## Apply the database

1. Create a Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste and run `supabase/schema.sql`.
4. In **Project Settings -> API**, copy the project URL and anon key.
5. Create `.env.local` from `.env.local.example` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Configure Supabase Auth providers for the login methods you want to support.
7. Test registration first. The database trigger creates `profiles`, `patient_profiles`, and `user_settings` rows for each new auth user.

## Tables

- `profiles`, `patient_profiles`, `doctor_profiles`
- `appointments`, `visits`
- `medications`, `medication_adherence`
- `medical_reports`, `ai_intake_summaries`
- `health_metrics`
- `conversations`, `conversation_members`, `messages`
- `notifications`, `user_settings`

Medical files are stored privately in the `medical-reports` Storage bucket. The path must begin with the authenticated user ID, for example `<user-id>/<report-id>.pdf`.

## Security

Row Level Security is enabled for every application table. Patients can access their own records; doctors can access records connected through appointments. Storage policies restrict report files to the owning user's folder.

The existing dashboard still needs to be migrated from its localStorage/demo reads to these tables. Do not enable production real-data mode until the Supabase environment variables are configured and the relevant pages use the repository queries.
