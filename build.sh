#!/usr/bin/env bash
set -euo pipefail

pip install -r requirements.txt

if command -v npm >/dev/null 2>&1; then
  cd frontend
  npm install
  npm run build
else
  echo "npm not found; using committed frontend/dist if present"
fi

if [ ! -f frontend/dist/index.html ]; then
  echo "ERROR: frontend/dist/index.html missing. Install Node and rebuild, or commit dist."
  exit 1
fi

echo "Build complete."
