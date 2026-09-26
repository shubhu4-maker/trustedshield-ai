const testCases = [
  { name: 'Empty content', body: { content: '', contentType: 'TEXT' } },
  { name: 'Too short content (< 5 chars)', body: { content: '123', contentType: 'TEXT' } },
  { name: 'Unsupported javascript scheme', body: { content: 'javascript:alert(1)', contentType: 'URL' } },
  { name: 'Unsupported file scheme', body: { content: 'file:///etc/passwd', contentType: 'URL' } },
  { name: 'Unsupported data scheme', body: { content: 'data:text/html,evil', contentType: 'URL' } },
  { name: 'Malformed URL (no domain/dot)', body: { content: 'notadomain', contentType: 'URL' } },
  { name: 'Excessively long input (> 10,000 chars)', body: { content: 'A'.repeat(10001), contentType: 'TEXT' } },
  { name: 'Invalid request body (missing content)', body: { contentType: 'TEXT' } },
  { name: 'Invalid contentType enum', body: { content: 'Valid message content', contentType: 'INVALID' } },
];

async function runTests() {
  console.log('--- RUNNING INPUT VALIDATION TEST SUITE ---');
  let passed = 0;

  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:5000/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tc.body),
      });

      if (res.status === 400) {
        const data = await res.json();
        console.log(`✅ PASS: [${tc.name}] rejected with HTTP 400 - ${data.error || JSON.stringify(data.details?.[0]?.message)}`);
        passed++;
      } else {
        console.log(`❌ FAIL: [${tc.name}] returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: [${tc.name}] fetch error:`, err.message);
    }
  }

  // Also test a valid submission
  try {
    const validRes = await fetch('http://localhost:5000/api/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Your Chase Bank card has been suspended. Visit https://chase-security-alert.xyz to unlock.',
        contentType: 'TEXT',
        isEphemeral: true,
      }),
    });

    if (validRes.status === 200) {
      const data = await validRes.json();
      console.log(`✅ PASS: [Valid submission] accepted with HTTP 200 - Risk: ${data.data.riskScore}/100 (${data.data.riskLevel})`);
      passed++;
    } else {
      console.log(`❌ FAIL: [Valid submission] returned HTTP ${validRes.status}`);
    }
  } catch (err) {
    console.log('❌ ERROR on valid submission:', err.message);
  }

  console.log(`\nRESULTS: ${passed}/${testCases.length + 1} validation tests passed.`);
}

runTests();
