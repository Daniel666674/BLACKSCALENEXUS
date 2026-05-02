#!/usr/bin/env node
'use strict';

/**
 * apollo-sync-2060.js
 *
 * Reads /root/apollo-contacts.csv, scores every contact with the
 * BlackScale ICP algorithm, then upserts all 2060 contacts into Brevo
 * with custom attributes: SCORE, TIER, INDUSTRY, LINKEDIN_URL, PHONE,
 * LOCATION, COMPANY_WEBSITE, COMPANY_INDUSTRY, COMPANY_SIZE,
 * TECHNOLOGIES, APOLLO_CONTACT_ID, JOB_TITLE, STAGE.
 *
 * Usage:
 *   export BREVO_API_KEY="xkeysib-..."
 *   node scripts/apollo-sync-2060.js
 *
 * Options:
 *   --csv=/path/to/file.csv   override default CSV path
 *   --list-id=123             add contacts to this Brevo list ID
 *   --dry-run                 parse + score but do NOT call Brevo API
 *   --skip-attributes         skip the Brevo attribute creation step
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

// ─── Config ────────────────────────────────────────────────────────────────

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const CSV_ARG       = process.argv.find(a => a.startsWith('--csv='));
const CSV_PATH      = CSV_ARG ? CSV_ARG.split('=').slice(1).join('=') : '/root/apollo-contacts.csv';
const DRY_RUN       = process.argv.includes('--dry-run');
const SKIP_ATTRS    = process.argv.includes('--skip-attributes');
const LIST_ID_ARG   = process.argv.find(a => a.startsWith('--list-id='));
const LIST_IDS      = LIST_ID_ARG ? [parseInt(LIST_ID_ARG.split('=')[1], 10)] : [];
const BATCH_SIZE    = 100;   // contacts per Brevo import request
const DELAY_MS      = 800;   // ms between batches (respect rate limits)

if (!BREVO_API_KEY && !DRY_RUN) {
  console.error('\n  ERROR: BREVO_API_KEY environment variable is not set.');
  console.error('  Run:  export BREVO_API_KEY="xkeysib-..."  then retry.\n');
  process.exit(1);
}

if (!fs.existsSync(CSV_PATH)) {
  console.error(`\n  ERROR: CSV file not found at: ${CSV_PATH}`);
  console.error('  Use:  --csv=/path/to/apollo.csv  to specify the path.\n');
  process.exit(1);
}

// ─── ICP Scoring ────────────────────────────────────────────────────────────

const SENIORITY_MAP = {
  founder: 20, owner: 20, propietario: 20, fundador: 20,
  ceo: 20, cto: 20, coo: 20, cmo: 20, cfo: 20, 'c_suite': 20, 'c-suite': 20,
  president: 20,
  vp: 16, 'vice president': 16, 'vice_president': 16,
  head: 12, director: 12,
  manager: 8, gerente: 8, senior: 8,
};

const DEPT_MAP = {
  sales: 10, ventas: 10, marketing: 10, 'c-suite': 10, 'c_suite': 10, growth: 10,
  operations: 6, 'ops': 6, operaciones: 6, finance: 6, business: 6, accounting: 6,
  it: 4, engineering: 4, tech: 4, sistemas: 4, software: 4, data: 4,
};

const ICP_INDUSTRY_MAP = [
  // [keyword, score]
  ['insurance', 25], ['seguros', 25], ['asegura', 25],
  ['saas', 22], ['software as a service', 22], ['tecnología', 22],
  ['tecnologia', 22], ['technology', 22], ['information technology', 22],
  ['fintech', 22], ['financial technology', 22],
  ['logistics', 20], ['logística', 20], ['logistica', 20], ['supply chain', 20],
  ['transportation', 20],
  ['professional services', 18], ['servicios profesionales', 18],
  ['consulting', 18], ['consultoría', 18], ['consultoria', 18],
  ['management consulting', 18], ['legal', 16], ['accounting', 16],
  ['real estate', 14], ['inmobiliaria', 14],
  ['healthcare', 12], ['health', 12], ['salud', 12],
  ['education', 10], ['educación', 10],
  ['retail', 8], ['e-commerce', 8], ['ecommerce', 8],
  ['manufacturing', 8], ['construction', 6],
];

function parseSizeNum(sizeStr) {
  if (!sizeStr) return 0;
  const s = String(sizeStr).replace(/[^0-9]/g, '');
  return parseInt(s, 10) || 0;
}

function scoreContact(row) {
  let total = 0;

  // ── Seniority (max 20) ──────────────────────────────────────────────────
  const seniority = (row.seniority || '').toLowerCase().trim();
  const title     = (row.title || '').toLowerCase();
  let senScore = 3; // default: other
  for (const [kw, pts] of Object.entries(SENIORITY_MAP)) {
    if (seniority === kw || seniority.includes(kw) || title.includes(kw)) {
      senScore = pts;
      break;
    }
  }
  total += senScore;

  // ── Email verified (max 10) ────────────────────────────────────────────
  const emailStatus = (row.emailStatus || '').toLowerCase();
  if (emailStatus === 'verified' || emailStatus === 'valid') total += 10;

  // ── Department (max 10) ────────────────────────────────────────────────
  const dept = (row.departments || row.department || '').toLowerCase();
  let deptScore = 2; // default: other
  for (const [kw, pts] of Object.entries(DEPT_MAP)) {
    if (dept.includes(kw) || title.includes(kw)) {
      deptScore = pts;
      break;
    }
  }
  total += deptScore;

  // ── ICP Industry (max 25) ──────────────────────────────────────────────
  const ind = (row.industry || row.companyIndustry || '').toLowerCase();
  let indScore = 5; // default: other
  for (const [kw, pts] of ICP_INDUSTRY_MAP) {
    if (ind.includes(kw)) { indScore = pts; break; }
  }
  total += indScore;

  // ── Company size (max 15) ──────────────────────────────────────────────
  const size = parseSizeNum(row.companySize || row.employees || '');
  if      (size >= 11  && size <= 200)  total += 15;
  else if (size >= 201 && size <= 500)  total += 12;
  else if (size >= 5   && size <= 10)   total += 10;
  else if (size >= 501 && size <= 1000) total += 8;
  else if (size >= 1   && size <= 4)    total += 6;
  else if (size > 1000)                 total += 4;

  // ── Data completeness (max 10) ─────────────────────────────────────────
  if (row.linkedinUrl)      total += 3;
  if (row.phone)            total += 4;
  if (row.companyWebsite)   total += 3;

  // ── Engagement (max 10) ────────────────────────────────────────────────
  const replied = parseInt(row.emailReplies  || '0', 10);
  const opened  = parseInt(row.emailOpens    || '0', 10);
  const sent    = parseInt(row.emailSent     || '0', 10);
  if      (replied > 0) total += 10;
  else if (opened  > 0) total += 5;
  else if (sent    > 0) total += 2;

  const score = Math.min(100, total);
  const tier  = score >= 80 ? 1 : score >= 60 ? 2 : score >= 40 ? 3 : 4;
  return { score, tier };
}

// ─── CSV Parser ─────────────────────────────────────────────────────────────
// Handles quoted fields, commas/semicolons inside quotes, CRLF line endings.

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Auto-detect delimiter from header line
  const header = lines[0] || '';
  const delim  = (header.match(/\t/g) || []).length > (header.match(/,/g) || []).length ? '\t' : ',';

  function splitLine(line) {
    const fields = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === delim && !inQuote) {
        fields.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    fields.push(cur.trim());
    return fields;
  }

  const headers = splitLine(header).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());

  // Map Apollo column names → internal keys
  function colIdx(candidates) {
    for (const c of candidates) {
      const i = headers.indexOf(c.toLowerCase());
      if (i !== -1) return i;
    }
    return -1;
  }

  const COL = {
    firstName:       colIdx(['first name', 'firstname', 'first_name']),
    lastName:        colIdx(['last name', 'lastname', 'last_name']),
    title:           colIdx(['title', 'job title', 'job_title', 'position']),
    company:         colIdx(['company', 'company name', 'company_name', 'organization']),
    email:           colIdx(['email', 'email address', 'work email', 'primary email']),
    emailStatus:     colIdx(['email status', 'email_status', 'emailstatus']),
    seniority:       colIdx(['seniority']),
    departments:     colIdx(['departments', 'department']),
    phone:           colIdx(['phone', 'work direct phone', 'mobile phone', 'phone number',
                             'work_direct_phone', 'mobile_phone']),
    linkedinUrl:     colIdx(['linkedin url', 'linkedin_url', 'person linkedin url',
                             'person_linkedin_url', 'linkedin']),
    companyLinkedin: colIdx(['company linkedin url', 'company_linkedin_url']),
    companyWebsite:  colIdx(['website', 'company website', 'company_website']),
    industry:        colIdx(['industry']),
    companyIndustry: colIdx(['company industry', 'company_industry']),
    employees:       colIdx(['# employees', 'employees', 'employee count', 'company_employee_count',
                             'company employee count', 'num_employees', 'headcount']),
    city:            colIdx(['city']),
    state:           colIdx(['state']),
    country:         colIdx(['country']),
    technologies:    colIdx(['technologies', 'technology']),
    apolloId:        colIdx(['apollo contact id', 'apollo_contact_id', 'contact id',
                             'person id', 'id']),
    stage:           colIdx(['stage']),
    emailOpens:      colIdx(['email open count', 'email_open_count', 'opens']),
    emailReplies:    colIdx(['email reply count', 'email_reply_count', 'replies']),
    emailSent:       colIdx(['email sent count', 'email_sent_count', 'sent']),
  };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const f = splitLine(line);
    const get = (key) => COL[key] >= 0 ? (f[COL[key]] || '').trim() : '';

    const email = get('email');
    if (!email || !email.includes('@')) continue; // skip rows without valid email

    const location = [get('city'), get('state'), get('country')]
      .filter(Boolean).join(', ');

    rows.push({
      email,
      firstName:       get('firstName'),
      lastName:        get('lastName'),
      title:           get('title'),
      company:         get('company'),
      emailStatus:     get('emailStatus'),
      seniority:       get('seniority'),
      departments:     get('departments'),
      phone:           get('phone'),
      linkedinUrl:     get('linkedinUrl'),
      companyWebsite:  get('companyWebsite') || get('companyLinkedin'),
      industry:        get('industry'),
      companyIndustry: get('companyIndustry') || get('industry'),
      companySize:     get('employees'),
      location,
      technologies:    get('technologies'),
      apolloId:        get('apolloId'),
      stage:           get('stage'),
      emailOpens:      get('emailOpens'),
      emailReplies:    get('emailReplies'),
      emailSent:       get('emailSent'),
    });
  }
  return rows;
}

// ─── Brevo API ───────────────────────────────────────────────────────────────

function brevoRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.brevo.com',
      path: endpoint,
      method,
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Brevo ${method} ${endpoint} → ${res.statusCode}: ${data}`));
        } else {
          try { resolve(data ? JSON.parse(data) : {}); }
          catch { resolve({}); }
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Create a Brevo custom attribute (silently ignores 400 = already exists)
async function ensureAttribute(name, type) {
  try {
    await brevoRequest('POST', `/v3/contacts/attributes/normal/${name}`, { type });
    process.stdout.write(`  attr ${name} created\n`);
  } catch (e) {
    const msg = e.message || '';
    if (!msg.includes('400')) {
      process.stdout.write(`  attr ${name}: ${msg}\n`);
    }
    // 400 = already exists → fine
  }
}

async function ensureAllAttributes() {
  console.log('\n── Creating Brevo custom attributes (skip if exist)…');
  const attrs = [
    ['SCORE',             'float'],
    ['TIER',              'float'],
    ['INDUSTRY',          'text'],
    ['LINKEDIN_URL',      'text'],
    ['PHONE',             'text'],
    ['LOCATION',          'text'],
    ['COMPANY_WEBSITE',   'text'],
    ['COMPANY_INDUSTRY',  'text'],
    ['COMPANY_SIZE',      'text'],
    ['TECHNOLOGIES',      'text'],
    ['APOLLO_CONTACT_ID', 'text'],
    ['JOB_TITLE',         'text'],
    ['STAGE',             'text'],
  ];
  for (const [name, type] of attrs) {
    await ensureAttribute(name, type);
    await sleep(100);
  }
  console.log('── Attributes ready.\n');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Import one batch of contacts via POST /v3/contacts/import (jsonBody)
async function importBatch(contacts, batchNum, total) {
  const jsonBody = contacts.map(c => {
    const { score, tier } = scoreContact(c);
    return {
      email: c.email,
      attributes: {
        FIRSTNAME:         c.firstName  || '',
        LASTNAME:          c.lastName   || '',
        COMPANY:           c.company    || '',
        SCORE:             score,
        TIER:              tier,
        INDUSTRY:          c.industry   || c.companyIndustry || '',
        LINKEDIN_URL:      c.linkedinUrl     || '',
        PHONE:             c.phone           || '',
        LOCATION:          c.location        || '',
        COMPANY_WEBSITE:   c.companyWebsite  || '',
        COMPANY_INDUSTRY:  c.companyIndustry || c.industry || '',
        COMPANY_SIZE:      c.companySize     || '',
        TECHNOLOGIES:      c.technologies    || '',
        APOLLO_CONTACT_ID: c.apolloId        || '',
        JOB_TITLE:         c.title           || '',
        STAGE:             c.stage           || '',
      },
      ...(LIST_IDS.length > 0 ? { listIds: LIST_IDS } : {}),
    };
  });

  const start = (batchNum - 1) * BATCH_SIZE + 1;
  const end   = Math.min(batchNum * BATCH_SIZE, total);
  process.stdout.write(`  Batch ${batchNum}: contacts ${start}–${end} of ${total}… `);

  const result = await brevoRequest('POST', '/v3/contacts/import', {
    updateExistingContacts: true,
    emptyContactsAttributes: false,
    jsonBody,
  });

  // Brevo may return a processId (async) or direct counts
  if (result.processId) {
    process.stdout.write(`queued (processId: ${result.processId})\n`);
  } else {
    process.stdout.write(`done\n`);
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     BlackScale Apollo → Brevo Sync (2060 contacts)      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  CSV:      ${CSV_PATH}`);
  console.log(`  Dry run:  ${DRY_RUN ? 'YES — no Brevo calls' : 'NO'}`);
  console.log(`  Lists:    ${LIST_IDS.length ? LIST_IDS.join(', ') : 'none (no list assignment)'}`);
  console.log(`  Batch sz: ${BATCH_SIZE}`);
  console.log('');

  // ── 1. Read and parse CSV ─────────────────────────────────────────────
  console.log('── Reading CSV…');
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const contacts = parseCSV(raw);
  console.log(`   Parsed ${contacts.length} contacts with valid emails.\n`);

  if (contacts.length === 0) {
    console.error('ERROR: No contacts parsed. Check that the CSV has an "Email" column and valid rows.');
    process.exit(1);
  }

  // ── 2. Score all contacts (preview) ──────────────────────────────────
  console.log('── Scoring contacts…');
  const scored = contacts.map(c => ({ ...c, ...scoreContact(c) }));

  const t1 = scored.filter(c => c.tier === 1).length;
  const t2 = scored.filter(c => c.tier === 2).length;
  const t3 = scored.filter(c => c.tier === 3).length;
  const t4 = scored.filter(c => c.tier === 4).length;
  const avgScore = Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length);

  console.log(`   Tier 1 (80+):  ${t1.toString().padStart(4)} contacts`);
  console.log(`   Tier 2 (60-79): ${t2.toString().padStart(4)} contacts`);
  console.log(`   Tier 3 (40-59): ${t3.toString().padStart(4)} contacts`);
  console.log(`   Tier 4 (<40):   ${t4.toString().padStart(4)} contacts`);
  console.log(`   Avg score:      ${avgScore}`);
  console.log('');

  // Show sample of top 5
  const top5 = scored.slice(0, 5);
  console.log('   Top contacts by score:');
  for (const c of top5) {
    console.log(`     ${String(c.score).padStart(3)}  T${c.tier}  ${(c.firstName + ' ' + c.lastName).padEnd(25).slice(0,25)}  ${(c.company || '').slice(0,30)}`);
  }
  console.log('');

  if (DRY_RUN) {
    console.log('── DRY RUN complete. No Brevo API calls made.');
    console.log('   Re-run without --dry-run to sync.');
    return;
  }

  // ── 3. Create Brevo attributes ────────────────────────────────────────
  if (!SKIP_ATTRS) {
    await ensureAllAttributes();
  }

  // ── 4. Batch import to Brevo ─────────────────────────────────────────
  const batches = [];
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    batches.push(contacts.slice(i, i + BATCH_SIZE));
  }

  console.log(`── Uploading ${contacts.length} contacts in ${batches.length} batches…\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      await importBatch(batch, i + 1, contacts.length);
      success += batch.length;
    } catch (err) {
      failed += batch.length;
      console.error(`\n  ERROR on batch ${i + 1}: ${err.message}`);

      // Retry once after 3s
      console.error(`  Retrying batch ${i + 1} in 3s…`);
      await sleep(3000);
      try {
        await importBatch(batch, i + 1, contacts.length);
        success += batch.length;
        failed  -= batch.length;
        console.log('  Retry succeeded.');
      } catch (err2) {
        console.error(`  Retry failed: ${err2.message}`);
        console.error(`  Skipping batch ${i + 1}. Check these ${batch.length} contacts manually.`);
      }
    }
    // Throttle between batches
    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  // ── 5. Summary ────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                     SYNC COMPLETE                       ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Total parsed:   ${String(contacts.length).padEnd(38)}║`);
  console.log(`║  Sent to Brevo:  ${String(success).padEnd(38)}║`);
  if (failed > 0)
  console.log(`║  Failed:         ${String(failed).padEnd(38)}║`);
  console.log(`║  Tier 1 (80+):   ${String(t1).padEnd(38)}║`);
  console.log(`║  Tier 2 (60-79): ${String(t2).padEnd(38)}║`);
  console.log(`║  Tier 3 (40-59): ${String(t3).padEnd(38)}║`);
  console.log(`║  Tier 4 (<40):   ${String(t4).padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  Next step: run POST /api/brevo/sync in the CRM to pull');
  console.log('  all updated contacts into the Marketing module.');
  console.log('');

  if (LIST_IDS.length === 0) {
    console.log('  TIP: Use --list-id=<N> to also add contacts to a Brevo list.');
    console.log('  Find your list IDs at: https://app.brevo.com/contact/list\n');
  }
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
