---
name: lab-workflow
description: >-
  Standardized end-to-end workflow for completing university laboratory works in the repository.
  Use when reading lab requirements (ТЗ), analyzing references and existing lab conventions,
  implementing code, executing database or API experiments, writing README reports, and verifying against acceptance criteria.
---

# University Laboratory Work Execution Guide

This skill standardizes the procedure for analyzing, implementing, testing, and documenting laboratory assignments for the **Advanced Web Technologies** course.

---

## Workflow Overview

```
1. Study Requirements (ТЗ) ➔ 2. Study References ➔ 3. Environment Setup ➔ 4. Implementation & Experiments ➔ 5. Verification & Bonus ➔ 6. Report & Commits
```

---

## Step 1: Study Requirements & Task Specification (ТЗ)

1. **Locate Assignment Files**:
   - Inspect the current lab directory: `0X-lab/docs/`.
   - Identify assignment files: `.docx`, `.pdf`.

2. **Extract Text and Tables**:
   - Use the extraction helper script:
     ```bash
     python3 .agents/skills/lab-workflow/scripts/extract_doc.py "0X-lab/docs/<assignment_file>.docx" "0X-lab/docs/lab_spec.txt"
     ```
   - If only PDF exists:
     ```bash
     python3 .agents/skills/lab-workflow/scripts/extract_doc.py "0X-lab/docs/<assignment_file>.pdf" "0X-lab/docs/lab_spec.txt"
     ```

3. **Analyze the Requirements**:
   - What are the core deliverables and directory structure?
   - What domain rules, database schemas, or API endpoints must be created?
   - What experiments and error scenarios must be demonstrated?
   - What conceptual questions must be answered in the README?
   - What acceptance criteria and grading rubrics are specified?
   - What bonus tasks are offered?

---

## Step 2: Study References & Existing Standards

1. **Inspect Past Labs**:
   - Review previous labs (`01-lab`, `02-lab`, `04-lab`, `05-lab`) to maintain consistent quality and conventions:
     - Student identity: `Novikov Maxim IT3-2304`
     - Technology choices: Next.js (App Router), FastAPI, PostgreSQL, Tailwind CSS, Pydantic.
     - Code formatting, folder organization, and naming conventions (`snake_case` in SQL/Python, `kebab-case` in routes/slugs, `PascalCase` in React components).

2. **Review Documentation Standards**:
   - Examine [lab_template.md](./references/lab_template.md).
   - Past labs feature thorough, professional READMEs with:
     - Clear setup instructions (`How to run`).
     - Mermaid architecture or ER diagrams.
     - Explicit design decision writeups.
     - Exhaustive experiment / verification logs (e.g. CORS diagnostic algorithms, SQLSTATE tables, EXPLAIN plans).
     - Completed self-review checklists.
     - Full solutions for all bonus tasks.

3. **Check Git Commit Conventions**:
   - Check `git log` of the repository.
   - Follow either conventional commit prefixes (`feat(...)`, `docs(...)`) or the step-by-step commit sequence explicitly recommended in the assignment.

---

## Step 3: Environment Setup & Pre-requisites

1. **Check Local Services**:
   - Ensure required runtimes are available: Python (>= 3.10), Node.js, pnpm, Docker, PostgreSQL.
   - For PostgreSQL: verify client (`psql`) and server (Docker or Homebrew service).
   - Set client encoding to UTF-8 (`PGCLIENTENCODING=UTF8`) if needed.

2. **Create Project Directory & Substructure**:
   - Set up the specific repository or directory layout demanded by the assignment (e.g., `course-catalog-db/`).

---

## Step 4: Step-by-Step Implementation & Controlled Experiments

1. **Core Implementation**:
   - Implement schemas, migrations, seeds, backend routes, or frontend components in logical progression.
   - Ensure idempotent execution (e.g., `DROP TABLE IF EXISTS`, clean migrations).

2. **Execute Controlled Experiments**:
   - Systematically reproduce every experiment described in the assignment:
     - Constraint violations with `\set VERBOSITY verbose` to capture SQLSTATE, constraint names, and API mappings.
     - Query plans using `EXPLAIN` and `EXPLAIN ANALYZE` before and after indexing.
     - Concurrency and transaction isolation tests (e.g., row locks, rollbacks).
   - Record raw outputs and timings.

3. **Implement Bonus Tasks**:
   - Whenever bonus tasks are available, implement all of them to guarantee maximum points.
   - Test them thoroughly and document findings.

---

## Step 5: Verification & Quality Assurance

1. **Clean-Slate Test**:
   - Verify that the project can be spun up from a fresh state without manual intervention:
     - Re-run schema creation, seed loading, and query execution.
     - Ensure zero errors or unhandled warnings.

2. **Self-Review Against Checklist**:
   - Cross-check every item in the lab's Acceptance Checklist / Grading Rubric.
   - Verify table row counts, types, constraints, query outputs, and Mermaid diagrams.

---

## Step 6: Documentation & Commit Progression

1. **Write the README Report**:
   - Follow the structure defined in [lab_template.md](./references/lab_template.md).
   - Provide answers to all theoretical questions in detail with solid software engineering arguments.

2. **Incremental Commits**:
   - Commit changes logically as features/steps are completed.
   - Ensure clean `git status` with no leftover scratch files or unwanted artifacts.
