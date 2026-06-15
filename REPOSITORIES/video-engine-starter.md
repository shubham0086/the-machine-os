# video-engine-starter

> Turn a brief into a video - text-to-video orchestration with Remotion, LLM routing, and a
> TTS cascade.

## Problem

Generating video from a prompt is an orchestration problem, not a single model call: script,
voice, timing, and render all have to line up deterministically.

## Architecture

A starter that orchestrates Remotion (programmatic video) + LLM routing for the script + a
TTS cascade for voice. The hard rule: **never let React compute time** - timing is owned by
the orchestrator so renders are deterministic. Demo-grade (the production engine's moat stays
private).

## Lessons learned

- Deterministic timing is everything in render pipelines; let the framework guess and frames drift.
- Routing + TTS cascade gives graceful degradation when a provider is unavailable.

## Demo

See the repo README for the Remotion render walkthrough.

## Repository

[github.com/shubham0086/video-engine-starter](https://github.com/shubham0086/video-engine-starter)

## Related

- Reliability pattern shared with [agent-routing](agent-routing.md)
