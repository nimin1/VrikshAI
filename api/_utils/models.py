"""
Pydantic models for VrikshAI structured AI responses.

These models define the exact structure of AI outputs using Pydantic AI,
ensuring type safety and validation for all GPT-5 responses.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class CareSummary(BaseModel):
    """Quick care summary for a plant."""

    water_frequency: str = Field(
        description="Watering frequency (e.g., 'Every 7-10 days' or 'Twice weekly')"
    )
    sunlight: str = Field(
        description="Light requirements (e.g., 'Bright indirect light' or 'Full sun, 6-8 hours')"
    )
    soil_type: str = Field(
        description="Soil type needed (e.g., 'Well-draining potting mix' or 'Sandy loam')"
    )
    difficulty: str = Field(
        description="Care difficulty level (e.g., 'Easy', 'Moderate', 'Advanced')"
    )


class DarshanResult(BaseModel):
    """
    AI Darshan (Plant Identification) result.

    Combines modern botanical classification with traditional Sanskrit names
    and Ayurvedic wisdom when available.
    """

    common_name: str = Field(
        description="Common name of the plant (e.g., 'Monstera Deliciosa')"
    )
    scientific_name: str = Field(
        description="Scientific binomial name (e.g., 'Monstera deliciosa')"
    )
    sanskrit_name: Optional[str] = Field(
        default=None,
        description="Sanskrit name if plant has traditional significance"
    )
    family: str = Field(
        description="Plant family (e.g., 'Araceae')"
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1"
    )
    care_summary: CareSummary = Field(
        description="Quick care requirements summary"
    )
    traditional_use: Optional[str] = Field(
        default=None,
        description="Traditional Ayurvedic or medicinal uses if applicable"
    )
    fun_fact: str = Field(
        description="Interesting fact about the plant"
    )


class Treatment(BaseModel):
    """Treatment recommendations for plant health issues."""

    immediate: List[str] = Field(
        description="Immediate actions to take right now"
    )
    ongoing: List[str] = Field(
        description="Ongoing care adjustments for recovery"
    )
    products: List[str] = Field(
        description="Recommended products or organic remedies"
    )


class ChikitsaResult(BaseModel):
    """
    AI Chikitsa (Health Diagnosis) result.

    Provides comprehensive plant health diagnosis with actionable treatment
    plans and prevention strategies.
    """

    diagnosis: str = Field(
        description="Clear diagnosis of the plant's condition"
    )
    severity: str = Field(
        description="Severity level: 'healthy', 'warning', or 'critical'"
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1"
    )
    causes: List[str] = Field(
        description="Likely causes of the health issue"
    )
    treatment: Treatment = Field(
        description="Structured treatment plan"
    )
    prevention: List[str] = Field(
        description="Tips to prevent this issue in the future"
    )
    recovery_time: str = Field(
        description="Expected recovery timeline (e.g., '1-2 weeks with proper care')"
    )
    warning_signs: List[str] = Field(
        description="Warning signs that indicate worsening condition"
    )
    ayurvedic_wisdom: Optional[str] = Field(
        default=None,
        description="Traditional Ayurvedic perspective or remedy if applicable"
    )

    @field_validator('severity')
    @classmethod
    def validate_severity(cls, v: str) -> str:
        """Ensure severity is one of the allowed values."""
        allowed = {'healthy', 'warning', 'critical'}
        if v.lower() not in allowed:
            raise ValueError(f"Severity must be one of {allowed}")
        return v.lower()


class WateringInfo(BaseModel):
    """Detailed watering schedule information."""

    frequency_days: int = Field(
        ge=1,
        description="Days between watering sessions"
    )
    amount: str = Field(
        description="Amount of water per session (e.g., '200-300ml', '1 cup')"
    )
    method: str = Field(
        description="Watering method (e.g., 'Top watering', 'Bottom watering')"
    )
    seasonal_adjustment: str = Field(
        description="How to adjust watering across seasons"
    )
    signs_to_water: List[str] = Field(
        description="Physical signs that indicate the plant needs water"
    )


class LightInfo(BaseModel):
    """Light requirements information."""

    hours_per_day: str = Field(
        description="Hours of light needed (e.g., '6-8 hours', '4-6 hours')"
    )
    type: str = Field(
        description="Type of light (e.g., 'Bright indirect', 'Low to medium')"
    )
    placement: str = Field(
        description="Ideal placement guidance (e.g., 'East or north-facing window')"
    )
    seasonal_note: str = Field(
        description="Seasonal light adjustments needed"
    )


class FertilizingInfo(BaseModel):
    """Fertilizing schedule information."""

    frequency: str = Field(
        description="How often to fertilize (e.g., 'Every 2 weeks during growing season')"
    )
    type: str = Field(
        description="Type of fertilizer (e.g., 'Balanced liquid fertilizer 20-20-20')"
    )
    dilution: str = Field(
        description="Dilution instructions (e.g., 'Half strength', 'Follow package')"
    )
    seasonal_note: str = Field(
        description="Seasonal fertilizing adjustments"
    )


class MaintenanceInfo(BaseModel):
    """General maintenance tasks."""

    pruning: str = Field(
        description="Pruning requirements and frequency"
    )
    repotting: str = Field(
        description="Repotting frequency and timing"
    )
    cleaning: str = Field(
        description="Leaf cleaning requirements"
    )
    pest_check: str = Field(
        description="How often to check for pests and what to look for"
    )


class SevaSchedule(BaseModel):
    """
    Seva (Care) Schedule result.

    Comprehensive, personalized care schedule that acts as the plant's
    complete care manual.
    """

    watering: WateringInfo = Field(
        description="Complete watering schedule"
    )
    light: LightInfo = Field(
        description="Light requirements"
    )
    fertilizing: FertilizingInfo = Field(
        description="Fertilizing schedule"
    )
    maintenance: MaintenanceInfo = Field(
        description="General maintenance tasks"
    )
    seasonal_tips: List[str] = Field(
        description="Season-specific care tips (Spring, Summer, Fall, Winter)"
    )
    vaidya_wisdom: Optional[str] = Field(
        default=None,
        description="Traditional plant care wisdom from Ayurvedic perspective"
    )
