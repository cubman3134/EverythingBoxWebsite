// Build wrapper.
//
// WHY THIS EXISTS: on Node 24 + Windows, `astro build` writes a complete, correct dist/
// and prints "Complete!", then crashes during process teardown with:
//
//   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76
//
// That is a libuv/native-addon teardown bug (sharp's image pipeline), not a build
// failure — but it poisons the exit code, which would make the check gate unusable.
//
// This wrapper does NOT blanket-ignore failures. It only forgives a non-zero exit when
// the build ALSO reported success AND the expected output is on disk. Anything else
// propagates, so a genuine build break still fails the gate.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TEARDOWN_CRASH = /Assertion failed: !\(handle->flags & UV_HANDLE_CLOSING\)/;

const res = spawnSync('npx', ['astro', 'build'], {
  encoding: 'utf8',
  shell: true,
});

const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
process.stdout.write(output);

if (res.status === 0) process.exit(0);

// Astro colourises its output, so "Complete!" arrives as ESC[1mComplete!ESC[22m — a
// \b-anchored match fails because the preceding character is the 'm' of the escape.
// Strip the escapes before matching rather than loosening the pattern.
// eslint-disable-next-line no-control-regex
const plain = output.replace(/\[[0-9;]*m/g, '');

const reportedComplete = /\bComplete!/.test(plain);
const teardownCrash = TEARDOWN_CRASH.test(plain);

// Independent evidence that the build really produced a site.
const hasPages = existsSync('dist/index.html');
const hasAssets = existsSync('dist/_astro') && readdirSync('dist/_astro').length > 0;

if (reportedComplete && teardownCrash && hasPages && hasAssets) {
  console.warn(
    '\n[build] astro reported Complete! and dist/ is intact; ignoring the known ' +
      'libuv teardown crash (Node 24 + Windows + sharp).',
  );
  process.exit(0);
}

console.error(
  `\n[build] FAILED (exit ${res.status}). ` +
    `complete=${reportedComplete} teardownCrash=${teardownCrash} ` +
    `pages=${hasPages} assets=${hasAssets}`,
);
process.exit(res.status ?? 1);
