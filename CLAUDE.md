# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Repository Overview

- **Name**: Claude
- **Owner**: jordialberti
- **Status**: New repository — initial setup phase

## Project Structure

This repository is in its initial state. As the project grows, this section should be updated to reflect the directory layout and architecture.

```
/
├── CLAUDE.md          # AI assistant guidance (this file)
└── (project files)    # To be added
```

## Development Workflow

### Git Conventions

- **Branch naming**: Use descriptive branch names prefixed by category (e.g., `feature/`, `fix/`, `docs/`, `claude/`)
- **Commit messages**: Write clear, imperative-mood messages (e.g., "Add user authentication module", not "Added user auth")
- **Commits**: Keep commits focused and atomic — one logical change per commit

### Code Style

When code is added to this repository, follow these conventions:

- Prefer clarity over cleverness
- Keep functions small and single-purpose
- Use meaningful variable and function names
- Add comments only where the intent isn't obvious from the code itself

## Commands

_No build, test, or lint commands configured yet. Update this section as tooling is added._

<!--
Example format once commands are set up:
- **Install dependencies**: `npm install` / `pip install -r requirements.txt`
- **Run tests**: `npm test` / `pytest`
- **Run single test**: `npm test -- path/to/test` / `pytest path/to/test.py`
- **Lint**: `npm run lint` / `ruff check .`
- **Build**: `npm run build` / `make build`
- **Format**: `npm run format` / `ruff format .`
-->

## Guidelines for AI Assistants

1. **Read before writing** — Always read existing files before proposing changes
2. **Minimal changes** — Only modify what's necessary to accomplish the task; avoid scope creep
3. **No over-engineering** — Don't add abstractions, utilities, or error handling beyond what's needed
4. **Security first** — Never commit secrets, credentials, or sensitive data; avoid introducing OWASP top 10 vulnerabilities
5. **Test your changes** — Run available tests before considering a task complete
6. **Update this file** — When adding significant structure, tooling, or conventions, update CLAUDE.md to keep it current
