import { supabaseAdmin } from '../config/supabase.js';

const SEED_SCANS = [
  {
    id: '11111111-2222-3333-4444-555555555551',
    user_id: null,
    content_type: 'TEXT',
    original_length: 240,
    redacted_content: 'Urgent notice: Your PayPal account has been temporarily restricted. Please visit https://paypal-security-alert.xyz/verify to update your account within 24 hours.',
    analyzed_url: 'https://paypal-security-alert.xyz/verify',
    risk_score: 92,
    risk_level: 'DANGEROUS',
    category: 'PHISHING',
    summary: 'High-risk phishing attack impersonating PayPal. Uses artificial urgency and an untrusted .xyz domain to harvest account credentials.',
    red_flags: [
      { title: 'Suspicious TLD (.xyz)', explanation: 'Official PayPal services operate strictly on paypal.com, not .xyz top-level domains.', severity: 'HIGH' },
      { title: 'Artificial Urgency', explanation: 'Demands action within 24 hours to cause panic and bypass critical thinking.', severity: 'HIGH' },
      { title: 'Credential Harvesting Link', explanation: 'Directs victim to an unofficial replica login portal.', severity: 'HIGH' },
    ],
    recommended_actions: [
      { action: 'Do not click the link or provide any login details.', priority: 'URGENT' },
      { action: 'Navigate to paypal.com directly through your browser address bar.', priority: 'URGENT' },
      { action: 'Forward the message to spoof@paypal.com.', priority: 'RECOMMENDED' },
    ],
    heuristic_signals: { totalRawScore: 85 },
    is_public: true,
    is_ephemeral: false,
    upvotes: 24,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: '11111111-2222-3333-4444-555555555552',
    user_id: null,
    content_type: 'TEXT',
    original_length: 320,
    redacted_content: 'Congratulations! You have been selected for a Remote Data Entry position at Apex Global Solutions. Salary is $65/hr. Contact the hiring manager on Telegram @apex_careers and pay $150 onboarding fee for equipment setup.',
    analyzed_url: null,
    risk_score: 88,
    risk_level: 'DANGEROUS',
    category: 'JOB_SCAM',
    summary: 'Classic employment advance-fee scam. Offers unrealistic compensation for entry-level work and demands upfront payment for home equipment via Telegram.',
    red_flags: [
      { title: 'Upfront Onboarding Fee', explanation: 'Legitimate employers never require candidates to pay fees for equipment or background checks.', severity: 'HIGH' },
      { title: 'Telegram Recruiting', explanation: 'Professional corporations conduct hiring via verified enterprise channels, not encrypted messaging apps.', severity: 'HIGH' },
      { title: 'Unrealistic Compensation', explanation: '$65/hr for basic data entry is vastly above standard market compensation.', severity: 'MEDIUM' },
    ],
    recommended_actions: [
      { action: 'Cease all communication with the recruiter.', priority: 'URGENT' },
      { action: 'Never transfer funds or buy gift cards for employment.', priority: 'URGENT' },
      { action: 'Report the user handle on Telegram.', priority: 'RECOMMENDED' },
    ],
    heuristic_signals: { totalRawScore: 80 },
    is_public: true,
    is_ephemeral: false,
    upvotes: 18,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: '11111111-2222-3333-4444-555555555553',
    user_id: null,
    content_type: 'TEXT',
    original_length: 280,
    redacted_content: 'Internal Revenue Service Alert: Final notice regarding overdue tax liabilities for 2024. Failure to transfer $1,200 via Bitcoin to wallet bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq will result in immediate federal arrest warrant.',
    analyzed_url: null,
    risk_score: 95,
    risk_level: 'DANGEROUS',
    category: 'IMPERSONATION',
    summary: 'Extreme intimidation scam impersonating the IRS. Threatens law enforcement action and demands payment via irreversible cryptocurrency.',
    red_flags: [
      { title: 'Cryptocurrency Demand by Government', explanation: 'Government agencies never accept payment via Bitcoin or any cryptocurrency.', severity: 'HIGH' },
      { title: 'Arrest Threat Intimidation', explanation: 'The IRS does not initiate arrest threats or police dispatch via email or SMS.', severity: 'HIGH' },
      { title: 'Bitcoin Wallet Address Detected', explanation: 'Irreversible transaction mechanism intended to prevent recovery.', severity: 'HIGH' },
    ],
    recommended_actions: [
      { action: 'Block sender immediately and do not respond.', priority: 'URGENT' },
      { action: 'Report to the Treasury Inspector General for Tax Administration (TIGTA).', priority: 'RECOMMENDED' },
    ],
    heuristic_signals: { totalRawScore: 90 },
    is_public: true,
    is_ephemeral: false,
    upvotes: 42,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: '11111111-2222-3333-4444-555555555554',
    user_id: null,
    content_type: 'TEXT',
    original_length: 220,
    redacted_content: 'Geek Squad Order Confirmation: Thank you for your auto-renewal purchase of Total Protection ($499.99). If you did not authorize this charge, call our cancellation desk immediately at [REDACTED_PHONE].',
    analyzed_url: null,
    risk_score: 82,
    risk_level: 'DANGEROUS',
    category: 'ECOMMERCE_INVOICE',
    summary: 'Refund and cancellation invoice scam designed to induce panic over an unauthorized charge, prompting the victim to call a malicious call center.',
    red_flags: [
      { title: 'Fake Renewal Invoice', explanation: 'Fabricated high-dollar charge designed to provoke hasty reactive calls.', severity: 'HIGH' },
      { title: 'Direct Phone Call Vector', explanation: 'Attempts to route victim to social-engineering operators to gain remote device access.', severity: 'HIGH' },
    ],
    recommended_actions: [
      { action: 'Do not dial the telephone number provided in the notice.', priority: 'URGENT' },
      { action: 'Inspect your actual bank or card statement directly.', priority: 'URGENT' },
    ],
    heuristic_signals: { totalRawScore: 75 },
    is_public: true,
    is_ephemeral: false,
    upvotes: 15,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: '11111111-2222-3333-4444-555555555555',
    user_id: null,
    content_type: 'URL',
    original_length: 35,
    redacted_content: 'https://chase-bank-verify-auth.top',
    analyzed_url: 'https://chase-bank-verify-auth.top',
    risk_score: 91,
    risk_level: 'DANGEROUS',
    category: 'PHISHING',
    summary: 'Lookalike domain spoofing Chase Bank using the suspicious .top generic top-level domain and multiple subdomains.',
    red_flags: [
      { title: 'Lookalike Brand Name', explanation: 'Uses "chase-bank" in hostname rather than official chase.com domain.', severity: 'HIGH' },
      { title: 'High-Risk TLD (.top)', explanation: 'Top-level domain frequently associated with spam and malicious landing pages.', severity: 'HIGH' },
    ],
    recommended_actions: [
      { action: 'Never open this link in your web browser.', priority: 'URGENT' },
      { action: 'Report domain to Google Safe Browsing and registrar.', priority: 'RECOMMENDED' },
    ],
    heuristic_signals: { totalRawScore: 88 },
    is_public: true,
    is_ephemeral: false,
    upvotes: 31,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

async function seed() {
  console.log('Seeding curated community threats into Supabase public.scans...');
  const { data, error } = await supabaseAdmin.from('scans').upsert(SEED_SCANS);
  if (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
  console.log('✅ Successfully seeded 5 curated threat intelligence samples into Supabase database!');
}

seed().catch(console.error);
