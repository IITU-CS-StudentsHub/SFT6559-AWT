# Course Lab Standard & Guidelines

## 1. Student Identity & Course Context
- **Course**: Advanced Web Technologies (Веб-технологии, 4 курс)
- **Student**: Novikov Maxim IT3-2304
- All lab deliverables, READMEs, and reports must include the student header:
  ```markdown
  # <Lab Name / Title>
  **Student:** Novikov Maxim IT3-2304  
  **Course:** Advanced Web Technologies · Lab <N>: <Topic>
  ```

## 2. Lab Structure Standards
- Each lab should be self-contained in its corresponding folder (e.g., `06-lab/course-catalog-db` or as specified in the assignment).
- Documentation files (`.docx`, `.pdf`) reside in `docs/`.
- Executable scripts, seeds, schemas, tests, or subprojects should be clearly arranged according to the assignment requirements.

## 3. README.md Report Structure
A complete laboratory report README must contain:
1. **Header & Context**: Student details, course name, lab title.
2. **Project Description & Goal**: Concise summary of what was built and why.
3. **How to Run**:
   - Prerequisites (Node.js, Python, PostgreSQL, Docker, etc.).
   - Exact commands for clean setup and execution (environment variables, install commands, dev servers, database migrations/runs).
4. **Architecture & Schema / Design Diagrams**:
   - Mermaid diagram (`erDiagram`, `flowchart`, or `sequenceDiagram`) where applicable.
   - 2–3 sentences explaining the structural and entity relationships.
5. **Key Decisions & Technical Rationale**:
   - Explanation of architectural choices (e.g. types, constraints, server vs client rendering, caching).
6. **Detailed Experiment / Verification Log**:
   - Step-by-step table or logs of tests, edge cases, error codes (e.g. SQLSTATE, HTTP codes), explain plans, and observations.
7. **Answers to Assignment Questions**:
   - Thoughtful, deep, technically sound answers to all theoretical/conceptual questions posed in the assignment.
8. **Self-Review Checklist**:
   - Verification against the rubric table with "Yes" / explanation.
9. **Bonus Tasks (if any)**:
   - Complete implementation and documentation of all available bonus tasks for top marks.

## 4. Git Commit Guidelines
- Commit incrementally as work progresses (do not create one monolithic commit at the end).
- Adhere to the lab specification's suggested commit messages or standard Conventional Commits (`feat(...)`, `test(...)`, `docs(...)`).
- Verify `git status` to ensure no unwanted temporary files, cache directories (`.pytest_cache`, `.DS_Store`), or secrets are committed.
