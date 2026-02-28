# commit-iq

Score your commit messages 0–100. Stop shipping `fix`, `wip`, and `asdf` to production.

<p align="center">
  <img src="https://img.shields.io/npm/v/commit-iq.svg" alt="npm version" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="node >= 18" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
</p>

## Why

Bad commit messages make `git log` useless and code reviews slower. `commit-iq` scores every commit against 9 rules — conventional prefix, subject length, imperative mood, no junk words, scope, issue references, and more — then grades the repo A+ through F. No AI or API key required. Runs locally, offline, instantly.

## Quick Start

```bash
npx commit-iq score
```

## What It Checks

| Rule | Points |
|------|--------|
| Conventional prefix (`feat`, `fix`, `docs`, `chore`, etc.) | +20 |
| Subject line 72 characters or fewer | +15 |
| Imperative mood (starts with a verb: `add`, `fix`, `update`) | +10 |
| No junk words (`wip`, `tmp`, `asdf`, `stuff`, `lol`, etc.) | +10 |
| Body present for diffs over 50 lines | +15 |
| No trailing period | +5 |
| Capitalized subject after prefix | +5 |
| Scope present (`feat(auth):`) | +10 |
| References an issue number (`closes #123`, `JIRA-456`) | +10 |

Grades: A+ (90+), A (80+), B+ (70+), B (60+), C+ (50+), C (40+), D (30+), F (below 30)

## Example Output

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

## Commands

| Command | Description |
|---------|-------------|
| `commit-iq score [n]` | Score the last N commits (default: 10) |
| `commit-iq check [message]` | Check a single commit message (pre-commit hook mode) |
| `commit-iq stats` | Show aggregate IQ statistics for the repo |
| `commit-iq hall-of-shame` | Show the best and worst commits in the repo |
| `commit-iq suggest` | Suggest a commit message based on staged changes |
| `commit-iq install` | Install as a git `prepare-commit-msg` hook |

## Options

### `score`

| Flag | Description | Default |
|------|-------------|---------|
| `[n]` | Number of commits to score | `10` |
| `-a, --author <email>` | Filter by author | all |
| `--no-color` | Disable colors | off |

### `check`

| Flag | Description | Default |
|------|-------------|---------|
| `--file <path>` | Read message from file (for git hook) | — |
| `--threshold <n>` | Score below which to warn | `50` |
| `--block <n>` | Score below which to block the commit | `20` |

### `stats`

| Flag | Description | Default |
|------|-------------|---------|
| `-n, --commits <n>` | Number of commits to analyze | `50` |
| `-a, --author <email>` | Filter by author | all |

### `hall-of-shame`

| Flag | Description | Default |
|------|-------------|---------|
| `-n, --commits <n>` | Number of commits to scan | `100` |

### `install`

| Flag | Description | Default |
|------|-------------|---------|
| `--threshold <n>` | Warn threshold | `50` |
| `--block <n>` | Block threshold | `20` |
| `--uninstall` | Remove the hook | — |

## Use as a Git Hook

```bash
npx commit-iq install
```

Installs as `prepare-commit-msg`. Scores every commit message before it lands. Blocks commits scoring below the threshold.

## Use in CI

```yaml
- name: Audit recent commits
  run: npx commit-iq score 20
```

## Install Globally

```bash
npm i -g commit-iq
```

## License

MIT
