/*
  # Crane Data Tracking System

  1. New Tables
    - `crane_readings`
      - `id` (uuid, primary key)
      - `crane_id` (text) - Crane identifier (e.g., "RT 02")
      - `hoist_hours` (numeric) - Hoist operating hours
      - `trolley_hours` (numeric) - Trolley operating hours
      - `gantry_hours` (numeric) - Gantry operating hours
      - `timestamp` (timestamptz) - When the reading was taken
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on `crane_readings` table
    - Add policy for public read access (for viewing data)
    - Add policy for service role to insert data
*/

CREATE TABLE IF NOT EXISTS crane_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crane_id text NOT NULL,
  hoist_hours numeric NOT NULL DEFAULT 0,
  trolley_hours numeric NOT NULL DEFAULT 0,
  gantry_hours numeric NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crane_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to crane readings"
  ON crane_readings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated insert of crane readings"
  ON crane_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crane_readings_timestamp ON crane_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crane_readings_crane_id ON crane_readings(crane_id);