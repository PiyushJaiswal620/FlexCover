// ============================
// FlexCover Phase 2 — Server Data Store
// ============================
import { randomUUID } from 'crypto';

// ─── CITIES & ZONES ─────────────────────────────────────────────────────────
export const CITIES = {
    bhubaneswar: {
        name: 'Bhubaneswar', state: 'Odisha',
        zones: [
            { id: 'bbsr-1', name: 'Saheed Nagar', lat: 20.2961, lng: 85.8245, riskLevel: 'medium', floodProne: true, avgRainfall: 65, avgAQI: 95, avgTemp: 36 },
            { id: 'bbsr-2', name: 'Patia', lat: 20.3555, lng: 85.8189, riskLevel: 'low', floodProne: false, avgRainfall: 45, avgAQI: 80, avgTemp: 34 },
            { id: 'bbsr-3', name: 'Rasulgarh', lat: 20.2882, lng: 85.8617, riskLevel: 'high', floodProne: true, avgRainfall: 80, avgAQI: 110, avgTemp: 38 },
        ],
    },
    mumbai: {
        name: 'Mumbai', state: 'Maharashtra',
        zones: [
            { id: 'mum-andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, riskLevel: 'high', floodProne: true, avgRainfall: 85, avgAQI: 130, avgTemp: 35 },
            { id: 'mum-bandra', name: 'Bandra', lat: 19.0596, lng: 72.8295, riskLevel: 'medium', floodProne: false, avgRainfall: 60, avgAQI: 110, avgTemp: 33 },
            { id: 'mum-dadar', name: 'Dadar', lat: 19.0178, lng: 72.8478, riskLevel: 'high', floodProne: true, avgRainfall: 78, avgAQI: 145, avgTemp: 34 },
            { id: 'mum-colaba', name: 'Colaba', lat: 18.9067, lng: 72.8147, riskLevel: 'low', floodProne: false, avgRainfall: 40, avgAQI: 85, avgTemp: 32 },
        ],
    },
    delhi: {
        name: 'Delhi', state: 'NCR',
        zones: [
            { id: 'del-cp', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, riskLevel: 'medium', floodProne: false, avgRainfall: 30, avgAQI: 280, avgTemp: 42 },
            { id: 'del-dwarka', name: 'Dwarka', lat: 28.5921, lng: 77.0460, riskLevel: 'high', floodProne: true, avgRainfall: 45, avgAQI: 340, avgTemp: 44 },
            { id: 'del-rohini', name: 'Rohini', lat: 28.7495, lng: 77.0565, riskLevel: 'high', floodProne: false, avgRainfall: 35, avgAQI: 360, avgTemp: 45 },
            { id: 'del-saket', name: 'Saket', lat: 28.5245, lng: 77.2066, riskLevel: 'low', floodProne: false, avgRainfall: 28, avgAQI: 190, avgTemp: 40 },
        ],
    },
    bengaluru: {
        name: 'Bengaluru', state: 'Karnataka',
        zones: [
            { id: 'blr-koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245, riskLevel: 'medium', floodProne: true, avgRainfall: 55, avgAQI: 90, avgTemp: 32 },
            { id: 'blr-whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500, riskLevel: 'medium', floodProne: true, avgRainfall: 50, avgAQI: 85, avgTemp: 31 },
            { id: 'blr-indiranagar', name: 'Indiranagar', lat: 12.9784, lng: 77.6408, riskLevel: 'low', floodProne: false, avgRainfall: 35, avgAQI: 75, avgTemp: 30 },
        ],
    },
    chennai: {
        name: 'Chennai', state: 'Tamil Nadu',
        zones: [
            { id: 'chn-tnagar', name: 'T. Nagar', lat: 13.0418, lng: 80.2341, riskLevel: 'high', floodProne: true, avgRainfall: 90, avgAQI: 110, avgTemp: 38 },
            { id: 'chn-adyar', name: 'Adyar', lat: 13.0067, lng: 80.2572, riskLevel: 'medium', floodProne: true, avgRainfall: 70, avgAQI: 95, avgTemp: 36 },
            { id: 'chn-anna', name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, riskLevel: 'low', floodProne: false, avgRainfall: 40, avgAQI: 80, avgTemp: 34 },
        ],
    },
};

export const PLATFORMS = ['Swiggy', 'Zomato', 'Zepto', 'Blinkit', 'Instamart', 'Amazon', 'BigBasket'];

// ─── INSURANCE PLANS ────────────────────────────────────────────────────────
export const PLANS = [
    {
        id: 'lite',
        name: 'Lite Weekly Shield',
        emoji: '🛡️',
        basePremium: 29,
        maxPayout: 1500,
        coverageHours: 20,
        coveredDisruptions: ['Heavy Rain', 'Platform Outage'],
        claimRules: 'Max 2 claims/week. 2hr minimum disruption.',
        autoTrigger: true,
        color: '#6366f1',
        popular: false,
        description: 'Basic income protection for occasional disruptions.',
    },
    {
        id: 'weather',
        name: 'Rain & Heat Protect',
        emoji: '🌧️',
        basePremium: 45,
        maxPayout: 2800,
        coverageHours: 35,
        coveredDisruptions: ['Heavy Rain', 'Flooding', 'Heatwave', 'Pollution'],
        claimRules: 'Max 4 claims/week. 1hr minimum disruption.',
        autoTrigger: true,
        color: '#0ea5e9',
        popular: true,
        description: 'Complete weather-related income protection.',
    },
    {
        id: 'full',
        name: 'Full Gig Income Guard',
        emoji: '💪',
        basePremium: 69,
        maxPayout: 4500,
        coverageHours: 56,
        coveredDisruptions: ['Heavy Rain', 'Flooding', 'Heatwave', 'Pollution', 'Zone Closure', 'Platform Outage'],
        claimRules: 'Unlimited claims. No minimum disruption.',
        autoTrigger: true,
        color: '#10b981',
        popular: false,
        description: 'Full-spectrum income protection for all disruption types.',
    },
    {
        id: 'prime',
        name: 'Prime Zone Protection',
        emoji: '👑',
        basePremium: 99,
        maxPayout: 7000,
        coverageHours: 70,
        coveredDisruptions: ['Heavy Rain', 'Flooding', 'Heatwave', 'Pollution', 'Zone Closure', 'Platform Outage', 'Access Disruption'],
        claimRules: 'Unlimited claims. Priority payouts. Dedicated support.',
        autoTrigger: true,
        color: '#f59e0b',
        popular: false,
        description: 'Premium coverage for high-risk delivery zones with priority payouts.',
    },
];

// ─── CLAIM TYPES ────────────────────────────────────────────────────────────
export const CLAIM_TYPES = [
    { id: 'heavy_rain', label: 'Heavy Rain Income Loss', icon: '🌧️', color: '#3b82f6' },
    { id: 'flood', label: 'Flood / Waterlogging Income Loss', icon: '🌊', color: '#0ea5e9' },
    { id: 'heatwave', label: 'Heatwave Work Loss', icon: '🔥', color: '#ef4444' },
    { id: 'pollution', label: 'Pollution Shutdown Income Loss', icon: '💨', color: '#6b7280' },
    { id: 'zone_closure', label: 'Zone Closure / Curfew Income Loss', icon: '🚧', color: '#f59e0b' },
    { id: 'platform_outage', label: 'Platform / App Outage Income Loss', icon: '📱', color: '#8b5cf6' },
    { id: 'access_disruption', label: 'Delivery Access Disruption', icon: '🚫', color: '#dc2626' },
    // Legacy IDs for backward-compat with old server data
    { id: 'extreme_heat', label: 'Extreme Heat Work Loss', icon: '🔥', color: '#ef4444' },
    { id: 'high_aqi', label: 'High AQI Shutdown', icon: '💨', color: '#6b7280' },
    { id: 'curfew', label: 'Curfew / Emergency Loss', icon: '🚧', color: '#f59e0b' },
];

// ─── AUTOMATION RULES ────────────────────────────────────────────────────────
export const AUTOMATION_RULES = [
    { id: 1, name: 'Auto-Claim on Heavy Rain', condition: 'Rainfall > 50mm in delivery zone', action: 'Suggest claim to affected riders', status: 'active', triggers: 47, category: 'weather' },
    { id: 2, name: 'Auto-Claim on Flood Alert', condition: 'Waterlogging Level ≥ 2 reported', action: 'Auto-initiate claim with 1-tap confirm', status: 'active', triggers: 23, category: 'weather' },
    { id: 3, name: 'Heatwave Protection', condition: 'Temperature > 44°C', action: 'Trigger work-loss protection suggestion', status: 'active', triggers: 31, category: 'weather' },
    { id: 4, name: 'AQI Emergency Stop', condition: 'AQI > 300 (Severe)', action: 'Mark delivery unsafe, suggest income claim', status: 'active', triggers: 18, category: 'environment' },
    { id: 5, name: 'Platform Outage Detection', condition: 'App downtime > 1 hour', action: 'Auto-suggest platform outage claim', status: 'active', triggers: 12, category: 'platform' },
    { id: 6, name: 'Premium Recalculation', condition: 'New trigger event detected', action: 'Recalculate premiums for next week', status: 'active', triggers: 89, category: 'premium' },
    { id: 7, name: 'Fraud Pattern Detection', condition: 'Anomaly score > 50%', action: 'Flag claim for manual review', status: 'active', triggers: 7, category: 'fraud' },
    { id: 8, name: 'Auto-Renewal', condition: 'Policy expires in 24h', action: 'Auto-renew weekly policy', status: 'active', triggers: 156, category: 'policy' },
];

// ─── SEED RIDERS ─────────────────────────────────────────────────────────────
const riderDefs = [
    { name: 'Rajesh Kumar', platform: 'Swiggy', city: 'Bhubaneswar', zoneKey: 'bbsr-1', hours: 10, earnings: 800, lang: 'Odia', vehicle: 'Bike' },
    { name: 'Amit Sharma', platform: 'Zomato', city: 'Mumbai', zoneKey: 'mum-andheri', hours: 8, earnings: 685, lang: 'Hindi', vehicle: 'Bike' },
    { name: 'Priya Patel', platform: 'Zepto', city: 'Delhi', zoneKey: 'del-dwarka', hours: 7, earnings: 500, lang: 'Hindi', vehicle: 'EV' },
    { name: 'Suresh Yadav', platform: 'Blinkit', city: 'Delhi', zoneKey: 'del-rohini', hours: 9, earnings: 600, lang: 'Hindi', vehicle: 'Bike' },
    { name: 'Kavita Singh', platform: 'Instamart', city: 'Bengaluru', zoneKey: 'blr-koramangala', hours: 6, earnings: 428, lang: 'Kannada', vehicle: 'Bicycle' },
    { name: 'Mohammed Irfan', platform: 'Swiggy', city: 'Chennai', zoneKey: 'chn-tnagar', hours: 9, earnings: 720, lang: 'Tamil', vehicle: 'Bike' },
    { name: 'Deepak Verma', platform: 'Amazon', city: 'Mumbai', zoneKey: 'mum-dadar', hours: 10, earnings: 750, lang: 'Hindi', vehicle: 'EV' },
    { name: 'Anita Nair', platform: 'Zomato', city: 'Bengaluru', zoneKey: 'blr-whitefield', hours: 7, earnings: 490, lang: 'Kannada', vehicle: 'Bicycle' },
    { name: 'Ravi Shankar', platform: 'BigBasket', city: 'Chennai', zoneKey: 'chn-adyar', hours: 8, earnings: 560, lang: 'Tamil', vehicle: 'Bike' },
    { name: 'Pooja Reddy', platform: 'Zepto', city: 'Bhubaneswar', zoneKey: 'bbsr-3', hours: 6, earnings: 420, lang: 'Odia', vehicle: 'Bicycle' },
];

const allZones = Object.values(CITIES).flatMap(c => c.zones);
const ips = ['192.168.1.10', '192.168.1.15', '203.0.113.45', '198.51.100.2'];
const devices = ['DEV-A1B2', 'DEV-C3D4', 'DEV-E5F6'];

function generateRiders() {
    return riderDefs.map((def, i) => {
        const cityData = Object.values(CITIES).find(c => c.name === def.city);
        const zone = cityData?.zones.find(z => z.id === def.zoneKey) || cityData?.zones[0] || allZones[0];
        return {
            id: `rider-${String(i + 1).padStart(3, '0')}`,
            name: def.name,
            phone: `+91 ${9000000000 + i * 1111111}`,
            email: `${def.name.toLowerCase().replace(/ /g, '.')}@gmail.com`,
            platform: def.platform,
            city: def.city,
            zone,
            language: def.lang,
            vehicleType: def.vehicle,
            upiId: `${def.name.toLowerCase().replace(/ /g, '.')}@paytm`,
            avgDailyHours: def.hours,
            avgDailyEarnings: def.earnings,
            avgWeeklyEarnings: def.earnings * 7,
            consentAutoMonitor: true,
            joinedAt: new Date(Date.now() - (30 + i * 15) * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            ipAddress: ips[i % ips.length],
            deviceId: devices[i % devices.length],
            payoutAccountId: `UPI-${9000000000 + (i % 5) * 1111111}`,
        };
    });
}

// ─── SEED POLICIES ──────────────────────────────────────────────────────────
function generatePolicies(riders) {
    const planOrder = ['weather', 'full', 'weather', 'prime', 'lite', 'weather', 'full', 'lite', 'weather', 'prime'];
    return riders.map((rider, i) => {
        const plan = PLANS.find(p => p.id === planOrder[i % planOrder.length]) || PLANS[1];
        const riskScore = rider.zone.riskLevel === 'high' ? 65 + Math.floor(Math.random() * 20)
            : rider.zone.riskLevel === 'medium' ? 35 + Math.floor(Math.random() * 25)
            : 10 + Math.floor(Math.random() * 20);
        const premium = Math.max(plan.basePremium, Math.round(plan.basePremium * (1 + (riskScore - 50) / 200)));
        const now = Date.now();
        const start = new Date(now - 3 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
            id: `policy-${rider.id}`,
            riderId: rider.id,
            workerId: rider.id,
            riderName: rider.name,
            workerName: rider.name,
            planId: plan.id,
            planName: plan.name,
            planEmoji: plan.emoji,
            city: rider.city,
            zone: rider.zone.name,
            zoneId: rider.zone.id,
            riskScore,
            riskCategory: riskScore >= 65 ? 'high' : riskScore >= 35 ? 'medium' : 'low',
            riskSource: 'deterministic',
            weeklyPremium: premium,
            dailyPremiumEquivalent: Math.round((premium / 7) * 100) / 100,
            coverageLimit: plan.maxPayout,
            maxPayout: plan.maxPayout,
            maxPayoutPerEvent: Math.round(rider.avgDailyEarnings * 0.8),
            coverageHours: plan.coverageHours,
            coveredDisruptions: plan.coveredDisruptions,
            status: 'active',
            autoRenewal: true,
            autoTrigger: true,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            nextRenewalDate: end.toISOString(),
            premiumDueDate: new Date(end.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            createdAt: rider.joinedAt,
            lastPremiumPaid: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        };
    });
}

// ─── SEED CLAIMS ────────────────────────────────────────────────────────────
function generateClaims(riders, policies) {
    const claimDefs = [
        { riderIdx: 1, type: 'heavy_rain', hours: 4, payout: 480, status: 'paid', daysAgo: 3 },
        { riderIdx: 1, type: 'flood', hours: 6, payout: 720, status: 'auto_approved', daysAgo: 1 },
        { riderIdx: 2, type: 'pollution', hours: 5, payout: 350, status: 'paid', daysAgo: 7 },
        { riderIdx: 2, type: 'heatwave', hours: 3, payout: 210, status: 'approved', daysAgo: 2 },
        { riderIdx: 3, type: 'high_aqi', hours: 7, payout: 560, status: 'paid', daysAgo: 5 },
        { riderIdx: 3, type: 'heatwave', hours: 4, payout: 320, status: 'flagged', daysAgo: 0, fraudScore: 65, fraudFlags: ['Duplicate weather event claim', 'Suspicious frequency pattern'] },
        { riderIdx: 0, type: 'heavy_rain', hours: 3, payout: 240, status: 'paid', daysAgo: 10 },
        { riderIdx: 4, type: 'flood', hours: 5, payout: 400, status: 'paid', daysAgo: 14 },
        { riderIdx: 0, type: 'zone_closure', hours: 6, payout: 480, status: 'approved', daysAgo: 4 },
        { riderIdx: 1, type: 'platform_outage', hours: 2, payout: 240, status: 'paid', daysAgo: 20 },
        { riderIdx: 5, type: 'heavy_rain', hours: 5, payout: 450, status: 'paid', daysAgo: 6 },
        { riderIdx: 6, type: 'heatwave', hours: 4, payout: 375, status: 'under_review', daysAgo: 1, fraudScore: 35, fraudFlags: ['Platform Inactive during window'] },
        { riderIdx: 7, type: 'flood', hours: 3, payout: 185, status: 'paid', daysAgo: 8 },
        { riderIdx: 8, type: 'platform_outage', hours: 2, payout: 160, status: 'auto_approved', daysAgo: 2 },
        { riderIdx: 9, type: 'pollution', hours: 6, payout: 315, status: 'paid', daysAgo: 12 },
    ];

    return claimDefs.map((cd, i) => {
        const rider = riders[cd.riderIdx] || riders[0];
        const policy = policies.find(p => p.workerId === rider.id || p.riderId === rider.id);
        const claimType = CLAIM_TYPES.find(ct => ct.id === cd.type);
        const ts = new Date(Date.now() - cd.daysAgo * 24 * 60 * 60 * 1000);
        return {
            id: `claim-${String(i + 1).padStart(3, '0')}`,
            riderId: rider.id,
            workerId: rider.id,
            riderName: rider.name,
            workerName: rider.name,
            policyId: policy?.id || `policy-${rider.id}`,
            triggerType: cd.type,
            triggerLabel: claimType?.label || cd.type,
            city: rider.city,
            zone: rider.zone.name,
            lostHours: cd.hours,
            incomeLoss: cd.payout + 100,
            payoutAmount: cd.payout,
            status: cd.status,
            fraudScore: cd.fraudScore,
            fraudFlags: cd.fraudFlags,
            platformActive: cd.status !== 'flagged',
            ipAddress: rider.ipAddress,
            deviceId: rider.deviceId,
            createdAt: ts.toISOString(),
            processedAt: ['paid', 'approved', 'auto_approved'].includes(cd.status)
                ? new Date(ts.getTime() + 45000).toISOString()
                : null,
        };
    });
}

// ─── SEED TRIGGERS ──────────────────────────────────────────────────────────
function generateTriggers() {
    const now = Date.now();
    return [
        { id: 'trig-seed-001', type: 'heavy_rain', city: 'Mumbai', zone: 'Andheri', severity: 'high', value: '72mm rainfall', threshold: '50mm', description: 'Heavy rainfall detected in Andheri zone. Roads waterlogged.', affectedRiders: 34, resolved: false, timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'trig-seed-002', type: 'flood', city: 'Bhubaneswar', zone: 'Rasulgarh', severity: 'high', value: 'Level 3 flooding', threshold: 'Level 2', description: 'Waterlogging reported in Rasulgarh. Multiple roads blocked.', affectedRiders: 12, resolved: false, timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString() },
        { id: 'trig-seed-003', type: 'heatwave', city: 'Delhi', zone: 'Rohini', severity: 'high', value: '47°C', threshold: '44°C', description: 'Extreme heat warning. Temperature crossed safe delivery threshold.', affectedRiders: 28, resolved: false, timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString() },
        { id: 'trig-seed-004', type: 'high_aqi', city: 'Delhi', zone: 'Dwarka', severity: 'high', value: 'AQI 385', threshold: 'AQI 300', description: 'AQI crossed severe level. Outdoor work conditions unsafe.', affectedRiders: 22, resolved: true, timestamp: new Date(now - 8 * 60 * 60 * 1000).toISOString() },
        { id: 'trig-seed-005', type: 'platform_outage', city: 'Bengaluru', zone: 'Koramangala', severity: 'medium', value: 'Swiggy 2hr downtime', threshold: '1hr', description: 'Swiggy experienced 2-hour outage in Bengaluru.', affectedRiders: 45, resolved: true, timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString() },
        { id: 'trig-seed-006', type: 'zone_closure', city: 'Mumbai', zone: 'Dadar', severity: 'medium', value: 'Market shutdown', threshold: 'Partial closure', description: 'Dadar market area closed due to local event. Delivery routes blocked.', affectedRiders: 18, resolved: false, timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString() },
    ];
}

// ─── SEED EVENT LOG ─────────────────────────────────────────────────────────
function generateEventLog() {
    const now = Date.now();
    return [
        { id: 'evt-seed-001', type: 'trigger', message: 'Rainfall threshold exceeded in Andheri, Mumbai', timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), severity: 'high' },
        { id: 'evt-seed-002', type: 'premium', message: 'Premium recalculated for 34 riders in Mumbai', timestamp: new Date(now - 2 * 60 * 60 * 1000 + 30000).toISOString(), severity: 'info' },
        { id: 'evt-seed-003', type: 'claim', message: 'Auto-claim initiated for Amit Sharma (flood)', timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(), severity: 'medium' },
        { id: 'evt-seed-004', type: 'fraud', message: 'Potential fraud flag raised for claim-seed-006', timestamp: new Date(now - 45 * 60 * 1000).toISOString(), severity: 'high' },
        { id: 'evt-seed-005', type: 'payout', message: 'Payout approved under parametric threshold — ₹720', timestamp: new Date(now - 30 * 60 * 1000).toISOString(), severity: 'info' },
        { id: 'evt-seed-006', type: 'trigger', message: 'Heatwave alert active in Rohini, Delhi (47°C)', timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(), severity: 'high' },
        { id: 'evt-seed-007', type: 'premium', message: 'Weekly premium discount applied for Kavita Singh (-₹3)', timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(), severity: 'info' },
        { id: 'evt-seed-008', type: 'policy', message: 'Policy auto-renewed for Suresh Yadav', timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString(), severity: 'info' },
        { id: 'evt-seed-009', type: 'rider', message: 'New rider registered: Mohammed Irfan (Swiggy, Chennai)', timestamp: new Date(now - 18 * 60 * 60 * 1000).toISOString(), severity: 'info' },
        { id: 'evt-seed-010', type: 'claim', message: 'Claim auto-approved for Ravi Shankar (platform outage)', timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(), severity: 'info' },
    ];
}

// ─── INIT STORE ─────────────────────────────────────────────────────────────
const _riders = generateRiders();
const _policies = generatePolicies(_riders);
const _claims = generateClaims(_riders, _policies);
const _triggers = generateTriggers();
const _eventLog = generateEventLog();

// Seed fraud alerts for flagged claims
const _fraudAlerts = _claims
    .filter(c => c.status === 'flagged' || (c.fraudScore && c.fraudScore >= 60))
    .map(c => ({
        id: `fraud-${c.id}`,
        claimId: c.id,
        workerId: c.workerId,
        workerName: c.workerName,
        anomalyScore: c.fraudScore || 65,
        verdict: 'flagged',
        flags: c.fraudFlags || ['Anomaly detected'],
        checkedAt: c.createdAt,
    }));

export const store = {
    workers: _riders,
    policies: _policies,
    claims: _claims,
    triggers: _triggers,
    disruptions: [],
    fraudAlerts: _fraudAlerts,
    payments: [],
    eventLog: _eventLog,
    claimTypes: CLAIM_TYPES,
};
