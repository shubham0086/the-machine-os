# content-analyzer

> Turn a URL into structured JSON - summary, sentiment, and a quality score - in one call.

## Problem

Raw web content is unstructured noise. Downstream agents need clean, typed fields, not a wall
of HTML.

## Architecture

URL in → fetch, clean, and extract → structured JSON out (summary, sentiment, quality score).
A focused data-prep stage that feeds the rest of a pipeline. 4 tests.

## Lessons learned

- A small, single-purpose extractor is more reusable than a do-everything "analysis agent."
- Quality scoring upstream saves the downstream model from reasoning over garbage.

## Demo

```bash
git clone https://github.com/shubham0086/content-analyzer
cd content-analyzer && node main.js
```

## Repository

[github.com/shubham0086/content-analyzer](https://github.com/shubham0086/content-analyzer)

## Related

- Pipeline companion: [research-agent](research-agent.md)
