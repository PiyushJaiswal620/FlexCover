// ============================
// FlexCover — Centralized API Client
// All backend calls go through here.
// Falls back gracefully to client-side store if backend is unavailable.
// ============================

const BASE = '/api';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

async function request(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    let res;
    try {
        res = await fetch(`${BASE}${path}`, opts);
    } catch (err) {
        throw new ApiError(`Network error: ${err.message}`, 0);
    }

    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const d = await res.json(); msg = d.error || msg; } catch (_) {}
        throw new ApiError(msg, res.status);
    }

    return res.json();
}

const get  = (path)         => request('GET',    path);
const post = (path, body)   => request('POST',   path, body);
const patch = (path, body)  => request('PATCH',  path, body);
const del  = (path)         => request('DELETE', path);

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════════════════
export const health = () => get('/health');

// ═══════════════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════════════
export const getCities      = ()  => get('/cities');
export const getPlatforms   = ()  => get('/platforms');
export const getPlans       = ()  => get('/plans');

// ═══════════════════════════════════════════════════════════════════════════
// RIDERS
// ═══════════════════════════════════════════════════════════════════════════
export const getRiders   = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/riders${q ? '?' + q : ''}`);
};
export const getRider      = (id) => get(`/riders/${id}`);
export const createRider   = (data) => post('/riders', data);

// ═══════════════════════════════════════════════════════════════════════════
// POLICIES
// ═══════════════════════════════════════════════════════════════════════════
export const getPolicies      = ()          => get('/policies');
export const getPolicyByRider = (riderId)   => get(`/policies/rider/${riderId}`);
export const createPolicy     = (data)      => post('/policies', data);
export const updatePolicyStatus = (id, status) => patch(`/policies/${id}/status`, { status });
export const renewPolicy      = (id)        => post(`/policies/${id}/renew`, {});
export const calculatePremium = (data)      => post('/policies/calculate', data);

// ═══════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════
export const assessRisk = (data) => post('/risk/assess', data);

// ═══════════════════════════════════════════════════════════════════════════
// CLAIMS
// ═══════════════════════════════════════════════════════════════════════════
export const getClaims = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/claims${q ? '?' + q : ''}`);
};
export const getClaim         = (id)        => get(`/claims/${id}`);
export const createClaim      = (data)      => post('/claims', data);
export const updateClaimStatus = (id, status) => patch(`/claims/${id}/status`, { status });
export const explainClaim     = (id)        => get(`/claims/${id}/explain`);

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════
export const getTriggers       = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/triggers${q ? '?' + q : ''}`);
};
export const getThresholds     = ()             => get('/triggers/thresholds');
export const simulateTrigger   = (type, city)   => post('/triggers/simulate', { type, city });
export const resolveTrigger    = (id)           => patch(`/triggers/${id}/resolve`, {});

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATION
// ═══════════════════════════════════════════════════════════════════════════
export const getAutomationRules  = ()           => get('/automation/rules');
export const getAutomationEvents = (limit = 50) => get(`/automation/events?limit=${limit}`);
export const toggleAutomationRule = (id, status) => patch(`/automation/rules/${id}`, { status });

// ═══════════════════════════════════════════════════════════════════════════
// FRAUD
// ═══════════════════════════════════════════════════════════════════════════
export const getFraudAlerts   = ()      => get('/fraud/alerts');
export const checkFraud       = (id)    => post(`/fraud/check/${id}`, {});
export const explainFraud     = (id)    => get(`/fraud/explain/${id}`);

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════
export const getPayments      = ()      => get('/payments');
export const getPayment       = (id)    => get(`/payments/${id}`);

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
export const getAnalyticsSummary = () => get('/analytics/summary');

// ═══════════════════════════════════════════════════════════════════════════
// FORECASTS
// ═══════════════════════════════════════════════════════════════════════════
export const getForecasts     = ()      => get('/forecasts');
export const getHighRiskForecasts = ()  => get('/forecasts/high-risk');

// ═══════════════════════════════════════════════════════════════════════════
// GEMINI AI
// ═══════════════════════════════════════════════════════════════════════════
export const geminiClaimReason  = (claimId) => post('/gemini/claim-reason', { claimId });
export const geminiFraudExplain = (claimId) => post('/gemini/fraud-explain', { claimId });

// ═══════════════════════════════════════════════════════════════════════════
// BACKEND STATUS
// ═══════════════════════════════════════════════════════════════════════════

let _backendAvailable = null;

/**
 * Returns true if backend is reachable, false otherwise.
 * Caches the result for 30 seconds.
 */
export async function isBackendAvailable() {
    if (_backendAvailable !== null) return _backendAvailable;
    try {
        await health();
        _backendAvailable = true;
    } catch (_) {
        _backendAvailable = false;
    }
    // Reset cache every 30s
    setTimeout(() => { _backendAvailable = null; }, 30000);
    return _backendAvailable;
}

export default {
    health, getCities, getPlatforms, getPlans,
    getRiders, getRider, createRider,
    getPolicies, getPolicyByRider, createPolicy, updatePolicyStatus, renewPolicy, calculatePremium,
    assessRisk,
    getClaims, getClaim, createClaim, updateClaimStatus, explainClaim,
    getTriggers, getThresholds, simulateTrigger, resolveTrigger,
    getAutomationRules, getAutomationEvents, toggleAutomationRule,
    getFraudAlerts, checkFraud, explainFraud,
    getPayments, getPayment,
    getAnalyticsSummary,
    getForecasts, getHighRiskForecasts,
    geminiClaimReason, geminiFraudExplain,
    isBackendAvailable,
};
