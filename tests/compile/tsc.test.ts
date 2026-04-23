const child_process = require('child_process');

describe('TypeScript compilation', () => {
  test('tsc --noEmit succeeds', () => {
    child_process.execSync('npx tsc --noEmit', { stdio: 'pipe' });
  }, 120000);
});
