# Шпаргалка и сценарий защиты Лабораторной работы № 6

**Тема:** PostgreSQL: Проектирование схемы базы данных  
**Группа:** IT3-2304  
**Студенты:** Новиков Максим, Сартов Даурен, Арыстамбаева Жанель, Ханов Алишер, Сабекова Томирис  

---

## 📌 Главное правило защиты
1. **Не открывайте pgAdmin или веб-интерфейсы**, если препод не просит — показывайте всё в консоли через `psql`. Это сразу производит впечатление профессиональной работы.
2. Отвечайте **терминами стандарта SQL и PostgreSQL**: *ACID, B-Tree индекс, Seq Scan / Bitmap Index Scan, SQLSTATE, READ COMMITTED, 3-я нормальная форма*.

---

## 🚀 Блок 1. Демонстрация «Чистого запуска» с нуля (30 секунд)

Преподаватель часто просит: *«Покажи, что у тебя всё собирается с нуля без ошибок»*.

Перейдите в папку проекта:
```bash
cd /Users/novitech/src/university/04-course/web/06-lab/course-catalog-db
```

Выполните команду одной строкой:
```bash
PGPASSWORD=change-me psql -h localhost -U catalog_app -d course_catalog -v ON_ERROR_STOP=1 -f schema.sql && \
PGPASSWORD=change-me psql -h localhost -U catalog_app -d course_catalog -v ON_ERROR_STOP=1 -f seed.sql && \
PGPASSWORD=change-me psql -h localhost -U catalog_app -d course_catalog -v ON_ERROR_STOP=1 -f queries.sql
```

🗣️ **Что говорить:**
> *«Схема полностью идемпотентна: сначала удаляются старые таблицы через `DROP TABLE IF EXISTS`, затем создаются три сущности с ограничениями целостности, накатываются сиды (6 курсов, 3 студента, 6 записей) и отрабатывают все 8 маршрутных запросов без единой ошибки».*

---

## 📊 Блок 2. Показ структуры таблиц и внешних ключей

Подключитесь к базе:
```bash
PGPASSWORD=change-me psql -h localhost -U catalog_app -d course_catalog
```

Покажите структуру самой сложной таблицы `enrollments`:
```sql
\d enrollments
```
**Что увидит преподаватель:**
* `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
* Два внешних ключа:
  * `enrollments_course_id_fkey` $\to$ `REFERENCES courses(id) ON DELETE RESTRICT`
  * `enrollments_student_id_fkey` $\to$ `REFERENCES students(id) ON DELETE CASCADE`
* Уникальный композитный ключ: `UNIQUE (course_id, student_id)`
* Индекс: `enrollments_student_id_idx` на внешний ключ.

Покажите ограничения на курсах и студентах:
```sql
\d courses
\d students
```

🗣️ **Что говорить:**
> *«Для `course_id` выбран `ON DELETE RESTRICT`, так как курс — это институциональная сущность. Если на курс уже записаны студенты, курс нельзя удалить случайно. А для `student_id` выбран `ON DELETE CASCADE`: при удалении профиля студента его записи на курсы должны удаляться вместе с ним».*

---

## 🔍 Блок 3. Демонстрация ключевых запросов

### 1. Подсчёт статистики (Запрос 6)
```sql
SELECT c.id, count(e.id) AS enrolled
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id
ORDER BY enrolled DESC, c.id;
```
🗣️ **Что говорить:**
> *«Обратите внимание: мы используем `LEFT JOIN` и обязательно `count(e.id)`, а не `count(*)`. Если бы мы написали `count(*)`, то курсы с нулём студентов вернули бы 1, так как `LEFT JOIN` создаёт одну строку с NULL-значениями. `count(e.id)` считает только не-NULL значения и честно возвращает 0».*

### 2. Атомарный инкремент лайков (Запрос 3)
```sql
UPDATE courses SET likes = likes + 1 WHERE id = 'api-design' RETURNING id, likes;
```
🗣️ **Что говорить:**
> *«Инкремент выполняется атомарно внутри базы данных `likes = likes + 1`, а не через вычитывание значения в Python и перезапись. Это исключает проблему Lost Update при конкурентных запросах».*

---

## 💥 Блок 4. Контролируемые ошибки и SQLSTATE

Включите подробный режим вывода:
```sql
\set VERBOSITY verbose
```

### 1. Попытка записать студента на тот же курс повторно:
```sql
INSERT INTO enrollments (course_id, student_id) VALUES ('modern-frontend', 1);
```
* **Код ошибки:** `23505` (unique_violation)
* **Ограничение:** `enrollments_course_id_student_id_key`
* **HTTP-ответ API:** `409 Conflict`

### 2. Попытка удалить курс с активными студентами:
```sql
DELETE FROM courses WHERE id = 'modern-frontend';
```
* **Код ошибки:** `23001` (RESTRICT setting of foreign key)
* **HTTP-ответ API:** `409 Conflict`

### 3. Каскадное удаление (которое не падает, а очищает зависимые строки):
```sql
BEGIN;
SELECT count(*) FROM enrollments; -- было 6
DELETE FROM students WHERE email = 'dauren@example.com'; -- удаляем Даурена
SELECT count(*) FROM enrollments; -- стало 3 (все 3 его записи удалились каскадом)
ROLLBACK;
SELECT count(*) FROM enrollments; -- снова 6
```

Верните обычный режим вывода:
```sql
\set VERBOSITY default
```

---

## ⚡ Блок 5. Демонстрация индекса на 50 000 строк (база `idx_demo`)

Переключитесь в тестовую базу:
```sql
\c idx_demo
```

### 1. Замер ДО индекса (удаляем индекс для наглядности):
```sql
DROP INDEX IF EXISTS enrollments_student_id_idx;
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE student_id = 777;
```
👉 **Результат:** `Seq Scan`, `Rows Removed by Filter: 49997`, время ~**3–5 ms**.

### 2. Создание индекса и замер ПОСЛЕ:
```sql
CREATE INDEX enrollments_student_id_idx ON enrollments (student_id);
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE student_id = 777;
```
👉 **Результат:** `Bitmap Heap Scan` $\to$ `Bitmap Index Scan`, `Rows Removed: 0`, время **0.006–0.02 ms** (**ускорение более чем в 300–500 раз!**).

### 3. Размер индекса:
```sql
SELECT pg_size_pretty(pg_relation_size('enrollments')) AS table_size,
       pg_size_pretty(pg_relation_size('enrollments_student_id_idx')) AS index_size;
```
🗣️ **Что говорить:**
> *«Индекс даёт колоссальный прирост в скорости, но занимает ~896 КБ (около 27% от размера таблицы) и замедляет операции `INSERT`/`DELETE`. Поэтому индексы создаются точечно под частые запросы и внешние ключи, а не на каждую колонку подряд».*

Вернитесь в рабочую базу:
```sql
\c course_catalog
```

---

## 🔒 Блок 6. Демонстрация транзакций (All-or-Nothing)

Покажите сценарий, когда операция сорвалась на середине:
```sql
BEGIN;
INSERT INTO students (name, email) VALUES ('Тестовый Студент', 'temp@example.com');
-- Вторая вставка падает из-за несуществующего курса:
INSERT INTO enrollments (course_id, student_id)
SELECT 'fake-course', id FROM students WHERE email = 'temp@example.com';
```
Вы увидите ошибку внешнего ключа и статус `=!>`.
Попробуйте сделать SELECT:
```sql
SELECT count(*) FROM students;
-- ERROR: current transaction is aborted, commands ignored until end of transaction block
ROLLBACK;
-- Проверяем: студент не остался в базе
SELECT count(*) FROM students WHERE email = 'temp@example.com'; -- вернет 0
```
🗣️ **Что говорить:**
> *«Транзакция гарантирует свойство Atomicity. Без транзакции студент был бы создан, а запись на курс упала — в системе остался бы "висячий" студент без курсов».*

---

## 🎁 Блок 7. Бонусные задания (Козыри для 10/10)

### 1. Защита от SQL-инъекций (Prepared Statements)
```sql
-- Уязвимый вариант (конкатенация):
SELECT id, title FROM courses WHERE id = 'x' OR '1'='1'; -- выдает ВСЕ 6 курсов!

-- Безопасный вариант через подготовленный запрос:
PREPARE by_id (text) AS SELECT id, title FROM courses WHERE id = $1;
EXECUTE by_id('x'' OR ''1''=''1'); -- выдает 0 строк!
DEALLOCATE by_id;
```
🗣️ **Что говорить:**
> *«В `PREPARE` парсер базы формирует дерево запроса заранее. Значение `$1` передаётся как литерал, и синтаксические токены `OR '1'='1'` не могут изменить логику предикатов».*

### 2. Запросы 7 и 8 (HAVING и LEFT JOIN IS NULL)
```sql
-- Курсы без единой записи:
SELECT c.id FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id WHERE e.id IS NULL ORDER BY c.id;

-- Студенты с более чем 1 курсом:
SELECT s.name, count(*) AS courses FROM students s JOIN enrollments e ON e.student_id = s.id GROUP BY s.id, s.name HAVING count(*) > 1 ORDER BY courses DESC;
```

---

## 🧠 Топ-10 каверзных вопросов преподавателя и ответы

1. **В: Зачем валидация в БД (`CHECK`, `NOT NULL`), если у нас в FastAPI есть Pydantic?**  
   **О:** Pydantic валидирует данные только на одном конкретном HTTP-входе бэкенда. База данных — единый источник правды. В неё могут писать фоновые задачи (Celery), скрипты миграций, аналитики через `psql` или другие сервисы. Ограничения в БД гарантируют целостность независимо от кода приложений.

2. **В: Почему `courses.id` — это `text` (slug), а `students.id` — `bigint`?**  
   **О:** Slug курса (`modern-frontend`) неизменен, понятен человеку и напрямую используется в красивых URL `/courses/{id}`. Студент же идентифицируется суррогатным числовым ключом `bigint`, потому что персональные данные (email, ФИО) могут меняться, а 8-байтный целочисленный ключ компактен и максимально быстр в индексах.

3. **В: Почему PostgreSQL сам создал индекс на `email` и `(course_id, student_id)`, но не создал на `student_id`?**  
   **О:** PostgreSQL автоматически создаёт B-Tree индексы только для `PRIMARY KEY` и `UNIQUE`. Для `FOREIGN KEY` индексы автоматически не строятся. А композитный индекс `(course_id, student_id)` работает только слева-направо (по первой колонке), поэтому для поиска по `student_id` потребовался отдельный явный индекс.

4. **В: Почему на маленькой таблице `courses` (6 строк) поиск по первичному ключу идёт через `Seq Scan`, а не по индексу?**  
   **О:** Планировщик оценивает стоимость (cost). 6 строк помещаются на одной дисковой странице памяти. Прочитать одну страницу целиком дешевле (`cost ~ 1.07`), чем читать страницу индекса, а потом страницу таблицы.

5. **В: В чём разница между `timestamptz` и `timestamp`?**  
   **О:** `timestamptz` сохраняет точный момент времени в UTC со смещением часового пояса, что исключает ошибки при работе клиентов из разных часовых поясов или переходе на летнее/зимнее время. Обычный `timestamp` не хранит информацию о часовом поясе.

6. **В: В чём разница между `varchar(255)` и `text` в PostgreSQL?**  
   **О:** В PostgreSQL `text` и `varchar` используют одну и ту же внутреннюю структуру хранения (`varlena`) и работают с одинаковой скоростью. Ограничение в 255 символов — легаси от MySQL/Oracle. В PostgreSQL предпочтителен `text`, а бизнес-правила задаются через `CHECK (char_length(...) >= 2)`.

7. **В: Что такое аномалии плоской таблицы?**  
   **О:** 
   * *Аномалия обновления:* изменение названия курса в одной строке приводит к противоречию данных.
   * *Аномалия удаления:* удаление записи студента стирает сам факт существования курса.
   * *Аномалия вставки:* нельзя добавить курс в каталог, пока на него не записался хотя бы один студент.

8. **В: Что означает уровень изоляции `READ COMMITTED`?**  
   **О:** Это дефолтный уровень изоляции PostgreSQL. Транзакция видит только те изменения других транзакций, которые были зафиксированы (`COMMIT`) на момент начала текущей операции (statement). Незакоммиченные изменения других клиентов не видны.

9. **В: В чём разница между `WHERE` и `HAVING`?**  
   **О:** `WHERE` фильтрует строки *до* группировки (`GROUP BY`), а `HAVING` фильтрует сформированные агрегированные группы (`HAVING count(*) > 1`).

10. **В: Что делает `GENERATED ALWAYS AS IDENTITY`?**  
    **О:** Это стандартный SQL-эквивалент механизма identity/sequence, который гарантирует, что база данных сама генерирует уникальный ключ. Прямая ручная вставка значения без специального флага завершится ошибкой `428C9`.
