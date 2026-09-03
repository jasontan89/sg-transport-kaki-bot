// Register slash commands with Telegram API
async function setupCommands() {
  console.log('Triggering /api/setup-commands endpoint...');
  const res = await fetch('https://blcsjvifiytbznwesmyx.supabase.co/functions/v1/lta_bot/api/setup-commands');
  const data = await res.json();
  console.log('Setup Commands Response:', data);
}

setupCommands().catch(console.error);
