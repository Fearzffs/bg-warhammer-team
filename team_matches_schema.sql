-- Create team_matches table
CREATE TABLE IF NOT EXISTS team_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opponent_team TEXT NOT NULL,
  date DATE NOT NULL,
  draw_diff INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on team_matches
ALTER TABLE team_matches ENABLE ROW LEVEL SECURITY;

-- Policies for team_matches
CREATE POLICY "Public read team_matches" ON team_matches FOR SELECT USING (true);
CREATE POLICY "Admin team_matches" ON team_matches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add team_match_id to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_match_id UUID REFERENCES team_matches(id) ON DELETE SET NULL;

-- Add prediction to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS prediction TEXT CHECK (prediction IN ('big_loss', 'small_loss', 'draw', 'small_win', 'big_win'));

-- Add role to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS role TEXT;

-- Remove normal_points columns if they exist
ALTER TABLE matches DROP COLUMN IF EXISTS normal_points_for;
ALTER TABLE matches DROP COLUMN IF EXISTS normal_points_against;
