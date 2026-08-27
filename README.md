# Bet2Fit

## TradingView forex skill

This repo includes a Claude Code skill that wires up
[tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp) for local
forex chart analysis — reading quotes/indicators, writing Pine Script,
drawing levels, managing alerts, and practicing setups in TradingView's
replay mode. It talks to a **TradingView Desktop** app running on your own
machine, so it only works in a local Claude Code session, not a cloud one.

It is a charting/analysis copilot, not a broker connection — it does not
place real trades.

Setup instructions, usage guidance, and helper scripts live in
[`.claude/skills/tradingview-forex/SKILL.md`](.claude/skills/tradingview-forex/SKILL.md).
Quick start on your laptop:

```bash
bash .claude/skills/tradingview-forex/scripts/setup.sh
bash .claude/skills/tradingview-forex/scripts/launch-macos.sh   # or launch-linux.sh / launch-windows.ps1
cp .mcp.json.example .mcp.json
```

Then restart Claude Code and ask it to check a pair, e.g. "pull up the EURUSD
4H chart and mark key levels."
