"""
VrikshAI Service - Pydantic AI integration with GPT-5.

This module provides the core AI functionality for plant identification,
health diagnosis, and care recommendations using OpenAI's GPT-5 model
with structured outputs via Pydantic AI.
"""

import os
import logging
from typing import Optional
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

from .models import DarshanResult, ChikitsaResult, SevaSchedule
from .prompts import (
    DARSHAN_SYSTEM_PROMPT,
    CHIKITSA_SYSTEM_PROMPT,
    SEVA_SYSTEM_PROMPT
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VrikshAIService:
    """
    AI service for plant identification, diagnosis, and care recommendations.

    Uses Pydantic AI with GPT-5 to provide structured, validated responses
    that combine modern botanical knowledge with traditional Sanskrit wisdom.
    """

    def __init__(self, api_key: str):
        """
        Initialize VrikshAI service with OpenAI API key.

        Args:
            api_key: OpenAI API key for GPT-4o access
        """
        if not api_key:
            raise ValueError("OpenAI API key is required")

        # Set API key in environment for OpenAI client
        os.environ['OPENAI_API_KEY'] = api_key

        # Initialize GPT-4o model (Pydantic AI reads from environment)
        self.model = OpenAIModel('gpt-4o')

        # Create specialized agents with structured outputs
        # Note: Pydantic AI v1.9+ uses 'output_type' instead of 'result_type'
        self.darshan_agent = Agent(
            self.model,
            output_type=DarshanResult,
            system_prompt=DARSHAN_SYSTEM_PROMPT
        )

        self.chikitsa_agent = Agent(
            self.model,
            output_type=ChikitsaResult,
            system_prompt=CHIKITSA_SYSTEM_PROMPT
        )

        self.seva_agent = Agent(
            self.model,
            output_type=SevaSchedule,
            system_prompt=SEVA_SYSTEM_PROMPT
        )

        logger.info("VrikshAI Service initialized with GPT-5")

    async def ai_darshan(self, image_url: str) -> DarshanResult:
        """
        Identify plant from image using AI vision.

        Args:
            image_url: URL or data URL of the plant image

        Returns:
            DarshanResult: Validated plant identification with care summary

        Raises:
            Exception: If identification fails
        """
        try:
            logger.info(f"Starting AI Darshan for image")

            prompt = f"""Analyze this plant image and provide a complete identification.

Image: {image_url}

Identify the plant species and provide comprehensive information including:
- Common and scientific names
- Sanskrit name (only if traditionally significant)
- Plant family
- Your confidence in this identification (be honest about uncertainty)
- Care requirements summary
- Traditional Ayurvedic or cultural uses (if applicable)
- An interesting fact about this plant

Focus on accuracy over confidence - better to be 70% sure and correct than 95% sure and wrong."""

            result = await self.darshan_agent.run(prompt)
            logger.info(f"AI Darshan completed: {result.output.common_name} "
                       f"(confidence: {result.output.confidence:.2f})")

            return result.output

        except Exception as e:
            logger.error(f"AI Darshan failed: {str(e)}")
            raise Exception(f"Plant identification failed: {str(e)}")

    async def ai_chikitsa(
        self,
        plant_name: str,
        symptoms: str,
        image_url: Optional[str] = None
    ) -> ChikitsaResult:
        """
        Diagnose plant health issues and provide treatment plan.

        Args:
            plant_name: Name of the plant (common or scientific)
            symptoms: Description of symptoms or issues observed
            image_url: Optional image URL showing the plant's condition

        Returns:
            ChikitsaResult: Validated diagnosis with treatment plan

        Raises:
            Exception: If diagnosis fails
        """
        try:
            logger.info(f"Starting AI Chikitsa for {plant_name}")

            image_context = f"\nImage showing symptoms: {image_url}" if image_url else ""

            prompt = f"""Diagnose the health issue for this plant and provide a comprehensive treatment plan.

Plant: {plant_name}
Symptoms: {symptoms}{image_context}

Provide:
- Clear diagnosis of what's wrong
- Severity level (healthy/warning/critical) - be honest about seriousness
- Confidence in your diagnosis
- Likely causes of this condition
- Immediate actions to take RIGHT NOW
- Ongoing care adjustments for recovery
- Specific products or organic remedies
- Prevention tips for the future
- Realistic recovery timeline
- Warning signs that indicate worsening
- Traditional Ayurvedic perspective (if applicable)

Be specific and actionable - plant parents need clear steps, not vague advice."""

            result = await self.chikitsa_agent.run(prompt)
            logger.info(f"AI Chikitsa completed: {result.output.diagnosis} "
                       f"(severity: {result.output.severity}, confidence: {result.output.confidence:.2f})")

            return result.output

        except Exception as e:
            logger.error(f"AI Chikitsa failed: {str(e)}")
            raise Exception(f"Plant diagnosis failed: {str(e)}")

    async def seva_schedule(
        self,
        plant_name: str,
        location: str = "General",
        season: str = "Spring",
        indoor: bool = True
    ) -> SevaSchedule:
        """
        Generate personalized care schedule for a plant.

        Args:
            plant_name: Name of the plant (common or scientific)
            location: Geographic location or climate zone
            season: Current season (Spring/Summer/Fall/Winter)
            indoor: Whether the plant is kept indoors

        Returns:
            SevaSchedule: Validated comprehensive care schedule

        Raises:
            Exception: If schedule generation fails
        """
        try:
            logger.info(f"Starting Seva Schedule for {plant_name}")

            setting = "indoor" if indoor else "outdoor"

            prompt = f"""Create a comprehensive, personalized care schedule for this plant.

Plant: {plant_name}
Location: {location}
Season: {season}
Setting: {setting}

Provide a complete care manual including:
- Detailed watering schedule with frequency, amount, method, seasonal adjustments, and signs to water
- Light requirements with hours, type, placement recommendations, and seasonal notes
- Fertilizing schedule with frequency, type, dilution, and seasonal adjustments
- Maintenance tasks: pruning, repotting, cleaning, pest checking
- Seasonal tips for all four seasons
- Traditional care wisdom (if applicable)

Make it specific to this plant, location, and season. Be realistic - busy plant parents need doable schedules.
Provide tangible signs to look for rather than just rigid schedules."""

            result = await self.seva_agent.run(prompt)
            logger.info(f"Seva Schedule completed for {plant_name}")

            return result.output

        except Exception as e:
            logger.error(f"Seva Schedule failed: {str(e)}")
            raise Exception(f"Care schedule generation failed: {str(e)}")


# Singleton instance
_vriksh_ai_service: Optional[VrikshAIService] = None


def get_vriksh_ai_service() -> VrikshAIService:
    """
    Get or create the singleton VrikshAI service instance.

    Returns:
        VrikshAIService: The initialized service instance

    Raises:
        ValueError: If OPENAI_API_KEY environment variable is not set
    """
    global _vriksh_ai_service

    if _vriksh_ai_service is None:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is required. "
                "Please set it in your .env file."
            )
        _vriksh_ai_service = VrikshAIService(api_key)

    return _vriksh_ai_service
