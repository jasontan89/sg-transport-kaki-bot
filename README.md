# 🇸🇬 SG Transport Kaki Bot

> **The ultimate all-in-one companion for Singapore commuters and drivers.**  
> Real-time bus arrivals, direct & transfer journey planning, platform crowd levels, breakdown push alerts, live ERP gantries, expressway traffic cameras, EV charging hubs, taxi stands, and alighting wake-up alarms.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20WebApps-success?logo=github)](https://jasontan89.github.io/sg-transport-kaki-bot/super-map.html)
[![Supabase Edge Functions](https://img.shields.io/badge/Hosted%20on-Supabase%20Edge%20Functions-3ECF8E?logo=supabase)](https://supabase.com)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-2CA5E0?logo=telegram)](https://t.me/LTA_Mall_Bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🗺️ Interactive WebApps (Telegram Mini Apps)

The bot features 4 high-speed, zero-watermark interactive map dashboards built with Leaflet and styled with dark slate OpenStreetMap tiles:

| Mini App | Description | Live URL |
| :--- | :--- | :--- |
| 🗺️ **Transit Super-Map** | All-in-one multi-layer radar (ERP, Cams, Incidents, Taxis, EV) with GPS locate | [Open Super-Map](https://jasontan89.github.io/sg-transport-kaki-bot/super-map.html) |
| 💳 **ERP Gantries Map** | Interactive gantries map with live SGT rates, slots & vehicle multipliers | [Open ERP Map](https://jasontan89.github.io/sg-transport-kaki-bot/erp-map.html) |
| 🚕 **Live Taxi Radar** | Real-time vacant taxis & 316 official barrier-free taxi stands | [Open Taxi Radar](https://jasontan89.github.io/sg-transport-kaki-bot/taxi-map.html) |
| 🚨 **Traffic Incidents Map** | Real-time accidents, roadworks, and breakdowns across expressways | [Open Incidents Map](https://jasontan89.github.io/sg-transport-kaki-bot/incidents-map.html) |

---

## ✨ 13 Core Features

### 1. 🚌 Live Bus Arrivals & Crowd Levels (`/bus`)
* Real-time countdowns for up to 3 upcoming buses.
* Crowd load indicators: 🟢 *Seats Available*, 🟡 *Standing Available*, 🔴 *Limited Standing*.
* Wheelchair-accessible bus icons (🧑‍🦽) and single/double-decker fleet identifiers.

### 2. 🚍 Bus Route Explorer (`/route`)
* Full sequential list of bus stops, cumulative distances, and operating timetables.

### 3. 🗺️ Smart Journey Planner (`/goto`)
* Find direct bus routes and 1-transfer journeys between any two bus stops or landmarks in Singapore.

### 4. 🚆 MRT Platform Crowds & Health (`/mrt`, `/disruptions`)
* Real-time crowd density indicators for all 6 train lines (**NSL**, **EWL**, **CCL**, **DTL**, **NEL**, **TEL**).
* Active train disruption alerts, free shuttle bus bridging, and alternative route advice.

### 5. 🔔 Automated Train Disruption Push Alerts (`/mrtalerts`)
* Subscribe to instant push notifications when a breakdown occurs on your daily train lines, powered by automated background cron checks.

### 6. 💳 Live ERP Gantry Pricing & Timetables (`/erp`)
* All 30 major expressway & arterial gantries (CTE, PIE, AYE, KPE, ECP/MCE, CBD, Orchard).
* Real-time rate engine evaluated in Singapore Time (SGT UTC+8) with next-slot change warnings.
* Vehicle multiplier switcher: 🚗 **Cars (1.0x)**, 🏍️ **Motorcycles (0.5x)**, 🚛 **Heavy Goods Vehicles (1.5x)**.

### 7. 🇸🇬🇲🇾 Causeway & Tuas Checkpoint Radar (`/checkpoint`, `/causeway`)
* Dual-hub radar for Woodlands Causeway (Cams 2701, 2702, 2704) and Tuas Second Link (Cams 4712, 4713, 4703).
* High-res multi-camera snapshot albums and expressway approach incident warnings (BKE, SLE, AYE).

### 8. 🔔 Bus Alighting Alarm & Live GPS Trip Tracker (`/alight`)
* Never miss your bus stop again when resting or on your phone.
* Share your Telegram Live Location; the bot monitors your distance and sounds an urgent wake-up buzzer when you are ~500m (or 300m / 800m) away.

### 9. 🗺️ All-in-One Transit "Super-Map" (`/supermap`, `/map`)
* Consolidates ERP gantries, cameras, incidents, taxis, and EV hubs into a single unified Leaflet map.

### 10. ⚡ EV Fast Charging Station Locator (`/ev`)
* 23 major high-speed charging hubs across Singapore with live plug availability, connector types (DC Fast / AC), charging speeds (kW), and pricing.

### 11. 🚗 Carpark Lot Availability (`/carpark`)
* Live lot counts for popular shopping malls, CBD office towers, and HDB carparks with Google Maps navigation links.

### 12. 🚕 Vacant Taxis & Taxi Stands (`/taxi`)
* Live count of vacant taxis within 1km + official LTA barrier-free taxi stands with queue capacities.

### 13. 📍 5-in-1 Instant GPS Location Scan
* Send any 📎 **Location attachment** in Telegram for an instant consolidated radar report of nearby bus stops, carparks, EV chargers, taxi stands, and sheltered bicycle racks.

---

## ⌨️ Slash Commands Reference

| Command | Description |
| :--- | :--- |
| `/supermap` or `/map` | 🗺️ Launch the interactive All-in-One Transit Super-Map |
| `/bus <code/name>` | 🚌 Live bus arrival timings, loads & wheelchair status |
| `/route <service>` | 🚍 Bus route sequence, stop distances & operating hours |
| `/goto <A> to <B>` | 🗺️ Plan direct and 1-transfer bus journeys |
| `/alight <code>` | 🔔 Set bus alighting alarm with Telegram Live Location tracking |
| `/cancelalight` | ⏹️ Stop and cancel active alighting alarm |
| `/mrt <line>` | 🚆 Platform crowd density for all 6 MRT lines |
| `/disruptions` | ⚠️ Train breakdown status & bridging shuttle advice |
| `/mrtalerts` | 🔔 Manage MRT disruption push notification subscriptions |
| `/checkpoint` | 🇸🇬🇲🇾 Woodlands Causeway & Tuas Second Link camera radar |
| `/erp <corridor>` | 💳 Live ERP gantry rates, upcoming slot changes & vehicle multipliers |
| `/ev <postal/name>` | ⚡ Live EV chargers, plug speeds & availability |
| `/carpark <name>` | 🚗 Real-time carpark lot availability & driving directions |
| `/traffic` | 📷 Checkpoint and expressway traffic cameras |
| `/incidents` | 🚨 Real-time accidents, heavy traffic & roadworks |
| `/taxi <area>` | 🚕 Vacant taxis count & official taxi stands |
| `/bike <station>` | 🚲 MRT sheltered bicycle parking lots |
| `/favorites` | ⭐ View your saved bus stops and cameras |
| `/menu` | 📋 Main interactive navigation menu |
| `/help` | ℹ️ Quick user guide and pro-tips |

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   Telegram Client                      │
│      (Chat Commands, Live Location & WebApp Mini Apps)  │
└───────────────────────────▲────────────────────────────┘
                            │ Webhook / HTTPS
┌───────────────────────────▼────────────────────────────┐
│         Supabase Edge Function (Deno + grammY)         │
│  • Webhook Dispatcher      • Live SGT Evaluator        │
│  • Alighting Tracker       • Super-Map REST API        │
└─────────────▲──────────────────────────▲───────────────┘
              │                          │
┌─────────────▼─────────────┐ ┌──────────▼───────────────┐
│     Supabase Database     │ │       LTA DataMall       │
│  • PostgreSQL + PostGIS   │ │  • Bus Arrivals & Routes │
│  • Alighting Alarms Table │ │  • Traffic Cameras       │
│  • MRT Alert Subscriptions│ │  • Traffic Incidents     │
│  • 5,208 Bus Stops        │ │  • Taxi Availability     │
│  • 316 Taxi Stands        │ │  • EV Charging Points    │
└───────────────────────────┘ └──────────────────────────┘
```

* **Bot Framework**: [grammY](https://grammy.dev/) running serverless on Deno.
* **Serverless Backend**: [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
* **Database**: [Supabase PostgreSQL](https://supabase.com/docs/guides/database) with PostGIS spatial extensions and Row Level Security (RLS).
* **Transit APIs**: [LTA DataMall v2](https://datamall.lta.gov.sg/content/datamall/en.html).
* **Interactive Maps**: [Leaflet.js](https://leafletjs.com/) with OpenStreetMap tiles, zero watermarks, and full Telegram WebApp SDK support.
* **Static Hosting**: [GitHub Pages](https://pages.github.com/) for instant CDN delivery of WebApp HTML pages.

---

## 📁 Repository Structure

```
sg-transport-kaki-bot/
├── src/
│   ├── index.ts              # Main bot entry point, command handlers & WebApp API routes
│   ├── db.ts                 # Database access layer (favorites, stops, alarms, MRT alerts)
│   ├── erp_data.ts           # 30 ERP gantries registry & SGT rate calculation engine
│   ├── lta_api.ts            # LTA DataMall v2 REST client
│   └── map_template.ts       # HTML generator for dynamic map views
├── public/                   # Static Telegram WebApp Mini Apps (GitHub Pages)
│   ├── super-map.html        # All-in-One Transit Super-Map
│   ├── erp-map.html          # Interactive ERP Gantry Map
│   ├── taxi-map.html         # Live Taxi Radar Map
│   └── incidents-map.html    # Live Traffic Incidents Radar
├── database/
│   └── schema.sql            # PostgreSQL schema, PostGIS functions, tables & RLS policies
├── scripts/
│   ├── deploy.js             # 1-command deployment to Supabase Edge Functions
│   ├── setup_commands.js     # Slash command registration via Telegram API
│   └── test_e2e.js           # Automated end-to-end test suite
├── .env.example              # Template for required environment variables
├── package.json              # Project scripts and configuration
└── README.md                 # Complete documentation
```

---

## 🚀 Setup & Deployment

### 1. Prerequisites
* Node.js 18+ or Deno
* Supabase Account & Project
* Telegram Bot Token from [@BotFather](https://t.me/BotFather)
* LTA DataMall API Key from [datamall.lta.gov.sg](https://datamall.lta.gov.sg/)

### 2. Database Setup
Run the SQL script located in `database/schema.sql` in your Supabase SQL Editor to create the tables, indexes, and PostGIS distance function:
```sql
-- Run database/schema.sql in Supabase Dashboard -> SQL Editor
```

### 3. Deploy Bot to Supabase Edge Functions
```bash
npm run deploy
```

### 4. Register Telegram Slash Commands
```bash
npm run setup-commands
```

### 5. Run Verification Tests
```bash
npm test
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
