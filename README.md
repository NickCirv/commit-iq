<div align="center">

# commit-iq

**Score your commit messages 0–100. Catch `wip`, `fix`, and `asdf` before they land.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?labelColor=0B0A09)](LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/commit-iq score
```

No global install needed. No API key. Runs fully offline.

## Usage

```bash
# Score the last 10 commits in this repo
npx github:NickCirv/commit-iq score

# Score the last 20 commits
npx github:NickCirv/commit-iq score 20

# Install as a git hook (blocks commits below threshold)
npx github:NickCirv/commit-iq install
```

| Command | Description |
|---------|-------------|
| `score [n]` | Score the last N commits (default: 10) |
| `check [message]` | Score a single message (pre-commit hook mode) |
| `stats` | Aggregate IQ statistics for the repo |
| `hall-of-shame` | Best and worst commits across repo history |
| `suggest` | Suggest a message based on staged changes |
| `install` | Install as `prepare-commit-msg` git hook |

### Key flags

| Flag | Command | Description |
|------|---------|-------------|
| `-a, --author <email>` | `score`, `stats` | Filter by author |
| `--threshold <n>` | `check`, `install` | Warn below this score (default: 50) |
| `--block <n>` | `check`, `install` | Block commit below this score (default: 20) |
| `--file <path>` | `check` | Read message from file (for git hook) |
| `--no-color` | `score` | Disable terminal colors |

## What it checks

| Rule | Points |
|------|--------|
| Conventional prefix (`feat`, `fix`, `docs`, `chore`, etc.) | +20 |
| Subject line ≤72 characters | +15 |
| Imperative mood (`add`, `fix`, `update`) | +10 |
| No junk words (`wip`, `tmp`, `asdf`, `stuff`, `lol`) | +10 |
| Body present for diffs over 50 lines | +15 |
| No trailing period | +5 |
| Capitalized subject after prefix | +5 |
| Scope present (`feat(auth):`) | +10 |
| References an issue (`closes #123`, `JIRA-456`) | +10 |

Grades: **A+** (90+) · **A** (80+) · **B+** (70+) · **B** (60+) · **C+** (50+) · **C** (40+) · **D** (30+) · **F** (<30)

## Example output

```
  commit-iq — last 10 commits

  ────────────────────────────────────────
   B+  72  feat(auth): Add OAuth2 login flow
            ✓ Conventional prefix  ✓ Subject length  ✓ Imperative
            ✓ No junk  ✓ Capitalized  ✗ No scope  ✗ No issue ref

   F   10  wip
            ✗ No conventional prefix  ✗ Junk word  ✗ No body

   A   85  fix(api): Handle null response from upstream closes #412
            ✓ All checks pass

  ────────────────────────────────────────
  Repo IQ:  58/100   Grade:  C+
  10 commits analyzed · 3 passed · 7 need improvement
```

## Use in CI

```yaml
- name: Audit recent commits
  run: npx github:NickCirv/commit-iq score 20
```

---
<sub>Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
