#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

program
  .name('commit-iq')
  .description('AI commit message quality scorer + rewriter')
  .version(pkg.version);

program
  .command('score [n]')
  .description('Score the last N commits (default: 10)')
  .option('-a, --author <author>', 'filter by author')
  .option('--no-color', 'disable colors')
  .action(async (n, opts) => {
    const { scoreCommand } = await import('../src/index.js');
    await scoreCommand(parseInt(n) || 10, opts);
  });

program
  .command('check [message]')
  .description('Check a commit message (pre-commit hook mode)')
  .option('--file <path>', 'read message from file (used by git hook)')
  .option('--threshold <n>', 'minimum score to pass (default: 50)', '50')
  .option('--block <n>', 'score below which to block commit (default: 20)', '20')
  .action(async (message, opts) => {
    const { checkCommand } = await import('../src/index.js');
    await checkCommand(message, opts);
  });

program
  .command('stats')
  .description('Show commit IQ statistics for this repo')
  .option('-n, --commits <n>', 'number of commits to analyze (default: 50)', '50')
  .option('-a, --author <author>', 'filter by author')
  .action(async (opts) => {
    const { statsCommand } = await import('../src/index.js');
    await statsCommand(opts);
  });

program
  .command('hall-of-shame')
  .description('Show the best and worst commits in this repo')
  .option('-n, --commits <n>', 'number of commits to scan (default: 100)', '100')
  .action(async (opts) => {
    const { shameCommand } = await import('../src/index.js');
    await shameCommand(opts);
  });

program
  .command('install')
  .description('Install commit-iq as a git prepare-commit-msg hook')
  .option('--threshold <n>', 'warn threshold (default: 50)', '50')
  .option('--block <n>', 'block threshold (default: 20)', '20')
  .option('--uninstall', 'remove the hook')
  .action(async (opts) => {
    const { installCommand } = await import('../src/index.js');
    await installCommand(opts);
  });

program
  .command('suggest')
  .description('Suggest a commit message based on staged changes')
  .action(async () => {
    const { suggestCommand } = await import('../src/index.js');
    await suggestCommand();
  });

program.parse();
