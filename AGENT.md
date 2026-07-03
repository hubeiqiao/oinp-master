# AGENT.md

Use `AGENTS.md` for the current repo context, project constraints, copy rules, design goals, and verification workflow.

This file exists because some agents look for `AGENT.md`; Codex-style agents should read `AGENTS.md`.

## Deployment Rule

Never deploy the Cloudflare Worker directly from a feature branch or work-in-progress branch.

Required flow:
1. Finish work on the feature branch.
2. Commit and push the feature branch.
3. Merge the feature branch into `main`.
4. Deploy only from `main`.

If asked to deploy while on any branch other than `main`, stop and explain that the project rule requires merging to `main` first.
