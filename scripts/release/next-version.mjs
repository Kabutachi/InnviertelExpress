// Git tags (vMAJOR.MINOR.PATCH) are the source of truth for the version; package.json is not kept in sync.
//
//   node scripts/release/next-version.mjs check <branch>   exits 1 if the branch has no valid prefix
//   node scripts/release/next-version.mjs next <branch>    prints the next tag
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BUMP_BY_PREFIX = { fix: 'patch', hotfix: 'patch', minor: 'minor', major: 'major' };
const TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/;
// Used by the first merge, when the repo has no version tags yet.
const FIRST_VERSION = 'v0.3.0';

export function bumpFromBranch(branch) {
  const match = /^(fix|hotfix|minor|major)[/-][^/-]/i.exec(branch);
  return match ? BUMP_BY_PREFIX[match[1].toLowerCase()] : null;
}

export function highestVersion(tags) {
  const versions = tags
    .map((tag) => TAG_PATTERN.exec(tag.trim()))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number));
  versions.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  return versions[0] ?? null;
}

export function formatVersion([major, minor, patch]) {
  return `v${major}.${minor}.${patch}`;
}

export function nextVersion(tags, bump) {
  const current = highestVersion(tags);
  if (!current) return FIRST_VERSION;
  const [major, minor, patch] = current;
  if (bump === 'major') return formatVersion([major + 1, 0, 0]);
  if (bump === 'minor') return formatVersion([major, minor + 1, 0]);
  if (bump === 'patch') return formatVersion([major, minor, patch + 1]);
  throw new Error(`Unknown bump: ${bump}`);
}

export function gitTags(...filters) {
  const output = execFileSync('git', ['tag', '--list', 'v*', ...filters], { encoding: 'utf8' });
  return output.split('\n').filter(Boolean);
}

function main([command, branch]) {
  if (!['check', 'next'].includes(command) || !branch) {
    console.error('Usage: next-version.mjs <check|next> <branch>');
    return 2;
  }
  const bump = bumpFromBranch(branch);
  if (!bump) {
    console.error(
      `Branch "${branch}" has no version prefix. Use fix/ or hotfix/ (patch), minor/ (minor) or major/ (major). A dash also works, e.g. fix-footer-link.`,
    );
    return 1;
  }
  console.log(command === 'check' ? `${branch}: ${bump} bump` : nextVersion(gitTags(), bump));
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
