const path = require('path');

/**
 * Cryptope checkout UI (TanStack Start / Vite) — local/dev only.
 *
 * Requires Node >= 20.19 (`nvm use` — see .nvmrc). Vite 8 fails on Node 18
 * (`styleText` missing from node:util).
 *
 * Production: prefer Docker `cryptope-ui` in deploy/production/docker-compose.prod.yml
 * (nginx → :8080, public path /cryptope-ui/). Stop this PM2 app on the server if Docker is used.
 *
 * From this directory:
 *   nvm use && npm i && pm2 start ecosystem.config.cjs
 *
 * Serves http://localhost:8080/crypto?transID=… (merchant embeds via :3001/crypto).
 */
module.exports = {
  apps: [
    {
      name: 'pgx_cryptope_ui',
      cwd: path.resolve(__dirname),
      script: path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js'),
      args: 'dev --host --port 8080',
      interpreter: 'node',
      watch: false,
      autorestart: true,
      max_restarts: 20,
      min_uptime: '5s',
      env: {
        NODE_ENV: 'development',
        CRYPTOPE_UI_PORT: '8080',
        // Local direct :8080 — keep base at /
        VITE_BASE_PATH: '/',
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:9003',
      },
    },
  ],
};
