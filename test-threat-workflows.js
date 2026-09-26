const threatCases = [
  {
    name: 'Suspicious SMS Urgency',
    body: {
      content: 'URGENT: Your parcel from USPS cannot be delivered due to missing street address. Confirm address within 12 hours at https://usps-tracking-update.xyz or package will be returned to sender.',
      contentType: 'TEXT',
      isEphemeral: true,
    },
    expectedCategory: 'PHISHING',
    expectedRiskLevel: ['SUSPICIOUS', 'DANGEROUS'],
  },
  {
    name: 'Phishing Email with PII',
    body: {
      content: 'Dear valued customer John Doe, your account john.doe@gmail.com has unusual sign-ins. Call security officer Mark at (555) 432-1098 or visit https://paypal-security-alert.xyz/verify immediately.',
      contentType: 'TEXT',
      isEphemeral: true,
    },
    expectedCategory: 'PHISHING',
    expectedRiskLevel: ['SUSPICIOUS', 'DANGEROUS'],
    expectPiiRedacted: true,
  },
  {
    name: 'Fake Job Offer Scam',
    body: {
      content: 'Congratulations! You have been accepted for Remote Data Entry. Salary is $75/hr. Send your SSN 000-12-3456 and contact recruiter Lisa on Telegram @apex_careers to wire an onboarding equipment fee of $200.',
      contentType: 'TEXT',
      isEphemeral: true,
    },
    expectedCategory: 'JOB_SCAM',
    expectedRiskLevel: ['SUSPICIOUS', 'DANGEROUS'],
    expectPiiRedacted: true,
  },
  {
    name: 'Payment / Invoice Scam',
    body: {
      content: 'Geek Squad Invoice #49281: Thank you for your auto-renewal purchase of $499.00. If you did not authorize this charge, call our refund department at 1-800-555-0199 or email refund@geeksquad-billing.cam.',
      contentType: 'TEXT',
      isEphemeral: true,
    },
    expectedCategory: 'ECOMMERCE_INVOICE',
    expectedRiskLevel: ['SUSPICIOUS', 'DANGEROUS'],
  },
  {
    name: 'Suspicious Malicious URL',
    body: {
      content: 'https://chase-bank-verify-auth.top/login',
      contentType: 'URL',
      isEphemeral: true,
    },
    expectedCategory: 'PHISHING',
    expectedRiskLevel: ['SUSPICIOUS', 'DANGEROUS'],
  },
];

async function runThreatTests() {
  console.log('--- TESTING COMPLETE THREAT-ANALYSIS WORKFLOWS ---');
  let passed = 0;

  for (const tc of threatCases) {
    try {
      const res = await fetch('http://localhost:5000/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tc.body),
      });

      if (!res.ok) {
        console.log(`❌ FAIL: [${tc.name}] HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const d = json.data;

      // Check category
      const categoryMatch = d.category === tc.expectedCategory;
      // Check risk level
      const riskMatch = tc.expectedRiskLevel.includes(d.riskLevel);
      // Check red flags exist
      const flagsExist = Array.isArray(d.redFlags) && d.redFlags.length > 0;
      // Check recommendations exist
      const actionsExist = Array.isArray(d.recommendedActions) && d.recommendedActions.length > 0;

      // Check PII redaction if required
      let piiOk = true;
      if (tc.expectPiiRedacted) {
        piiOk = Array.isArray(d.piiRedactions) && d.piiRedactions.length > 0;
      }

      if (categoryMatch && riskMatch && flagsExist && actionsExist && piiOk) {
        console.log(`✅ PASS: [${tc.name}]`);
        console.log(`   - Risk: ${d.riskScore}/100 [${d.riskLevel}]`);
        console.log(`   - Category: ${d.category}`);
        console.log(`   - Flags: ${d.redFlags.length} detected (Top: "${d.redFlags[0].title}")`);
        console.log(`   - Actions: ${d.recommendedActions.length} recommendations`);
        if (tc.expectPiiRedacted) {
          console.log(`   - PII Scrubbed: ${d.piiRedactions.map(r => r.type).join(', ')}`);
        }
        passed++;
      } else {
        console.log(`❌ FAIL: [${tc.name}] Category: ${d.category} (expected ${tc.expectedCategory}), Risk: ${d.riskLevel}, PII ok: ${piiOk}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: [${tc.name}]`, err.message);
    }
  }

  console.log(`\nTHREAT WORKFLOW RESULTS: ${passed}/${threatCases.length} passed.\n`);
}

runThreatTests();
