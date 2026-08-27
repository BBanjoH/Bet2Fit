#!/usr/bin/env bash
# Clones (or updates) tradingview-mcp into vendor/tradingview-mcp and installs
# its dependencies. Run this from the repo root on your own laptop:
#   bash .claude/skills/tradingview-forex/scripts/setup.sh
set -euo pipefail

REPO_URL="https://github.com/tradesdontlie/tradingview-mcp.git"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
VENDOR_DIR="$REPO_ROOT/vendor/tradingview-mcp"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required but was not found on PATH." >&2
  exit 1
fi

mkdir -p "$REPO_ROOT/vendor"

if [ -d "$VENDOR_DIR/.git" ]; then
  echo "tradingview-mcp already cloned at $VENDOR_DIR, pulling latest..."
  git -C "$VENDOR_DIR" pull --ff-only
else
  echo "Cloning tradingview-mcp into $VENDOR_DIR..."
  git clone "$REPO_URL" "$VENDOR_DIR"
fi

echo "Installing dependencies..."
(cd "$VENDOR_DIR" && npm install)

echo
echo "Done. Next steps:"
echo "  1. Launch TradingView Desktop with remote debugging enabled (see"
echo "     scripts/launch-<macos|linux|windows>.* in this same directory)."
echo "  2. cp .mcp.json.example .mcp.json (at the repo root) and restart Claude Code."
