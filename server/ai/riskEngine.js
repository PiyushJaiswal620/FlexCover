// ============================
// GigGuard AI — AI Risk Assessment Engine
// ============================

// Calculates weekly premium dynamically based on multiple risk factors
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

    // Calculate weekly premium tier
    let weeklyPremium, riskCategory;
    if (riskScore >= 65) {
        weeklyPremium = 40;
        riskCategory = 'high';
    } else if (riskScore >= 35) {
        weeklyPremium = 25;
        riskCategory = 'medium';
    } else {
        weeklyPremium = 15;
        riskCategory = 'low';
    }

    // Coverage limit = 80% of expected weekly earnings
    const coverageLimit = Math.round(avgDailyEarnings * 7 * 0.8);

    return {
        riskScore,
        riskCategory,
        weeklyPremium,
        coverageLimit,
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
