#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================"
echo " Starting Humant HRMS Launcher"
echo "========================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not detected."
  if [[ "$OSTYPE" == "darwin"* ]] && command -v brew >/dev/null 2>&1; then
    echo "Attempting to install Node.js with Homebrew..."
    brew install node
  else
    echo "Opening the Node.js download page."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open https://nodejs.org
    else
      xdg-open https://nodejs.org >/dev/null 2>&1 || true
    fi
    exit 1
  fi
fi

node "$ROOT/launcher.js"