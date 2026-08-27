# Launches TradingView Desktop on Windows with the Chrome DevTools Protocol
# debug port open, so tradingview-mcp can attach to it.
# Usage: pwsh .claude/skills/tradingview-forex/scripts/launch-windows.ps1

$AppPath = $env:TRADINGVIEW_APP_PATH
if (-not $AppPath) {
    $AppPath = "$env:LOCALAPPDATA\TradingView\TradingView.exe"
}
$Port = $env:TRADINGVIEW_DEBUG_PORT
if (-not $Port) {
    $Port = "9222"
}

if (-not (Test-Path $AppPath)) {
    Write-Error "TradingView executable not found at: $AppPath`nSet `$env:TRADINGVIEW_APP_PATH if it's installed elsewhere."
    exit 1
}

Write-Host "Launching TradingView Desktop with --remote-debugging-port=$Port ..."
Start-Process -FilePath $AppPath -ArgumentList "--remote-debugging-port=$Port"

Write-Host "Launched. Leave TradingView open, then run the setup/status check from vendor\tradingview-mcp (see SKILL.md)."
