// ============================
// FlexCover — Risk Assessment Engine (with AI fallback)
// ============================
import { assessRiskWithAI } from './geminiRiskEngine.js';

/**
 * Deterministic risk calculator — used as fallback when Gemini is unavailable.
 */
export function calculateRisk({ zone, avgDailyHours, avgDailyEarnings, platform }) {
    let riskScore = 0;

    // 1. Location risk (flood prone, base risk)
    const locationWeights = { high: 35, medium: 20, low: 8 };
    riskScore += locationWeights[zone.riskLevel] || 15;

    // 2. Flood-prone zones
    if (zone.floodProne) riskScore += 12;

    // 3. Weather history (avg rainfall)
    if (zone.avgRainfall > 70) riskScore += 15;
    else if (zone.avgRainfall > 40) riskScore += 8;
    else riskScore += 3;

    // 4. Pollution levels (avg AQI)
    if (zone.avgAQI > 300) riskScore += 18;
    else if (zone.avgAQI > 150) riskScore += 10;
    else riskScore += 3;

    // 5. Working hours factor — more hours = more exposure
    if (avgDailyHours >= 10) riskScore += 10;
    else if (avgDailyHours >= 7) riskScore += 6;
    else riskScore += 2;

    // 6. Platform-specific risk
    const highRiskPlatforms = ['Zomato', 'Swiggy', 'Zepto'];
    if (highRiskPlatforms.includes(platform)) riskScore += 5;

    // Normalize to 0-100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Calculate weekly premium (dynamic tiers)
    let weeklyPremium, riskCategory;
    if (riskScore >= 65) {
        weeklyPremium = Math.round(90 + (riskScore - 65) * (60 / 35)); // ₹90-150
        riskCategory = 'high';
    } else if (riskScore >= 35) {
        weeklyPremium = Math.round(50 + (riskScore - 35) * (40 / 30)); // ₹50-90
        riskCategory = 'medium';
    } else {
        weeklyPremium = Math.round(15 + riskScore * (35 / 35)); // ₹15-50
        riskCategory = 'low';
    }

    // Coverage limit = 80% of expected weekly earnings
    const coverageLimit = Math.round(avgDailyEarnings * 7 * 0.8);

    return {
        riskScore,
        riskCategory,
        weeklyPremium,
        coverageLimit,
        source: 'deterministic',
        factors: {
            locationRisk: zone.riskLevel,
            floodProne: zone.floodProne,
            avgRainfall: zone.avgRainfall,
            avgAQI: zone.avgAQI,
            workingHours: avgDailyHours,
            platform
        }
    };
}

/**
 * Primary risk assessment — tries Gemini AI first, falls back to deterministic.
 */
export async function assessRisk({ zone, avgDailyHours, avgDailyEarnings, platform, city }) {
    // Try AI-powered assessment
    const aiResult = await assessRiskWithAI({ zone, avgDailyHours, avgDailyEarnings, platform, city });

    if (aiResult) {
        return {
            ...aiResult,
            source: 'gemini',
        };
    }

    // Fall back to deterministic
    return calculateRisk({ zone, avgDailyHours, avgDailyEarnings, platform });
}
