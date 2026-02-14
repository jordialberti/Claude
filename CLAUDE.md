# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Repository Overview

- **Name**: Claude
- **Owner**: jordialberti
- **Status**: Monorepo with independent subprojects

## Project Structure

This repository is organized as a monorepo. Each subdirectory is an independent subproject.

```
/
├── CLAUDE.md          # AI assistant guidance (this file)
├── helloworld/        # Minimal Python subproject
│   └── main.py
├── WD1/               # SAP B1 Purchase Request → Purchase Order converter
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── mock-data.js
│       └── app.js
└── Frame/             # Frame-based Knowledge Base editor (retro UI)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
```

### Subprojects

| Subproject   | Language   | Description                                          | Run command                        |
|--------------|------------|------------------------------------------------------|------------------------------------|
| `helloworld` | Python     | Minimal hello world                                  | `python3 helloworld/main.py`       |
| `WD1`        | JavaScript | Sol·licituds de compra SAP B1 → Comandes de compra   | Obrir `WD1/index.html` al navegador|
| `Frame`      | React/JS   | Editor de bases de coneixement amb frames (UI retro)  | `cd Frame && npm run dev`          |

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

### helloworld

```bash
python3 helloworld/main.py
```

### WD1

Obrir `WD1/index.html` directament al navegador. No requereix servidor ni dependències.

**Arquitectura WD1:**
- `index.html` — Estructura de la pàgina (taula, filtres, modal)
- `css/styles.css` — Estils amb variables CSS (paleta SAP Fiori-like)
- `js/mock-data.js` — Dades simulades (proveïdors, articles, sol·licituds)
- `js/app.js` — Lògica: filtrat, selecció múltiple, conversió simulada

**Pròxims passos WD1:**
- Connectar amb SAP Service Layer API (substituir mock-data.js)
- Autenticació SAP B1
- Creació real de comandes de compra via API

### Frame

```bash
cd Frame && npm install && npm run dev
```

Per a producció: `npm run build` (genera `Frame/dist/`).

**Arquitectura Frame:**
- `src/App.jsx` — Component principal RetroFrameSystem (editor, consultes, jerarquia IS-A)
- `src/main.jsx` — Punt d'entrada React
- `src/index.css` — Tailwind CSS

**Funcionalitats Frame:**
- Editor visual de frames amb slots i facetes estàndard (VALUE, TIPUS, HERENCIA, etc.)
- Jerarquia IS-A amb herència de propietats
- Consultes en llenguatge natural (català)
- Creació de frames via llenguatge natural
- Valors calculats amb fórmules
- Export/Import en format TSV

## Guidelines for AI Assistants

1. **Read before writing** — Always read existing files before proposing changes
2. **Minimal changes** — Only modify what's necessary to accomplish the task; avoid scope creep
3. **No over-engineering** — Don't add abstractions, utilities, or error handling beyond what's needed
4. **Security first** — Never commit secrets, credentials, or sensitive data; avoid introducing OWASP top 10 vulnerabilities
5. **Test your changes** — Run available tests before considering a task complete
6. **Update this file** — When adding significant structure, tooling, or conventions, update CLAUDE.md to keep it current
