#!/bin/sh
set -eu

node <<'NODE'
const fs = require('node:fs');

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axtzvyybrmujrpuznbxd.supabase.co',
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yGjuNw4ZND4eSYfuNTsx4Q_WEoRYanh',
};

fs.writeFileSync(
  '/app/dist/runtime-config.js',
  `window.__SAO_APP_CONFIG__ = ${JSON.stringify(config)};\n`,
  'utf8'
);
NODE

exec node server.mjs
