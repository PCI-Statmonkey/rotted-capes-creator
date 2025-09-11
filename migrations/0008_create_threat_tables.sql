-- Migration: Create comprehensive threat system tables
-- Date: 2025-09-11
-- Description: Creates threats, threat_actions, threat_features, and threat_skills tables
--              to support the new comprehensive threat builder system

-- Main threats table
CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Threat Parameters
    rank TEXT NOT NULL CHECK (rank IN (
        'Bystander', 'Hardened', 'Zeta', 'Epsilon', 'Delta', 
        'Gamma', 'Beta', 'Alpha', 'Theta', 'Sigma', 'Upsilon', 'Omega'
    )),
    role TEXT NOT NULL CHECK (role IN (
        'Skillful', 'Striker', 'Bruiser', 'Ranged', 
        'Controller', 'Lurker', 'Horde Leader'
    )),
    size TEXT NOT NULL CHECK (size IN (
        'Tiny/Smaller', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'
    )),
    type TEXT NOT NULL CHECK (type IN (
        'Animal', 'Survivor', 'Abomination', 'Powered Individual', 
        'Robot/Tech', 'Zombie', 'Super Z'
    )),
    advanced BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Advanced parameters
    defense_rank TEXT CHECK (defense_rank IN (
        'Bystander', 'Hardened', 'Zeta', 'Epsilon', 'Delta', 
        'Gamma', 'Beta', 'Alpha', 'Theta', 'Sigma', 'Upsilon', 'Omega'
    )),
    durability_rank TEXT CHECK (durability_rank IN (
        'Bystander', 'Hardened', 'Zeta', 'Epsilon', 'Delta', 
        'Gamma', 'Beta', 'Alpha', 'Theta', 'Sigma', 'Upsilon', 'Omega'
    )),
    attack_rank TEXT CHECK (attack_rank IN (
        'Bystander', 'Hardened', 'Zeta', 'Epsilon', 'Delta', 
        'Gamma', 'Beta', 'Alpha', 'Theta', 'Sigma', 'Upsilon', 'Omega'
    )),
    effective_rank INTEGER,
    
    -- Ability Scores
    strength INTEGER NOT NULL DEFAULT 10,
    dexterity INTEGER NOT NULL DEFAULT 10,
    constitution INTEGER NOT NULL DEFAULT 10,
    intelligence INTEGER NOT NULL DEFAULT 10,
    wisdom INTEGER NOT NULL DEFAULT 10,
    charisma INTEGER NOT NULL DEFAULT 10,
    
    -- Defenses
    avoidance INTEGER NOT NULL,
    fortitude INTEGER NOT NULL,
    willpower INTEGER NOT NULL,
    
    -- Health and Initiative
    stamina INTEGER NOT NULL,
    wounds INTEGER NOT NULL,
    initiative INTEGER NOT NULL,
    pace TEXT NOT NULL,
    
    -- Notes and metadata
    gm_notes TEXT,
    public_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL
);

-- Threat actions table
CREATE TABLE threat_actions (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Attack', 'Non-Attack')),
    attack_family TEXT CHECK (attack_family IN (
        'Melee', 'Ranged', 'Mental', 'Elemental', 'Energy', 'Special'
    )),
    description TEXT NOT NULL,
    
    -- Attack-specific fields
    to_hit INTEGER,
    damage TEXT,
    defense TEXT CHECK (defense IN ('Avoidance', 'Fortitude', 'Willpower')),
    
    -- Action properties
    range TEXT,
    area TEXT,
    duration TEXT,
    frequency TEXT,
    effects TEXT,
    notes TEXT,
    
    -- Metadata
    auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Threat features table
CREATE TABLE threat_features (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'trait', 'immunity', 'resistance', 'vulnerability', 'special'
    )),
    source TEXT,
    auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Threat skills table
CREATE TABLE threat_skills (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bonus INTEGER NOT NULL,
    ability TEXT NOT NULL CHECK (ability IN (
        'strength', 'dexterity', 'constitution', 
        'intelligence', 'wisdom', 'charisma'
    )),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_threats_user_id ON threats(user_id);
CREATE INDEX idx_threats_rank ON threats(rank);
CREATE INDEX idx_threats_type ON threats(type);
CREATE INDEX idx_threat_actions_threat_id ON threat_actions(threat_id);
CREATE INDEX idx_threat_actions_type ON threat_actions(type);
CREATE INDEX idx_threat_features_threat_id ON threat_features(threat_id);
CREATE INDEX idx_threat_features_type ON threat_features(type);
CREATE INDEX idx_threat_skills_threat_id ON threat_skills(threat_id);

-- Add updated_at trigger for threats table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_threats_updated_at 
    BEFORE UPDATE ON threats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE threats IS 'Main threats table for the comprehensive threat builder system';
COMMENT ON TABLE threat_actions IS 'Actions that threats can perform (attack and non-attack)';
COMMENT ON TABLE threat_features IS 'Features, traits, immunities, and special abilities of threats';
COMMENT ON TABLE threat_skills IS 'Skills and bonuses for threats';

COMMENT ON COLUMN threats.advanced IS 'Whether threat uses advanced parameter system';
COMMENT ON COLUMN threats.effective_rank IS 'Calculated effective rank for advanced threats';
COMMENT ON COLUMN threat_actions.auto_generated IS 'Whether action was auto-generated by the system';
COMMENT ON COLUMN threat_features.auto_generated IS 'Whether feature was auto-generated by the system';