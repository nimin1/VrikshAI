"""
Quick test script to verify VrikshAI service is working.
Run with: python test_service.py
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from api._utils.vriksh_ai_service import get_vriksh_ai_service

async def test_seva_schedule():
    """Test care schedule generation (no image needed)."""
    print("\n🌱 Testing VrikshAI Service...\n")

    try:
        # Get AI service
        service = get_vriksh_ai_service()
        print("✅ AI Service initialized successfully")

        # Test Seva Schedule (fastest endpoint)
        print("\n📅 Generating care schedule for Monstera Deliciosa...")
        result = await service.seva_schedule(
            plant_name="Monstera Deliciosa",
            location="General",
            season="Spring",
            indoor=True
        )

        print("\n✅ SUCCESS! Care Schedule Generated:\n")
        print(f"🚰 Watering: Every {result.watering.frequency_days} days")
        print(f"   Amount: {result.watering.amount}")
        print(f"   Method: {result.watering.method}")

        print(f"\n☀️  Light: {result.light.type}")
        print(f"   Hours: {result.light.hours_per_day}")
        print(f"   Placement: {result.light.placement}")

        print(f"\n🌿 Fertilizing: {result.fertilizing.frequency}")
        print(f"   Type: {result.fertilizing.type}")

        print(f"\n🔧 Maintenance:")
        print(f"   Pruning: {result.maintenance.pruning}")
        print(f"   Repotting: {result.maintenance.repotting}")

        print(f"\n📝 Seasonal Tips ({len(result.seasonal_tips)} tips):")
        for tip in result.seasonal_tips[:2]:
            print(f"   • {tip}")

        if result.vaidya_wisdom:
            print(f"\n🕉️  Traditional Wisdom: {result.vaidya_wisdom}")

        print("\n" + "="*60)
        print("✅ VrikshAI Backend is working perfectly!")
        print("="*60 + "\n")

        return True

    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("\nPlease check your .env file has:")
        print("  - OPENAI_API_KEY (starts with 'sk-')")
        print("  - SUPABASE_URL (starts with 'https://')")
        print("  - SUPABASE_KEY (long JWT token)")
        print("  - JWT_SECRET (random string)")
        return False

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print(f"\nError type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_seva_schedule())
    exit(0 if success else 1)
