# Pre-commit Hook Setup

This monorepo is configured with pre-commit hooks that run automated checks before each commit.

## What Gets Checked

Before each commit, the following checks are performed:

1. **Type Checking** - TypeScript type checking across all packages (backend, frontend, shared)
2. **Linting** - ESLint checks on all packages
3. **Prettier** - Code formatting on staged files only

## How It Works

### Husky

- Manages Git hooks
- Configured in `.husky/pre-commit`
- Automatically installed via `prepare` script in root `package.json`

### Lint-staged

- Runs only on files staged for commit (efficient!)
- Configured in root `package.json` under `lint-staged`
- Applies different rules based on file type:
  - `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` files → Prettier + ESLint (with --max-warnings=0)
  - `.json`, `.css`, `.md` files → Prettier only

### ESLint & Prettier at Root

- ESLint and Prettier are installed at the root level
- Each package can have its own ESLint config for package-specific rules
- Root `eslint.config.mjs` provides base configuration
- Shared `.prettierrc` ensures consistent formatting across all packages

## Available Scripts

### Root Level (run from project root)

```bash
# Format all files
pnpm format

# Check formatting without modifying
pnpm format:check

# Run linters across all packages
pnpm lint

# Run type checking across all packages
pnpm type-check
```

### Individual Package Scripts

#### Backend

```bash
pnpm --filter backend lint
pnpm --filter backend type-check
pnpm --filter backend format
```

#### Frontend

```bash
pnpm --filter frontend lint
pnpm --filter frontend type-check
```

#### Shared

```bash
pnpm --filter shared lint
pnpm --filter shared type-check
```

## Pre-commit Hook Process

When you run `git commit`, the following happens automatically:

1. 🔍 **Type Check** - Runs `pnpm type-check` across all packages
   - If type errors exist, commit is blocked
2. 🎨 **Lint & Format Staged Files** - Runs `pnpm lint-staged`
   - Only checks files you've staged for commit
   - Applies Prettier formatting
   - Runs ESLint with auto-fix
   - If any errors remain, commit is blocked

3. ✅ **Success** - If all checks pass, commit proceeds

## Prettier Configuration

Shared configuration at `.prettierrc`:

- `singleQuote: true` - Use single quotes
- `trailingComma: "all"` - Add trailing commas
- `tabWidth: 2` - 2-space indentation
- `semi: true` - Semicolons required
- `printWidth: 80` - 80 character line width

## ESLint Configuration

- **Backend**: TypeScript + Prettier integration (`backend/eslint.config.mjs`)
- **Frontend**: React + TypeScript rules (`frontend/eslint.config.js`)
- **Shared**: TypeScript rules (`packages/shared/eslint.config.mjs`)

## Bypassing Pre-commit Hooks

⚠️ **Not recommended**, but if absolutely necessary:

```bash
git commit --no-verify
```

## Troubleshooting

### Pre-commit hook not running

```bash
# Reinstall hooks
pnpm install
```

### Type check failing

```bash
# Run type check to see errors
pnpm type-check
```

### Lint errors

```bash
# Run lint to see and auto-fix errors
pnpm lint
```

### Format issues

```bash
# Format all files
pnpm format
```
