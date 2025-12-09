# checkpoint-frontend
Checkpoint is a web application project created for the DT468 course.

## How to setup

### 1. Clone the repository
```bash
git clone https://github.com/iceonepiece/checkpoint-frontend.git
cd checkpoint-frontend
```
### 2. Install dependencies and run
```bash
npm install
npm run dev
```

## Database Setup
### 1. Create tables
```bash
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  comment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  file_id bigint,
  github_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  message text NOT NULL,
  CONSTRAINT comments_pkey PRIMARY KEY (comment_id),
  CONSTRAINT comments_github_id_fkey FOREIGN KEY (github_id) REFERENCES public.users(github_id),
  CONSTRAINT comments_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id)
);
CREATE TABLE public.file_versions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_id bigint NOT NULL,
  blob_sha text,
  commit_sha text,
  CONSTRAINT file_versions_pkey PRIMARY KEY (id),
  CONSTRAINT file_versions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id)
);
CREATE TABLE public.files (
  file_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  repo_id bigint NOT NULL,
  path text NOT NULL,
  asset_status smallint NOT NULL DEFAULT '0'::smallint,
  CONSTRAINT files_pkey PRIMARY KEY (file_id)
);
CREATE TABLE public.lock_events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  github_id bigint NOT NULL,
  is_locked boolean NOT NULL,
  file_id bigint NOT NULL,
  CONSTRAINT lock_events_pkey PRIMARY KEY (id),
  CONSTRAINT lock_events_github_id_fkey FOREIGN KEY (github_id) REFERENCES public.users(github_id),
  CONSTRAINT lock_events_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id)
);
CREATE TABLE public.sessions (
  session_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  github_id bigint,
  github_access_token text NOT NULL,
  session_token text NOT NULL UNIQUE,
  CONSTRAINT sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT sessions_github_id_fkey FOREIGN KEY (github_id) REFERENCES public.users(github_id)
);
CREATE TABLE public.users (
  github_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  username text,
  avatar_url text,
  CONSTRAINT users_pkey PRIMARY KEY (github_id)
);
```


## Description of features


## Screenshots 
