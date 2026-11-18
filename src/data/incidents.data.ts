// src/data/incidents.data.ts
import { IncidentItem } from '../types/incident';
import { daysAgo } from '../utils/dateHelpers';

// Seed timestamps computed once at module load
const inc14Occurred = daysAgo(5);
const inc14Detected = new Date(inc14Occurred.getTime() + 2 * 60_000);
const inc14Restored = new Date(inc14Occurred.getTime() + 9 * 60_000); // 7 minutes outage

// 1 hour initial notice deadline was at occurred + 60 mins
const inc14InitialNoticeDeadline = new Date(inc14Occurred.getTime() + 60 * 60_000);
// T+1 preliminary report deadline was occurred + 24 hours
const inc14PrelimDeadline = new Date(inc14Occurred.getTime() + 24 * 3600_000);
// 14-day RCA report deadline is occurred + 14 days (~9 days remaining)
const inc14RcaDeadline = new Date(inc14Occurred.getTime() + 14 * 86_400_000);

export const SEED_INCIDENTS: IncidentItem[] = [
  {
    id: 'INC-2026-014',
    title: 'FIX Trading Gateway Session Dropout and Order Routing Interruption',
    severity: 'CRITICAL',
    status: 'RESTORED',
    isGlitch: true,
    occurredAt: inc14Occurred.toISOString(),
    detectedAt: inc14Detected.toISOString(),
    restoredAt: inc14Restored.toISOString(),
    durationMinutes: 7,
    owner: 'Vikram Shah',
    ownerId: 'USR-004',
    clocks: {
      initialNotice: {
        label: '1-Hour Technical Glitch Notice',
        deadline: inc14InitialNoticeDeadline.toISOString(),
        status: 'MET',
        submittedAt: new Date(inc14Occurred.getTime() + 38 * 60_000).toISOString(),
      },
      preliminaryReport: {
        label: 'T+1 Preliminary Incident Report',
        deadline: inc14PrelimDeadline.toISOString(),
        status: 'MET',
        submittedAt: new Date(inc14Occurred.getTime() + 18 * 3600_000).toISOString(),
      },
      rcaReport: {
        label: '14-Day Comprehensive Root Cause Analysis (RCA)',
        deadline: inc14RcaDeadline.toISOString(),
        status: 'RUNNING',
      },
    },
    filings: [
      {
        id: 'FIL-2026-GLITCH-001',
        type: 'INITIAL_NOTICE',
        filingNumber: 'IFSCA/GLITCH/2026/014-N1',
        status: 'ACKNOWLEDGED',
        submittedAt: new Date(inc14Occurred.getTime() + 38 * 60_000).toISOString(),
        acknowledgedAt: new Date(inc14Occurred.getTime() + 48 * 60_000).toISOString(),
        recipient: 'India International Exchange & IFSCA Surveillance',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        signatory: 'Aarav Mehta',
      },
      {
        id: 'FIL-2026-GLITCH-002',
        type: 'PRELIMINARY_REPORT',
        filingNumber: 'IFSCA/GLITCH/2026/014-R1',
        status: 'SUBMITTED',
        submittedAt: new Date(inc14Occurred.getTime() + 18 * 3600_000).toISOString(),
        recipient: 'IFSCA Market Infrastructure Division',
        hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        signatory: 'Aarav Mehta',
      },
      {
        id: 'FIL-2026-GLITCH-003',
        type: 'RCA_REPORT',
        filingNumber: 'IFSCA/GLITCH/2026/014-RCA',
        status: 'IN_PROGRESS',
        recipient: 'IFSCA Market Infrastructure Division',
        hash: 'pending-rca-approval-seal',
        signatory: 'Rohan Desai',
      },
    ],
    description: 'Sudden socket reset on primary FIX order router caused a 7-minute trading interruption across USD/INR currency futures and index derivatives. Automatic failover to secondary BCP gateway restored order flow.',
    impactedSystems: ['FIX Order Gateway 01', 'RMS Streaming Risk Filter'],
    rootCause: 'BGP routing table flap on external co-location lease switch triggered TCP socket timeout before keepalive reset.',
    remediation: 'Upgraded BGP dampening thresholds, enabled dual-homed redundant cross-connects with auto-failover heartbeat tuned to 150ms.',
  },
  {
    id: 'INC-2026-015',
    title: 'Market Data Feed 3-Minute Millisecond Tick Jitter',
    severity: 'LOW',
    status: 'CLOSED',
    isGlitch: false,
    occurredAt: daysAgo(3).toISOString(),
    detectedAt: daysAgo(3).toISOString(),
    restoredAt: new Date(daysAgo(3).getTime() + 3 * 60_000).toISOString(),
    durationMinutes: 3,
    owner: 'Deepa Patel',
    ownerId: 'USR-005',
    filings: [],
    description: 'Tick latency spike reached 420ms on equities multicast channel for 3 minutes. Resolved after network buffer flush. Duration below 5-minute threshold; non-qualifying under IFSCA technical glitch rules.',
    impactedSystems: ['Market Data Multicast Feed'],
    rootCause: 'Spike in market open order cancellation messages saturated ingress ring buffer.',
  },
  {
    id: 'INC-2026-016',
    title: 'Cloud Document Storage Provider Access Degradation',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    isGlitch: false,
    occurredAt: daysAgo(1).toISOString(),
    detectedAt: daysAgo(1).toISOString(),
    restoredAt: new Date(daysAgo(1).getTime() + 42 * 60_000).toISOString(),
    durationMinutes: 42,
    owner: 'Vikram Shah',
    ownerId: 'USR-004',
    filings: [],
    description: 'Vendor API degradation affected read-access to archived client onboarding PDFs for 42 minutes. Core trading and order routing unaffected. Third-party vendor status ticket logged.',
    impactedSystems: ['Vendor Document Archive'],
    rootCause: 'Vendor global storage region maintenance incident.',
    remediation: 'Configured local secondary read-replica cache in GIFT City datacenter.',
  },
  {
    id: 'INC-2026-003',
    title: 'Historical Exchange Gateway Router Firmware Crash (FY25)',
    severity: 'HIGH',
    status: 'CLOSED',
    isGlitch: true,
    occurredAt: daysAgo(120).toISOString(),
    detectedAt: daysAgo(120).toISOString(),
    restoredAt: new Date(daysAgo(120).getTime() + 11 * 60_000).toISOString(),
    durationMinutes: 11,
    owner: 'Vikram Shah',
    ownerId: 'USR-004',
    clocks: {
      initialNotice: {
        label: '1-Hour Notice',
        deadline: new Date(daysAgo(120).getTime() + 3600_000).toISOString(),
        status: 'MET',
        submittedAt: new Date(daysAgo(120).getTime() + 25 * 60_000).toISOString(),
      },
      preliminaryReport: {
        label: 'T+1 Report',
        deadline: new Date(daysAgo(120).getTime() + 24 * 3600_000).toISOString(),
        status: 'MET',
        submittedAt: new Date(daysAgo(120).getTime() + 14 * 3600_000).toISOString(),
      },
      rcaReport: {
        label: '14-Day RCA',
        deadline: new Date(daysAgo(120).getTime() + 14 * 86_400_000).toISOString(),
        status: 'MET',
        submittedAt: new Date(daysAgo(120).getTime() + 8 * 86_400_000).toISOString(),
      },
    },
    filings: [
      {
        id: 'FIL-2025-HIST-001',
        type: 'INITIAL_NOTICE',
        filingNumber: 'IFSCA/GLITCH/2025/003-N1',
        status: 'ACKNOWLEDGED',
        submittedAt: new Date(daysAgo(120).getTime() + 25 * 60_000).toISOString(),
        acknowledgedAt: new Date(daysAgo(120).getTime() + 40 * 60_000).toISOString(),
        recipient: 'IFSCA & India INX',
        hash: '7b24016b15a1a1f3320f269411bbd6f6e525a74e54911f42d2a440a34b223401',
        signatory: 'Aarav Mehta',
      },
      {
        id: 'FIL-2025-HIST-002',
        type: 'PRELIMINARY_REPORT',
        filingNumber: 'IFSCA/GLITCH/2025/003-R1',
        status: 'ACKNOWLEDGED',
        submittedAt: new Date(daysAgo(120).getTime() + 14 * 3600_000).toISOString(),
        acknowledgedAt: new Date(daysAgo(120).getTime() + 20 * 3600_000).toISOString(),
        recipient: 'IFSCA',
        hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        signatory: 'Aarav Mehta',
      },
      {
        id: 'FIL-2025-HIST-003',
        type: 'RCA_REPORT',
        filingNumber: 'IFSCA/GLITCH/2025/003-RCA',
        status: 'ACKNOWLEDGED',
        submittedAt: new Date(daysAgo(120).getTime() + 8 * 86_400_000).toISOString(),
        acknowledgedAt: new Date(daysAgo(120).getTime() + 12 * 86_400_000).toISOString(),
        recipient: 'IFSCA',
        hash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f',
        signatory: 'Rohan Desai',
      },
    ],
    description: 'Hardware line card failure during peak market close in previous financial year. Full closure approved by IFSCA with zero regulatory penalty.',
    impactedSystems: ['Line Card Switch 02'],
    rootCause: 'Capacitor surge on aging line card chassis.',
    remediation: 'Complete chassis replaced with hot-swappable dual redundant power bus.',
  },
];
