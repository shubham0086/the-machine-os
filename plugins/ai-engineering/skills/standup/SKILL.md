---
name: standup
description: Generate a standup update from recent activity. Use when preparing for daily standup, summarizing yesterday's commits and PRs and ticket moves, formatting work into yesterday/today/blockers, or structuring a few rough notes into a shareable update.
argument-hint: "[yesterday | today | blockers]"
---

# /standup

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Generate a standup update by pulling together recent activity across your tools.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        STANDUP                                    │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Tell me what you worked on and I'll structure it             │
│  ✓ Format for daily standup (yesterday / today / blockers)      │
│  ✓ Keep it concise and action-oriented                          │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Source control: Recent commits and PRs                        │
│  + Project tracker: Ticket status changes                        │
│  + Chat: Relevant discussions and decisions                      │
│  + CI/CD: Build and deploy status                                │
└─────────────────────────────────────────────────────────────────┘
```

## What I Need From You

**Option A: Let me pull it**
If your tools are connected, just say `/standup` and I'll gather everything automatically.

**Option B: Tell me what you did**
"Worked on the auth migration, reviewed 3 PRs, got blocked on the API rate limiting issue."

## Output

```markdown
## Standup — [Date]

### Yesterday (Accomplishments)
- [Completed action item with ticket reference / link if available]
- [PR activity, code review, or collaborative designs finalized]

### Today (Focus Areas)
- [Immediate priority objective for today]
- [Secondary scheduled task or engineering meeting focus]

### Blockers (impediments)
- **Blocked on:** [Detailed explanation of blocker]
- **Impact:** [How it delays delivery / scope]
- **Action Plan:** [Who can unblock or what active research is being done to resolve]
```

## If Connectors Available

If **~~source control** is connected:
- Pull recent commits and PRs (opened, reviewed, merged)
- Summarize code changes at a high level

If **~~project tracker** is connected:
- Pull tickets moved to "in progress" or "done"
- Show upcoming sprint items

If **~~chat** is connected:
- Scan for relevant discussions and decisions
- Flag threads needing your response

## Tips

1. **Run it every morning** — Build a habit and never scramble for standup notes.
2. **Add context** — After I generate, add any nuance about blockers or priorities.
3. **Share format** — Ask me to format for Slack, email, or your team's standup tool.