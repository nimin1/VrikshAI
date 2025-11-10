/**
 * VrikshAI Type Definitions
 *
 * These types mirror the backend Pydantic models.
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// ============================================================================
// Darshan Types (Plant Identification)
// ============================================================================

export interface PlantDescription {
  appearance: string;
  leaves: string;
  flowers_fruits: string | null;
  origin: string;
  lifespan: string;
}

export interface CareGuide {
  light: string;
  water: string;
  soil: string;
  temperature: string;
  humidity: string;
  fertilizer: string;
  pruning: string;
  pests_diseases: string;
  difficulty: string;
}

export interface VastuGuidance {
  direction: string;
  location: string;
  benefits: string[];
  suitable_rooms: string[];
  considerations: string;
}

export interface TraditionalSignificance {
  ayurvedic_uses: string | null;
  medicinal_properties: string | null;
  cultural_importance: string | null;
  festivals_rituals: string | null;
}

export interface PlantWarnings {
  toxicity_humans: string | null;
  toxicity_pets: string | null;
  skin_irritation: string | null;
  handling_precautions: string | null;
}

export interface DarshanResult {
  common_name: string;
  scientific_name: string;
  sanskrit_name: string | null;
  family: string;
  plant_type: string;
  confidence: number;
  health_status: 'thriving' | 'healthy' | 'needs_attention' | 'struggling' | 'critical';
  health_notes: string;
  description: PlantDescription;
  care_guide: CareGuide;
  vastu: VastuGuidance;
  traditional_significance: TraditionalSignificance;
  interesting_facts: string[];
  warnings: PlantWarnings;
}

// Legacy interface for backwards compatibility
export interface CareSummary {
  water_frequency: string;
  sunlight: string;
  soil_type: string;
  difficulty: string;
}

export interface DarshanRequest {
  image: string; // Base64 encoded image
}

export interface DarshanResponse {
  result: DarshanResult;
  timestamp: string;
}

// ============================================================================
// Chikitsa Types (Health Diagnosis)
// ============================================================================

export interface Treatment {
  immediate_action: string;
  products: string[];
  natural_remedies: string[];
  when_to_seek_help: string;
}

export interface ChikitsaResult {
  diagnosis: string;
  severity: 'healthy' | 'warning' | 'critical';
  confidence: number;
  causes: string[];
  treatment: Treatment;
  prevention: string[];
  recovery_time: string;
  warning_signs: string[];
  ayurvedic_wisdom?: string;
}

export interface ChikitsaRequest {
  plant_name: string;
  symptoms: string;
  image?: string; // Optional image
}

export interface ChikitsaResponse {
  result: ChikitsaResult;
  timestamp: string;
}

// ============================================================================
// Seva Types (Care Schedules)
// ============================================================================

export interface SevaTask {
  task: string;
  frequency: string;
  best_time: string;
  notes: string;
}

export interface SeasonalTips {
  spring: string[];
  summer: string[];
  monsoon: string[];
  autumn: string[];
  winter: string[];
}

export interface SevaResult {
  plant_name: string;
  schedule: SevaTask[];
  seasonal_tips: SeasonalTips;
  general_wisdom: string;
  watch_for: string[];
}

export interface SevaRequest {
  plant_name: string;
  location: string;
  season: string;
  indoor: boolean;
}

export interface SevaResponse {
  result: SevaResult;
  timestamp: string;
}

// ============================================================================
// Vana Types (Plant Collection)
// ============================================================================

export interface Plant {
  id: string;
  user_id: string;
  common_name: string;
  scientific_name: string;
  sanskrit_name?: string;
  nickname?: string;
  acquired_date: string;
  location: string;
  image_url?: string;
  health_status: 'healthy' | 'warning' | 'critical';
  last_watered?: string;
  last_fertilized?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddPlantRequest {
  common_name: string;
  scientific_name: string;
  sanskrit_name?: string;
  nickname?: string;
  acquired_date: string;
  location: string;
  image_url?: string;
  health_status?: 'healthy' | 'warning' | 'critical';
  notes?: string;
}

export interface UpdatePlantRequest {
  nickname?: string;
  location?: string;
  health_status?: 'healthy' | 'warning' | 'critical';
  last_watered?: string;
  last_fertilized?: string;
  notes?: string;
}

export interface VanaResponse {
  plants: Plant[];
  count: number;
}

export interface PlantResponse {
  plant: Plant;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string;
  detail?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
