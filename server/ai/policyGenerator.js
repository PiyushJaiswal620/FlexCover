// ============================
// FlexCover — Weekly Insurance Policy Generator
// ============================
import { randomUUID } from 'crypto';

/**
 * All disruption triggers that FlexCover covers.
 * Each trigger has a threshold that, when crossed, auto-activates a claim.
 */
const DISRUPTION_TRIGGERS = [
    {
        id: 'heavy_rain',
        label: 'Heavy Rainfall',
        description: 'Rainfall exceeding 50mm in the worker\'s delivery zone',
        threshold: '>50mm rainfall',
        category: 'weather',
    },
    {
        id: 'extreme_heat',
        label: 'Extreme Heat',
        description: 'Temperature exceeding 45°C in the worker\'s city',
        threshold: '>45°C temperature',
        category: 'weather',
    },
    {
        id: 'high_aqi',
        label: 'Hazardous Air Quality',
        description: 'AQI exceeding 350 in the worker\'s zone',
        threshold: '>350 AQI',
        category: 'environment',
    },
    {
        id: 'platform_outage',
        label: 'Platform Outage',
        description: 'Delivery platform downtime exceeding 30 minutes',
        threshold: '>30min downtime',
        category: 'platform',
    },
    {
        id: 'curfew',
        label: 'Local Curfew / Emergency',
        description: 'Government-imposed curfew or emergency alert in the zone',
        threshold: 'Official curfew order',
        category: 'civic',
    },
];

/**
 * Policy terms and exclusions.
 */
const POLICY_TERMS = {
    coverageType: 'Income Loss Protection',
    coversDuration: '7 days (weekly rolling)',
    autoRenewal: true,
    renewalDay: 'Every Monday at 00:00 IST',
    exclusions: [
        'Health or medical expenses',
        'Vehicle damage or repair costs',
        'Personal accidents or injuries',
        'Loss of personal belongings',
        'Voluntary non-working days',
        'Disruptions outside registered delivery zone',
    ],
    inclusions: [
        'Income loss due to weather disruptions',
        'Income loss due to platform outages',
        'Income loss due to air quality emergencies',
        'Income loss due to government-imposed curfews',
        'Income loss due to city emergency alerts',
    ],
    claimProcess: 'Automatic — no paperwork required. Claims are triggered by sensor data and paid within 60 seconds.',
    paymentMethod: 'UPI direct transfer to registered wallet',
};

/**
 * Generate a complete weekly insurance policy from a risk assessment.
 *
 * @param {object} params
 * @param {string} params.workerId
 * @param {string} params.workerName
 * @param {string} params.city
 * @param {object} params.zone - Zone object with name, id, riskLevel, floodProne, etc.
 * @param {object} params.risk - Output from assessRisk() or calculateRisk()
 * @param {number} params.avgDailyEarnings
 * @param {number} params.avgDailyHours
 * @param {string} params.platform
 * @returns {object} Complete policy document
 */
export function generatePolicy({
    workerId, workerName, city, zone,
    risk, avgDailyEarnings, avgDailyHours, platform,
}) {
    const now = new Date();
    const startDate = now.toISOString();

    // Policy expires in 7 days
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Max payout per event = one day's expected earnings
    const maxPayoutPerEvent = Math.round(avgDailyEarnings * 0.8);

    // Weekly coverage limit from risk assessment
    const weeklyMaxPayout = risk.coverageLimit;

    // Determine which triggers apply based on zone characteristics
    const activeTriggers = DISRUPTION_TRIGGERS.map(trigger => {
        let applicable = true;
        let relevance = 'standard';

        // Mark extra-relevant triggers for this zone
        if (trigger.id === 'heavy_rain' && zone.floodProne) {
            relevance = 'high — flood-prone zone';
        } else if (trigger.id === 'heavy_rain' && zone.avgRainfall > 60) {
            relevance = 'high — heavy rainfall area';
        } else if (trigger.id === 'high_aqi' && zone.avgAQI > 200) {
            relevance = 'high — poor air quality area';
        } else if (trigger.id === 'extreme_heat' && zone.avgAQI > 250) {
            relevance = 'elevated — heat + pollution compound risk';
        }

        return {
            ...trigger,
            applicable,
            relevance,
        };
    });

    const policy = {
        // Identity
        id: randomUUID(),
        policyNumber: `FC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randomUUID().split('-')[0].toUpperCase()}`,
        workerId,
        workerName,

        // Location
        city,
        zone: zone.name,
        zoneId: zone.id,

        // Risk assessment
        riskScore: risk.riskScore,
        riskCategory: risk.riskCategory,
        riskSource: risk.source || 'deterministic',
        riskReasoning: risk.reasoning || null,

        // Premium & coverage
        weeklyPremium: risk.weeklyPremium,
        dailyPremiumEquivalent: Math.round((risk.weeklyPremium / 7) * 100) / 100,
        hourlyPremiumEquivalent: Math.round((risk.weeklyPremium / (7 * avgDailyHours)) * 100) / 100,
        coverageLimit: weeklyMaxPayout,
        maxPayoutPerEvent,
        maxEventsPerWeek: Math.floor(weeklyMaxPayout / maxPayoutPerEvent),

        // Duration
        coverageDuration: '7 days',
        startDate,
        endDate,
        autoRenewal: true,
        nextRenewalDate: endDate,

        // What's covered
        disruptions: activeTriggers,

        // Terms
        terms: {
            ...POLICY_TERMS,
            workerProfile: {
                platform,
                avgDailyHours,
                avgDailyEarnings,
                expectedWeeklyEarnings: avgDailyEarnings * 7,
            },
        },

        // Status
        status: 'active',
        createdAt: startDate,
        lastPremiumPaid: startDate,
    };

    return policy;
}

/**
 * Renew an existing policy — recalculates dates, keeps the same risk profile.
 */
export function renewPolicy(existingPolicy) {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        ...existingPolicy,
        startDate: now.toISOString(),
        endDate,
        nextRenewalDate: endDate,
        lastPremiumPaid: now.toISOString(),
        status: 'active',
    };
}

export { DISRUPTION_TRIGGERS, POLICY_TERMS };
