// ============================
// FlexCover — Gemini Claim & Fraud Reasoner
// ============================
import { GoogleGenerativeAI } from '@google/generative-ai';

let model = null;

function init() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;
    try {
        const genAI = new GoogleGenerativeAI(key);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } catch (e) {
        console.warn('⚠️  Gemini Claim Reasoner: init failed:', e.message);
    }
}
init();

/**
 * Explain a triggered claim in plain language (worker-facing).
 */
export async function explainClaim({ claim, trigger, rider, policy }) {
    if (!model) return fallbackClaimExplain(claim, trigger);

    const prompt = `You are FlexCover AI, an income protection assistant for gig delivery workers in India.
A claim has been automatically triggered for a delivery partner. Explain this in simple, friendly language
that a delivery rider could understand (avoid jargon). Use 2-3 sentences max.

Rider: ${rider?.name || 'Unknown'} working for ${rider?.platform || 'a delivery app'} in ${claim.city}, ${claim.zone}.
Disruption Type: ${claim.triggerLabel}
Event: ${trigger?.data?.description || claim.triggerLabel + ' detected in zone'}
Hours affected: ~${claim.lostHours} hours
Estimated income lost: ₹${claim.incomeLoss}
Payout amount: ₹${claim.payoutAmount}
Policy: ${policy?.planName || 'Rain & Heat Protect'} (₹${policy?.weeklyPremium || 45}/week)

Write only the explanation, no JSON, no bullet points. Start with "Your claim was triggered because..."`;

    try {
        const res = await model.generateContent(prompt);
        return res.response.text().trim();
    } catch (e) {
        return fallbackClaimExplain(claim, trigger);
    }
}

/**
 * Explain a fraud flag in plain language (admin-facing).
 */
export async function explainFraud({ claim, fraudResult, rider }) {
    if (!model) return fallbackFraudExplain(fraudResult);

    const prompt = `You are a fraud analyst assistant for FlexCover, an income protection platform.
Explain why this claim was flagged for review in 2-3 clear sentences for an admin reviewer.

Claim ID: ${claim.id}
Rider: ${claim.workerName} (${rider?.platform || 'unknown platform'})
Claim type: ${claim.triggerLabel}
Anomaly Score: ${fraudResult.anomalyScore}/100
Verdict: ${fraudResult.verdict}
Flags: ${fraudResult.flags.join('; ')}

Be factual and concise. Do not speculate. Start with "This claim was flagged because..."`;

    try {
        const res = await model.generateContent(prompt);
        return res.response.text().trim();
    } catch (e) {
        return fallbackFraudExplain(fraudResult);
    }
}

/**
 * AI-powered onboarding welcome + risk summary for a new rider.
 */
export async function generateRiderWelcome({ rider, policy, riskAssessment }) {
    if (!model) return fallbackWelcome(rider, policy);

    const prompt = `You are FlexCover AI. A new gig delivery worker just registered. 
Write a 2-sentence friendly welcome message that mentions their risk level, weekly premium, and max payout.
Include their name and delivery platform.

Name: ${rider.name}
Platform: ${rider.platform}
City: ${rider.city}, Zone: ${rider.zone?.name || rider.zone}
Risk Score: ${riskAssessment?.riskScore || policy?.riskScore || 50}/100
Risk Category: ${riskAssessment?.riskCategory || 'medium'}
Weekly Premium: ₹${policy?.weeklyPremium || 45}
Max Payout: ₹${policy?.coverageLimit || 2800}/week

Write only the welcome message, no JSON. Be warm and reassuring.`;

    try {
        const res = await model.generateContent(prompt);
        return res.response.text().trim();
    } catch (e) {
        return fallbackWelcome(rider, policy);
    }
}

// ── Deterministic fallbacks ──────────────────────────────────────────────────

function fallbackClaimExplain(claim, trigger) {
    return `Your claim was triggered because ${claim.triggerLabel.toLowerCase()} was detected in ${claim.city}, ${claim.zone}. Based on the disruption data and your policy, you are eligible for a payout of ₹${claim.payoutAmount} for approximately ${claim.lostHours} hours of lost income. Please confirm below to receive the amount on your UPI account.`;
}

function fallbackFraudExplain(fraudResult) {
    const topFlag = fraudResult.flags?.[0] || 'anomaly detected in claim pattern';
    return `This claim was flagged because ${topFlag.toLowerCase()}. The anomaly score is ${fraudResult.anomalyScore}/100, which triggered a ${fraudResult.verdict} status. Please review the claim manually before processing the payout.`;
}

function fallbackWelcome(rider, policy) {
    return `Welcome to FlexCover, ${rider.name}! Your income protection is now active on ${rider.platform} in ${rider.city}, with a weekly premium of ₹${policy?.weeklyPremium || 45} and coverage up to ₹${policy?.coverageLimit || 2800}/week. We'll automatically detect disruptions and suggest claims for you.`;
}
