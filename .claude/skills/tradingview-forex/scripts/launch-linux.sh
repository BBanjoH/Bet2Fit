#!/usr/bin/env bash
# Launches TradingView Desktop on Linux with the Chrome DevTools Protocol
# debug port open, so tradingview-mcp can attach to it.
set -euo pipefail

APP_PATH="${TRADINGVIEW_APP_PATH:-tradingview}"
PORT="${TRADINGVIEW_DEBUG_PORT:-9222}"

if ! command -v "$APP_PATH" >/dev/null 2>&1 && [ ! -x "$APP_PATH" ]; then
  echo "TradingView executable '$APP_PATH' not found on PATH." >&2
  echo "Set TRADINGVIEW_APP_PATH to the full path of the TradingView binary/AppImage." >&2
  exit 1
fi

echo "Launching TradingView Desktop with --remote-debugging-port=$PORT ..."
"$APP_PATH" --remote-debugging-port="$PORT" &
disown

echo "Launched. Leave TradingView open, then run the setup/status check from"
echo "vendor/tradingview-mcp (see SKILL.md)."
