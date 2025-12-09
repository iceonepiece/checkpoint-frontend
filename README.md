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
CREATE TABLE public.files (
  file_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  repo_id bigint NOT NULL,
  path text NOT NULL,
  asset_status smallint NOT NULL DEFAULT '0'::smallint,
  CONSTRAINT files_pkey PRIMARY KEY (file_id),
  CONSTRAINT unique_repo_id_path UNIQUE (repo_id, path)
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


## Core Features

### 🔼 Upload New Assets
Easily upload new assets through a simple UI.
Each upload automatically creates a Git commit, making version tracking effortless.

### 🔒 File Locking System
Artists can lock and unlock files to prevent conflicting edits.
Reviewers have permission to override locks when necessary.

### 👀 Asset Review & Status Management
Reviewers can review submitted assets, leave comments, and update asset status
(e.g. Needs Changes, Pending, or Approved).

### 🖼️ Asset Preview & Diff Comparison
View asset previews directly in the browser and compare versions side-by-side.
Perfect for checking visual changes, file updates, and improvements across commits.

## Screenshots 
![image alt](https://github.com/iceonepiece/checkpoint-frontend/blob/098297209353ef33c3c2022f0170119fce629570/public/samples/1.png)
![image alt](https://github.com/iceonepiece/checkpoint-frontend/blob/098297209353ef33c3c2022f0170119fce629570/public/samples/2.png)
![image alt](https://github.com/iceonepiece/checkpoint-frontend/blob/098297209353ef33c3c2022f0170119fce629570/public/samples/3.png)
![image alt](https://github.com/iceonepiece/checkpoint-frontend/blob/098297209353ef33c3c2022f0170119fce629570/public/samples/4.png)

## Video Demostration 
[Google Drive](https://drive.google.com/drive/folders/1-LDTARu7B4La_nXgjyPTqknfPn86p0KC?usp=sharing)

## Team Members
```bash
1. Vibhumi Sermsilp  65360501810 
2. Jarusrawee Deekhuankhun  65360501812 
```
