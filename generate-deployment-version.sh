#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================"
echo " Humant Deployment Version Generator"
echo "========================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not detected. Please install Node.js LTS first."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open https://nodejs.org
  else
    xdg-open https://nodejs.org >/dev/null 2>&1 || true
  fi
  exit 1
fi

node "$ROOT/generate-deployment-version.js"