# research-agent

> Research a topic end to end - search across multiple providers with graceful fallback, then
> synthesize.

## Problem

A single search API is a single point of failure and a single point of bias. Rate limits and
outages kill a research pipeline that depends on one provider.

## Architecture

A research pipeline over SerpAPI + Tavily + Brave + DuckDuckGo with ordered fallback, then
summarization. Same reliability philosophy as [agent-routing](agent-routing.md), applied to
search instead of LLMs. 9 tests.

## Lessons learned

- Provider fallback isn't just for LLMs - every external dependency in a pipeline needs it.
- DuckDuckGo as the no-key final fallback keeps the demo runnable for everyone.

## Demo

```bash
git clone https://github.com/shubham0086/research-agent
cd research-agent && node main.js
```

## Repository

[github.com/shubham0086/research-agent](https://github.com/shubham0086/research-agent)

## Related

- Pipeline companion: [content-analyzer](content-analyzer.md)
