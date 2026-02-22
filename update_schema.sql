-- Add guest role
-- Note: This is handled in the app logic

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Admin teams" ON teams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add new columns to matches table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'opponent_team') THEN
    ALTER TABLE matches ADD COLUMN opponent_team TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'opponent_army_list') THEN
    ALTER TABLE matches ADD COLUMN opponent_army_list TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'deployment_type') THEN
    ALTER TABLE matches ADD COLUMN deployment_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'table_number') THEN
    ALTER TABLE matches ADD COLUMN table_number INTEGER CHECK (table_number >= 1 AND table_number <= 8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'normal_points') THEN
    ALTER TABLE matches ADD COLUMN normal_points INTEGER;
  END IF;
END $$;
