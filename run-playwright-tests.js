// Browser-based harness to run test-all-features.js with Playwright
// Assumes the frontend is accessible at the URL below (default: production).

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.env.TEST_TARGET_URL || 'https://school.6x7.gr';
const TEST_SCRIPT_PATH = path.join(__dirname, 'test-all-features.js');

async function main() {
  console.log(`Opening ${TARGET_URL} ...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Preseed minimal config to avoid warnings about missing settings
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    localStorage.setItem('backend_url', 'https://school-backend.fly.dev');
    localStorage.setItem('supabase_url', 'https://jmjezmfhygvazfunuujt.supabase.co');
  });

  const testScript = fs.readFileSync(TEST_SCRIPT_PATH, 'utf8');

  const results = await page.evaluate(script => {
    // Wrap the test script to allow returning results
    const wrapped = `(function(){ ${script}\n; return typeof testResults !== 'undefined' ? testResults : window.testResults; })()`;
    return eval(wrapped);
  }, testScript);

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Warnings: ${results.warnings.length}`);

  if (results.failed.length) {
    console.log('\nFailed Tests:');
    results.failed.forEach(name => console.log(`- ${name}`));
  }

  if (results.warnings.length) {
    console.log('\nWarnings:');
    results.warnings.forEach(w => console.log(`- ${w.name}: ${w.message}`));
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});

