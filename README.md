# 🧩 PNPM Monorepo with Shared Package

This repository is a PNPM-based monorepo containing a frontend, a backend, and a shared package for common utilities, types, and constants.

## ⚙️ Requirements

Ensure you have the following installed:

*   **Node.js**: Version 18 or higher (`≥ 18`)
*   **PNPM**: Version 10.16.1 or higher (`≥ 10.16.1`)

If you do not have PNPM installed globally, you can install it using npm:

```bash
npm install -g pnpm

# 🧩 Getting started
##1. Install Dependencies

pnpm install




This installs all dependencies for the root, backend, frontend, and shared packages.

##2. Development

To start frontend and backend concurrently:

pnpm run dev


This runs both commands in parallel using concurrently:

pnpm run dev:frontend → starts the frontend development server

pnpm run dev:backend → starts the backend in development mode

3. Individual Development

If you want to run them separately:

Frontend:

pnpm run dev:frontend


Backend:

pnpm run dev:backend


