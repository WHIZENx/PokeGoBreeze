const { execSync } = require('child_process');

const branch = process.env.VERCEL_GIT_COMMIT_REF;
console.log(`🪵 Branch Detected: ${branch}`);

try {
  if (branch !== 'main') {
    execSync('npm run develop', { stdio: 'inherit' });
  } else if (branch === 'main') {
    execSync('npm run deploy', { stdio: 'inherit' });
  } else {
    throw new Error(`Unsupported branch: ${branch}`);
  }
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exit(1);
}
