// ============================
// FlexCover AI — Advanced Fraud Detection Module
// ============================

/**
 * Calculates distance between two coordinates in km
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Advanced Fraud Detection Engine
 * @param {Object} claim - The claim being checked
 * @param {Array} allClaims - Database of existing claims
 * @param {Object} worker - Worker profile
 * @param {Array} activeTriggers - Records of actual disruption events
 */
export function checkFraud(claim, allClaims, worker, activeTriggers = []) {
    let anomalyScore = 0;
    const flags = [];

    // --- 1. GPS SPOOFING DETECTION: Geospatial Validation ---
    // Validate if the reported GPS coordinates match the disruption zone
    if (claim.lat && claim.lng && claim.zoneLat && claim.zoneLng) {
        const distanceKm = getDistance(claim.lat, claim.lng, claim.zoneLat, claim.zoneLng);
        
        if (distanceKm > 15) { // If worker is > 15km from the event epicenter
            anomalyScore += 65;
            flags.push(`GPS Spoofing Suspected: Reported location is ${distanceKm.toFixed(1)}km away from the disruption zone`);
        } else if (distanceKm > 8) {
            anomalyScore += 30;
            flags.push(`Location Anomaly: Worker was on the periphery of the affected zone (${distanceKm.toFixed(1)}km)`);
        }
    }

    // --- 2. HISTORICAL EVIDENCE: Disruption Verification ---
    // Check if a real system disruption was logged for this city/type at the time of claim
    const actualDisruption = activeTriggers.find(t => 
        t.type === claim.triggerType && 
        t.city === claim.city &&
        (!t.resolved || Math.abs(new Date(t.timestamp) - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000)
    );

    if (!actualDisruption) {
        anomalyScore += 55;
        flags.push('No Historical Evidence: System records do not show a disruption event matching this claim');
    }

    // --- 3. CROSS-PLATFORM COLLUSION: Delivery "Double-Dipping" ---
    // Check if the same worker is claiming income loss for the SAME time from multiple platforms
    const overlappingClaims = allClaims.filter(c => 
        c.workerId === claim.workerId &&
        c.id !== claim.id &&
        Math.abs(new Date(c.createdAt) - new Date(claim.createdAt)) < 4 * 60 * 60 * 1000 && // within 4 hours
        c.platform !== claim.platform
    );

    if (overlappingClaims.length > 0) {
        anomalyScore += 50;
        flags.push(`Multi-Platform Collision: Duplicate claim found on ${overlappingClaims[0].platform} for matching hours`);
    }

    // --- 4. DEVICE & NETWORK CLUSTERING (Fraud Rings) ---
    if (claim.ipAddress && claim.deviceId) {
        const clusterClaims = allClaims.filter(c => 
            c.workerId !== claim.workerId &&
            Math.abs(new Date(c.createdAt) - new Date(claim.createdAt)) < 60 * 60 * 1000 && // within 1 hour
            (c.ipAddress === claim.ipAddress || c.deviceId === claim.deviceId)
        );

        if (clusterClaims.length >= 2) {
            anomalyScore += 45;
            flags.push(`Fraud Ring Suspected: ${clusterClaims.length + 1} workers shared identical IP/Device within 1hr window`);
        }
    }

    // --- 5. REPUTATION & LOYALTY ---
    if (worker && worker.joinedAt) {
        const accountAgeDays = (new Date() - new Date(worker.joinedAt)) / (1000 * 60 * 60 * 24);
        if (accountAgeDays > 180) {
            anomalyScore -= 15; // Trust discount for veterans
            flags.push('Reputation Discount: Verified active worker for >6 months');
        } else if (accountAgeDays < 2) {
            anomalyScore += 25; // Penalty for brand new "burner" accounts
            flags.push('New Account Profile: High-risk creation window before event');
        }
    }

    // Normalize and Thresholding
    anomalyScore = Math.max(0, Math.min(100, anomalyScore));

    let verdict = 'clean';
    if (anomalyScore >= 60) verdict = 'flagged';
    else if (anomalyScore >= 25) verdict = 'under_review';

    return {
        claimId: claim.id,
        workerId: claim.workerId,
        workerName: claim.workerName,
        anomalyScore,
        verdict,
        flags: flags.length ? flags : ['No anomalies detected. Parametric verification passed.'],
        checkedAt: new Date().toISOString(),
    };
}
