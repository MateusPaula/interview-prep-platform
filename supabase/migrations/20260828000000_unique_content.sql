alter table public.challenges
  add constraint challenges_title_key unique (title);

alter table public.behavioral_questions
  add constraint behavioral_questions_question_key unique (question);
