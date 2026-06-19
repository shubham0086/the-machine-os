---
name: deploy-checklist
description: Pre-deployment verification checklist. Use when about to ship a release, deploying a change with database migrations or feature flags, verifying CI status and approvals before going to production, or documenting rollback triggers ahead of time.
argument-hint: "[service or release name]"
---

# /deploy-checklist

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Generate a pre-deployment checklist to verify readiness before shipping.

## Usage

```
/deploy-checklist $ARGUMENTS
```

## Output

```markdown
## Deploy Checklist: [Service/Release]
**Date:** [Date] | **Deployer:** [Name] | **Target Environment:** Production

### Pre-Deploy (Pre-flight Verification)
- [ ] **CI Pipeline:** All automated builds and tests are passing cleanly.
- [ ] **Code Sign-off:** Changes are peer-reviewed, approved, and merged to target branch.
- [ ] **Defect Triage:** No known blocker defects or critical unpatched issues exist in release.
- [ ] **Database Migrations:** Schema changes tested, backwards-compatible, and runbooks prepared.
- [ ] **Feature Flags:** Remote configurations verified, targeted environments set up.
- [ ] **Rollback Strategy:** Clear step-by-step rollback procedure documented.
- [ ] **Telemetry Baseline:** Monitoring dashboards and alerting are fully functional.
- [ ] **Communications:** Affected internal stakeholders and on-call rotations notified.

### Deploy (Execution Phase)
- [ ] Deploy to staging environment and execute integration verification suite.
- [ ] Run targeted staging smoke tests (critical write/read loops).
- [ ] Trigger production deploy (Canary/Blue-Green strategy if supported).
- [ ] Monitor error rates, error logs, and response times immediately for 15 minutes.
- [ ] Validate core user flows directly in production.

### Post-Deploy (Post-flight Stabilization)
- [ ] Confirm baseline service metrics (error rate, latency, CPU, RAM) are normal.
- [ ] Fully enable feature flags under active telemetry observation (if dynamic).
- [ ] Update release notes / changelog and close out completed deployment tickets.
- [ ] Notify business and operational stakeholders of release completion.

### Rollback Action Plan & Triggers
If any of these thresholds are breached, abort and execute the rollback plan immediately:
- **Error Rate Trigger:** Production API error rates exceed `[X]%` for more than `[Y]` consecutive minutes.
- **Latency Trigger:** P99/P50 latency exceeds `[X]`ms baseline threshold.
- **Critical Flow Failure:** [Describe flow, e.g., checkout or registration] fails validation.

#### Step-by-Step Rollback Execution Runbook:
1. [Step 1: Code revert command / build promotion reversion]
2. [Step 2: Database migration rollback commands if applicable]
3. [Step 3: Verification checklist for post-rollback recovery]
```

## Customization

Tell me about your deploy and I'll customize the checklist:
- "We use feature flags" → adds flag verification steps
- "This includes a database migration" → adds migration-specific checks
- "This is a breaking API change" → adds consumer notification steps

## If Connectors Available

If **~~source control** is connected:
- Pull the release diff and list of changes
- Verify all PRs are approved and merged

If **~~CI/CD** is connected:
- Check build and test status automatically
- Verify pipeline is green before deploy

If **~~monitoring** is connected:
- Pre-fill rollback trigger thresholds from current baselines
- Set up post-deploy metric watch

## Tips

1. **Run before every deploy** — Even routine ones. Checklists prevent "I forgot to..."
2. **Customize once, reuse** — Tell me your stack and I'll remember your deploy process.
3. **Include rollback criteria** — Decide when to roll back before you deploy, not during.