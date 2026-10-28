-- norm_demo.sql: a flat registrations table for normalization experiments
DROP TABLE IF EXISTS registrations;

CREATE TABLE registrations (
    id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_name  text,
    student_email text,
    course_id     text,
    course_title  text,
    credits       integer
);

INSERT INTO registrations
  (student_name, student_email, course_id, course_title, credits) VALUES
  ('Жанель Арыстамбаева', 'zhanel@example.com',
   'modern-frontend', 'Modern Frontend: React & Next.js', 5),
  ('Жанель Арыстамбаева', 'zhanel@example.com',
   'ai-integration', 'AI/LLM Integration', 5),
  ('Даурен Сартов', 'dauren@example.com',
   'modern-frontend', 'Modern Frontend: React & Next.js', 5),
  ('Даурен Сартов', 'dauren@example.com',
   'backend-fastapi', 'Backend Foundations: FastAPI', 5),
  ('Даурен Сартов', 'dauren@example.com',
   'ai-integration', 'AI/LLM Integration', 5),
  ('Алишер Ханов', 'alisher@example.com',
   'ai-integration', 'AI/LLM Integration', 5);
