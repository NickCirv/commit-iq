/**
 * scorer.js — Score commit messages 0-100
 * Rule-based, no AI required.
 */

const CONVENTIONAL_PREFIXES = [
  'feat', 'fix', 'docs', 'style', 'refactor',
  'perf', 'test', 'chore', 'ci', 'build', 'revert',
  'wip', 'hotfix', 'release', 'merge',
];

const BAD_MESSAGES = [
  'wip', 'tmp', 'temp', 'asdf', 'test', 'aaa', 'bbb',
  'ccc', 'xxx', 'fix', 'update', 'changes', 'stuff',
  'misc', 'work', 'commit', 'minor', 'tweaks', 'lol',
  'oops', 'typo', 'cleanup', 'done', 'more', 'blah',
];

const IMPERATIVE_STARTERS = [
  'add', 'fix', 'update', 'remove', 'implement', 'refactor',
  'improve', 'enhance', 'create', 'delete', 'move', 'rename',
  'extract', 'merge', 'revert', 'bump', 'release', 'deploy',
  'introduce', 'replace', 'migrate', 'integrate', 'configure',
  'enable', 'disable', 'expose', 'hide', 'wrap', 'unwrap',
  'simplify', 'optimize', 'reduce', 'increase', 'change',
  'convert', 'format', 'clean', 'init', 'setup', 'break',
  'handle', 'allow', 'prevent', 'ensure', 'use', 'make',
  'set', 'get', 'load', 'save', 'parse', 'send', 'receive',
  'validate', 'verify', 'test', 'check', 'build', 'generate',
];

const ISSUE_PATTERN = /#\d+|JIRA-\d+|[A-Z]+-\d+|closes?\s+#\d+|fixes?\s+#\d+|refs?\s+#\d+/i;
const SCOPE_PATTERN = /^[a-z]+\([a-z0-9_-]+\):/;

export function scoreMessage(message, diffLineCount = 0) {
  const breakdown = [];
  let score = 0;

  const lines = message.trim().split('\n');
  const subject = lines[0].trim();
  const body = lines.slice(1).join('\n').trim();

  // 1. Conventional prefix (+20)
  const hasConventionalPrefix = CONVENTIONAL_PREFIXES.some(prefix =>
    new RegExp(`^${prefix}(\\([^)]+\\))?!?:`, 'i').test(subject)
  );
  if (hasConventionalPrefix) {
    score += 20;
    breakdown.push({ rule: 'Conventional prefix', points: 20, pass: true });
  } else {
    breakdown.push({ rule: 'Conventional prefix', points: 0, pass: false, hint: 'Use feat/fix/docs/chore/etc.' });
  }

  // 2. Subject under 72 chars (+15)
  if (subject.length <= 72) {
    score += 15;
    breakdown.push({ rule: 'Subject length ≤72 chars', points: 15, pass: true });
  } else {
    const partial = subject.length <= 100 ? 7 : 0;
    score += partial;
    breakdown.push({
      rule: 'Subject length ≤72 chars',
      points: partial,
      pass: false,
      hint: `Subject is ${subject.length} chars — keep it under 72`,
    });
  }

  // 3. Imperative mood (+10)
  const subjectWords = extractSubjectWords(subject);
  const firstWord = (subjectWords[0] || '').toLowerCase().replace(/[^a-z]/g, '');
  const isImperative = IMPERATIVE_STARTERS.includes(firstWord);
  if (isImperative) {
    score += 10;
    breakdown.push({ rule: 'Imperative mood', points: 10, pass: true });
  } else {
    breakdown.push({
      rule: 'Imperative mood',
      points: 0,
      pass: false,
      hint: `Start with a verb (add, fix, update...) not "${firstWord}"`,
    });
  }

  // 4. No junk words (+10)
  const lowerSubject = subject.toLowerCase();
  const isJunk = BAD_MESSAGES.some(bad =>
    lowerSubject === bad ||
    new RegExp(`^${bad}$`, 'i').test(subject) ||
    new RegExp(`^(feat|fix|chore|docs)?:?\\s*${bad}\\s*$`, 'i').test(subject)
  );
  if (!isJunk) {
    score += 10;
    breakdown.push({ rule: 'No junk words (wip/tmp/asdf)', points: 10, pass: true });
  } else {
    breakdown.push({
      rule: 'No junk words (wip/tmp/asdf)',
      points: 0,
      pass: false,
      hint: 'Describe what actually changed',
    });
  }

  // 5. Body present for large diffs (+15)
  if (diffLineCount > 50) {
    if (body.length > 20) {
      score += 15;
      breakdown.push({ rule: 'Body present for large diff', points: 15, pass: true });
    } else {
      breakdown.push({
        rule: 'Body present for large diff',
        points: 0,
        pass: false,
        hint: `Diff has ${diffLineCount} lines — explain the why in a body`,
      });
    }
  } else {
    score += 15;
    breakdown.push({ rule: 'Body present for large diff', points: 15, pass: true, note: 'N/A (small diff)' });
  }

  // 6. No trailing period (+5)
  if (!subject.endsWith('.')) {
    score += 5;
    breakdown.push({ rule: 'No trailing period', points: 5, pass: true });
  } else {
    breakdown.push({
      rule: 'No trailing period',
      points: 0,
      pass: false,
      hint: 'Remove the trailing period from the subject',
    });
  }

  // 7. Capitalized subject (+5)
  const subjectAfterPrefix = getSubjectAfterPrefix(subject);
  const firstChar = subjectAfterPrefix.charAt(0);
  const isCapitalized = firstChar === firstChar.toUpperCase() && /[A-Z]/.test(firstChar);
  if (isCapitalized) {
    score += 5;
    breakdown.push({ rule: 'Capitalized subject', points: 5, pass: true });
  } else {
    breakdown.push({
      rule: 'Capitalized subject',
      points: 0,
      pass: false,
      hint: `Capitalize after the prefix: "${subjectAfterPrefix}"`,
    });
  }

  // 8. Scope present (+10)
  const hasScope = SCOPE_PATTERN.test(subject);
  if (hasScope) {
    score += 10;
    breakdown.push({ rule: 'Scope present', points: 10, pass: true });
  } else {
    breakdown.push({
      rule: 'Scope present',
      points: 0,
      pass: false,
      hint: 'Add a scope: feat(auth): or fix(api):',
    });
  }

  // 9. References issue number (+10)
  const hasIssueRef = ISSUE_PATTERN.test(message);
  if (hasIssueRef) {
    score += 10;
    breakdown.push({ rule: 'References issue number', points: 10, pass: true });
  } else {
    breakdown.push({
      rule: 'References issue number',
      points: 0,
      pass: false,
      hint: 'Add closes #123 or refs #456 in the body',
    });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    grade: scoreToGrade(score),
    breakdown,
    subject,
    body,
  };
}

export function scoreToGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

function extractSubjectWords(subject) {
  // Strip conventional prefix if present
  const stripped = subject.replace(/^[a-z]+(\([^)]+\))?!?:\s*/i, '');
  return stripped.split(/\s+/);
}

function getSubjectAfterPrefix(subject) {
  return subject.replace(/^[a-z]+(\([^)]+\))?!?:\s*/i, '');
}
