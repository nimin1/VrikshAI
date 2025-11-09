-- VrikshAI Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plants table (Mera Vana - User's plant collection)
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255),
    scientific_name VARCHAR(255),
    sanskrit_name VARCHAR(255),
    family VARCHAR(255),
    image_url TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    last_watered TIMESTAMP WITH TIME ZONE,
    next_watering_due DATE,
    care_schedule JSONB,
    health_status VARCHAR(50) DEFAULT 'healthy',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identifications table (AI Darshan history)
CREATE TABLE IF NOT EXISTS identifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    result JSONB NOT NULL,
    confidence DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health checks table (AI Chikitsa history)
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    diagnosis VARCHAR(500) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    confidence DECIMAL(3, 2),
    symptoms TEXT[],
    treatment JSONB,
    prevention JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_health_status ON plants(health_status);
CREATE INDEX IF NOT EXISTS idx_plants_next_watering ON plants(next_watering_due);
CREATE INDEX IF NOT EXISTS idx_identifications_user_id ON identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identifications_created_at ON identifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_plant_id ON health_checks(plant_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON health_checks(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at on row changes
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Could not create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Plants policies
CREATE POLICY plants_select_own ON plants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY plants_insert_own ON plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY plants_update_own ON plants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY plants_delete_own ON plants
    FOR DELETE USING (auth.uid() = user_id);

-- Identifications policies
CREATE POLICY identifications_select_own ON identifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY identifications_insert_own ON identifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Health checks policies (through plants ownership)
CREATE POLICY health_checks_select_own ON health_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM plants
            WHERE plants.id = health_checks.plant_id
            AND plants.user_id = auth.uid()
        )
    );

CREATE POLICY health_checks_insert_own ON health_checks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM plants
            WHERE plants.id = health_checks.plant_id
            AND plants.user_id = auth.uid()
        )
    );
