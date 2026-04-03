// ============================
// FlexCover Phase 2 — Full Express Backend
// ============================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

import { store, CITIES, PLATFORMS, PLANS, CLAIM_TYPES, AUTOMATION_RULES } from './data/mockData.js';
import { calculateRisk, assessRisk } from './ai/riskEngine.js';
import { generatePolicy, renewPolicy, DISRUPTION_TRIGGERS, POLICY_TERMS } from './ai/policyGenerator.js';
import { generateDisruptionData, processTriggeredClaims, getThresholds } from './ai/triggerEngine.js';
import { checkFraud } from './ai/fraudDetector.js';
import { generateForecasts, getHighRiskForecasts } from './ai/predictiveAlerts.js';
import { explainClaim, explainFraud, generateRiderWelcome } from './ai/geminiClaimReasoner.js';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function logEvent(type, message, severity = 'info') {
    const entry = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        message,
        severity,
        timestamp: new Date().toISOString(),
    };
    store.eventLog.unshift(entry);
    if (store.eventLog.length > 200) store.eventLog.splice(200);
    return entry;
}

// ═══════════════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════════════

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

app.get('/api/plans', (req, res) => {
    res.json({ plans: PLANS });
});

// ═══════════════════════════════════════════════════════════════════════════
// RIDERS (formerly Workers)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/riders', (req, res) => {
    const { city, platform } = req.query;
    let riders = store.workers;
    if (city) riders = riders.filter(w => w.city.toLowerCase() === city.toLowerCase());
    if (platform) riders = riders.filter(w => w.platform === platform);
    res.json({ riders, total: riders.length });
});

// Also keep /api/workers for backward-compat
app.get('/api/workers', (req, res) => {
    const { city, platform } = req.query;
    let workers = store.workers;
    if (city) workers = workers.filter(w => w.city.toLowerCase() === city.toLowerCase());
    if (platform) workers = workers.filter(w => w.platform === platform);
    res.json({ workers, total: workers.length });
});

app.get('/api/riders/:id', (req, res) => {
    const rider = store.workers.find(w => w.id === req.params.id);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    const policy = store.policies.find(p => p.workerId === rider.id || p.riderId === rider.id);
    const claims = store.claims.filter(c => c.workerId === rider.id || c.riderId === rider.id);
    res.json({ rider, policy, claims });
});

app.post('/api/riders', async (req, res) => {
    const {
        name, phone, email, platform, city, zoneId,
        avgDailyHours, avgDailyEarnings, avgWeeklyEarnings,
        language, vehicleType, upiId, consentAutoMonitor,
    } = req.body;

    if (!name || !city || !platform) {
        return res.status(400).json({ error: 'name, city, and platform are required' });
    }

    const cityData = Object.values(CITIES).find(c => c.name.toLowerCase() === city.toLowerCase());
    if (!cityData) return res.status(400).json({ error: `City "${city}" not found` });

    const zone = zoneId
        ? cityData.zones.find(z => z.id === zoneId)
        : cityData.zones[0];

    if (!zone) return res.status(400).json({ error: 'Zone not found' });

    const dailyEarnings = avgDailyEarnings || (avgWeeklyEarnings ? Math.round(avgWeeklyEarnings / 7) : 600);
    const dailyHours = Number(avgDailyHours) || 8;

    const rider = {
        id: randomUUID(),
        name: name.trim(),
        phone: phone || '',
        email: email || '',
        platform,
        city: cityData.name,
        zone,
        language: language || 'Hindi',
        vehicleType: vehicleType || 'Bike',
        upiId: upiId || '',
        avgDailyHours: dailyHours,
        avgDailyEarnings: dailyEarnings,
        avgWeeklyEarnings: dailyEarnings * 7,
        consentAutoMonitor: consentAutoMonitor !== false,
        joinedAt: new Date().toISOString(),
        isActive: true,
        ipAddress: req.ip || '127.0.0.1',
        deviceId: `DEV-${randomUUID().slice(0, 8).toUpperCase()}`,
        payoutAccountId: upiId || `UPI-${phone || Math.random().toString().slice(2, 12)}`,
    };

    store.workers.push(rider);
    logEvent('rider', `New rider registered: ${rider.name} (${rider.platform}, ${rider.city})`, 'info');

    // AI-powered risk assessment
    const risk = await assessRisk({
        zone,
        avgDailyHours: dailyHours,
        avgDailyEarnings: dailyEarnings,
        platform,
        city: cityData.name,
    });

    res.status(201).json({ rider, riskAssessment: risk });
});

// ═══════════════════════════════════════════════════════════════════════════
// POLICIES
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/policies', (req, res) => {
    res.json({ policies: store.policies, total: store.policies.length });
});

app.get('/api/policies/rider/:riderId', (req, res) => {
    const policy = store.policies.find(
        p => p.workerId === req.params.riderId || p.riderId === req.params.riderId
    );
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
});

// Legacy route
app.get('/api/policies/:workerId', (req, res) => {
    // Avoid conflict with :workerId matching "calculate"
    if (req.params.workerId === 'calculate') return;
    const policy = store.policies.find(
        p => p.workerId === req.params.workerId || p.riderId === req.params.workerId
    );
    if (!policy) return res.status(404).json({ error: 'Policy not found for rider' });
    res.json(policy);
});

// Create/activate a policy for a rider + plan
app.post('/api/policies', async (req, res) => {
    const { riderId, planId } = req.body;
    if (!riderId || !planId) return res.status(400).json({ error: 'riderId and planId required' });

    const rider = store.workers.find(w => w.id === riderId);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ error: `Plan "${planId}" not found` });

    const risk = await assessRisk({
        zone: rider.zone,
        avgDailyHours: rider.avgDailyHours,
        avgDailyEarnings: rider.avgDailyEarnings,
        platform: rider.platform,
        city: rider.city,
    });

    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const policy = {
        id: `policy-${riderId}`,
        riderId,
        workerId: riderId,          // backward-compat
        riderName: rider.name,
        workerName: rider.name,
        planId: plan.id,
        planName: plan.name,
        planEmoji: plan.emoji || '🛡️',
        city: rider.city,
        zone: rider.zone.name,
        zoneId: rider.zone.id,
        riskScore: risk.riskScore,
        riskCategory: risk.riskCategory,
        riskSource: risk.source,
        riskReasoning: risk.reasoning || null,
        weeklyPremium: Math.max(plan.basePremium, risk.weeklyPremium),
        dailyPremiumEquivalent: Math.round((Math.max(plan.basePremium, risk.weeklyPremium) / 7) * 100) / 100,
        coverageLimit: plan.maxPayout || risk.coverageLimit,
        maxPayout: plan.maxPayout || risk.coverageLimit,
        maxPayoutPerEvent: Math.round(rider.avgDailyEarnings * 0.8),
        coverageHours: plan.coverageHours || 35,
        coveredDisruptions: plan.coveredDisruptions || [],
        disruptions: DISRUPTION_TRIGGERS,
        terms: POLICY_TERMS,
        coverageDuration: '7 days',
        autoRenewal: true,
        autoTrigger: true,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        nextRenewalDate: endDate.toISOString(),
        premiumDueDate: new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: now.toISOString(),
        lastPremiumPaid: now.toISOString(),
    };

    // Replace existing or add
    const idx = store.policies.findIndex(p => p.workerId === riderId || p.riderId === riderId);
    if (idx >= 0) store.policies[idx] = policy;
    else store.policies.push(policy);

    logEvent('policy', `Policy activated for ${rider.name}: ${plan.name} @ ₹${policy.weeklyPremium}/wk`, 'info');

    // Generate AI welcome message
    let welcomeMessage = null;
    try {
        welcomeMessage = await generateRiderWelcome({ rider, policy, riskAssessment: risk });
    } catch (e) { /* optional */ }

    res.status(201).json({ policy, riskAssessment: risk, welcomeMessage });
});

// Pause / Resume / Cancel policy
app.patch('/api/policies/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['active', 'paused', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'status must be active, paused, or cancelled' });
    }
    const policy = store.policies.find(p => p.id === req.params.id || p.riderId === req.params.id || p.workerId === req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    policy.status = status;
    policy.updatedAt = new Date().toISOString();
    logEvent('policy', `Policy ${policy.id} status changed to ${status}`, 'info');
    res.json(policy);
});

// Renew policy
app.post('/api/policies/:id/renew', (req, res) => {
    const idx = store.policies.findIndex(p => p.id === req.params.id || p.workerId === req.params.id || p.riderId === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Policy not found' });
    const renewed = renewPolicy(store.policies[idx]);
    store.policies[idx] = renewed;
    logEvent('policy', `Policy auto-renewed for ${renewed.riderName || renewed.workerName}`, 'info');
    res.json({ policy: renewed, message: 'Policy renewed for 7 days' });
});

// Premium calculator (no policy created)
app.post('/api/policies/calculate', async (req, res) => {
    const { city, zoneId, avgDailyHours, avgDailyEarnings, platform } = req.body;
    const cityData = Object.values(CITIES).find(c => c.name.toLowerCase() === city?.toLowerCase());
    if (!cityData) return res.status(400).json({ error: 'City not found' });
    const zone = zoneId ? cityData.zones.find(z => z.id === zoneId) : cityData.zones[0];
    if (!zone) return res.status(400).json({ error: 'Zone not found' });
    const result = await assessRisk({
        zone,
        avgDailyHours: Number(avgDailyHours) || 8,
        avgDailyEarnings: Number(avgDailyEarnings) || 600,
        platform: platform || 'Unknown',
        city: cityData.name,
    });
    res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/risk/assess', async (req, res) => {
    const { city, zoneId, avgDailyHours, avgDailyEarnings, platform } = req.body;
    if (!city) return res.status(400).json({ error: 'city is required' });
    const cityData = Object.values(CITIES).find(c => c.name.toLowerCase() === city.toLowerCase());
    if (!cityData) return res.status(400).json({ error: 'City not found' });
    const zone = zoneId ? cityData.zones.find(z => z.id === zoneId) : cityData.zones[0];
    if (!zone) return res.status(400).json({ error: 'Zone not found' });

    const result = await assessRisk({
        zone,
        avgDailyHours: Number(avgDailyHours) || 8,
        avgDailyEarnings: Number(avgDailyEarnings) || 600,
        platform: platform || 'Unknown',
        city: cityData.name,
    });

    res.json({
        assessment: result,
        zone: { name: zone.name, riskLevel: zone.riskLevel, floodProne: zone.floodProne, avgRainfall: zone.avgRainfall, avgAQI: zone.avgAQI },
        worker: { city: cityData.name, platform: platform || 'Unknown', avgDailyHours: Number(avgDailyHours) || 8, avgDailyEarnings: Number(avgDailyEarnings) || 600 },
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// CLAIMS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/claims', (req, res) => {
    const { status, riderId, workerId } = req.query;
    let claims = store.claims;
    const rId = riderId || workerId;
    if (rId) claims = claims.filter(c => c.workerId === rId || c.riderId === rId);
    if (status) claims = claims.filter(c => c.status === status);
    res.json({
        claims,
        total: claims.length,
        totalPayout: claims.filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status))
            .reduce((s, c) => s + c.payoutAmount, 0),
    });
});

app.get('/api/claims/:id', (req, res) => {
    const claim = store.claims.find(c => c.id === req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
});

app.post('/api/claims', (req, res) => {
    const { riderId, policyId, triggerType, city, zone, lostHours, incomeLoss, payoutAmount, status } = req.body;
    const rider = store.workers.find(w => w.id === riderId);
    const claimType = store.claimTypes?.find(ct => ct.id === triggerType);

    const claim = {
        id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        riderId,
        workerId: riderId,
        riderName: rider?.name || 'Unknown',
        workerName: rider?.name || 'Unknown',
        policyId,
        triggerType,
        triggerLabel: claimType?.label || triggerType,
        city: city || rider?.city || 'Unknown',
        zone: zone || rider?.zone?.name || 'Unknown',
        lostHours: Number(lostHours) || 3,
        incomeLoss: Number(incomeLoss) || 300,
        payoutAmount: Number(payoutAmount) || 240,
        status: status || 'submitted',
        createdAt: new Date().toISOString(),
        processedAt: null,
    };

    // Fraud check on submission
    const fraudResult = checkFraud(claim, store.claims, rider);
    if (fraudResult.anomalyScore >= 60) {
        claim.status = 'flagged';
        claim.fraudScore = fraudResult.anomalyScore;
        claim.fraudFlags = fraudResult.flags;
        store.fraudAlerts.push({ ...fraudResult, claimId: claim.id });
        logEvent('fraud', `Claim ${claim.id} flagged — score ${fraudResult.anomalyScore}`, 'high');
    } else if (fraudResult.anomalyScore >= 25) {
        claim.status = 'under_review';
        claim.fraudScore = fraudResult.anomalyScore;
        claim.fraudFlags = fraudResult.flags;
        logEvent('fraud', `Claim ${claim.id} under review — score ${fraudResult.anomalyScore}`, 'medium');
    }

    store.claims.unshift(claim);
    logEvent('claim', `New claim submitted: ${claim.triggerLabel} by ${claim.riderName}`, 'info');
    res.status(201).json({ claim, fraudCheck: fraudResult });
});

// Update claim status (1-tap confirm, admin approve/reject)
app.patch('/api/claims/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['submitted', 'under_review', 'auto_approved', 'approved', 'rejected', 'paid', 'suggested'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Use: ${validStatuses.join(', ')}` });
    }

    const claim = store.claims.find(c => c.id === req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const prev = claim.status;
    claim.status = status;
    if (['approved', 'auto_approved', 'paid'].includes(status)) {
        claim.processedAt = new Date().toISOString();
    }

    logEvent('claim', `Claim ${claim.id} status: ${prev} → ${status}`, 'info');

    // Auto generate UPI payment if approved
    let payment = null;
    if (status === 'paid' || status === 'auto_approved') {
        payment = {
            id: randomUUID(),
            claimId: claim.id,
            riderId: claim.riderId || claim.workerId,
            riderName: claim.riderName || claim.workerName,
            amount: claim.payoutAmount,
            method: 'UPI',
            status: 'completed',
            transactionId: `FC${Date.now()}${Math.floor(Math.random() * 9999)}`,
            processedAt: new Date().toISOString(),
        };
        store.payments.push(payment);
        logEvent('payout', `Payout ₹${payment.amount} processed for ${payment.riderName} — TxID: ${payment.transactionId}`, 'info');
    }

    res.json({ claim, payment });
});

// AI explanation for a claim
app.get('/api/claims/:id/explain', async (req, res) => {
    const claim = store.claims.find(c => c.id === req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const rider = store.workers.find(w => w.id === (claim.riderId || claim.workerId));
    const policy = store.policies.find(p => p.id === claim.policyId || p.workerId === (claim.riderId || claim.workerId));
    const trigger = store.triggers?.find(t => t.type === claim.triggerType);

    const explanation = await explainClaim({ claim, trigger, rider, policy });
    res.json({ explanation, claimId: claim.id });
});

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERS (Parametric Disruptions)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/triggers', (req, res) => {
    const { city, resolved } = req.query;
    let triggers = store.triggers;
    if (city) triggers = triggers.filter(t => t.city === city);
    if (resolved !== undefined) triggers = triggers.filter(t => t.resolved === (resolved === 'true'));
    res.json({ triggers, total: triggers.length, active: store.triggers.filter(t => !t.resolved).length });
});

app.get('/api/triggers/thresholds', (req, res) => {
    res.json(getThresholds());
});

// Simulate / fire a trigger
app.post('/api/triggers/simulate', (req, res) => {
    const { type, city } = req.body;
    if (!type || !city) return res.status(400).json({ error: 'type and city are required' });

    const disruption = generateDisruptionData(type, city);
    if (!disruption) return res.status(400).json({ error: `Invalid trigger type: ${type}` });

    // Map to store trigger format
    const trigger = {
        ...disruption,
        zone: disruption.city,
        severity: disruption.data?.rainfall_mm > 80 || disruption.data?.temperature_c > 48 || disruption.data?.aqi > 450 ? 'high' : 'medium',
        description: disruption.data?.description || disruption.label,
        value: Object.values(disruption.data || {}).filter(v => typeof v !== 'string').map(String).join(', '),
        threshold: getThresholds()[type]?.threshold || '—',
        affectedRiders: 0,
        resolved: false,
    };

    store.triggers.unshift(trigger);
    store.disruptions.push(disruption);

    // Process auto-claims for affected riders
    const newClaims = processTriggeredClaims(disruption, store.workers, store.policies);
    const affected = newClaims.length;
    trigger.affectedRiders = affected;

    // Fraud check + store claims
    const fraudResults = [];
    newClaims.forEach(c => {
        const rider = store.workers.find(w => w.id === c.workerId);
        const fraudResult = checkFraud(c, store.claims, rider);
        c.riderId = c.workerId;
        c.riderName = c.workerName;

        if (fraudResult.anomalyScore >= 60) {
            c.status = 'flagged';
            c.fraudScore = fraudResult.anomalyScore;
            c.fraudFlags = fraudResult.flags;
            store.fraudAlerts.push({ ...fraudResult, claimId: c.id });
        } else {
            c.status = 'suggested';
        }
        fraudResults.push(fraudResult);
    });

    store.claims.unshift(...newClaims);

    // Auto payments for clean claims
    const payments = newClaims.filter(c => c.status === 'suggested').map(c => ({
        id: randomUUID(),
        claimId: c.id,
        riderId: c.workerId,
        riderName: c.workerName,
        amount: c.payoutAmount,
        method: 'UPI',
        status: 'pending_confirmation',
        transactionId: `FC${Date.now()}${Math.floor(Math.random() * 9999)}`,
        processedAt: null,
    }));
    store.payments.push(...payments);

    // Log events
    logEvent('trigger', `${trigger.description} — ${city}`, trigger.severity);
    if (newClaims.length > 0) {
        logEvent('premium', `Premium recalculated for ${affected} riders in ${city}`, 'info');
        logEvent('claim', `Auto-claims suggested for ${newClaims.filter(c => c.status === 'suggested').length} riders in ${city}`, 'medium');
    }
    const flagged = newClaims.filter(c => c.status === 'flagged').length;
    if (flagged > 0) {
        logEvent('fraud', `${flagged} claims flagged for review in ${city}`, 'high');
    }
    if (payments.length > 0) {
        logEvent('payout', `Payout pipeline initiated — ₹${payments.reduce((s, p) => s + p.amount, 0)} total for ${payments.length} riders`, 'info');
    }

    res.json({
        trigger,
        disruption,
        affectedRiders: affected,
        newClaims,
        fraudResults,
        payments,
        totalPayout: newClaims.reduce((s, c) => s + c.payoutAmount, 0),
    });
});

// Resolve a trigger
app.patch('/api/triggers/:id/resolve', (req, res) => {
    const trigger = store.triggers.find(t => t.id === req.params.id);
    if (!trigger) return res.status(404).json({ error: 'Trigger not found' });
    trigger.resolved = true;
    trigger.resolvedAt = new Date().toISOString();
    res.json(trigger);
});

// ═══════════════════════════════════════════════════════════════════════════
// FRAUD
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/fraud/alerts', (req, res) => {
    res.json({ alerts: store.fraudAlerts, total: store.fraudAlerts.length });
});

app.post('/api/fraud/check/:claimId', (req, res) => {
    const claim = store.claims.find(c => c.id === req.params.claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    const worker = store.workers.find(w => w.id === (claim.workerId || claim.riderId));
    const result = checkFraud(claim, store.claims, worker);
    res.json(result);
});

// AI explanation for a fraud flag
app.get('/api/fraud/explain/:claimId', async (req, res) => {
    const claim = store.claims.find(c => c.id === req.params.claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    const rider = store.workers.find(w => w.id === (claim.workerId || claim.riderId));
    const fraudResult = {
        anomalyScore: claim.fraudScore || 0,
        verdict: claim.status,
        flags: claim.fraudFlags || ['No flags recorded'],
    };
    const explanation = await explainFraud({ claim, fraudResult, rider });
    res.json({ explanation, claimId: claim.id, fraudResult });
});

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/payments', (req, res) => {
    res.json({ payments: store.payments, total: store.payments.length });
});

app.get('/api/payments/:claimId', (req, res) => {
    const payment = store.payments.find(p => p.claimId === req.params.claimId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/automation/rules', (req, res) => {
    res.json({ rules: AUTOMATION_RULES, total: AUTOMATION_RULES.length });
});

app.get('/api/automation/events', (req, res) => {
    const { limit = 50 } = req.query;
    const events = store.eventLog.slice(0, Number(limit));
    res.json({ events, total: store.eventLog.length });
});

// Toggle a rule on/off
app.patch('/api/automation/rules/:id', (req, res) => {
    const { status } = req.body;
    const rule = AUTOMATION_RULES.find(r => r.id === Number(req.params.id));
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    rule.status = status === 'active' ? 'active' : 'paused';
    logEvent('policy', `Automation rule "${rule.name}" set to ${rule.status}`, 'info');
    res.json(rule);
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/analytics/summary', (req, res) => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const weekClaims = store.claims.filter(c => new Date(c.createdAt) >= weekAgo);
    const weekPayout = weekClaims
        .filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status))
        .reduce((s, c) => s + c.payoutAmount, 0);

    // Risk by city
    const riskByCity = {};
    Object.values(CITIES).forEach(city => {
        const cityRiders = store.workers.filter(w => w.city === city.name);
        const cityPolicies = store.policies.filter(p => p.city === city.name);
        const avgRisk = cityPolicies.length
            ? Math.round(cityPolicies.reduce((s, p) => s + p.riskScore, 0) / cityPolicies.length)
            : 0;
        riskByCity[city.name] = {
            riders: cityRiders.length,
            policies: cityPolicies.length,
            avgRiskScore: avgRisk,
            zones: city.zones.map(z => ({ name: z.name, riskLevel: z.riskLevel, floodProne: z.floodProne })),
        };
    });

    // Weekly payout trend (last 8 weeks)
    const weeklyPayouts = Array.from({ length: 8 }, (_, i) => {
        const start = new Date(now - (8 - i) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now - (7 - i) * 7 * 24 * 60 * 60 * 1000);
        const wc = store.claims.filter(c => new Date(c.createdAt) >= start && new Date(c.createdAt) < end);
        return {
            week: `W${i + 1}`,
            payout: wc.filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status)).reduce((s, c) => s + c.payoutAmount, 0),
            claims: wc.length,
        };
    });

    // Platform distribution
    const platformData = {};
    store.workers.forEach(w => { platformData[w.platform] = (platformData[w.platform] || 0) + 1; });

    // Claim type distribution
    const claimsByType = {};
    store.claims.forEach(c => { claimsByType[c.triggerType] = (claimsByType[c.triggerType] || 0) + 1; });

    res.json({
        totalRiders: store.workers.length,
        totalWorkers: store.workers.length,
        activePolicies: store.policies.filter(p => p.status === 'active').length,
        totalClaims: store.claims.length,
        claimsThisWeek: weekClaims.length,
        payoutThisWeek: weekPayout,
        totalPayout: store.claims
            .filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status))
            .reduce((s, c) => s + c.payoutAmount, 0),
        autoApproved: store.claims.filter(c => c.status === 'auto_approved').length,
        fraudAlerts: store.fraudAlerts.length,
        activeDisruptions: store.triggers.filter(t => !t.resolved).length,
        riskByCity,
        weeklyPayouts,
        platformData,
        claimsByType,
        avgWeeklyPremium: store.policies.length
            ? Math.round(store.policies.reduce((s, p) => s + p.weeklyPremium, 0) / store.policies.length)
            : 0,
        platforms: PLATFORMS,
        cities: Object.values(CITIES).map(c => c.name),
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORECASTS & PREDICTIVE ALERTS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/forecasts', (req, res) => {
    const forecasts = generateForecasts();
    res.json({ forecasts, total: forecasts.length });
});

app.get('/api/forecasts/high-risk', (req, res) => {
    const forecasts = getHighRiskForecasts();
    res.json({ forecasts, total: forecasts.length });
});

// ═══════════════════════════════════════════════════════════════════════════
// GEMINI AI ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Explain a claim in plain language
app.post('/api/gemini/claim-reason', async (req, res) => {
    const { claimId } = req.body;
    const claim = store.claims.find(c => c.id === claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    const rider = store.workers.find(w => w.id === (claim.workerId || claim.riderId));
    const policy = store.policies.find(p => p.workerId === rider?.id || p.riderId === rider?.id);
    const trigger = store.triggers.find(t => t.type === claim.triggerType);
    const explanation = await explainClaim({ claim, trigger, rider, policy });
    res.json({ explanation, claimId });
});

// Explain fraud flag in plain language
app.post('/api/gemini/fraud-explain', async (req, res) => {
    const { claimId } = req.body;
    const claim = store.claims.find(c => c.id === claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    const rider = store.workers.find(w => w.id === (claim.workerId || claim.riderId));
    const fraudResult = {
        anomalyScore: claim.fraudScore || 0,
        verdict: claim.status,
        flags: claim.fraudFlags || [],
    };
    const explanation = await explainFraud({ claim, fraudResult, rider });
    res.json({ explanation, claimId, fraudResult });
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        riders: store.workers.length,
        policies: store.policies.length,
        claims: store.claims.length,
        triggers: store.triggers.length,
        gemini: !!process.env.GEMINI_API_KEY,
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('\n🛡️  FlexCover Phase 2 Backend');
        console.log(`   Running on http://localhost:${PORT}`);
        console.log(`   Riders: ${store.workers.length} | Policies: ${store.policies.length} | Claims: ${store.claims.length}`);
        console.log(`   Triggers: ${store.triggers.length} | Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ enabled' : '⚠️  disabled (fallback)'}`);
        console.log(`\n   API Endpoints:`);
        console.log(`   GET  /api/health`);
        console.log(`   GET  /api/riders | POST /api/riders`);
        console.log(`   POST /api/policies | PATCH /api/policies/:id/status`);
        console.log(`   GET  /api/claims | POST /api/claims | PATCH /api/claims/:id/status`);
        console.log(`   GET  /api/triggers | POST /api/triggers/simulate`);
        console.log(`   GET  /api/automation/rules | GET /api/automation/events`);
        console.log(`   GET  /api/analytics/summary`);
        console.log(`   POST /api/risk/assess`);
        console.log(`   GET  /api/fraud/alerts`);
        console.log(`   POST /api/gemini/claim-reason | POST /api/gemini/fraud-explain\n`);
    });
}

export default app;
