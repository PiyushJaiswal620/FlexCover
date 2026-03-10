// ============================
// GigGuard AI — Express Backend Server
// ============================
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { store, CITIES, PLATFORMS } from './data/mockData.js';
import { calculateRisk } from './ai/riskEngine.js';
import { generateDisruptionData, processTriggeredClaims, getThresholds } from './ai/triggerEngine.js';
import { checkFraud } from './ai/fraudDetector.js';
import { generateForecasts, getHighRiskForecasts } from './ai/predictiveAlerts.js';

const app = express();
app.use(cors());
app.use(express.json());

// ============ WORKERS ============
app.get('/api/workers', (req, res) => {
    const { city, platform } = req.query;
    let workers = store.workers;
    if (city) workers = workers.filter(w => w.city.toLowerCase() === city.toLowerCase());
    if (platform) workers = workers.filter(w => w.platform === platform);
    res.json({ workers, total: workers.length });
});

app.get('/api/workers/:id', (req, res) => {
    const worker = store.workers.find(w => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    const policy = store.policies.find(p => p.workerId === worker.id);
    const claims = store.claims.filter(c => c.workerId === worker.id);
    res.json({ worker, policy, claims });
});

app.post('/api/workers', (req, res) => {
    const { name, phone, email, platform, city, zoneId, avgDailyHours, avgDailyEarnings } = req.body;

    // Find zone
    const cityData = Object.values(CITIES).find(c => c.name.toLowerCase() === city.toLowerCase());
    if (!cityData) return res.status(400).json({ error: 'City not found' });

    const zone = zoneId
        ? cityData.zones.find(z => z.id === zoneId)
        : cityData.zones[0];

    if (!zone) return res.status(400).json({ error: 'Zone not found' });

    const worker = {
        id: randomUUID(),
        name, phone, email, platform,
        city: cityData.name,
        zone,
        avgDailyHours: Number(avgDailyHours) || 8,
        avgDailyEarnings: Number(avgDailyEarnings) || 600,
        joinedAt: new Date().toISOString(),
        isActive: true,
    };

    store.workers.push(worker);

    // Auto-generate policy via AI risk engine
    const risk = calculateRisk({
        zone, avgDailyHours: worker.avgDailyHours,
        avgDailyEarnings: worker.avgDailyEarnings,
        platform: worker.platform
    });

    const policy = {
        id: randomUUID(),
        workerId: worker.id,
        workerName: worker.name,
        city: worker.city,
        zone: zone.name,
        zoneId: zone.id,
        riskScore: risk.riskScore,
        weeklyPremium: risk.weeklyPremium,
        coverageLimit: risk.coverageLimit,
        riskCategory: risk.riskCategory,
        status: 'active',
        startDate: worker.joinedAt,
        lastPremiumPaid: worker.joinedAt,
    };

    store.policies.push(policy);

    res.status(201).json({ worker, policy, riskAssessment: risk });
});

// ============ POLICIES ============
app.get('/api/policies', (req, res) => {
    res.json({ policies: store.policies, total: store.policies.length });
});

app.get('/api/policies/:workerId', (req, res) => {
    const policy = store.policies.find(p => p.workerId === req.params.workerId);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
});

app.post('/api/policies/calculate', (req, res) => {
    const { city, zoneId, avgDailyHours, avgDailyEarnings, platform } = req.body;
    const cityData = Object.values(CITIES).find(c => c.name.toLowerCase() === city.toLowerCase());
    if (!cityData) return res.status(400).json({ error: 'City not found' });

    const zone = zoneId ? cityData.zones.find(z => z.id === zoneId) : cityData.zones[0];
    if (!zone) return res.status(400).json({ error: 'Zone not found' });

    const result = calculateRisk({ zone, avgDailyHours, avgDailyEarnings, platform });
    res.json(result);
});

// ============ CLAIMS ============
app.get('/api/claims', (req, res) => {
    const { status, workerId } = req.query;
    let claims = store.claims;
    if (status) claims = claims.filter(c => c.status === status);
    if (workerId) claims = claims.filter(c => c.workerId === workerId);
    res.json({
        claims,
        total: claims.length,
        totalPayout: claims.reduce((s, c) => s + c.payoutAmount, 0)
    });
});

app.get('/api/claims/:workerId', (req, res) => {
    const claims = store.claims.filter(c => c.workerId === req.params.workerId);
    res.json({ claims, total: claims.length });
});

// ============ DISRUPTIONS ============
app.get('/api/disruptions', (req, res) => {
    res.json({ disruptions: store.disruptions, total: store.disruptions.length });
});

app.get('/api/disruptions/thresholds', (req, res) => {
    res.json(getThresholds());
});

app.post('/api/disruptions/simulate', (req, res) => {
    const { type, city } = req.body;
    if (!type || !city) return res.status(400).json({ error: 'type and city required' });

    // Generate disruption event
    const disruption = generateDisruptionData(type, city);
    if (!disruption) return res.status(400).json({ error: 'Invalid disruption type' });

    store.disruptions.push(disruption);

    // Process claims for affected workers
    const newClaims = processTriggeredClaims(disruption, store.workers, store.policies);
    store.claims.unshift(...newClaims);

    // Run fraud checks on new claims
    const fraudResults = newClaims.map(c => {
        const worker = store.workers.find(w => w.id === c.workerId);
        const result = checkFraud(c, store.claims, worker);
        if (result.verdict !== 'clean') {
            store.fraudAlerts.push(result);
            c.status = 'flagged';
        }
        return result;
    });

    // Generate mock payments for approved claims
    const payments = newClaims.filter(c => c.status === 'approved').map(c => ({
        id: randomUUID(),
        claimId: c.id,
        workerId: c.workerId,
        workerName: c.workerName,
        amount: c.payoutAmount,
        method: 'UPI',
        upiId: `${c.workerName.toLowerCase().replace(' ', '')}@upi`,
        status: 'completed',
        transactionId: `GIGD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        processedAt: new Date().toISOString(),
    }));

    store.payments.push(...payments);

    res.json({
        disruption,
        affectedWorkers: newClaims.length,
        claims: newClaims,
        fraudChecks: fraudResults,
        payments,
        totalPayout: newClaims.reduce((s, c) => s + c.payoutAmount, 0),
    });
});

// ============ FRAUD ============
app.get('/api/fraud/alerts', (req, res) => {
    res.json({ alerts: store.fraudAlerts, total: store.fraudAlerts.length });
});

app.post('/api/fraud/check/:claimId', (req, res) => {
    const claim = store.claims.find(c => c.id === req.params.claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    const worker = store.workers.find(w => w.id === claim.workerId);
    const result = checkFraud(claim, store.claims, worker);
    res.json(result);
});

// ============ PAYMENTS ============
app.get('/api/payments', (req, res) => {
    res.json({ payments: store.payments, total: store.payments.length });
});

app.get('/api/payments/:claimId', (req, res) => {
    const payment = store.payments.find(p => p.claimId === req.params.claimId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
});

// ============ ANALYTICS ============
app.get('/api/analytics/summary', (req, res) => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const weekClaims = store.claims.filter(c => new Date(c.createdAt) >= weekAgo);
    const weekPayout = weekClaims.reduce((s, c) => s + c.payoutAmount, 0);

    // Risk by city
    const riskByCity = {};
    Object.values(CITIES).forEach(city => {
        const cityWorkers = store.workers.filter(w => w.city === city.name);
        const cityPolicies = store.policies.filter(p => p.city === city.name);
        const avgRisk = cityPolicies.reduce((s, p) => s + p.riskScore, 0) / Math.max(cityPolicies.length, 1);
        riskByCity[city.name] = {
            workers: cityWorkers.length,
            policies: cityPolicies.length,
            avgRiskScore: parseFloat(avgRisk.toFixed(1)),
            zones: city.zones.map(z => ({
                name: z.name,
                riskLevel: z.riskLevel,
                floodProne: z.floodProne,
            }))
        };
    });

    // Weekly payout chart data (last 8 weeks)
    const weeklyPayouts = [];
    for (let i = 7; i >= 0; i--) {
        const start = new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        const payout = store.claims
            .filter(c => new Date(c.createdAt) >= start && new Date(c.createdAt) < end)
            .reduce((s, c) => s + c.payoutAmount, 0);
        weeklyPayouts.push({
            week: `W${8 - i}`,
            payout,
            claims: store.claims.filter(c => new Date(c.createdAt) >= start && new Date(c.createdAt) < end).length,
        });
    }

    res.json({
        totalWorkers: store.workers.length,
        activePolicies: store.policies.filter(p => p.status === 'active').length,
        totalClaims: store.claims.length,
        claimsThisWeek: weekClaims.length,
        payoutThisWeek: weekPayout,
        totalPayout: store.claims.reduce((s, c) => s + c.payoutAmount, 0),
        fraudAlerts: store.fraudAlerts.length,
        activeDisruptions: store.disruptions.filter(d => !d.resolved).length,
        riskByCity,
        weeklyPayouts,
        platforms: PLATFORMS,
        cities: Object.values(CITIES).map(c => c.name),
    });
});

// ============ FORECASTS ============
app.get('/api/forecasts', (req, res) => {
    const forecasts = generateForecasts();
    res.json({ forecasts, total: forecasts.length });
});

app.get('/api/forecasts/high-risk', (req, res) => {
    const forecasts = getHighRiskForecasts();
    res.json({ forecasts, total: forecasts.length });
});

// ============ METADATA ============
app.get('/api/cities', (req, res) => {
    const cities = Object.entries(CITIES).map(([key, city]) => ({
        id: key,
        name: city.name,
        state: city.state,
        zones: city.zones,
    }));
    res.json({ cities });
});

app.get('/api/platforms', (req, res) => {
    res.json({ platforms: PLATFORMS });
});

// Server start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🛡️  GigGuard AI Backend running on http://localhost:${PORT}`);
    console.log(`   Workers: ${store.workers.length}`);
    console.log(`   Policies: ${store.policies.length}`);
    console.log(`   Claims: ${store.claims.length}\n`);
});
