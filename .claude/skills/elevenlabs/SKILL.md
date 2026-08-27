---
name: elevenlabs
description: Reference for the ElevenLabs MCP server (text-to-speech, voice cloning/design, speech-to-text transcription, speech-to-speech, audio isolation, video-to-music). Use when the user wants to set up, configure, or troubleshoot ElevenLabs MCP access, or asks about its available tools/env vars/output modes. Not currently connected in this session as live tools — see setup below.
---

# ElevenLabs MCP

Source: https://github.com/elevenlabs/elevenlabs-mcp

This server is **not currently connected as a live MCP server in this
session** — no `mcp__ElevenLabs__*` tools are available. This skill is a
setup/reference doc; use it to help configure the server, then re-check for
`mcp__ElevenLabs__*` tools (or the project's MCP config) once it's wired up.

## Deprecation — use the hosted server instead

The `elevenlabs/elevenlabs-mcp` repo (local, `uvx`/`pip`-run server) is
**archived and deprecated**. ElevenLabs now recommends the **hosted MCP
server** at:

```
https://api.elevenlabs.io/v1/mcp
```

Prefer pointing any new MCP client config at that hosted URL over installing
the local package — it needs no local install and gets updates without a
version bump on the client side.

## Capabilities

The server (local or hosted) exposes ElevenLabs' audio platform:

- Text-to-speech generation
- Voice cloning and voice design
- Speech-to-text transcription, including speaker identification
- Speech-to-speech conversion
- Audio isolation (strip background noise/music from a recording)
- Video-to-music generation
- Voice library management (list/search available voices)

The upstream README does not publish a stable verbatim tool-name list for
the local package — once connected, discover the exact tool names/schemas
via this session's tool listing (`ToolSearch`) rather than assuming names
from this doc.

## Setup (local package, if the hosted server isn't an option)

For Claude Desktop, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ElevenLabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": {
        "ELEVENLABS_API_KEY": "<your-key>"
      }
    }
  }
}
```

Alternatively: `pip install elevenlabs-mcp` then
`python -m elevenlabs_mcp --api-key=<key> --print`.

The upstream docs don't give Claude Code-specific setup steps; for Claude
Code, register the server (local command or the hosted URL above) the same
way other MCP servers are added to this project/user's MCP config.

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `ELEVENLABS_API_KEY` | Required auth. Free tier: 10k credits/month. | — |
| `ELEVENLABS_MCP_BASE_PATH` | Base directory for file I/O. Input files must resolve within this path; paths outside are rejected. | `~/Desktop` |
| `ELEVENLABS_MCP_OUTPUT_MODE` | `files` (save to disk, return paths), `resources` (return base64/UTF-8 data inline), or `both`. | `files` |
| `ELEVENLABS_API_RESIDENCY` | Data residency region (enterprise only). | `us` |

## Notes

- Treat `ELEVENLABS_API_KEY` as a secret — never print it or commit it to
  the repo; keep it in local/user MCP config, not in project files.
- Voice design/cloning can time out in some dev clients even though the
  job completes server-side — if a call appears to hang, check the
  ElevenLabs dashboard/history before assuming failure.
- Respect `ELEVENLABS_MCP_BASE_PATH`: don't pass file paths outside it,
  they'll be rejected by the server.
