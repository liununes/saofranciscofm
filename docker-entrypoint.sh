#!/bin/sh
set -eu

node <<'NODE'
const fs = require('node:fs');

const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabasePublishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
};

fs.writeFileSync(
  '/app/dist/runtime-config.js',
  `window.__SAO_APP_CONFIG__ = ${JSON.stringify(config)};\n`,
  'utf8'
);
NODE

exec node server.mjs
