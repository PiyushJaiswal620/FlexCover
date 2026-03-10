// ============================
// GigGuard AI — Parametric Trigger Engine
// ============================
import { randomUUID } from 'crypto';

// Trigger thresholds
const THRESHOLDS = {
    heavy_rain: { param: 'rainfall_mm', threshold: 50, unit: 'mm', label: 'Heavy Rainfall (>50mm)' },
    extreme_heat: { param: 'temperature_c', threshold: 45, unit: '°C', label: 'Extreme Heat (>45°C)' },
    high_aqi: { param: 'aqi', threshold: 350, unit: 'AQI', label: 'High AQI (>350)' },
    curfew: { param: 'curfew', threshold: 1, unit: '', label: 'Local Curfew Alert' },
    platform_outage: { param: 'outage', threshold: 1, unit: '', label: 'Platform Downtime' },
};

export function getThresholds() {
    return THRESHOLDS;
}

// Simulate disruption event data
export function generateDisruptionData(type, city) {
    const config = THRESHOLDS[type];
    if (!config) return null;

    const simulated = {};
    switch (type) {
        case 'heavy_rain':
            simulated.rainfall_mm = 55 + Math.floor(Math.random() * 80); // 55-135mm
            simulated.description = `Rainfall of ${simulated.rainfall_mm}mm detected in ${city}`;
            break;
        case 'extreme_heat':
            simulated.temperature_c = 46 + Math.floor(Math.random() * 6); // 46-52°C
            simulated.description = `Temperature of ${simulated.temperature_c}°C recorded in ${city}`;
            break;
        case 'high_aqi':
            simulated.aqi = 360 + Math.floor(Math.random() * 140); // 360-500
            simulated.description = `AQI level of ${simulated.aqi} detected in ${city}`;
            break;
        case 'curfew':
            simulated.curfew = 1;
            simulated.description = `Local curfew imposed in ${city} area`;
            break;
        case 'platform_outage':
            simulated.outage = 1;
            simulated.platform = ['Zomato', 'Swiggy', 'Zepto'][Math.floor(Math.random() * 3)];
            simulated.description = `${simulated.platform} platform outage detected in ${city}`;
            break;
    }

    return {
        id: randomUUID(),
        type,
        label: config.label,
        city,
        data: simulated,
        triggeredAt: new Date().toISOString(),
        resolved: false,
    };
}

// Process claims for affected workers
export function processTriggeredClaims(disruption, workers, policies) {
    const affectedWorkers = workers.filter(w =>
        w.city === disruption.city && w.isActive
    );

    const claims = affectedWorkers.map(w => {
        const policy = policies.find(p => p.workerId === w.id && p.status === 'active');
        if (!policy) return null;

        const lostHours = 3 + Math.floor(Math.random() * 5); // 3-7 hours lost
        const hourlyRate = w.avgDailyEarnings / w.avgDailyHours;
        const expectedEarnings = Math.round(lostHours * hourlyRate);
        const actualEarnings = 0;
        const incomeLoss = expectedEarnings - actualEarnings;
        const payoutAmount = Math.min(incomeLoss, Math.round(policy.coverageLimit / 7));

        return {
            id: randomUUID(),
            workerId: w.id,
            workerName: w.name,
            policyId: policy.id,
            disruptionId: disruption.id,
            triggerType: disruption.type,
            triggerLabel: disruption.label,
            city: w.city,
            zone: w.zone.name,
            lostHours,
            expectedEarnings,
            actualEarnings,
            incomeLoss,
            payoutAmount,
            status: 'approved',
            createdAt: new Date().toISOString(),
            processedAt: new Date(Date.now() + 30000).toISOString(),
        };
    }).filter(Boolean);

    return claims;
}
