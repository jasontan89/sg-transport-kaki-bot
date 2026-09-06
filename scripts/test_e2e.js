// End-to-End Automated Verification Test Suite
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let ACCOUNT_KEY = process.env.LTA_ACCOUNT_KEY || "";
if (!ACCOUNT_KEY && fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (k === 'LTA_ACCOUNT_KEY') ACCOUNT_KEY = v;
      }
    }
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("🚀 RUNNING SG TRANSPORT KAKI BOT TESTS");
  console.log("==========================================");

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

  // 1. Checkpoint Cameras
  const camRes = await fetch("https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2", {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  const camData = await camRes.json();
  const cams = camData.value || [];
  assert(cams.length >= 8, `Traffic Cameras API online with ${cams.length} feeds`);

  // 2. Traffic Incidents
  const incRes = await fetch("https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents", {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  const incData = await incRes.json();
  assert(Array.isArray(incData.value), "Traffic Incidents API online");

  // 3. Option 1: MRT Breakdown Alerts (LTA DataMall TrainServiceAlerts)
  const alertRes = await fetch("https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts", {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  const alertData = await alertRes.json();
  assert(alertData && alertData.value && (alertData.value.Status === 1 || alertData.value.Status === 2), `TrainServiceAlerts API online (Status: ${alertData?.value?.Status})`);

  // 4. Option 4: Live Carpark Lot Availability (LTA DataMall CarParkAvailabilityv2)
  const cpRes = await fetch("https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2", {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  const cpData = await cpRes.json();
  assert(Array.isArray(cpData.value) && cpData.value.length > 50, `CarParkAvailabilityv2 API online with ${cpData?.value?.length} carparks`);

  // 5. Option 3: Official SMRT Connect Transit Station Timetables API
  try {
    const smrtRes = await fetch("https://connect.smrt.wwprojects.com/smrt/api/station_info", {
      headers: {
        "Referer": "http://journey.smrt.com.sg/journey/station_info/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const smrtData = await smrtRes.json();
    assert(Array.isArray(smrtData.results) && smrtData.results.length >= 100, `SMRT Station Timetables API online with ${smrtData?.results?.length} stations`);
  } catch (err) {
    assert(false, `SMRT Station Timetables API error: ${err.message}`);
  }

  // 6. Super-Map Live Endpoint
  const superMapRes = await fetch("https://blcsjvifiytbznwesmyx.supabase.co/functions/v1/lta_bot/api/super-map-data");
  assert(superMapRes.ok, "Super-Map consolidated endpoint returns HTTP 200");
  const smData = await superMapRes.json();
  assert(smData.erp && smData.erp.length === 30, "Super-Map returns 30 ERP gantries");
  assert(smData.cameras && smData.cameras.length >= 8, "Super-Map returns 8 traffic cameras");
  assert(smData.ev_hubs && smData.ev_hubs.length === 23, "Super-Map returns 23 EV hubs");

  console.log("\n==========================================");
  console.log(`📊 RESULTS: ${passed}/${total} PASSED (${Math.round(passed/total*100)}%)`);
  console.log("==========================================");
}

runTests().catch(console.error);
