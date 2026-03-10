// ============================
// GigGuard AI — Fraud Detection Module
// ============================

// Isolation Forest-inspired anomaly scoring
export function checkFraud(claim, allClaims, worker) {
    let anomalyScore = 0;
    const flags = [];

    // 1. Duplicate claim check — same worker, same trigger type, same day
    const sameDayClaims = allClaims.filter(c =>
        c.workerId === claim.workerId &&
        c.triggerType === claim.triggerType &&
        c.id !== claim.id &&
        Math.abs(new Date(c.createdAt) - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000
    );
    if (sameDayClaims.length > 0) {
        anomalyScore += 35;
        flags.push('Duplicate claim detected for same trigger type within 24hrs');
    }

    // 2. Abnormal claim frequency — more than 5 claims in last 7 days
    const recentClaims = allClaims.filter(c =>
        c.workerId === claim.workerId &&
        new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (recentClaims.length > 5) {
        anomalyScore += 25;
        flags.push(`Abnormally high claim frequency: ${recentClaims.length} claims in 7 days`);
    }

    // 3. Payout amount anomaly — significantly higher than average
    const avgPayout = allClaims.reduce((sum, c) => sum + c.payoutAmount, 0) / Math.max(allClaims.length, 1);
    if (claim.payoutAmount > avgPayout * 2.5) {
        anomalyScore += 20;
        flags.push(`Payout amount ₹${claim.payoutAmount} is ${(claim.payoutAmount / avgPayout).toFixed(1)}x the average`);
    }

    // 4. GPS spoofing indicator — worker registered in zone but claim from far zone
    // (Simulated: if claim zone doesn't match worker's registered zone)
    if (claim.zone && worker.zone && claim.zone !== worker.zone.name) {
        anomalyScore += 15;
        flags.push('Location mismatch: claim zone differs from registered zone');
    }

    // 5. Fake inactivity pattern — claims only during disruptions, never active otherwise
    const claimDays = new Set(allClaims.filter(c => c.workerId === claim.workerId).map(c =>
        new Date(c.createdAt).toDateString()
    ));
    if (claimDays.size >= 4 && recentClaims.length === claimDays.size) {
        anomalyScore += 15;
        flags.push('Suspicious pattern: activity only observed during disruption events');
    }

    // Normalize to 0-100
    anomalyScore = Math.min(100, anomalyScore);

    const verdict = anomalyScore >= 50 ? 'flagged' : anomalyScore >= 25 ? 'review' : 'clean';

    return {
        claimId: claim.id,
        workerId: claim.workerId,
        workerName: claim.workerName,
        anomalyScore,
        verdict,
        flags,
        checkedAt: new Date().toISOString(),
    };
}
