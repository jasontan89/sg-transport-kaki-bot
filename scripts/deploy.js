// Supabase Edge Functions Deployment Script
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const envPath = path.join(__dirname, '..', '.env');

// Read local .env
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        envVars[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
}

let index = fs.readFileSync(path.join(srcDir, 'index.ts'), 'utf8');
const erp = fs.readFileSync(path.join(srcDir, 'erp_data.ts'), 'utf8');
let lta = fs.readFileSync(path.join(srcDir, 'lta_api.ts'), 'utf8');
let db = fs.readFileSync(path.join(srcDir, 'db.ts'), 'utf8');
const map = fs.readFileSync(path.join(srcDir, 'map_template.ts'), 'utf8');

if (envVars.LTA_ACCOUNT_KEY) {
  lta = lta.replace(
    'const ACCOUNT_KEY = Deno.env.get("LTA_ACCOUNT_KEY") ?? "";',
    `const ACCOUNT_KEY = Deno.env.get("LTA_ACCOUNT_KEY") || "${envVars.LTA_ACCOUNT_KEY}";`
  );
}

if (envVars.SUPABASE_ANON_KEY) {
  db = db.replace(
    'const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";',
    `const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "${envVars.SUPABASE_ANON_KEY}";`
  );
}

const botToken = envVars.LTA_BOT_TOKEN || envVars.TELEGRAM_BOT_TOKEN || "";
if (botToken) {
  index = index.replace(
    'const token = Deno.env.get("LTA_BOT_TOKEN") ?? "";',
    `const token = Deno.env.get("LTA_BOT_TOKEN") || "${botToken}";`
  );
}

const deployPayload = {
  project_id: "blcsjvifiytbznwesmyx",
  name: "lta_bot",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [
    { name: "index.ts", content: index },
    { name: "erp_data.ts", content: erp },
    { name: "lta_api.ts", content: lta },
    { name: "db.ts", content: db },
    { name: "map_template.ts", content: map }
  ]
};

const tokenPath = path.join(process.env.USERPROFILE || 'C:\\Users\\tanse', '.gemini', 'antigravity', 'mcp_oauth_tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
const token = tokens['https://mcp.supabase.com/mcp'].token.access_token;

async function deploy() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': 'Bearer ' + token
  };

  const initRes = await fetch('https://mcp.supabase.com/mcp', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "antigravity", version: "1.0.0" }
      }
    })
  });

  const sessionId = initRes.headers.get('mcp-session-id');
  const authHeaders = {
    ...headers,
    ...(sessionId ? { 'mcp-session-id': sessionId } : {})
  };

  await fetch('https://mcp.supabase.com/mcp', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    })
  });

  console.log('Deploying SG Transport Kaki Bot to Supabase Edge Functions...');
  const deployRes = await fetch('https://mcp.supabase.com/mcp', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "deploy_edge_function",
        arguments: deployPayload
      }
    })
  });

  console.log('Deploy HTTP Status:', deployRes.status);
  const text = await deployRes.text();
  console.log('Deploy Result:', text);
}

deploy().catch(console.error);
