-- ABA Web Agency — create the two accounts
--
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- There is no public signup page; these are the only two accounts.
--
--   Set both passwords below before running. Once run, the accounts can sign
--   in immediately — email is pre-confirmed, so no confirmation link is sent.
--
--   Passwords are placeholders on purpose: this file is in version control.
--
-- Safe to re-run: existing accounts are skipped, not duplicated.
-- To change a password later, see the snippet at the bottom.

do $$
declare
  admin_email    text := 'med@intelligentb2b.com';
  admin_password text := 'CHANGE_ME';
  admin_name     text := 'Med';

  client_email    text := 'user@aba.it';
  client_password text := 'CHANGE_ME';
  client_name     text := 'ABA Web Agency';
  client_company  text := 'ABA Web Agency';

  new_id uuid;
begin
  -- nothing is written until both passwords have been set
  if admin_password = 'CHANGE_ME' or client_password = 'CHANGE_ME' then
    raise exception 'Set both passwords before running this script.';
  end if;

  -- ---------------------------------------------------------------- admin
  if not exists (select 1 from auth.users where email = admin_email) then
    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id, 'authenticated', 'authenticated', admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', admin_name),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), new_id, new_id::text,
      jsonb_build_object('sub', new_id::text, 'email', admin_email),
      'email', now(), now(), now()
    );
  end if;

  -- the signup trigger creates the profile; make sure it is an admin one
  update public.profiles
     set role = 'admin', full_name = coalesce(full_name, admin_name)
   where email = admin_email;

  -- --------------------------------------------------------------- client
  if not exists (select 1 from auth.users where email = client_email) then
    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id, 'authenticated', 'authenticated', client_email,
      extensions.crypt(client_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', client_name, 'company', client_company),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), new_id, new_id::text,
      jsonb_build_object('sub', new_id::text, 'email', client_email),
      'email', now(), now(), now()
    );
  end if;
end
$$;

-- Check it worked — you should see exactly two rows, one admin, one client.
select email, full_name, company, role from public.profiles order by role;

-- ---------------------------------------------------------------------------
-- To change a password later:
--
--   update auth.users
--      set encrypted_password = extensions.crypt('new-password', extensions.gen_salt('bf'))
--    where email = 'med@intelligentb2b.com';
-- ---------------------------------------------------------------------------
