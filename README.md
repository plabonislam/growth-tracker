# PNPM Monorepo - Full Stack Application

A modern monorepo setup using pnpm workspaces, featuring a NestJS backend, React frontend, and a shared TypeScript package.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Available Scripts](#available-scripts)
- [Packages](#packages)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This monorepo contains three main packages:

- **Backend** - NestJS API server with TypeScript
- **Frontend** - React application with Vite and TypeScript
- **Shared** - Shared TypeScript utilities, types, and constants

All packages use TypeScript, share code through the `shared` package, and follow consistent code quality standards.

## 📁 Project Structure

```
pnpm_mono_shared/
├── apps/
│   ├── backend/      # NestJS backend application
│   ├── frontend/     # React frontend application
│   └── shared/       # Shared TypeScript package
├── .husky/           # Git hooks (pre-commit)
├── .prettierrc       # Shared Prettier configuration
├── .prettierignore   # Prettier ignore patterns
├── eslint.config.mjs # Root ESLint configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
├── package.json      # Root package.json with shared scripts
└── PRECOMMIT_SETUP.md # Pre-commit hooks documentation
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **pnpm** (v10.16.1 or higher) - [Install pnpm](https://pnpm.io/installation)
- **Git** (for version control)

### Verify Installation

```bash
node --version  # Should be v18+
pnpm --version  # Should be v10.16.1+
git --version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pnpm_mono_shared
```

### 2. Install Dependencies

Install all dependencies for all packages:

```bash
pnpm install
```

This will:

- Install dependencies for root, backend, frontend, and shared packages
- Set up Git hooks via Husky (via `prepare` script)
- Link workspace packages together

### 3. Build Shared Package

The shared package needs to be built before other packages can use it:

```bash
pnpm --filter shared run build
```

Or use the convenience script:

```bash
pnpm dev:shared
```

### 4. Start Development Servers

Start all development servers concurrently:

```bash
pnpm dev
```

This will start:

- Shared package build (watch mode)
- Frontend dev server (typically http://localhost:5173)
- Backend dev server (typically http://localhost:3000)

Or start them individually:

```bash
# Start only the backend
pnpm dev:backend

# Start only the frontend
pnpm dev:frontend

# Build shared package
pnpm dev:shared
```

## 💻 Development

### Working with Packages

#### Run Commands in Specific Packages

```bash
# Backend commands
pnpm --filter backend <command>

# Frontend commands
pnpm --filter frontend <command>

# Shared commands
pnpm --filter shared <command>
```

#### Examples

```bash
# Run backend tests
pnpm --filter backend test

# Build frontend
pnpm --filter frontend build

# Lint shared package
pnpm --filter shared lint
```

### Adding Dependencies

#### Add to Root (Shared Dev Dependencies)

```bash
pnpm add -D -w <package-name>
```

#### Add to Specific Package

```bash
# Backend
pnpm --filter backend add <package-name>

# Frontend
pnpm --filter frontend add <package-name>

# Shared
pnpm --filter shared add <package-name>
```

### Using Shared Package

The `shared` package is automatically linked via workspace protocol:

```typescript
// In backend or frontend
import { something } from 'shared';
import { Languages } from 'shared/types/languages';
import { LANGUAGES } from 'shared/const/languages';
```

## 📜 Available Scripts

### Root Level Scripts

Run these from the project root:

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start all development servers concurrently       |
| `pnpm dev:backend`  | Start backend development server                 |
| `pnpm dev:frontend` | Start frontend development server                |
| `pnpm dev:shared`   | Build shared package                             |
| `pnpm format`       | Format all files with Prettier                   |
| `pnpm format:check` | Check formatting without modifying files         |
| `pnpm lint`         | Run ESLint across all packages                   |
| `pnpm type-check`   | Run TypeScript type checking across all packages |

### Backend Scripts

```bash
pnpm --filter backend <script>
```

| Script        | Description                              |
| ------------- | ---------------------------------------- |
| `build`       | Build the NestJS application             |
| `start`       | Start the production server              |
| `start:dev`   | Start development server with watch mode |
| `start:debug` | Start with debugging enabled             |
| `start:prod`  | Start production server from dist        |
| `lint`        | Run ESLint with auto-fix                 |
| `type-check`  | Run TypeScript type checking             |
| `test`        | Run unit tests                           |
| `test:watch`  | Run tests in watch mode                  |
| `test:cov`    | Run tests with coverage                  |
| `test:e2e`    | Run end-to-end tests                     |

### Frontend Scripts

```bash
pnpm --filter frontend <script>
```

| Script       | Description                   |
| ------------ | ----------------------------- |
| `dev`        | Start Vite development server |
| `build`      | Build for production          |
| `preview`    | Preview production build      |
| `lint`       | Run ESLint with auto-fix      |
| `type-check` | Run TypeScript type checking  |

### Shared Scripts

```bash
pnpm --filter shared <script>
```

| Script       | Description                        |
| ------------ | ---------------------------------- |
| `build`      | Build the shared package with tsup |
| `lint`       | Run ESLint with auto-fix           |
| `type-check` | Run TypeScript type checking       |

## 📦 Packages

### Backend (`apps/backend/`)

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Runtime**: Node.js
- **Testing**: Jest
- **Port**: 3000 (default)

Key features:

- RESTful API
- TypeScript strict mode
- ESLint + Prettier integration
- Jest for unit and e2e testing

### Frontend (`apps/frontend/`)

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Port**: 5173 (default)

Key features:

- Modern React with hooks
- Fast HMR (Hot Module Replacement)
- TypeScript support
- ESLint with React rules

### Shared (`apps/shared/`)

- **Build Tool**: tsup
- **Language**: TypeScript 5.9
- **Output**: ESM and CommonJS

Key features:

- Shared types and constants
- Dual package exports (ESM + CJS)
- TypeScript declarations
- Used by both backend and frontend

## ✨ Code Quality

This project enforces code quality through automated tools:

### Pre-commit Hooks

**Before every commit**, the following checks run automatically:

1. ✅ **Type Checking** - TypeScript type validation across all packages
2. ✅ **Linting** - ESLint with auto-fix on staged files
3. ✅ **Formatting** - Prettier formatting on staged files

If any check fails, the commit is blocked. This ensures consistent code quality across the entire monorepo.

📖 **For detailed information about pre-commit hooks, see [PRECOMMIT_SETUP.md](./PRECOMMIT_SETUP.md)**

### Manual Code Quality Checks

You can also run these checks manually:

```bash
# Format all files
pnpm format

# Check formatting (CI-friendly)
pnpm format:check

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

### Code Quality Tools

- **Prettier** - Code formatting (shared config at `.prettierrc`)
- **ESLint** - Linting (package-specific configs + root base config)
- **TypeScript** - Type checking
- **Husky** - Git hooks management
- **lint-staged** - Run linters on staged files only

### Configuration Files

- `.prettierrc` - Shared Prettier configuration
- `.prettierignore` - Files to exclude from formatting
- `eslint.config.mjs` - Root ESLint base configuration
- `apps/backend/eslint.config.mjs` - Backend-specific ESLint rules
- `apps/frontend/eslint.config.js` - Frontend-specific ESLint rules
- `apps/shared/eslint.config.mjs` - Shared package ESLint rules

## 🐛 Troubleshooting

### Dependencies Not Installing

```bash
# Clean install
rm -rf node_modules **/node_modules pnpm-lock.yaml
pnpm install
```

### Pre-commit Hooks Not Working

```bash
# Reinstall hooks
pnpm install

# Verify hook exists
ls -la .husky/pre-commit
```

### Type Errors

```bash
# Check types across all packages
pnpm type-check

# Check specific package
pnpm --filter backend type-check
pnpm --filter frontend type-check
pnpm --filter shared type-check
```

### Build Errors

```bash
# Ensure shared package is built first
pnpm --filter shared run build

# Then build other packages
pnpm --filter backend run build
pnpm --filter frontend run build
```

### Port Already in Use

If ports 3000 or 5173 are already in use:

```bash
# Backend - set PORT environment variable
PORT=3001 pnpm --filter backend start:dev

# Frontend - Vite will auto-select next available port
# Or set in vite.config.ts
```

### Workspace Linking Issues

```bash
# Rebuild shared package
pnpm --filter shared run build

# Clear node_modules and reinstall
rm -rf node_modules **/node_modules
pnpm install
```

### ESLint/Prettier Conflicts

```bash
# Format all files first
pnpm format

# Then lint
pnpm lint
```

## 🤝 Contributing

### Development Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the existing patterns
   - Ensure TypeScript types are correct
   - Follow the code style (Prettier will format on commit)

3. **Test your changes**

   ```bash
   # Type check
   pnpm type-check

   # Lint
   pnpm lint

   # Format
   pnpm format

   # Run tests (if applicable)
   pnpm --filter backend test
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

   The pre-commit hook will automatically:
   - Check types
   - Lint and format staged files
   - Block commit if errors exist

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions
- Write meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic
- Use the shared package for common utilities

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:

```bash
git commit -m "feat(backend): add user authentication endpoint"
```

## 📚 Additional Resources

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Pre-commit Hooks Setup](./PRECOMMIT_SETUP.md)

**Happy Coding! 🚀**
