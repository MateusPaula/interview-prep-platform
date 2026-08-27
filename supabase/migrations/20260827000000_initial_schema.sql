create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null,
  topic text not null check (
    topic in (
      'arrays',
      'strings',
      'hash-maps',
      'two-pointers',
      'sliding-window',
      'stacks-queues',
      'linked-lists',
      'trees',
      'graphs',
      'binary-search',
      'recursion-backtracking',
      'dynamic-programming'
    )
  ),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  starter_code text not null,
  created_at timestamptz not null default now()
);

create table public.behavioral_questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('teamwork', 'leadership', 'conflict', 'failure', 'growth')
  ),
  question text not null
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id),
  topic text not null check (
    topic in (
      'arrays',
      'strings',
      'hash-maps',
      'two-pointers',
      'sliding-window',
      'stacks-queues',
      'linked-lists',
      'trees',
      'graphs',
      'binary-search',
      'recursion-backtracking',
      'dynamic-programming'
    )
  ),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  outcome text not null check (
    outcome in ('solved', 'solved_with_hints', 'gave_up')
  ),
  hints_used int not null check (hints_used >= 0 and hints_used <= 3),
  time_spent_seconds int not null check (time_spent_seconds >= 0),
  attempted_at timestamptz not null default now()
);

create index attempts_user_id_idx on public.attempts (user_id);

create index attempts_challenge_id_idx on public.attempts (challenge_id);

create table public.confidence_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null check (
    topic in (
      'arrays',
      'strings',
      'hash-maps',
      'two-pointers',
      'sliding-window',
      'stacks-queues',
      'linked-lists',
      'trees',
      'graphs',
      'binary-search',
      'recursion-backtracking',
      'dynamic-programming'
    )
  ),
  level int not null check (level >= 1 and level <= 5),
  rated_at timestamptz not null default now()
);

create index confidence_ratings_user_topic_rated_idx
  on public.confidence_ratings (user_id, topic, rated_at);

alter table public.challenges enable row level security;
alter table public.behavioral_questions enable row level security;
alter table public.attempts enable row level security;
alter table public.confidence_ratings enable row level security;

create policy "authenticated users can read challenges"
  on public.challenges
  for select
  to authenticated
  using (true);

create policy "authenticated users can read behavioral questions"
  on public.behavioral_questions
  for select
  to authenticated
  using (true);

create policy "users can read their own attempts"
  on public.attempts
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users can insert their own attempts"
  on public.attempts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "users can read their own confidence ratings"
  on public.confidence_ratings
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users can insert their own confidence ratings"
  on public.confidence_ratings
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));
