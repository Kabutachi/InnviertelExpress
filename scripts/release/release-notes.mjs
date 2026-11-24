// Builds the title and description of the main -> prod release PR.
//
//   node scripts/release/release-notes.mjs title
//   node scripts/release/release-notes.mjs body
//
// With GH_TOKEN and GITHUB_REPOSITORY set, commits are grouped by their merged PR.
// Without them, every commit is listed under "Other commits".
import { execFileSync } from 'node:child_process';
import { bumpFromBranch, formatVersion, gitTags, highestVersion } from './next-version.mjs';

const PROD = 'origin/prod';
const MAIN = 'origin/main';

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function versionAt(ref) {
  const version = highestVersion(gitTags('--merged', ref));
  return version ? formatVersion(version) : null;
}

// Stops a commit or PR title from notifying someone when it lands in the description.
function safeText(text) {
  return text.replace(/@/g, '@​');
}

function unreleasedCommits() {
  const log = git('log', '--no-merges', '--reverse', '--format=%H%x09%s', `${PROD}..${MAIN}`);
  return log
    ? log.split('\n').map((line) => {
        const [sha, ...subject] = line.split('\t');
        return { sha, subject: subject.join('\t') };
      })
    : [];
}

async function mergedPull(sha) {
  const { GH_TOKEN: token, GITHUB_REPOSITORY: repo } = process.env;
  if (!token || !repo) return null;
  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/pulls`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status} for commit ${sha}`);
  const pulls = await response.json();
  return pulls.find((pull) => pull.merged_at && pull.base.ref === 'main') ?? null;
}

async function buildBody() {
  const groups = { major: new Map(), minor: new Map(), patch: new Map() };
  const other = [];

  for (const commit of unreleasedCommits()) {
    const pull = await mergedPull(commit.sha);
    const bump = pull && bumpFromBranch(pull.head.ref);
    if (bump) groups[bump].set(pull.number, pull.title);
    else if (pull) other.push(`- ${safeText(pull.title)} (#${pull.number})`);
    else other.push(`- ${safeText(commit.subject)} (${commit.sha.slice(0, 7)})`);
  }

  const previous = versionAt(PROD);
  const lines = [
    `## Release ${versionAt(MAIN)}`,
    '',
    previous ? `Updates production from **${previous}** to **${versionAt(MAIN)}**.` : `First versioned release: **${versionAt(MAIN)}**.`,
  ];
  const sections = [
    ['Major', [...groups.major].map(([number, title]) => `- ${safeText(title)} (#${number})`)],
    ['Minor', [...groups.minor].map(([number, title]) => `- ${safeText(title)} (#${number})`)],
    ['Fixes', [...groups.patch].map(([number, title]) => `- ${safeText(title)} (#${number})`)],
    ['Other commits', [...new Set(other)]],
  ];
  for (const [heading, items] of sections) {
    if (items.length) lines.push('', `### ${heading}`, '', ...items);
  }
  lines.push('', '> Merge with a **merge commit**, not squash, so `main` and `prod` keep a shared history.');
  return lines.join('\n');
}

const command = process.argv[2];
if (command === 'title') {
  console.log(`Release ${versionAt(MAIN)}`);
} else if (command === 'body') {
  console.log(await buildBody());
} else {
  console.error('Usage: release-notes.mjs <title|body>');
  process.exitCode = 2;
}
