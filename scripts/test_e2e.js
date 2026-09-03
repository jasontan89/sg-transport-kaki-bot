// End-to-End Automated Verification Test Suite
const ACCOUNT_KEY = process.env.LTA_ACCOUNT_KEY || "";

async function runTests() {
  console.log("==========================================");
  console.log("???? RUNNING SG TRANSPORT KAKI BOT TESTS");
  console.log("==========================================");

  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      console.log(`? [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`? [FAIL] ${msg}`);
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

  // 3. Super-Map Live Endpoint
  const superMapRes = await fetch("https://blcsjvifiytbznwesmyx.supabase.co/functions/v1/lta_bot/api/super-map-data");
  assert(superMapRes.ok, "Super-Map consolidated endpoint returns HTTP 200");
  const smData = await superMapRes.json();
  assert(smData.erp && smData.erp.length === 30, "Super-Map returns 30 ERP gantries");
  assert(smData.cameras && smData.cameras.length >= 8, "Super-Map returns 8 traffic cameras");
  assert(smData.ev_hubs && smData.ev_hubs.length === 23, "Super-Map returns 23 EV hubs");

  console.log("\n==========================================");
  console.log(`?? RESULTS: ${passed}/${total} PASSED (${Math.round(passed/total*100)}%)`);
  console.log("==========================================");
}

runTests().catch(console.error);
