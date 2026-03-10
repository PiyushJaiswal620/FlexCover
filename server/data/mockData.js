// ============================
// GigGuard AI — Mock Data Store
// ============================
import { randomUUID } from 'crypto';

// Indian cities with zone risk profiles
export const CITIES = {
    mumbai: {
        name: 'Mumbai', state: 'Maharashtra',
        zones: [
            { id: 'mum-andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, riskLevel: 'high', floodProne: true, avgRainfall: 85, avgAQI: 130 },
            { id: 'mum-bandra', name: 'Bandra', lat: 19.0596, lng: 72.8295, riskLevel: 'medium', floodProne: false, avgRainfall: 60, avgAQI: 110 },
            { id: 'mum-dadar', name: 'Dadar', lat: 19.0178, lng: 72.8478, riskLevel: 'high', floodProne: true, avgRainfall: 78, avgAQI: 145 },
            { id: 'mum-colaba', name: 'Colaba', lat: 18.9067, lng: 72.8147, riskLevel: 'low', floodProne: false, avgRainfall: 40, avgAQI: 85 },
        ]
    },
    delhi: {
        name: 'Delhi', state: 'NCR',
        zones: [
            { id: 'del-cp', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, riskLevel: 'medium', floodProne: false, avgRainfall: 30, avgAQI: 280 },
            { id: 'del-dwarka', name: 'Dwarka', lat: 28.5921, lng: 77.0460, riskLevel: 'high', floodProne: true, avgRainfall: 45, avgAQI: 340 },
            { id: 'del-rohini', name: 'Rohini', lat: 28.7495, lng: 77.0565, riskLevel: 'high', floodProne: false, avgRainfall: 35, avgAQI: 360 },
            { id: 'del-saket', name: 'Saket', lat: 28.5245, lng: 77.2066, riskLevel: 'low', floodProne: false, avgRainfall: 28, avgAQI: 190 },
        ]
    },
    bangalore: {
        name: 'Bengaluru', state: 'Karnataka',
        zones: [
            { id: 'blr-koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245, riskLevel: 'medium', floodProne: true, avgRainfall: 55, avgAQI: 90 },
            { id: 'blr-whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500, riskLevel: 'medium', floodProne: true, avgRainfall: 50, avgAQI: 85 },
            { id: 'blr-indiranagar', name: 'Indiranagar', lat: 12.9784, lng: 77.6408, riskLevel: 'low', floodProne: false, avgRainfall: 35, avgAQI: 75 },
        ]
    },
    chennai: {
        name: 'Chennai', state: 'Tamil Nadu',
        zones: [
            { id: 'chn-tnagar', name: 'T. Nagar', lat: 13.0418, lng: 80.2341, riskLevel: 'high', floodProne: true, avgRainfall: 90, avgAQI: 110 },
            { id: 'chn-adyar', name: 'Adyar', lat: 13.0067, lng: 80.2572, riskLevel: 'medium', floodProne: true, avgRainfall: 70, avgAQI: 95 },
            { id: 'chn-anna', name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, riskLevel: 'low', floodProne: false, avgRainfall: 40, avgAQI: 80 },
        ]
    },
    hyderabad: {
        name: 'Hyderabad', state: 'Telangana',
        zones: [
            { id: 'hyd-hitec', name: 'HITEC City', lat: 17.4435, lng: 78.3772, riskLevel: 'low', floodProne: false, avgRainfall: 25, avgAQI: 100 },
            { id: 'hyd-secunderabad', name: 'Secunderabad', lat: 17.4399, lng: 78.4983, riskLevel: 'medium', floodProne: true, avgRainfall: 45, avgAQI: 120 },
            { id: 'hyd-lb', name: 'LB Nagar', lat: 17.3457, lng: 78.5522, riskLevel: 'medium', floodProne: false, avgRainfall: 40, avgAQI: 135 },
        ]
    }
};

export const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Amazon', 'Blinkit', 'BigBasket', 'Dunzo'];

// Seed workers
const workerNames = [
    'Rajesh Kumar', 'Amit Sharma', 'Priya Patel', 'Suresh Yadav', 'Kavita Singh',
    'Mohammed Irfan', 'Deepak Verma', 'Anita Nair', 'Ravi Shankar', 'Pooja Reddy',
    'Vikram Joshi', 'Sunita Das', 'Arjun Mishra', 'Lakshmi Iyer', 'Kiran Rao',
    'Manish Gupta', 'Sneha Menon', 'Rahul Tiwari'
];

const allZones = Object.values(CITIES).flatMap(c => c.zones);

function generateWorkers() {
    return workerNames.map((name, i) => {
        const zone = allZones[i % allZones.length];
        const city = Object.values(CITIES).find(c => c.zones.includes(zone));
        const platform = PLATFORMS[i % PLATFORMS.length];
        const avgHours = 6 + Math.floor(Math.random() * 6); // 6-11 hrs
        const avgEarnings = 400 + Math.floor(Math.random() * 600); // ₹400-1000/day

        return {
            id: randomUUID(),
            name,
            phone: `+91 ${9000000000 + i * 1111111}`,
            email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
            platform,
            city: city.name,
            zone: zone,
            avgDailyHours: avgHours,
            avgDailyEarnings: avgEarnings,
            joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
        };
    });
}

// In-memory store
export const store = {
    workers: generateWorkers(),
    policies: [],
    claims: [],
    disruptions: [],
    fraudAlerts: [],
    payments: [],
};

// Generate policies for all seed workers
store.workers.forEach(w => {
    const zone = w.zone;
    const riskScore = zone.riskLevel === 'high' ? 0.75 + Math.random() * 0.2
        : zone.riskLevel === 'medium' ? 0.4 + Math.random() * 0.2
            : 0.1 + Math.random() * 0.2;

    const weeklyPremium = zone.riskLevel === 'high' ? 40
        : zone.riskLevel === 'medium' ? 25 : 15;

    const coverageLimit = w.avgDailyEarnings * 7 * 0.8; // 80% of weekly expected earnings

    store.policies.push({
        id: randomUUID(),
        workerId: w.id,
        workerName: w.name,
        city: w.city,
        zone: zone.name,
        zoneId: zone.id,
        riskScore: parseFloat(riskScore.toFixed(2)),
        weeklyPremium,
        coverageLimit: Math.round(coverageLimit),
        status: 'active',
        startDate: w.joinedAt,
        lastPremiumPaid: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
});

// Generate some historical claims
const triggerTypes = ['heavy_rain', 'extreme_heat', 'high_aqi', 'curfew', 'platform_outage'];
const triggerLabels = {
    heavy_rain: 'Heavy Rainfall (>50mm)',
    extreme_heat: 'Extreme Heat (>45°C)',
    high_aqi: 'High AQI (>350)',
    curfew: 'Local Curfew Alert',
    platform_outage: 'Platform Downtime',
};

for (let i = 0; i < 25; i++) {
    const worker = store.workers[i % store.workers.length];
    const policy = store.policies.find(p => p.workerId === worker.id);
    const trigger = triggerTypes[i % triggerTypes.length];
    const lostHours = 2 + Math.floor(Math.random() * 6);
    const hourlyRate = worker.avgDailyEarnings / worker.avgDailyHours;
    const incomeLoss = Math.round(lostHours * hourlyRate);
    const payout = Math.min(incomeLoss, policy.coverageLimit / 7);

    const claimDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);

    store.claims.push({
        id: randomUUID(),
        workerId: worker.id,
        workerName: worker.name,
        policyId: policy.id,
        triggerType: trigger,
        triggerLabel: triggerLabels[trigger],
        city: worker.city,
        zone: worker.zone.name,
        lostHours,
        expectedEarnings: Math.round(lostHours * hourlyRate),
        actualEarnings: 0,
        incomeLoss,
        payoutAmount: Math.round(payout),
        status: Math.random() > 0.15 ? 'approved' : 'flagged',
        createdAt: claimDate.toISOString(),
        processedAt: new Date(claimDate.getTime() + 60000).toISOString(),
    });
}

// Sort claims by date descending
store.claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
