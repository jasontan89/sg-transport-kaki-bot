// E2E Verification Test for Telegram Background Alighting Alarm
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
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

const SUPABASE_URL = envVars.SUPABASE_URL || "https://blcsjvifiytbznwesmyx.supabase.co";
const SUPABASE_KEY = envVars.SUPABASE_ANON_KEY || "";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/lta_bot`;

const TEST_USER_ID = 88888001; // Isolated test user ID
const DEST_STOP_CODE = "28389"; // Boon Lay Int

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${msg}`);
  }
}

async function getDbAlarm() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alighting_alarms?user_id=eq.${TEST_USER_ID}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function run() {
  console.log("===============================================================");
  console.log("🚀 TESTING TELEGRAM NATIVE BACKGROUND ALIGHTING ALARM ENGINE");
  console.log("===============================================================\n");

  // Step 1: Arm an alighting alarm via /api/bus-alight (HTTP API channel)
  console.log("1️⃣ Arming alighting alarm for stop code " + DEST_STOP_CODE + " via /api/bus-alight...");
  const armRes = await fetch(`${FUNCTION_URL}/api/bus-alight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: TEST_USER_ID,
      chatId: TEST_USER_ID,
      destStopCode: DEST_STOP_CODE,
      thresholdMeters: 500
    })
  });
  const armData = await armRes.json();
  assert(armRes.ok && armData.ok === true, "Arm alarm API endpoint returned HTTP 200 with ok: true");

  // Verify in Supabase DB
  let alarm = await getDbAlarm();
  assert(alarm !== null, "Alarm record persisted in Supabase alighting_alarms table");
  assert(alarm && alarm.status === 'active', "Alarm status is active");
  assert(alarm && alarm.notified === false, "Alarm notified is false initially");
  assert(alarm && typeof alarm.dest_lat === 'number' && typeof alarm.dest_lon === 'number', `Resolved destination coordinates: (${alarm?.dest_lat}, ${alarm?.dest_lon})`);

  const destLat = alarm.dest_lat;
  const destLon = alarm.dest_lon;

  // Step 2: Simulate Telegram Background Live Location Update (Far away: ~1,100m)
  console.log("\n2️⃣ Simulating locked-phone background GPS update (Distance: ~1,100m > 500m)...");
  const farLat = destLat + 0.01;
  const farLon = destLon;

  const farUpdateRes = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 200001,
      edited_message: {
        message_id: 7777,
        from: { id: TEST_USER_ID, is_bot: false, first_name: "Tester" },
        chat: { id: TEST_USER_ID, type: "private" },
        date: Math.floor(Date.now() / 1000) - 30,
        edit_date: Math.floor(Date.now() / 1000),
        location: {
          latitude: farLat,
          longitude: farLon
        }
      }
    })
  });
  assert(farUpdateRes.ok, "Live location edited_message processed by webhook successfully");

  alarm = await getDbAlarm();
  assert(alarm && alarm.status === 'active', "Alarm status remains active while distant");
  assert(alarm && alarm.notified === false, "Alarm NOT triggered yet (distant)");
  assert(alarm && alarm.last_distance > 800, `Background telemetry recorded distance: ${Math.round(alarm?.last_distance)}m`);

  // Step 3: Simulate Approaching Stop (Within threshold: ~220m < 500m)
  console.log("\n3️⃣ Simulating arrival at stop (Distance: ~220m <= 500m)...");
  const closeLat = destLat + 0.002;
  const closeLon = destLon;

  const closeUpdateRes = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 200002,
      edited_message: {
        message_id: 7777,
        from: { id: TEST_USER_ID, is_bot: false, first_name: "Tester" },
        chat: { id: TEST_USER_ID, type: "private" },
        date: Math.floor(Date.now() / 1000) - 60,
        edit_date: Math.floor(Date.now() / 1000),
        location: {
          latitude: closeLat,
          longitude: closeLon
        }
      }
    })
  });
  assert(closeUpdateRes.ok, "Threshold arrival edited_message processed by webhook successfully");

  alarm = await getDbAlarm();
  assert(alarm && alarm.status === 'triggered', `Alarm status transitioned to: '${alarm?.status}'`);
  assert(alarm && alarm.notified === true, "Alarm marked as notified: true");
  assert(alarm && alarm.last_distance <= 500, `Triggered distance: ${Math.round(alarm?.last_distance)}m <= 500m threshold`);

  // Step 4: Dismiss / Cancel Alarm
  console.log("\n4️⃣ Simulating user dismissing alarm...");
  const dismissRes = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 200003,
      callback_query: {
        id: "cb_dismiss_1",
        from: { id: TEST_USER_ID, is_bot: false, first_name: "Tester" },
        message: {
          message_id: 7778,
          chat: { id: TEST_USER_ID, type: "private" },
          date: Math.floor(Date.now() / 1000)
        },
        data: "alight_dismiss"
      }
    })
  });
  assert(dismissRes.ok, "Dismiss callback query handled successfully");

  alarm = await getDbAlarm();
  assert(alarm && alarm.status === 'cancelled', `Alarm status transitioned to cancelled: '${alarm?.status}'`);

  // Step 5: Test native WebApp sendData message channel (message.web_app_data)
  console.log("\n5️⃣ Testing WebApp native sendData channel (message.web_app_data)...");
  const webAppDataRes = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 200004,
      message: {
        message_id: 7779,
        from: { id: TEST_USER_ID, is_bot: false, first_name: "Tester" },
        chat: { id: TEST_USER_ID, type: "private" },
        date: Math.floor(Date.now() / 1000),
        web_app_data: {
          data: JSON.stringify({
            action: "alight_alarm",
            stopCode: DEST_STOP_CODE,
            thresholdMeters: 500
          }),
          button_text: "🚌 SG Transport Kaki"
        }
      }
    })
  });
  assert(webAppDataRes.ok, "WebApp sendData webhook update processed successfully");

  alarm = await getDbAlarm();
  assert(alarm && alarm.status === 'active', "Alarm armed via WebApp native sendData is active in Supabase");
  assert(alarm && alarm.dest_bus_stop_code === DEST_STOP_CODE, "Destination bus stop code matches DEST_STOP_CODE");

  // Clean up
  await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 200005,
      callback_query: {
        id: "cb_dismiss_2",
        from: { id: TEST_USER_ID, is_bot: false, first_name: "Tester" },
        message: { message_id: 7780, chat: { id: TEST_USER_ID, type: "private" }, date: Math.floor(Date.now() / 1000) },
        data: "alight_dismiss"
      }
    })
  });

  console.log("\n===============================================================");
  console.log(`📊 FINAL RESULT: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("===============================================================");

  if (passed === total) {
    console.log("🎉 ALL TESTS PASSED! Both API and native sendData channels verified.");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed.");
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Unhandled test failure:", err);
  process.exit(1);
});
