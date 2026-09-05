const LTA_API_URL = "https://datamall2.mytransport.sg/ltaodataservice";
const ACCOUNT_KEY = Deno.env.get("LTA_ACCOUNT_KEY") ?? ""; 

export async function fetchBusArrival(busStopCode: string) {
  const url = `${LTA_API_URL}/v3/BusArrival?BusStopCode=${busStopCode}`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch bus arrival data");
  return response.json();
}

export async function fetchTrafficImages() {
  const url = `${LTA_API_URL}/Traffic-Imagesv2`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch traffic images");
  return response.json();
}

export async function fetchCarparkAvailability() {
  const url = `${LTA_API_URL}/CarParkAvailabilityv2`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch carpark data");
  return response.json();
}

export async function fetchERPRates() {
  const url = `${LTA_API_URL}/ERPRates`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch ERP rates");
  return response.json();
}

export async function fetchTrafficIncidents() {
  const url = `${LTA_API_URL}/TrafficIncidents`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch traffic incidents");
  return response.json();
}

export async function fetchMRTCrowd(line: string = "NSL") {
  const url = `${LTA_API_URL}/PCDRealTime?TrainLine=${line}`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch MRT crowd data");
  return response.json();
}

export async function fetchTrainAlerts() {
  const url = `${LTA_API_URL}/TrainServiceAlerts`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch train service alerts");
  return response.json();
}

export async function fetchTaxiAvailability(maxBatches: number = 3) {
  let allTaxis: Array<{ Latitude: number; Longitude: number }> = [];
  let skip = 0;
  for (let i = 0; i < maxBatches; i++) {
    const url = `${LTA_API_URL}/Taxi-Availability${skip > 0 ? `?$skip=${skip}` : ''}`;
    const response = await fetch(url, {
      headers: { AccountKey: ACCOUNT_KEY }
    });
    if (!response.ok) break;
    const data = await response.json();
    const batch = data.value || [];
    allTaxis = allTaxis.concat(batch);
    if (batch.length < 500) break;
    skip += 500;
  }
  return { value: allTaxis };
}

export async function fetchTaxiStands() {
  const url = `${LTA_API_URL}/TaxiStands`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch taxi stands");
  return response.json();
}

export async function fetchBicycleParking(lat: number, lon: number, dist: number = 0.5) {
  const url = `${LTA_API_URL}/BicycleParkingv2?Lat=${lat}&Long=${lon}&Dist=${dist}`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch bicycle parking data");
  return response.json();
}

export async function fetchEVChargingPoints(postalCode: string) {
  const cleanCode = (postalCode || "").trim().replace(/\D/g, "");
  const url = `${LTA_API_URL}/EVChargingPoints?PostalCode=${cleanCode}`;
  const response = await fetch(url, {
    headers: { AccountKey: ACCOUNT_KEY }
  });
  if (!response.ok) throw new Error("Failed to fetch EV charging data");
  return response.json();
}

let cachedMRTStations: any[] | null = null;
let lastMRTFetchTime = 0;

export async function fetchMRTStationInfo(query?: string) {
  const now = Date.now();
  if (!cachedMRTStations || now - lastMRTFetchTime > 3600000) {
    try {
      const res = await fetch("https://connect.smrt.wwprojects.com/smrt/api/station_info", {
        headers: {
          "Referer": "http://journey.smrt.com.sg/journey/station_info/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      if (res.ok) {
        const data = await res.json();
        cachedMRTStations = data.results || [];
        lastMRTFetchTime = now;
      }
    } catch (err) {
      console.error("Error fetching SMRT station info:", err);
    }
  }

  const allStations = cachedMRTStations || [];
  if (!query || !query.trim()) return allStations;

  const q = query.toLowerCase().trim();
  return allStations.filter((s: any) =>
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.code && s.code.toLowerCase().includes(q)) ||
    (s.listing && s.listing.toLowerCase().includes(q))
  );
}

