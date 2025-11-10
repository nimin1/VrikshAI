/**
 * Database service for VrikshAI using Supabase.
 *
 * Provides a clean interface for all database operations with proper error
 * handling and ownership verification.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Database service wrapping Supabase client.
 *
 * Handles all database operations for users, plants, identifications,
 * and health checks with proper error handling and security.
 */
class VanaDatabase {
  /**
   * Initialize database connection.
   *
   * @param {string} url - Supabase project URL
   * @param {string} key - Supabase anon key
   * @throws {Error} If credentials are missing
   */
  constructor(url, key) {
    if (!url || !key) {
      throw new Error('Supabase URL and key are required');
    }

    this.client = createClient(url, key);
    console.log('Database connection established');
  }

  /**
   * Fetch user by ID.
   *
   * @param {string} userId - UUID of the user
   * @returns {Promise<Object|null>} User data object or null if not found
   */
  async getUser(userId) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Add a new plant to user's Mera Vana collection.
   *
   * @param {string} userId - UUID of the plant owner
   * @param {Object} plantData - Plant information object
   * @returns {Promise<string>} plant_id - UUID of the created plant
   * @throws {Error} If save fails
   */
  async saveToVana(userId, plantData) {
    try {
      // Prepare plant data
      const data = {
        user_id: userId,
        name: plantData.name,
        species: plantData.species,
        scientific_name: plantData.scientific_name,
        sanskrit_name: plantData.sanskrit_name,
        family: plantData.family,
        image_url: plantData.image_url,
        care_schedule: plantData.care_schedule,
        health_status: plantData.health_status || 'healthy',
        notes: plantData.notes,
      };

      // Calculate next watering if last_watered is provided
      if (plantData.last_watered) {
        data.last_watered = plantData.last_watered;
        // Default to 7 days if not specified
        const wateringFrequency = plantData.watering_frequency_days || 7;
        const lastWatered = new Date(plantData.last_watered);
        const nextWatering = new Date(lastWatered);
        nextWatering.setDate(nextWatering.getDate() + wateringFrequency);
        data.next_watering_due = nextWatering.toISOString().split('T')[0];
      }

      const { data: insertedData, error } = await this.client
        .from('plants')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      const plantId = insertedData.id;
      console.log(`Plant ${plantId} added to Vana for user ${userId}`);
      return plantId;
    } catch (error) {
      console.error('Error saving plant to Vana:', error.message);
      throw new Error(`Failed to save plant: ${error.message}`);
    }
  }

  /**
   * Get all plants in user's Mera Vana collection.
   *
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} List of plant objects ordered by added_date (newest first)
   * @throws {Error} If fetch fails
   */
  async getMeraVana(userId) {
    try {
      const { data, error } = await this.client
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('added_date', { ascending: false });

      if (error) throw error;

      console.log(`Retrieved ${data.length} plants for user ${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching Mera Vana:', error.message);
      throw new Error(`Failed to fetch plants: ${error.message}`);
    }
  }

  /**
   * Update a plant in Mera Vana with ownership verification.
   *
   * @param {string} plantId - UUID of the plant
   * @param {string} userId - UUID of the user (for ownership verification)
   * @param {Object} updates - Object of fields to update
   * @returns {Promise<boolean>} True if update successful
   * @throws {Error} If update fails or user doesn't own plant
   */
  async updateVanaPlant(plantId, userId, updates) {
    try {
      // Verify ownership
      const { data: plant, error: fetchError } = await this.client
        .from('plants')
        .select('user_id')
        .eq('id', plantId)
        .single();

      if (fetchError) throw fetchError;
      if (!plant || plant.user_id !== userId) {
        throw new Error('Plant not found or access denied');
      }

      // Calculate next watering if last_watered is updated
      if (updates.last_watered && updates.watering_frequency_days) {
        const lastWatered = new Date(updates.last_watered);
        const nextWatering = new Date(lastWatered);
        nextWatering.setDate(nextWatering.getDate() + updates.watering_frequency_days);
        updates.next_watering_due = nextWatering.toISOString().split('T')[0];
      }

      // Update plant
      const { error: updateError } = await this.client
        .from('plants')
        .update(updates)
        .eq('id', plantId);

      if (updateError) throw updateError;

      console.log(`Plant ${plantId} updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating plant:', error.message);
      throw new Error(`Failed to update plant: ${error.message}`);
    }
  }

  /**
   * Delete a plant from Mera Vana with ownership verification.
   *
   * @param {string} plantId - UUID of the plant
   * @param {string} userId - UUID of the user (for ownership verification)
   * @returns {Promise<boolean>} True if deletion successful
   * @throws {Error} If deletion fails or user doesn't own plant
   */
  async removeFromVana(plantId, userId) {
    try {
      // Verify ownership
      const { data: plant, error: fetchError } = await this.client
        .from('plants')
        .select('user_id')
        .eq('id', plantId)
        .single();

      if (fetchError) throw fetchError;
      if (!plant || plant.user_id !== userId) {
        throw new Error('Plant not found or access denied');
      }

      // Delete plant (CASCADE will handle related records)
      const { error: deleteError } = await this.client
        .from('plants')
        .delete()
        .eq('id', plantId);

      if (deleteError) throw deleteError;

      console.log(`Plant ${plantId} removed from Vana`);
      return true;
    } catch (error) {
      console.error('Error removing plant:', error.message);
      throw new Error(`Failed to remove plant: ${error.message}`);
    }
  }
}

// Singleton instance
let _database = null;

/**
 * Get or create the singleton database instance.
 *
 * @returns {VanaDatabase} The initialized database connection
 * @throws {Error} If Supabase credentials are not set
 */
export function getDatabase() {
  if (_database === null) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_KEY environment variables are required. ' +
        'Please set them in your .env file.'
      );
    }

    _database = new VanaDatabase(url, key);
  }

  return _database;
}
