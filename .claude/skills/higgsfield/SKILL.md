---
name: higgsfield
description: Generate or edit AI images, video, audio, voice, 3D assets, websites/apps/games, and social (TikTok) content via the Higgsfield MCP server (higgsfield.ai). Use whenever the user asks to create/generate/edit an image, video, audio clip, voiceover, dubbing, 3D model, marketing/ad video, explainer, UGC/talking-head video, podcast, character sheet, or wants to publish/analyze content on TikTok.
---

# Higgsfield MCP

Higgsfield (higgsfield.ai) is an AI media-generation platform exposed to this
session as the `mcp__Higgsfield__*` MCP tools. It covers image, video, audio,
3D, voice, website/app/game generation, and TikTok publishing. This skill
tells you which tool to reach for and the order to call them in.

## Core generation tools

- `generate_image` / `generate_image_batch` — image generation.
- `generate_video` / `generate_video_batch` — video generation.
- `generate_audio` / `generate_audio_batch` — audio/music/SFX generation.
- `generate_3d` — turn an image into a 3D GLB mesh.

For **multiple independent generations of the same media type**, use the
`*_batch` variant together with `jobs_wait`, then fetch results once with a
single `show_generation_by_ids` call — don't poll each job individually.
Read each batch tool's own description for the exact protocol before using it.

When unsure which model fits a request, call
`models_explore(action:'recommend')` before calling a `generate_*` tool.

## Templated / multi-step video workflows

Before building any made-to-brief video — a narrated explainer, an ad or
commercial, a UGC/talking-head video, a podcast, or similar — call
`get_workflow_instructions` with no argument first to see the catalog of
available workflows and their trigger phrases, then call it again with the
matching workflow name to load that workflow's instructions. Always check
the catalog rather than assuming a workflow exists, since new ones are added
over time. If a loaded workflow needs a bundled template/reference/script
file, fetch it with `get_workflow_bundle_file`.

For a character sheet, character reference, model sheet, turnaround, or
consistent multi-view character prompt, call `get_workflow_instructions`
with `{ workflow: "character-sheet" }` and follow it — only generate the
actual image once the user explicitly asks for it.

For a website, app, or browser game, call `get_workflow_instructions` with
`{ workflow: "website-builder-flow" }`, then use `create_website` with
`type` set to `"website"`, `"app"`, or `"game"`.

## Editing existing assets

Prefer these dedicated tools over re-generating from scratch:

- `upscale_image` / `upscale_video` — upscale to 2K/4K.
- `outpaint_image` — uncrop / expand canvas.
- `reframe` — change aspect ratio.
- `remove_background` — cutout.
- `motion_control` — recast, puppeteer, or motion transfer.
- `voice_change`, `dubbing` — voice/audio edits.

## Analysis

- `virality_predictor` — predict engagement/attention/retention/hook
  strength for a video when asked to assess creative performance.
- `video_analysis_create` / `video_analysis_jobs` / `video_analysis_status`
  — deeper video content analysis jobs.

## Voice and characters

- `list_voices`, `create_voice`, `create_voice_from_confirmed_audio` —
  manage voices for narration/dubbing.
- `show_characters`, `show_reference_elements` — reusable character/reference
  assets for consistent generations.

## Media input

- `media_upload` / `media_upload_widget` / `media_import_url` /
  `media_confirm` — get an existing local file or URL into Higgsfield before
  referencing it in a generation or edit call.

## TikTok

- `tiktok_connect` / `tiktok_reconnect` / `tiktok_accounts` — account setup.
- `tiktok_music_trending` / `tiktok_music_tune` — trending sounds.
- `tiktok_prepare_publish` / `tiktok_publish` / `tiktok_publish_status` —
  publish flow. Treat `tiktok_publish` as a real, visible action (posts
  publicly) — confirm with the user before calling it, the same as any other
  action that publishes content externally.

## Account / workspace

- `balance`, `show_plans_and_credits`, `transactions` — credits and billing.
- `list_workspaces`, `select_workspace` — multi-workspace accounts.
- `job_display`, `jobs_wait`, `show_generations` — check on and retrieve
  generation jobs.

## Notes

- This is a paid, credit-metered platform — batch calls and check
  `balance`/`show_plans_and_credits` before large or repeated generation
  runs if cost is a concern.
- `tiktok_publish`, `deploy_website`, `publish_website`, and
  `participate_in_contest` all take externally-visible, hard-to-reverse
  actions — confirm with the user before calling them, per this project's
  general rule on risky actions.
