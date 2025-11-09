"""
Database service for VrikshAI using Supabase.

Provides a clean interface for all database operations with proper error
handling and ownership verification.
"""

import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VanaDatabase:
    """
    Database service wrapping Supabase client.

    Handles all database operations for users, plants, identifications,
    and health checks with proper error handling and security.
    """

    def __init__(self, url: str, key: str):
        """
        Initialize database connection.

        Args:
            url: Supabase project URL
            key: Supabase anon key

        Raises:
            ValueError: If credentials are missing
        """
        if not url or not key:
            raise ValueError("Supabase URL and key are required")

        self.client: Client = create_client(url, key)
        logger.info("Database connection established")

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user by ID.

        Args:
            user_id: UUID of the user

        Returns:
            User data dictionary or None if not found
        """
        try:
            response = self.client.table('users').select('*').eq('id', user_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {str(e)}")
            return None

    def save_to_vana(self, user_id: str, plant_data: Dict[str, Any]) -> str:
        """
        Add a new plant to user's Mera Vana collection.

        Args:
            user_id: UUID of the plant owner
            plant_data: Plant information dictionary

        Returns:
            plant_id: UUID of the created plant

        Raises:
            Exception: If save fails
        """
        try:
            # Prepare plant data
            data = {
                'user_id': user_id,
                'name': plant_data.get('name'),
                'species': plant_data.get('species'),
                'scientific_name': plant_data.get('scientific_name'),
                'sanskrit_name': plant_data.get('sanskrit_name'),
                'family': plant_data.get('family'),
                'image_url': plant_data.get('image_url'),
                'care_schedule': plant_data.get('care_schedule'),
                'health_status': plant_data.get('health_status', 'healthy'),
                'notes': plant_data.get('notes'),
            }

            # Calculate next watering if last_watered is provided
            if plant_data.get('last_watered'):
                data['last_watered'] = plant_data['last_watered']
                # Default to 7 days if not specified
                watering_frequency = plant_data.get('watering_frequency_days', 7)
                last_watered = datetime.fromisoformat(plant_data['last_watered'].replace('Z', '+00:00'))
                data['next_watering_due'] = (last_watered + timedelta(days=watering_frequency)).date().isoformat()

            response = self.client.table('plants').insert(data).execute()

            plant_id = response.data[0]['id']
            logger.info(f"Plant {plant_id} added to Vana for user {user_id}")
            return plant_id

        except Exception as e:
            logger.error(f"Error saving plant to Vana: {str(e)}")
            raise Exception(f"Failed to save plant: {str(e)}")

    def get_mera_vana(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all plants in user's Mera Vana collection.

        Args:
            user_id: UUID of the user

        Returns:
            List of plant dictionaries ordered by added_date (newest first)

        Raises:
            Exception: If fetch fails
        """
        try:
            response = self.client.table('plants')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('added_date', desc=True)\
                .execute()

            logger.info(f"Retrieved {len(response.data)} plants for user {user_id}")
            return response.data

        except Exception as e:
            logger.error(f"Error fetching Mera Vana: {str(e)}")
            raise Exception(f"Failed to fetch plants: {str(e)}")

    def update_vana_plant(
        self,
        plant_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update a plant in Mera Vana with ownership verification.

        Args:
            plant_id: UUID of the plant
            user_id: UUID of the user (for ownership verification)
            updates: Dictionary of fields to update

        Returns:
            True if update successful

        Raises:
            Exception: If update fails or user doesn't own plant
        """
        try:
            # Verify ownership
            plant = self.client.table('plants')\
                .select('user_id')\
                .eq('id', plant_id)\
                .single()\
                .execute()

            if not plant.data or plant.data['user_id'] != user_id:
                raise Exception("Plant not found or access denied")

            # Calculate next watering if last_watered is updated
            if 'last_watered' in updates and 'watering_frequency_days' in updates:
                last_watered = datetime.fromisoformat(updates['last_watered'].replace('Z', '+00:00'))
                frequency = updates['watering_frequency_days']
                updates['next_watering_due'] = (last_watered + timedelta(days=frequency)).date().isoformat()

            # Update plant
            self.client.table('plants')\
                .update(updates)\
                .eq('id', plant_id)\
                .execute()

            logger.info(f"Plant {plant_id} updated successfully")
            return True

        except Exception as e:
            logger.error(f"Error updating plant: {str(e)}")
            raise Exception(f"Failed to update plant: {str(e)}")

    def remove_from_vana(self, plant_id: str, user_id: str) -> bool:
        """
        Delete a plant from Mera Vana with ownership verification.

        Args:
            plant_id: UUID of the plant
            user_id: UUID of the user (for ownership verification)

        Returns:
            True if deletion successful

        Raises:
            Exception: If deletion fails or user doesn't own plant
        """
        try:
            # Verify ownership
            plant = self.client.table('plants')\
                .select('user_id')\
                .eq('id', plant_id)\
                .single()\
                .execute()

            if not plant.data or plant.data['user_id'] != user_id:
                raise Exception("Plant not found or access denied")

            # Delete plant (CASCADE will handle related records)
            self.client.table('plants')\
                .delete()\
                .eq('id', plant_id)\
                .execute()

            logger.info(f"Plant {plant_id} removed from Vana")
            return True

        except Exception as e:
            logger.error(f"Error removing plant: {str(e)}")
            raise Exception(f"Failed to remove plant: {str(e)}")

    def save_darshan_history(
        self,
        user_id: Optional[str],
        image_url: str,
        result: Dict[str, Any]
    ) -> str:
        """
        Save plant identification to history.

        Args:
            user_id: UUID of the user (None for anonymous)
            image_url: URL of the identified plant image
            result: DarshanResult as dictionary

        Returns:
            identification_id: UUID of the saved record

        Raises:
            Exception: If save fails
        """
        try:
            data = {
                'user_id': user_id,
                'image_url': image_url,
                'result': result,
                'confidence': result.get('confidence')
            }

            response = self.client.table('identifications').insert(data).execute()

            identification_id = response.data[0]['id']
            logger.info(f"Identification {identification_id} saved to history")
            return identification_id

        except Exception as e:
            logger.error(f"Error saving identification: {str(e)}")
            raise Exception(f"Failed to save identification: {str(e)}")

    def save_chikitsa_record(
        self,
        plant_id: str,
        diagnosis: Dict[str, Any]
    ) -> str:
        """
        Save health diagnosis to plant's Chikitsa history.

        Args:
            plant_id: UUID of the plant
            diagnosis: ChikitsaResult as dictionary

        Returns:
            health_check_id: UUID of the saved record

        Raises:
            Exception: If save fails
        """
        try:
            data = {
                'plant_id': plant_id,
                'diagnosis': diagnosis.get('diagnosis'),
                'severity': diagnosis.get('severity'),
                'confidence': diagnosis.get('confidence'),
                'symptoms': diagnosis.get('causes', []),  # Store causes as symptoms array
                'treatment': diagnosis.get('treatment'),
                'prevention': diagnosis.get('prevention'),
                'image_url': diagnosis.get('image_url')
            }

            response = self.client.table('health_checks').insert(data).execute()

            health_check_id = response.data[0]['id']
            logger.info(f"Health check {health_check_id} saved for plant {plant_id}")
            return health_check_id

        except Exception as e:
            logger.error(f"Error saving health check: {str(e)}")
            raise Exception(f"Failed to save diagnosis: {str(e)}")

    def get_chikitsa_history(
        self,
        plant_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get health check history for a plant.

        Args:
            plant_id: UUID of the plant
            limit: Maximum number of records to return

        Returns:
            List of health check dictionaries ordered by date (newest first)

        Raises:
            Exception: If fetch fails
        """
        try:
            response = self.client.table('health_checks')\
                .select('*')\
                .eq('plant_id', plant_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()

            logger.info(f"Retrieved {len(response.data)} health checks for plant {plant_id}")
            return response.data

        except Exception as e:
            logger.error(f"Error fetching health history: {str(e)}")
            raise Exception(f"Failed to fetch health history: {str(e)}")


# Singleton instance
_database: Optional[VanaDatabase] = None


def get_database() -> VanaDatabase:
    """
    Get or create the singleton database instance.

    Returns:
        VanaDatabase: The initialized database connection

    Raises:
        ValueError: If Supabase credentials are not set
    """
    global _database

    if _database is None:
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY environment variables are required. "
                "Please set them in your .env file."
            )

        _database = VanaDatabase(url, key)

    return _database
