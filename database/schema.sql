-- ============================================================
-- SG Transport Kaki Bot — Complete Supabase PostgreSQL Schema
-- ============================================================

-- Enable PostGIS for geospatial distance queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Bus Stops Table
CREATE TABLE IF NOT EXISTS public.lta_bus_stops (
  bus_stop_code VARCHAR(10) PRIMARY KEY,
  road_name TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bus_stops_coords ON public.lta_bus_stops (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bus_stops_desc ON public.lta_bus_stops USING gin(to_tsvector('english', description));

-- 2. Bus Stop Proximity Function (Haversine Formula in SQL)
CREATE OR REPLACE FUNCTION public.get_nearby_stops(user_lat DOUBLE PRECISION, user_lon DOUBLE PRECISION, limit_count INT DEFAULT 5)
RETURNS TABLE (
  bus_stop_code VARCHAR,
  road_name TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  dist_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.bus_stop_code,
    b.road_name,
    b.description,
    b.latitude,
    b.longitude,
    (6371000 * acos(
      cos(radians(user_lat)) * cos(radians(b.latitude)) * cos(radians(b.longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(b.latitude))
    )) AS dist_meters
  FROM public.lta_bus_stops b
  ORDER BY dist_meters ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Taxi Stands Table
CREATE TABLE IF NOT EXISTS public.lta_taxi_stands (
  taxi_code VARCHAR(20) PRIMARY KEY,
  name TEXT NOT NULL,
  road_name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity INT DEFAULT 2,
  barrier_free BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'bus_stop', 'camera', 'ev_hub'
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_fav UNIQUE (user_id, type, value)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites (user_id);

-- 5. MRT Disruption Push Alert Subscriptions
CREATE TABLE IF NOT EXISTS public.mrt_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  line_code VARCHAR(10) NOT NULL, -- 'NSL', 'EWL', 'CCL', 'DTL', 'NEL', 'TEL'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_sub UNIQUE (user_id, line_code)
);

CREATE TABLE IF NOT EXISTS public.mrt_alert_state (
  id INT PRIMARY KEY DEFAULT 1,
  last_status INT NOT NULL DEFAULT 1,
  last_affected JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bus Alighting Wake-up Alarms Table
CREATE TABLE IF NOT EXISTS public.alighting_alarms (
  user_id BIGINT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  dest_bus_stop_code VARCHAR(10) NOT NULL,
  dest_name TEXT NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lon DOUBLE PRECISION NOT NULL,
  threshold_meters INT NOT NULL DEFAULT 500,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'triggered', 'cancelled'
  last_lat DOUBLE PRECISION,
  last_lon DOUBLE PRECISION,
  last_distance DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alighting_alarms_user ON public.alighting_alarms (user_id, status);

-- Row Level Security (RLS)
ALTER TABLE public.lta_bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lta_taxi_stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrt_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrt_alert_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alighting_alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read bus stops" ON public.lta_bus_stops FOR SELECT USING (true);
CREATE POLICY "Allow anon read taxi stands" ON public.lta_taxi_stands FOR SELECT USING (true);
CREATE POLICY "Allow anon all favorites" ON public.favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all mrt subscriptions" ON public.mrt_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all mrt alert state" ON public.mrt_alert_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all alighting alarms" ON public.alighting_alarms FOR ALL USING (true) WITH CHECK (true);
