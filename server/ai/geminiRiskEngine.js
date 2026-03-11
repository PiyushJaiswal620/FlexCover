// ============================
// FlexCover — Gemini AI Risk Assessment Engine
// ============================
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

function initGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.warn('⚠️  GEMINI_API_KEY not set — AI risk engine disabled, using deterministic fallback.');
        return false;
    }
    try {
        genAI = new GoogleGenerativeAI(key);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('✅ Gemini AI Risk Engine initialized.');
        return true;
    } catch (err) {
        console.error('❌ Failed to initialize Gemini:', err.message);
        return false;
    }
}

// Initialize on first import
const isReady = initGemini();

/**
 * Assess risk using Google Gemini AI.
 * Returns a structured risk assessment or null on failure.
 */
export async function assessRiskWithAI({ zone, avgDailyHours, avgDailyEarnings, platform, city }) {
    if (!model) return null;

    const prompt = `You are a risk assessment engine for a gig worker income protection platform in India called FlexCover.

Analyze the following worker and location data, then output a JSON risk assessment.

## Worker Profile
- Platform: ${platform}
- City: ${city || 'Unknown'}
- Daily working hours: ${avgDailyHours}
- Average daily earnings: ₹${avgDailyEarnings}

## Zone Data
- Zone name: ${zone.name}
- Risk level (historical): ${zone.riskLevel}
- Flood-prone area: ${zone.floodProne ? 'Yes' : 'No'}
- Average annual rainfall: ${zone.avgRainfall}mm
- Average AQI (Air Quality Index): ${zone.avgAQI}
- Latitude: ${zone.lat}, Longitude: ${zone.lng}

## Risk Factors to Consider
1. **Location risk** — flood-prone areas and zones with historically high risk levels should score higher
2. **Weather patterns** — high average rainfall (>60mm) and flood-prone zones increase risk
3. **Air quality** — AQI above 200 is hazardous for outdoor delivery workers, above 300 is severe
4. **Working hours** — more hours = more exposure to adverse conditions (10+ hrs is high)
5. **Platform type** — food delivery platforms (Zomato, Swiggy, Zepto) involve continuous outdoor exposure vs. package delivery
6. **City factors** — Mumbai/Chennai are monsoon-heavy, Delhi has extreme AQI, Bengaluru has sudden flooding

## Output Format
Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "riskScore": <integer 0-100>,
  "riskCategory": "<low|medium|high>",
  "weeklyPremium": <integer, range ₹15-150 based on risk>,
  "coverageLimit": <integer, 80% of expected weekly earnings>,
  "reasoning": "<2-3 sentence explanation of the risk assessment>",
  "factors": {
    "locationRisk": <integer 0-35>,
    "weatherRisk": <integer 0-20>,
    "airQualityRisk": <integer 0-20>,
    "workingHoursRisk": <integer 0-15>,
    "platformRisk": <integer 0-10>
  }
}

Premium guidelines:
- riskScore 0-30 (low): ₹15-50/week
- riskScore 31-64 (medium): ₹50-90/week
- riskScore 65-100 (high): ₹90-150/week

Coverage limit should be approximately 80% of the worker's expected weekly earnings (₹${avgDailyEarnings} × 7 × 0.8 = ₹${Math.round(avgDailyEarnings * 7 * 0.8)}).`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Strip markdown code fences if Gemini wraps them
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        // Validate critical fields
        if (
            typeof parsed.riskScore !== 'number' ||
            typeof parsed.weeklyPremium !== 'number' ||
            typeof parsed.coverageLimit !== 'number'
        ) {
            console.warn('⚠️  Gemini returned invalid structure, falling back.');
            return null;
        }

        // Clamp values to sane ranges
        parsed.riskScore = Math.min(100, Math.max(0, Math.round(parsed.riskScore)));
        parsed.weeklyPremium = Math.min(150, Math.max(15, Math.round(parsed.weeklyPremium)));
        parsed.coverageLimit = Math.max(0, Math.round(parsed.coverageLimit));

        if (!parsed.riskCategory) {
            parsed.riskCategory = parsed.riskScore >= 65 ? 'high' : parsed.riskScore >= 35 ? 'medium' : 'low';
        }

        return parsed;

    } catch (err) {
        console.error('❌ Gemini risk assessment failed:', err.message);
        return null;
    }
}

export { isReady as geminiAvailable };
