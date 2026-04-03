// ============================
// FlexCover Phase 2 — Client-Side Data Store
// ============================

// ─── CITIES & ZONES ───
export const CITIES = {
  bhubaneswar: {
    name: 'Bhubaneswar', state: 'Odisha',
    zones: [
      { id: 'bbsr-1', name: 'Saheed Nagar', lat: 20.2961, lng: 85.8245, riskLevel: 'medium', floodProne: true, avgRainfall: 65, avgAQI: 95, avgTemp: 36 },
      { id: 'bbsr-2', name: 'Patia', lat: 20.3555, lng: 85.8189, riskLevel: 'low', floodProne: false, avgRainfall: 45, avgAQI: 80, avgTemp: 34 },
      { id: 'bbsr-3', name: 'Rasulgarh', lat: 20.2882, lng: 85.8617, riskLevel: 'high', floodProne: true, avgRainfall: 80, avgAQI: 110, avgTemp: 38 },
    ]
  },
  mumbai: {
    name: 'Mumbai', state: 'Maharashtra',
    zones: [
      { id: 'mum-andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, riskLevel: 'high', floodProne: true, avgRainfall: 85, avgAQI: 130, avgTemp: 35 },
      { id: 'mum-bandra', name: 'Bandra', lat: 19.0596, lng: 72.8295, riskLevel: 'medium', floodProne: false, avgRainfall: 60, avgAQI: 110, avgTemp: 33 },
      { id: 'mum-dadar', name: 'Dadar', lat: 19.0178, lng: 72.8478, riskLevel: 'high', floodProne: true, avgRainfall: 78, avgAQI: 145, avgTemp: 34 },
    ]
  },
  delhi: {
    name: 'Delhi', state: 'NCR',
    zones: [
      { id: 'del-cp', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, riskLevel: 'medium', floodProne: false, avgRainfall: 30, avgAQI: 280, avgTemp: 42 },
      { id: 'del-dwarka', name: 'Dwarka', lat: 28.5921, lng: 77.0460, riskLevel: 'high', floodProne: true, avgRainfall: 45, avgAQI: 340, avgTemp: 44 },
      { id: 'del-rohini', name: 'Rohini', lat: 28.7495, lng: 77.0565, riskLevel: 'high', floodProne: false, avgRainfall: 35, avgAQI: 360, avgTemp: 45 },
    ]
  },
  bengaluru: {
    name: 'Bengaluru', state: 'Karnataka',
    zones: [
      { id: 'blr-koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245, riskLevel: 'medium', floodProne: true, avgRainfall: 55, avgAQI: 90, avgTemp: 32 },
      { id: 'blr-whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500, riskLevel: 'medium', floodProne: true, avgRainfall: 50, avgAQI: 85, avgTemp: 31 },
    ]
  },
  chennai: {
    name: 'Chennai', state: 'Tamil Nadu',
    zones: [
      { id: 'chn-tnagar', name: 'T. Nagar', lat: 13.0418, lng: 80.2341, riskLevel: 'high', floodProne: true, avgRainfall: 90, avgAQI: 110, avgTemp: 38 },
      { id: 'chn-adyar', name: 'Adyar', lat: 13.0067, lng: 80.2572, riskLevel: 'medium', floodProne: true, avgRainfall: 70, avgAQI: 95, avgTemp: 36 },
    ]
  },
};

export const PLATFORMS = ['Swiggy', 'Zomato', 'Zepto', 'Blinkit', 'Instamart'];
export const DELIVERY_TYPES = ['Food Delivery', 'Grocery / Quick Commerce'];
export const VEHICLE_TYPES = ['Bike', 'Bicycle', 'EV', 'Walking'];
export const LANGUAGES = ['Hindi', 'English', 'Odia', 'Tamil', 'Kannada', 'Telugu', 'Marathi', 'Bengali'];

// ─── INSURANCE PLANS ───
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

// ─── CLAIM TYPES ───
export const CLAIM_TYPES = [
  { id: 'heavy_rain', label: 'Heavy Rain Income Loss', icon: '🌧️', color: '#3b82f6' },
  { id: 'flood', label: 'Flood / Waterlogging Income Loss', icon: '🌊', color: '#0ea5e9' },
  { id: 'heatwave', label: 'Heatwave Work Loss', icon: '🔥', color: '#ef4444' },
  { id: 'pollution', label: 'Pollution Shutdown Income Loss', icon: '💨', color: '#6b7280' },
  { id: 'zone_closure', label: 'Zone Closure / Curfew Income Loss', icon: '🚧', color: '#f59e0b' },
  { id: 'platform_outage', label: 'Platform / App Outage Income Loss', icon: '📱', color: '#8b5cf6' },
  { id: 'access_disruption', label: 'Delivery Access Disruption', icon: '🚫', color: '#dc2626' },
];

export const CLAIM_STATUSES = ['eligible', 'suggested', 'submitted', 'under_review', 'auto_approved', 'approved', 'rejected', 'paid'];

// ─── SAMPLE RIDERS ───
const SAMPLE_RIDERS = [
  {
    id: 'rider-001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    age: 28,
    gender: 'Male',
    platform: 'Swiggy',
    deliveryType: 'Food Delivery',
    city: 'Bhubaneswar',
    zone: { id: 'bbsr-1', name: 'Saheed Nagar', riskLevel: 'medium', floodProne: true, avgRainfall: 65, avgAQI: 95, avgTemp: 36 },
    language: 'Odia',
    avgDailyHours: 10,
    avgWeeklyEarnings: 5600,
    vehicleType: 'Bike',
    upiId: 'rajesh.kumar@paytm',
    emergencyContact: '+91 98765 00001',
    consentAutoMonitor: true,
    joinedAt: '2025-11-15T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'rider-002',
    name: 'Amit Sharma',
    phone: '+91 87654 32109',
    age: 24,
    gender: 'Male',
    platform: 'Zomato',
    deliveryType: 'Food Delivery',
    city: 'Mumbai',
    zone: { id: 'mum-andheri', name: 'Andheri', riskLevel: 'high', floodProne: true, avgRainfall: 85, avgAQI: 130, avgTemp: 35 },
    language: 'Hindi',
    avgDailyHours: 8,
    avgWeeklyEarnings: 4800,
    vehicleType: 'Bike',
    upiId: 'amit.sharma@gpay',
    emergencyContact: '+91 87654 00002',
    consentAutoMonitor: true,
    joinedAt: '2025-09-20T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'rider-003',
    name: 'Priya Patel',
    phone: '+91 76543 21098',
    age: 26,
    gender: 'Female',
    platform: 'Zepto',
    deliveryType: 'Grocery / Quick Commerce',
    city: 'Delhi',
    zone: { id: 'del-dwarka', name: 'Dwarka', riskLevel: 'high', floodProne: true, avgRainfall: 45, avgAQI: 340, avgTemp: 44 },
    language: 'Hindi',
    avgDailyHours: 7,
    avgWeeklyEarnings: 3500,
    vehicleType: 'EV',
    upiId: 'priya.patel@phonepe',
    emergencyContact: '+91 76543 00003',
    consentAutoMonitor: true,
    joinedAt: '2026-01-10T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'rider-004',
    name: 'Suresh Yadav',
    phone: '+91 65432 10987',
    age: 32,
    gender: 'Male',
    platform: 'Blinkit',
    deliveryType: 'Grocery / Quick Commerce',
    city: 'Delhi',
    zone: { id: 'del-rohini', name: 'Rohini', riskLevel: 'high', floodProne: false, avgRainfall: 35, avgAQI: 360, avgTemp: 45 },
    language: 'Hindi',
    avgDailyHours: 9,
    avgWeeklyEarnings: 4200,
    vehicleType: 'Bike',
    upiId: 'suresh.yadav@paytm',
    emergencyContact: '+91 65432 00004',
    consentAutoMonitor: true,
    joinedAt: '2025-08-05T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'rider-005',
    name: 'Kavita Singh',
    phone: '+91 54321 09876',
    age: 22,
    gender: 'Female',
    platform: 'Instamart',
    deliveryType: 'Grocery / Quick Commerce',
    city: 'Bengaluru',
    zone: { id: 'blr-koramangala', name: 'Koramangala', riskLevel: 'medium', floodProne: true, avgRainfall: 55, avgAQI: 90, avgTemp: 32 },
    language: 'Kannada',
    avgDailyHours: 6,
    avgWeeklyEarnings: 3000,
    vehicleType: 'Bicycle',
    upiId: 'kavita.singh@gpay',
    emergencyContact: '+91 54321 00005',
    consentAutoMonitor: true,
    joinedAt: '2026-02-01T10:00:00.000Z',
    isActive: true,
  },
];

// ─── RISK ENGINE ───
export function calculateRiskScore(rider) {
  let score = 30; // base
  const z = rider.zone;
  if (z.riskLevel === 'high') score += 25;
  else if (z.riskLevel === 'medium') score += 12;
  if (z.floodProne) score += 10;
  if (z.avgRainfall > 70) score += 8;
  else if (z.avgRainfall > 50) score += 4;
  if (z.avgAQI > 300) score += 12;
  else if (z.avgAQI > 200) score += 7;
  else if (z.avgAQI > 150) score += 3;
  if ((z.avgTemp || 35) > 42) score += 8;
  else if ((z.avgTemp || 35) > 38) score += 4;
  if (rider.avgDailyHours > 10) score += 5;
  // cap 0-100
  return Math.min(100, Math.max(0, score));
}

export function calculateWeeklyPremium(rider, planId = 'weather') {
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  let premium = plan.basePremium;
  const riskScore = calculateRiskScore(rider);

  const factors = [];

  // Zone weather risk
  if (rider.zone.avgRainfall > 70) { premium += 5; factors.push({ label: 'High rainfall zone', amount: +5 }); }
  else if (rider.zone.avgRainfall < 40) { premium -= 2; factors.push({ label: 'Low rainfall zone', amount: -2 }); }

  // Flood risk
  if (rider.zone.floodProne) { premium += 4; factors.push({ label: 'Flood-prone area', amount: +4 }); }

  // Heatwave risk
  if ((rider.zone.avgTemp || 35) > 42) { premium += 3; factors.push({ label: 'Extreme heat zone', amount: +3 }); }
  else if ((rider.zone.avgTemp || 35) > 38) { premium += 1; factors.push({ label: 'Heat-prone zone', amount: +1 }); }

  // AQI
  if (rider.zone.avgAQI > 300) { premium += 5; factors.push({ label: 'Severe pollution', amount: +5 }); }
  else if (rider.zone.avgAQI > 200) { premium += 3; factors.push({ label: 'High pollution', amount: +3 }); }

  // Clean history discount (use _store directly to avoid circular init)
  const claims = _store ? _store.claims : [];
  const riderClaims = claims.filter(c => c.riderId === rider.id);
  const recentClaims = riderClaims.filter(c => Date.now() - new Date(c.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000);
  if (recentClaims.length === 0) { premium -= 3; factors.push({ label: 'Clean claims history', amount: -3 }); }
  else if (recentClaims.length > 3) { premium += 4; factors.push({ label: 'Frequent claims', amount: +4 }); }

  // Consistency discount
  if (rider.avgDailyHours >= 8) { premium -= 2; factors.push({ label: 'Consistent worker', amount: -2 }); }

  // High-risk hours
  if (rider.avgDailyHours > 10) { premium += 2; factors.push({ label: 'Extended hours risk', amount: +2 }); }

  premium = Math.max(15, Math.round(premium));

  return {
    basePremium: plan.basePremium,
    finalPremium: premium,
    riskScore,
    factors,
    confidence: riskScore > 60 ? 'High Risk' : riskScore > 35 ? 'Moderate' : 'Low Risk',
    planId,
    planName: plan.name,
    maxPayout: plan.maxPayout,
  };
}

// ─── FRAUD DETECTION ───
export function checkFraud(claim, allClaims, rider) {
  const flags = [];
  let fraudScore = 0;

  // Duplicate claims
  const dupes = allClaims.filter(c =>
    c.id !== claim.id && c.riderId === claim.riderId &&
    c.triggerType === claim.triggerType &&
    Math.abs(new Date(c.createdAt) - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000
  );
  if (dupes.length > 0) { flags.push('Duplicate weather event claim detected'); fraudScore += 35; }

  // Location mismatch
  if (claim.zone !== rider?.zone?.name) { flags.push('Claim location does not match registered zone'); fraudScore += 25; }

  // No matching trigger (use _store directly to avoid circular init)
  const triggers = _store ? _store.triggers.filter(t =>
    Math.abs(new Date(t.timestamp) - new Date(claim.createdAt)) < 6 * 60 * 60 * 1000 &&
    (t.city === claim.city || t.zone === claim.zone)
  ) : [];
  if (triggers.length === 0) { flags.push('No matching disruption event found'); fraudScore += 40; }

  // Suspicious frequency
  const recentClaims = allClaims.filter(c =>
    c.riderId === claim.riderId &&
    Date.now() - new Date(c.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );
  if (recentClaims.length > 4) { flags.push('Suspicious frequency pattern'); fraudScore += 20; }

  // Activity mismatch
  if (rider && rider.avgDailyHours < 3) { flags.push('Low activity pattern detected'); fraudScore += 15; }

  fraudScore = Math.min(100, fraudScore);
  const verdict = fraudScore > 50 ? 'flagged' : fraudScore > 25 ? 'under_review' : 'clean';

  return { fraudScore, flags, verdict, confidence: 100 - fraudScore, claimId: claim.id };
}

// ─── TRIGGER DATA ───
function generateInitialTriggers() {
  const now = Date.now();
  return [
    { id: 'trig-001', type: 'heavy_rain', city: 'Mumbai', zone: 'Andheri', severity: 'high', value: '72mm rainfall', threshold: '50mm', timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), description: 'Heavy rainfall detected in Andheri zone. Roads waterlogged.', affectedRiders: 34, resolved: false },
    { id: 'trig-002', type: 'flood', city: 'Bhubaneswar', zone: 'Rasulgarh', severity: 'high', value: 'Level 3 flooding', threshold: 'Level 2', timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(), description: 'Waterlogging reported in Rasulgarh. Multiple roads blocked.', affectedRiders: 12, resolved: false },
    { id: 'trig-003', type: 'heatwave', city: 'Delhi', zone: 'Rohini', severity: 'high', value: '47°C', threshold: '44°C', timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(), description: 'Extreme heat warning. Temperature crossed safe delivery threshold.', affectedRiders: 28, resolved: false },
    { id: 'trig-004', type: 'pollution', city: 'Delhi', zone: 'Dwarka', severity: 'high', value: 'AQI 385', threshold: 'AQI 300', timestamp: new Date(now - 8 * 60 * 60 * 1000).toISOString(), description: 'AQI crossed severe level. Outdoor work conditions unsafe.', affectedRiders: 22, resolved: true },
    { id: 'trig-005', type: 'platform_outage', city: 'Bengaluru', zone: 'Koramangala', severity: 'medium', value: 'Swiggy 2hr downtime', threshold: '1hr', timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString(), description: 'Swiggy app experienced 2-hour outage in Bengaluru.', affectedRiders: 45, resolved: true },
    { id: 'trig-006', type: 'zone_closure', city: 'Mumbai', zone: 'Dadar', severity: 'medium', value: 'Market shutdown', threshold: 'Partial closure', timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(), description: 'Dadar market area closed due to local event. Delivery routes blocked.', affectedRiders: 18, resolved: false },
  ];
}

// ─── GENERATE SAMPLE CLAIMS ───
function generateInitialClaims() {
  const riders = SAMPLE_RIDERS;
  const claims = [];
  const now = Date.now();

  const claimData = [
    { riderId: 'rider-002', type: 'heavy_rain', hours: 4, payout: 480, status: 'paid', daysAgo: 3 },
    { riderId: 'rider-002', type: 'flood', hours: 6, payout: 720, status: 'auto_approved', daysAgo: 1 },
    { riderId: 'rider-003', type: 'pollution', hours: 5, payout: 350, status: 'paid', daysAgo: 7 },
    { riderId: 'rider-003', type: 'heatwave', hours: 3, payout: 210, status: 'approved', daysAgo: 2 },
    { riderId: 'rider-004', type: 'pollution', hours: 7, payout: 560, status: 'paid', daysAgo: 5 },
    { riderId: 'rider-004', type: 'heatwave', hours: 4, payout: 320, status: 'under_review', daysAgo: 0 },
    { riderId: 'rider-001', type: 'heavy_rain', hours: 3, payout: 240, status: 'paid', daysAgo: 10 },
    { riderId: 'rider-005', type: 'flood', hours: 5, payout: 400, status: 'paid', daysAgo: 14 },
    { riderId: 'rider-001', type: 'zone_closure', hours: 6, payout: 480, status: 'approved', daysAgo: 4 },
    { riderId: 'rider-002', type: 'platform_outage', hours: 2, payout: 240, status: 'paid', daysAgo: 20 },
  ];

  claimData.forEach((cd, i) => {
    const rider = riders.find(r => r.id === cd.riderId);
    claims.push({
      id: `claim-${(i + 1).toString().padStart(3, '0')}`,
      riderId: cd.riderId,
      riderName: rider?.name || 'Unknown',
      policyId: `policy-${cd.riderId}`,
      triggerType: cd.type,
      triggerLabel: CLAIM_TYPES.find(ct => ct.id === cd.type)?.label || cd.type,
      city: rider?.city || 'Unknown',
      zone: rider?.zone?.name || 'Unknown',
      lostHours: cd.hours,
      incomeLoss: cd.payout + 100,
      payoutAmount: cd.payout,
      status: cd.status,
      createdAt: new Date(now - cd.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: cd.status === 'paid' ? new Date(now - cd.daysAgo * 24 * 60 * 60 * 1000 + 45000).toISOString() : null,
    });
  });

  return claims;
}

// ─── GENERATE POLICIES ───
function generateInitialPolicies() {
  return SAMPLE_RIDERS.map((rider, i) => {
    const planIdx = [1, 2, 1, 3, 0]; // weather, full, weather, prime, lite
    const plan = PLANS[planIdx[i]];
    const premium = calculateWeeklyPremium(rider, plan.id);
    const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: `policy-${rider.id}`,
      riderId: rider.id,
      riderName: rider.name,
      planId: plan.id,
      planName: plan.name,
      planEmoji: plan.emoji,
      city: rider.city,
      zone: rider.zone.name,
      zoneId: rider.zone.id,
      weeklyPremium: premium.finalPremium,
      maxPayout: plan.maxPayout,
      coverageHours: plan.coverageHours,
      coveredDisruptions: plan.coveredDisruptions,
      riskScore: premium.riskScore,
      status: 'active',
      autoTrigger: true,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextRenewal: endDate.toISOString(),
      premiumDueDate: new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: rider.joinedAt,
    };
  });
}

// ─── AUTOMATION EVENT LOG ───
function generateEventLog() {
  const now = Date.now();
  return [
    { id: 'evt-001', type: 'trigger', message: 'Rainfall threshold exceeded in Andheri, Mumbai', timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), severity: 'high' },
    { id: 'evt-002', type: 'premium', message: 'Premium recalculated for 34 riders in Mumbai', timestamp: new Date(now - 2 * 60 * 60 * 1000 + 30000).toISOString(), severity: 'info' },
    { id: 'evt-003', type: 'claim', message: 'Auto-claim initiated for Amit Sharma (flood)', timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(), severity: 'medium' },
    { id: 'evt-004', type: 'fraud', message: 'Potential fraud flag raised for claim-006', timestamp: new Date(now - 45 * 60 * 1000).toISOString(), severity: 'high' },
    { id: 'evt-005', type: 'payout', message: 'Payout approved under parametric threshold — ₹720', timestamp: new Date(now - 30 * 60 * 1000).toISOString(), severity: 'info' },
    { id: 'evt-006', type: 'trigger', message: 'Heatwave alert active in Rohini, Delhi (47°C)', timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(), severity: 'high' },
    { id: 'evt-007', type: 'premium', message: 'Weekly premium discount applied for Kavita Singh (-₹3)', timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(), severity: 'info' },
    { id: 'evt-008', type: 'policy', message: 'Policy auto-renewed for Suresh Yadav', timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString(), severity: 'info' },
  ];
}

// ─── STORE SINGLETON ───
let _store = null;

export function getStore() {
  if (!_store) {
    // Initialize claims and triggers first so premium calc can reference them
    _store = {
      riders: [...SAMPLE_RIDERS],
      policies: [],
      claims: [],
      triggers: generateInitialTriggers(),
      eventLog: generateEventLog(),
      fraudAlerts: [],
      currentRiderId: 'rider-001',
    };
    // Now add claims (they don't depend on policies)
    _store.claims = generateInitialClaims();
    // Now generate policies (depends on claims via calculateWeeklyPremium)
    _store.policies = generateInitialPolicies();
  }
  return _store;
}

export function getCurrentRider() {
  const s = getStore();
  return s.riders.find(r => r.id === s.currentRiderId) || s.riders[0];
}

export function setCurrentRider(id) {
  getStore().currentRiderId = id;
}

export function getCurrentPolicy() {
  const s = getStore();
  return s.policies.find(p => p.riderId === s.currentRiderId);
}

export function getRiderClaims(riderId) {
  return getStore().claims.filter(c => c.riderId === riderId);
}

export function addRider(riderData) {
  const s = getStore();
  const id = `rider-${Date.now()}`;
  const rider = { ...riderData, id, joinedAt: new Date().toISOString(), isActive: true };
  s.riders.push(rider);
  s.currentRiderId = id;
  return rider;
}

export function addPolicy(riderId, planId) {
  const s = getStore();
  const rider = s.riders.find(r => r.id === riderId);
  if (!rider) return null;
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  const premium = calculateWeeklyPremium(rider, planId);
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  const policy = {
    id: `policy-${riderId}`,
    riderId, riderName: rider.name, planId: plan.id, planName: plan.name, planEmoji: plan.emoji,
    city: rider.city, zone: rider.zone.name, zoneId: rider.zone.id,
    weeklyPremium: premium.finalPremium, maxPayout: plan.maxPayout,
    coverageHours: plan.coverageHours, coveredDisruptions: plan.coveredDisruptions,
    riskScore: premium.riskScore, status: 'active', autoTrigger: true,
    startDate: start.toISOString(), endDate: end.toISOString(),
    nextRenewal: end.toISOString(),
    premiumDueDate: new Date(end.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Replace existing or add
  const idx = s.policies.findIndex(p => p.riderId === riderId);
  if (idx >= 0) s.policies[idx] = policy;
  else s.policies.push(policy);
  return policy;
}

export function addClaim(claimData) {
  const s = getStore();
  const id = `claim-${Date.now()}`;
  const claim = { ...claimData, id, createdAt: new Date().toISOString() };
  s.claims.unshift(claim);
  return claim;
}

export function addTrigger(triggerData) {
  const s = getStore();
  const id = `trig-${Date.now()}`;
  const trigger = { ...triggerData, id, timestamp: new Date().toISOString() };
  s.triggers.unshift(trigger);
  return trigger;
}

export function addEventLog(entry) {
  const s = getStore();
  const id = `evt-${Date.now()}`;
  const log = { ...entry, id, timestamp: new Date().toISOString() };
  s.eventLog.unshift(log);
  return log;
}

export function updateClaimStatus(claimId, status) {
  const s = getStore();
  const claim = s.claims.find(c => c.id === claimId);
  if (claim) {
    claim.status = status;
    if (status === 'paid' || status === 'approved') claim.processedAt = new Date().toISOString();
  }
  return claim;
}

// ─── Simulated trigger action ───
export function simulateTrigger(type, city, zone) {
  const triggerInfo = {
    heavy_rain: { severity: 'high', value: `${55 + Math.floor(Math.random() * 30)}mm rainfall`, threshold: '50mm', description: 'Heavy rainfall detected. Roads waterlogged. Delivery disruptions expected.' },
    flood: { severity: 'high', value: `Level ${2 + Math.floor(Math.random() * 2)} flooding`, threshold: 'Level 2', description: 'Waterlogging reported. Multiple roads blocked. Delivery extremely unsafe.' },
    heatwave: { severity: 'high', value: `${44 + Math.floor(Math.random() * 5)}°C`, threshold: '44°C', description: 'Extreme heat warning. Temperature crossed safe delivery threshold.' },
    pollution: { severity: 'high', value: `AQI ${310 + Math.floor(Math.random() * 90)}`, threshold: 'AQI 300', description: 'AQI crossed severe level. Outdoor work conditions unsafe.' },
    platform_outage: { severity: 'medium', value: `${1 + Math.floor(Math.random() * 3)}hr downtime`, threshold: '1hr', description: 'Platform experienced an outage. No orders available for delivery.' },
    zone_closure: { severity: 'medium', value: 'Area shutdown', threshold: 'Partial closure', description: 'Delivery zone closed due to local event. Routes blocked.' },
    access_disruption: { severity: 'medium', value: 'Route blocked', threshold: 'Delivery impossible', description: 'Delivery routes inaccessible. Multiple areas blocked.' },
  };

  const info = triggerInfo[type] || triggerInfo.heavy_rain;
  const s = getStore();

  // Add trigger
  const trigger = addTrigger({ type, city, zone: zone || city, ...info, affectedRiders: 0, resolved: false });

  // Find affected riders
  const affected = s.riders.filter(r => r.city === city && r.isActive);
  trigger.affectedRiders = affected.length;

  // Generate auto-claims for affected riders with matching policy coverage
  const newClaims = [];
  affected.forEach(rider => {
    const policy = s.policies.find(p => p.riderId === rider.id && p.status === 'active');
    if (!policy) return;

    const typeLabel = CLAIM_TYPES.find(ct => ct.id === type)?.label || type;
    const coveredTypes = {
      heavy_rain: 'Heavy Rain', flood: 'Flooding', heatwave: 'Heatwave',
      pollution: 'Pollution', zone_closure: 'Zone Closure',
      platform_outage: 'Platform Outage', access_disruption: 'Access Disruption'
    };
    const disruptionName = coveredTypes[type];
    if (!policy.coveredDisruptions.includes(disruptionName)) return;

    const lostHours = 2 + Math.floor(Math.random() * 5);
    const hourlyRate = (rider.avgWeeklyEarnings || 4200) / (rider.avgDailyHours * 7);
    const payout = Math.round(lostHours * hourlyRate);

    const claim = addClaim({
      riderId: rider.id, riderName: rider.name, policyId: policy.id,
      triggerType: type, triggerLabel: typeLabel,
      city: rider.city, zone: rider.zone.name,
      lostHours, incomeLoss: payout + 80, payoutAmount: Math.min(payout, policy.maxPayout / 7),
      status: 'suggested',
    });
    newClaims.push(claim);
  });

  // Add event log
  addEventLog({ type: 'trigger', message: `${info.description} — ${city}`, severity: info.severity });
  if (newClaims.length > 0) {
    addEventLog({ type: 'claim', message: `Auto-claims suggested for ${newClaims.length} riders in ${city}`, severity: 'medium' });
  }

  return { trigger, newClaims, affected: affected.length };
}
