/**
 * AI Darshan (दर्शन - Vision) API Endpoint - Node.js Serverless
 *
 * Plant identification from images using OpenAI GPT-4o Vision API.
 * Public endpoint - no authentication required.
 */

import OpenAI from 'openai';

// System prompt for comprehensive plant analysis
const DARSHAN_SYSTEM_PROMPT = `You are VrikshAI's Darshan (दर्शन - Vision) agent, an expert botanist and plant wellness specialist with deep knowledge spanning:
- Modern botanical science and plant taxonomy
- Traditional Ayurvedic plant wisdom
- Vastu Shastra (ancient Indian architectural science) and plant placement
- Plant health diagnostics
- Ethnobotany and cultural plant significance

Your role is to provide a comprehensive analysis of plants from images, combining scientific accuracy with traditional wisdom.

CRITICAL IDENTIFICATION REQUIREMENTS:
- You MUST analyze the actual image provided. DO NOT generate generic responses.
- Base identification on visible features: leaf shape, arrangement, venation, edges, color, texture, growth habit, stems, bark (if visible), flowers, fruits
- If image is unclear or features are not distinct, lower confidence significantly (0.30-0.60 range)
- Be honest about uncertainty - better to have 0.50 confidence with correct ID than 0.95 with wrong guess

HEALTH ASSESSMENT:
Analyze visible indicators in the image:
- Leaf color (vibrant green = healthy, yellowing = nutrient issues, brown = stress)
- Leaf condition (spots, holes, wilting, curling indicate problems)
- Overall vigor (dense foliage = thriving, sparse = struggling)
- Visible pests or disease signs
Provide health_status as: "thriving", "healthy", "needs_attention", "struggling", or "critical"

COMPREHENSIVE INFORMATION TO PROVIDE:

1. BOTANICAL IDENTITY:
   - Common name (most widely used)
   - Scientific name (full Latin binomial)
   - Sanskrit name (if plant has traditional significance in Indian culture/Ayurveda)
   - Family name
   - Plant type (herb, shrub, tree, climber, succulent, etc.)

2. DETAILED DESCRIPTION:
   - Physical characteristics (size, growth habit, distinctive features)
   - Leaf details (shape, size, arrangement, texture, color variations)
   - Flowers/fruits (if applicable - color, season, fragrance)
   - Native habitat and origin
   - Lifespan (annual, perennial, etc.)

3. CARE REQUIREMENTS:
   - Light needs (full sun, partial shade, shade) with specific hours
   - Water frequency and method (specific schedule based on season)
   - Soil type and pH preference
   - Temperature range (ideal and tolerance limits)
   - Humidity requirements
   - Fertilizer needs (type, frequency, NPK ratio)
   - Pruning and maintenance tips
   - Common pests/diseases and prevention
   - Difficulty level (beginner, intermediate, expert)

4. VASTU SHASTRA GUIDANCE:
   - Best placement direction (North, East, South, West, Northeast, etc.)
   - Indoor vs outdoor suitability
   - Auspicious benefits (prosperity, health, peace, harmony, etc.)
   - Rooms suitable for placement (living room, bedroom, kitchen, entrance, etc.)
   - Vastu considerations (avoid bedroom if oxygen-depleting at night, etc.)
   - Lucky/unlucky associations in Vastu tradition

5. CULTURAL & TRADITIONAL SIGNIFICANCE:
   - Ayurvedic uses and medicinal properties (if applicable)
   - Traditional remedies and preparations
   - Religious/spiritual significance in Indian culture
   - Festivals or rituals associated with the plant
   - Historical or mythological references

6. INTERESTING FACTS:
   - Scientific facts (air purification, NASA studies, unique biology)
   - Surprising uses or benefits
   - Record-breaking specimens
   - Ecological importance
   - Cultural trivia from around the world

7. WARNINGS & PRECAUTIONS:
   - Toxicity to humans (if any)
   - Pet safety (toxic to cats, dogs, etc.)
   - Skin irritation or allergies
   - Handling precautions

Be specific, accurate, and culturally sensitive. Combine modern science with traditional wisdom to provide holistic plant knowledge.`;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Parse JSON response from GPT-4o
 */
function parseGPTResponse(content) {
  // GPT might wrap JSON in markdown code blocks
  let jsonStr = content.trim();

  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
  }

  return JSON.parse(jsonStr);
}

/**
 * Validate response data structure
 */
function validateDarshanResult(data) {
  // Required top-level fields
  const requiredFields = ['common_name', 'scientific_name', 'family', 'plant_type', 'confidence', 'health_status', 'health_notes'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('Confidence must be a number between 0 and 1');
  }

  // Validate nested objects exist
  const requiredObjects = ['description', 'care_guide', 'vastu', 'traditional_significance', 'warnings'];
  for (const field of requiredObjects) {
    if (!(field in data) || typeof data[field] !== 'object') {
      throw new Error(`Missing or invalid object: ${field}`);
    }
  }

  // Validate arrays
  if (!Array.isArray(data.interesting_facts) || data.interesting_facts.length === 0) {
    throw new Error('interesting_facts must be a non-empty array');
  }

  if (!Array.isArray(data.vastu.benefits) || data.vastu.benefits.length === 0) {
    throw new Error('vastu.benefits must be a non-empty array');
  }

  if (!Array.isArray(data.vastu.suitable_rooms) || data.vastu.suitable_rooms.length === 0) {
    throw new Error('vastu.suitable_rooms must be a non-empty array');
  }

  return data;
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { image_url, image_base64 } = req.body;

    // Validate input
    if (!image_url && !image_base64) {
      return res.status(400).json({
        success: false,
        error: 'Either image_url or image_base64 is required'
      });
    }

    // Use base64 data URL if provided
    let imageUrl = image_url;
    if (image_base64 && !imageUrl) {
      // Ensure it's a proper data URL
      imageUrl = image_base64.startsWith('data:')
        ? image_base64
        : `data:image/jpeg;base64,${image_base64}`;
    }

    console.log('AI Darshan request received');
    console.log('Data URL length:', imageUrl.length, 'characters');

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: DARSHAN_SYSTEM_PROMPT + '\n\nIMPORTANT: You must respond with a valid JSON object matching this exact structure:\n{\n  "common_name": "string",\n  "scientific_name": "string",\n  "sanskrit_name": "string or null",\n  "family": "string",\n  "plant_type": "string (herb/shrub/tree/climber/succulent/etc)",\n  "confidence": 0.0-1.0,\n  "health_status": "thriving/healthy/needs_attention/struggling/critical",\n  "health_notes": "string - specific observations about plant condition",\n  "description": {\n    "appearance": "string - physical characteristics",\n    "leaves": "string - detailed leaf description",\n    "flowers_fruits": "string or null",\n    "origin": "string - native habitat",\n    "lifespan": "string - annual/perennial/etc"\n  },\n  "care_guide": {\n    "light": "string - detailed light requirements",\n    "water": "string - detailed watering schedule",\n    "soil": "string - soil type and pH",\n    "temperature": "string - ideal temperature range",\n    "humidity": "string - humidity needs",\n    "fertilizer": "string - fertilizer requirements",\n    "pruning": "string - pruning and maintenance",\n    "pests_diseases": "string - common issues and prevention",\n    "difficulty": "beginner/intermediate/expert"\n  },\n  "vastu": {\n    "direction": "string - best placement direction",\n    "location": "string - indoor/outdoor/both",\n    "benefits": ["array of auspicious benefits"],\n    "suitable_rooms": ["array of suitable room types"],\n    "considerations": "string - vastu-specific notes"\n  },\n  "traditional_significance": {\n    "ayurvedic_uses": "string or null",\n    "medicinal_properties": "string or null",\n    "cultural_importance": "string or null",\n    "festivals_rituals": "string or null"\n  },\n  "interesting_facts": [\n    "array of 3-5 genuinely interesting facts"\n  ],\n  "warnings": {\n    "toxicity_humans": "string or null",\n    "toxicity_pets": "string or null",\n    "skin_irritation": "string or null",\n    "handling_precautions": "string or null"\n  }\n}'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this plant image comprehensively. Identify the species, assess its health, and provide detailed information including care requirements, Vastu guidance, traditional significance, interesting facts, and safety warnings. Look carefully at all visible features and provide accurate, helpful information in JSON format.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'auto' // Auto balances cost and accuracy
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.3 // Lower temperature for more focused, accurate responses
    });

    console.log('API call completed. Response ID:', response.id);

    // Extract and parse response
    const content = response.choices[0].message.content;
    const resultData = parseGPTResponse(content);
    const validatedData = validateDarshanResult(resultData);

    console.log('AI Darshan completed:', validatedData.common_name, '(confidence:', validatedData.confidence, ')');

    // Return success response
    return res.status(200).json({
      success: true,
      darshan: validatedData
    });

  } catch (error) {
    console.error('AI Darshan failed:', error.message);
    console.error('Error type:', error.constructor.name);

    // Handle specific error types
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again in a moment.'
      });
    }

    if (error instanceof SyntaxError || error.message.includes('JSON')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Plant identification failed. Please try again with a clearer image.'
    });
  }
}
