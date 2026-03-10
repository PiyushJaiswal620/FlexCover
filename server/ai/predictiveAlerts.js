// ============================
// GigGuard AI — Predictive Risk Alerts
// ============================
import { CITIES } from '../data/mockData.js';

// Generate 24-48hr weather forecast per city zone
export function generateForecasts() {
    const forecasts = [];
    const now = new Date();

    Object.entries(CITIES).forEach(([cityKey, city]) => {
        city.zones.forEach(zone => {
            // Tomorrow forecast
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowRainfall = zone.avgRainfall * (0.5 + Math.random());
            const tomorrowTemp = 25 + Math.random() * 22; // 25-47°C
            const tomorrowAQI = zone.avgAQI * (0.7 + Math.random() * 0.6);

            const alerts = [];
            if (tomorrowRainfall > 50) alerts.push({ type: 'heavy_rain', message: `Heavy rainfall (${Math.round(tomorrowRainfall)}mm) predicted`, severity: 'high' });
            if (tomorrowTemp > 45) alerts.push({ type: 'extreme_heat', message: `Extreme heat (${Math.round(tomorrowTemp)}°C) expected`, severity: 'high' });
            if (tomorrowAQI > 350) alerts.push({ type: 'high_aqi', message: `Dangerous AQI levels (${Math.round(tomorrowAQI)}) forecast`, severity: 'high' });
            if (tomorrowRainfall > 30 && tomorrowRainfall <= 50) alerts.push({ type: 'moderate_rain', message: `Moderate rain (${Math.round(tomorrowRainfall)}mm) expected`, severity: 'medium' });
            if (tomorrowAQI > 200 && tomorrowAQI <= 350) alerts.push({ type: 'moderate_aqi', message: `Elevated AQI (${Math.round(tomorrowAQI)}) expected`, severity: 'medium' });

            forecasts.push({
                city: city.name,
                zone: zone.name,
                zoneId: zone.id,
                date: tomorrow.toISOString().split('T')[0],
                period: '24h',
                weather: {
                    rainfall_mm: Math.round(tomorrowRainfall),
                    temperature_c: Math.round(tomorrowTemp),
                    humidity: 50 + Math.floor(Math.random() * 40),
                    wind_kmh: 5 + Math.floor(Math.random() * 30),
                    aqi: Math.round(tomorrowAQI),
                },
                alerts,
                riskLevel: alerts.some(a => a.severity === 'high') ? 'high'
                    : alerts.some(a => a.severity === 'medium') ? 'medium' : 'low',
                workerMessage: alerts.length > 0
                    ? `⚠️ ${alerts[0].message} in ${zone.name}, ${city.name}. Coverage recommended.`
                    : `✅ Normal conditions expected in ${zone.name}, ${city.name}. Safe to work.`
            });
        });
    });

    return forecasts;
}

// Get forecasts filtered by severity
export function getHighRiskForecasts() {
    return generateForecasts().filter(f => f.riskLevel === 'high' || f.riskLevel === 'medium');
}
