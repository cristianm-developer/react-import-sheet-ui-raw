---
name: commit-with-commitizen
description: Stages all changes with git add and creates a commit using Commitizen (conventional commits). Use when the user wants to commit, run commitizen, stage and commit, or "commitear" with cz.
---

# Commit with Commitizen

## When to use

Apply this skill when the user asks to:
- Commit (commitear) using Commitizen
- Stage all changes and commit with cz
- Run add + commit with Commitizen

## Instructions

1. **Stage all changes**
   ```bash
   git add .
   ```

2. **Run Commitizen to create the commit**
   - If the project has Commitizen installed (devDependency + config): use the project's script, e.g. `npm run commit` or `pnpm commit`, or run:
     ```bash
     npx cz
     ```
   - If Commitizen is not in the project: run with npx (no install required):
     ```bash
     npx cz
     ```
   - On first run, npx may prompt to install `commitizen` and an adapter (e.g. `cz-conventional-changelog`); accept if the user wants Commitizen in the project.

3. **Do not** run `git commit -m "..."` manually; let Commitizen prompt for type, scope, message, etc., and perform the commit.

## Optional: project setup

To have a dedicated script and avoid typing `npx cz`:

- Install: `npm install -D commitizen cz-conventional-changelog`
- In `package.json` add:
  ```json
  "config": { "commitizen": { "path": "cz-conventional-changelog" } },
  "scripts": { "commit": "cz" }
  ```
- Then the workflow is: `git add .` then `npm run commit` (or `pnpm commit`).

## Summary

1. `git add .`
2. `npx cz` or `npm run commit` (if configured)
3. Complete the Commitizen prompts; it will run `git commit` with the generated message.
