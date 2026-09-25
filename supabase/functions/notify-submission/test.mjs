// Runs index.ts against a stubbed Resend, so the branching can be checked
// without deploying. From the repo root:
//   NODE_PATH=$(npm root -g) node supabase/functions/notify-submission/test.mjs
// Exits non-zero if any case fails.
import fs from 'node:fs';
import { createRequire } from 'node:module';

// createRequire rather than a bare import: it honours NODE_PATH, so a
// globally installed TypeScript is found without a package.json here.
const ts = createRequire(import.meta.url)('typescript');

const src = fs.readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { target: 'es2022', module: 'esnext' } }).outputText;

let handler;
let calls = [];
let responder = () => ({ ok: true, text: async () => 'ok' });

globalThis.Deno = {
  env: { get: (k) => ({ WEBHOOK_SECRET: 'sek', RESEND_API_KEY: 'rk',
                        NOTIFY_TO: 'support@startuplogin.com' })[k] },
  serve: (h) => { handler = h; },
};
globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  calls.push(body);
  return responder(body);
};

await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

const post = (payload, secret = 'sek') => handler(new Request('https://x/', {
  method: 'POST',
  headers: { 'x-webhook-secret': secret, 'content-type': 'application/json' },
  body: JSON.stringify(payload),
}));

const signup = (extra = {}) => ({
  type: 'INSERT', table: 'notify_signups',
  record: { email: 'founder@acme.in', source: 'schemes', startup_name: 'Acme Robotics', ...extra },
});

const failures = [];
function check(label, cond) { if (!cond) failures.push(label); }

function show(label, res, body) {
  console.log(`${label}\n   status ${res.status}  ${JSON.stringify(body)}`);
}

// 1 · happy path
calls = [];
let r = await post(signup());
show('1 · both emails send', r, await r.json());
console.log('   emails sent:', calls.length);
check('happy path sends two emails', calls.length === 2);
check('happy path returns 200', r.status === 200);
calls.forEach(c => console.log(`     to=${c.to[0]}  subject="${c.subject}"`));
console.log('   confirmation mentions the startup:', /Thanks, Acme Robotics/.test(calls[1].html));
console.log('   confirmation has reply_to:', calls[1].reply_to);
check('confirmation goes to the signer', calls[1].to[0] === 'founder@acme.in');
check('alert goes to the admin', calls[0].to[0] === 'support@startuplogin.com');
check('confirmation sets reply_to', calls[1].reply_to === 'support@startuplogin.com');
console.log('   confirmation has the "not expecting this" line:', /Not expecting this email\?/.test(calls[1].html));

// 2 · no startup name
calls = [];
r = await post(signup({ startup_name: '' }));
const b2 = await r.json();
show('\n2 · signup with no startup name', r, b2);
console.log('   alert subject falls back to the address:', calls[0].subject);
console.log('   confirmation greeting has no dangling comma:', /Thanks — we'/.test(calls[1].html));

// 3 · confirmation fails, alert succeeds
calls = [];
responder = (body) => body.to[0] === 'founder@acme.in'
  ? { ok: false, text: async () => 'blocked recipient' }
  : { ok: true, text: async () => 'ok' };
r = await post(signup());
const b3 = await r.json();
show('\n3 · confirmation fails, alert succeeds', r, b3);
check('one failure still returns 200', r.status === 200 && b3.alert === true && b3.confirmation === false);

// 4 · both fail
calls = [];
responder = () => ({ ok: false, text: async () => 'provider down' });
r = await post(signup());
const b4 = await r.json();
show('\n4 · both fail', r, b4);
check('both failing returns 502', r.status === 502);

// 5 · listing submissions still work
calls = [];
responder = () => ({ ok: true, text: async () => 'ok' });
r = await post({ type: 'INSERT', table: 'listings',
  record: { name: 'Acme', status: 'pending', type: 'startup', city: 'Pune' } });
show('\n5 · listing submission unaffected', r, await r.json());
console.log('   emails sent:', calls.length, '| subject:', calls[0]?.subject);
check('listing submission still sends one email', calls.length === 1);

// 6 · bulk import must stay silent
calls = [];
r = await post({ type: 'INSERT', table: 'listings', record: { name: 'Bulk', status: 'live' } });
show('\n6 · live (bulk-imported) listing ignored', r, await r.json());
console.log('   emails sent:', calls.length);
check('bulk-imported row sends nothing', calls.length === 0);

// 7 · wrong secret
r = await post(signup(), 'wrong');
show('\n7 · wrong secret', r, await r.json());
check('wrong secret is rejected', r.status === 401);

if (failures.length) {
  console.error("\nFAILED:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log("\nall cases passed");
