🧩 PNPM Monorepo with Shared Package

This repository is a PNPM-based monorepo containing both a frontend and a backend, along with a shared package for common utilities, types, and constants.

⚙️ Requirements

Node.js ≥ 18

PNPM ≥ 10.16.1

Install PNPM globally if you haven’t already:

npm install -g pnpm

🚀 Getting Started
1. Install Dependencies

Run the following command in the root directory:

pnpm install


This installs all dependencies for the root, backend, frontend, and shared packages.

2. Development

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


