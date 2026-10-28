#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  echo "Please install the LTS version of Node.js from https://nodejs.org, then open this launcher again."
  read -r "?Press Return to close. "
  exit 1
fi
if [ ! -d node_modules ]; then
  npm ci --no-audit --no-fund || exit 1
fi
echo "Open the Local address printed below in your browser. Keep this window open while playing."
npm run dev -- --port 5173
