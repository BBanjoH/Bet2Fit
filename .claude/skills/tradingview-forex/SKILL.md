---
name: tradingview-forex
description: Use TradingView Desktop (via the tradingview-mcp server) to read forex charts, manage indicators and Pine Script, draw levels, set alerts, and run replay-mode practice trades. Trigger on forex pair mentions (EURUSD, GBPUSD, USDJPY, etc.), "check the chart", "set an alert", "write a Pine Script indicator/strategy", or "backtest/replay this setup". This only works when run locally, with TradingView Desktop open on the user's own machine — it does not work in a cloud/remote session.
---

# TradingView Forex Trading Skill

Wraps [tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp), an MCP
server that controls a **locally running TradingView Desktop** app over the
Chrome DevTools Protocol. It gives Claude Code direct, local access to your
charts for forex analysis — it does **not** place real trades or connect to any
broker. Treat it as a charting/analysis copilot, not an execution engine.

## Requires local setup — will not work in a cloud session

This MCP server talks to a TradingView Desktop process on `localhost:9222`. It
only works when Claude Code is running **on the same machine** as TradingView
Desktop. If you're in a cloud/remote Claude Code session, stop here and switch
to a local session on your laptop.

## One-time setup (run on your laptop)

1. **Prerequisites**: TradingView Desktop (paid subscription — this tool does
   not bypass any paywall or access control), Node.js 18+.
2. Run the setup script from the repo root:
   ```bash
   bash .claude/skills/tradingview-forex/scripts/setup.sh
   ```
   This clones `tradingview-mcp` into `vendor/tradingview-mcp` and runs
   `npm install`. Safe to re-run — it just `git pull`s if already cloned.
3. Launch TradingView Desktop with remote debugging enabled (pick your OS):
   ```bash
   bash .claude/skills/tradingview-forex/scripts/launch-macos.sh    # macOS
   bash .claude/skills/tradingview-forex/scripts/launch-linux.sh    # Linux
   pwsh .claude/skills/tradingview-forex/scripts/launch-windows.ps1 # Windows
   ```
   Keep TradingView Desktop open — the MCP server proxies into that running
   instance, it doesn't launch its own copy.
4. Register the MCP server for this project. Copy the example config and
   restart Claude Code:
   ```bash
   cp .mcp.json.example .mcp.json
   ```
   (`.mcp.json` is gitignored on purpose — it can contain machine-specific
   paths, so don't commit it.)
5. Sanity check from a terminal:
   ```bash
   cd vendor/tradingview-mcp
   node bin/tv.js status
   ```
   Should report a connected chart. If not, confirm TradingView Desktop is
   running with `--remote-debugging-port=9222` and that port 9222 isn't in use
   by anything else.

## Using it for forex

Once connected, the `tradingview` MCP tools (also available as the `tv` CLI
inside `vendor/tradingview-mcp`) are available. Typical forex workflows:

- **Chart review**: `chart_set_symbol` to a pair (e.g. `FX:EURUSD`),
  `chart_set_timeframe`, then `chart_get_state` / `data_get_ohlcv` /
  `quote_get` to read price action and `data_get_study_values` for whatever
  indicators are on the chart.
- **Indicators**: add/manage with `chart_manage_indicator`; for anything
  custom, use `pine_new` / `pine_set_source` / `pine_smart_compile` /
  `pine_get_errors` to iterate on a Pine Script indicator or strategy, then
  `pine_save`.
- **Marking levels**: `draw_shape` for trend lines, horizontal
  support/resistance, and annotations.
- **Alerts**: `alert_create` / `alert_delete` for price or indicator-condition
  alerts — this is the closest thing to "automation" this tool offers; it
  notifies, it does not execute orders.
- **Multi-pair monitoring**: `pane_set_layout` for a grid (e.g. 2x2 of
  EURUSD/GBPUSD/USDJPY/AUDUSD), `pane_set_symbol` per pane.
- **Practice/backtesting**: `replay_start`, `replay_step`, `replay_trade`,
  `replay_autoplay` to walk a strategy through historical bars in
  TradingView's replay mode. This is simulated — no real capital moves.
- **Screenshots**: capture the current chart state for visual review when a
  numeric read isn't enough.

Standard forex tickers use the `FX:` or broker-specific prefixes TradingView
itself uses (e.g. `FX:EURUSD`, `OANDA:EURUSD`, `FX_IDC:EURUSD`) — use whatever
prefix the user's TradingView account/data feed expects; ask if unclear.

## Guardrails

- Never claim this places, modifies, or closes real orders — it can't. If the
  user asks for actual order execution, tell them this tool doesn't do that
  and ask what broker/API they'd want wired up separately.
- Respect TradingView's Terms of Use: this drives the user's own desktop
  session interactively: don't attempt bulk/automated scraping loops that
  look like data harvesting.
- All data stays local (MCP server talks only to `localhost:9222`) — don't
  route chart data through any external service.
