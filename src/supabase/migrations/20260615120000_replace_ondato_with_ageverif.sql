alter table public.creator_applications
  drop column if exists ondato_identity_verification_id,
  drop column if exists ondato_session_token,
  add column if not exists ageverif_resource_uid text;

drop index if exists creator_applications_ondato_id_idx;

create index if not exists creator_applications_ageverif_uid_idx
  on public.creator_applications (ageverif_resource_uid)
  where ageverif_resource_uid is not null;
