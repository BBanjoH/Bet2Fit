#!/usr/bin/env bash
# Launches TradingView Desktop on macOS with the Chrome DevTools Protocol
# debug port open, so tradingview-mcp can attach to it.
set -euo pipefail

APP_PATH="${TRADINGVIEW_APP_PATH:-/Applications/TradingView.app/Contents/MacOS/TradingView}"
PORT="${TRADINGVIEW_DEBUG_PORT:-9222}"

if [ ! -x "$APP_PATH" ]; then
  echo "TradingView executable not found at: $APP_PATH" >&2
  echo "Set TRADINGVIEW_APP_PATH if it's installed elsewhere." >&2
  exit 1
fi

echo "Launching TradingView Desktop with --remote-debugging-port=$PORT ..."
"$APP_PATH" --remote-debugging-port="$PORT" &
disown

echo "Launched. Leave this window/app open, then run the setup/status check"
echo "from vendor/tradingview-mcp (see SKILL.md)."
