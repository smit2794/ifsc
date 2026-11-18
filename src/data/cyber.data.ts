// src/data/cyber.data.ts
import {
  ITAssetItem,
  SystemInventoryItem,
  SecurityRiskItem,
  VulnerabilityItem,
  AccessReviewRecord,
  OutsourcingRegisterEntry,
  BCPRecord,
  SecurityIncidentHistoryItem,
  CyberChecklistItem,
} from '../types/cyber';
import { daysAgo, daysFromNow } from '../utils/dateHelpers';

// 15 IT Assets
export const SEED_IT_ASSETS: ITAssetItem[] = [
  { id: 'AST-001', assetTag: 'SRV-PROD-FIX-01', name: 'Primary FIX Order Gateway Server', category: 'Server', ipAddress: '10.14.20.11', location: 'GIFT Datacenter Rack A1', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-002', assetTag: 'SRV-PROD-FIX-02', name: 'Secondary BCP FIX Gateway Server', category: 'Server', ipAddress: '10.14.20.12', location: 'GIFT Datacenter Rack A2', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-003', assetTag: 'SRV-PROD-RMS-01', name: 'Real-Time Risk Management Engine Server', category: 'Server', ipAddress: '10.14.20.21', location: 'GIFT Datacenter Rack B1', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'PENDING_REBOOT' },
  { id: 'AST-004', assetTag: 'NET-CORE-SW-01', name: 'Cisco Nexus 9300 Core Switch 01', category: 'Network Gateway', ipAddress: '10.14.10.1', location: 'GIFT Datacenter Rack C1', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-005', assetTag: 'NET-CORE-SW-02', name: 'Cisco Nexus 9300 Redundant Core Switch 02', category: 'Network Gateway', ipAddress: '10.14.10.2', location: 'GIFT Datacenter Rack C2', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-006', assetTag: 'SEC-FW-PALO-01', name: 'Palo Alto Perimeter Next-Gen Firewall A', category: 'Security Appliance', ipAddress: '10.14.1.1', location: 'Perimeter Demarc', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-007', assetTag: 'SEC-FW-PALO-02', name: 'Palo Alto Perimeter Next-Gen Firewall B', category: 'Security Appliance', ipAddress: '10.14.1.2', location: 'Perimeter Demarc', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-008', assetTag: 'SRV-WORM-VAULT-01', name: 'Hardware WORM Compliance Evidence Vault Appliance', category: 'Server', ipAddress: '10.14.30.5', location: 'GIFT Datacenter Vault', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-009', assetTag: 'SEC-HSM-THALES-01', name: 'Thales Luna Hardware Security Module (mTLS Keys)', category: 'Security Appliance', ipAddress: '10.14.1.15', location: 'Crypto Vault Cage', owner: 'Vikram Shah', criticality: 'CRITICAL', patchStatus: 'CURRENT' },
  { id: 'AST-010', assetTag: 'NET-NTP-GPS-01', name: 'Meinberg GPS Atomic Time Server', category: 'Network Gateway', ipAddress: '10.14.5.1', location: 'Roof GPS Antenna / Datacenter', owner: 'Vikram Shah', criticality: 'HIGH', patchStatus: 'CURRENT' },
  { id: 'AST-011', assetTag: 'WS-TRD-EXEC-01', name: 'Trading Desk Order Execution Terminal 01', category: 'Workstation', ipAddress: '10.14.40.101', location: 'Trading Room Floor', owner: 'Deepa Patel', criticality: 'HIGH', patchStatus: 'CURRENT' },
  { id: 'AST-012', assetTag: 'WS-TRD-EXEC-02', name: 'Trading Desk Backup Execution Terminal 02', category: 'Workstation', ipAddress: '10.14.40.102', location: 'Trading Room Floor', owner: 'Deepa Patel', criticality: 'HIGH', patchStatus: 'CURRENT' },
  { id: 'AST-013', assetTag: 'WS-CMPL-OFF-01', name: 'Compliance Officer Secure Assurance Workstation', category: 'Workstation', ipAddress: '10.14.40.110', location: 'Compliance Office', owner: 'Aarav Mehta', criticality: 'HIGH', patchStatus: 'CURRENT' },
  { id: 'AST-014', assetTag: 'WS-RISK-OFF-01', name: 'Risk Officer Financial Analytics Console', category: 'Workstation', ipAddress: '10.14.40.115', location: 'Risk Office', owner: 'Priya Nair', criticality: 'HIGH', patchStatus: 'CURRENT' },
  { id: 'AST-015', assetTag: 'WS-PO-EXEC-01', name: 'Principal Officer Executive Governance Station', category: 'Workstation', ipAddress: '10.14.40.120', location: 'Executive Office', owner: 'Rohan Desai', criticality: 'HIGH', patchStatus: 'CURRENT' },
];

// 10 System Inventory Items
export const SEED_SYSTEM_INVENTORY: SystemInventoryItem[] = [
  { id: 'SYS-001', systemName: 'FIX Protocol Order Routing Engine', version: 'v4.4-patch-12', hostingType: 'On-Premise IFSC', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(45).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-002', systemName: 'Real-Time Risk Management System (RMS)', version: 'v8.2.1', hostingType: 'On-Premise IFSC', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(45).toISOString(), status: 'DEGRADED' },
  { id: 'SYS-003', systemName: 'Exchange Clearing & Settlement Gateway', version: 'v3.1.0', hostingType: 'Exchange Gateway', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(45).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-004', systemName: 'WORM Immutable Evidence Archive', version: 'v5.0-FIPS', hostingType: 'On-Premise IFSC', drTier: 'Tier 2 (RTO < 2h)', lastTestedDate: daysAgo(90).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-005', systemName: 'Automated AML & PEP Screening Pipeline', version: 'v2.8.4', hostingType: 'Private Cloud', drTier: 'Tier 2 (RTO < 2h)', lastTestedDate: daysAgo(60).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-006', systemName: 'Identity & Access Management (Okta Directory)', version: 'Cloud-SaaS', hostingType: 'Private Cloud', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(30).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-007', systemName: 'Order Audit Trail System (OATS) GPS Sync', version: 'v2.1', hostingType: 'On-Premise IFSC', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(4).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-008', systemName: 'Client Margin & Fund Segregation Ledger', version: 'v6.4', hostingType: 'On-Premise IFSC', drTier: 'Tier 2 (RTO < 2h)', lastTestedDate: daysAgo(15).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-009', systemName: 'Disaster Recovery Warm Standby Cluster', version: 'v4.4-mirror', hostingType: 'On-Premise IFSC', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(45).toISOString(), status: 'OPERATIONAL' },
  { id: 'SYS-010', systemName: 'Market Data Multicast Feed Distributor', version: 'v9.0.2', hostingType: 'Exchange Gateway', drTier: 'Tier 1 (RTO < 15m)', lastTestedDate: daysAgo(10).toISOString(), status: 'OPERATIONAL' },
];

// 12 Security Risks
export const SEED_SECURITY_RISKS: SecurityRiskItem[] = [
  { id: 'RSK-001', riskCode: 'RSK-IAM-01', title: 'Segregation of duties overlap in privileged directory permissions', category: 'Access Control', inherentRisk: 'HIGH', residualRisk: 'LOW', mitigationControl: 'Automated hourly Okta crawler with instant CASE generation', owner: 'Aarav Mehta', status: 'IN_TREATMENT' },
  { id: 'RSK-002', riskCode: 'RSK-NET-02', title: 'External telecom fiber cut impacting order routing latency', category: 'Network Disruption', inherentRisk: 'CRITICAL', residualRisk: 'LOW', mitigationControl: 'Dual diverse physical fiber paths with automatic BGP sub-second failover', owner: 'Vikram Shah', status: 'MITIGATED' },
  { id: 'RSK-003', riskCode: 'RSK-VND-03', title: 'Cloud infrastructure vendor regional outage or data loss', category: 'Third-Party Vulnerability', inherentRisk: 'HIGH', residualRisk: 'MEDIUM', mitigationControl: 'Local daily WORM backup replica stored in physical IFSC datacenter', owner: 'Priya Nair', status: 'IN_TREATMENT' },
  { id: 'RSK-004', riskCode: 'RSK-SEC-04', title: 'Credential stuffing attack targeting customer trading portal', category: 'Access Control', inherentRisk: 'HIGH', residualRisk: 'LOW', mitigationControl: 'Mandatory WebAuthn FIDO2 keys + rate limiting collars', owner: 'Vikram Shah', status: 'MITIGATED' },
  { id: 'RSK-005', riskCode: 'RSK-DLP-05', title: 'Unauthorized export of institutional trade order book', category: 'Data Leakage', inherentRisk: 'HIGH', residualRisk: 'LOW', mitigationControl: 'Hardware USB lockdown + host-based endpoint DLP filtering', owner: 'Vikram Shah', status: 'MITIGATED' },
  { id: 'RSK-006', riskCode: 'RSK-CRY-06', title: 'Expiring mTLS certificates causing silent FIX gateway dropouts', category: 'Network Disruption', inherentRisk: 'CRITICAL', residualRisk: 'MEDIUM', mitigationControl: 'Automated certificate lifecycle management with 30-day escalation alerts', owner: 'Vikram Shah', status: 'IN_TREATMENT' },
  { id: 'RSK-007', riskCode: 'RSK-ALG-07', title: 'Algorithmic loop causing runaway order flood on exchange', category: 'Network Disruption', inherentRisk: 'CRITICAL', residualRisk: 'LOW', mitigationControl: 'Hardware-level drop-copy kill-switch trigger (<150ms)', owner: 'Deepa Patel', status: 'MITIGATED' },
  { id: 'RSK-008', riskCode: 'RSK-CLK-08', title: 'NTP drift exceeding 1 millisecond regulatory time variance', category: 'Access Control', inherentRisk: 'MEDIUM', residualRisk: 'LOW', mitigationControl: 'Redundant atomic GPS clock receiver with millisecond drift alarms', owner: 'Vikram Shah', status: 'MITIGATED' },
  { id: 'RSK-009', riskCode: 'RSK-BCP-09', title: 'Datacenter power outage during high-volume market close', category: 'Network Disruption', inherentRisk: 'HIGH', residualRisk: 'LOW', mitigationControl: 'Dual redundant UPS with diesel generator auto-switch in 8 seconds', owner: 'Rohan Desai', status: 'MITIGATED' },
  { id: 'RSK-010', riskCode: 'RSK-INS-10', title: 'Trading desk insider trading or front-running customer orders', category: 'Data Leakage', inherentRisk: 'CRITICAL', residualRisk: 'LOW', mitigationControl: 'Pre-clearance portal + automated post-trade correlation screening', owner: 'Aarav Mehta', status: 'MITIGATED' },
  { id: 'RSK-011', riskCode: 'RSK-DDO-11', title: 'Distributed Denial of Service attack on market data ingress', category: 'Network Disruption', inherentRisk: 'HIGH', residualRisk: 'LOW', mitigationControl: 'Upstream ISP scrubbing center with 500 Gbps mitigation capacity', owner: 'Vikram Shah', status: 'MITIGATED' },
  { id: 'RSK-012', riskCode: 'RSK-LOG-12', title: 'Tampering or deletion of trade logs within 8-year statutory window', category: 'Data Leakage', inherentRisk: 'CRITICAL', residualRisk: 'LOW', mitigationControl: 'Physical WORM storage optical media with SHA-256 block chain', owner: 'Vikram Shah', status: 'MITIGATED' },
];

// 20 Vulnerabilities
export const SEED_VULNERABILITIES: VulnerabilityItem[] = [
  { id: 'VUL-001', cveId: 'CVE-2026-10492', title: 'OpenSSL Memory Buffer Over-read in Legacy TLS Renegotiation', severity: 'HIGH', affectedSystem: 'Staging FIX Gateway 03', discoveredDate: daysAgo(8).toISOString(), remediationDeadline: daysFromNow(6).toISOString(), status: 'OPEN' },
  { id: 'VUL-002', cveId: 'CVE-2026-8812', title: 'Linux Kernel TCP SACK Panic Denial of Service Flaw', severity: 'MEDIUM', affectedSystem: 'Market Data Distributor', discoveredDate: daysAgo(12).toISOString(), remediationDeadline: daysFromNow(18).toISOString(), status: 'OPEN' },
  { id: 'VUL-003', cveId: 'CVE-2026-4421', title: 'Nginx Ingress Reverse Proxy Header Injection', severity: 'LOW', affectedSystem: 'Internal API Gateway', discoveredDate: daysAgo(14).toISOString(), remediationDeadline: daysFromNow(16).toISOString(), status: 'OPEN' },
  { id: 'VUL-004', cveId: 'CVE-2025-49210', title: 'Cisco NX-OS BGP Route Flap Memory Corruption', severity: 'CRITICAL', affectedSystem: 'Core Switch 01', discoveredDate: daysAgo(40).toISOString(), remediationDeadline: daysAgo(26).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-005', cveId: 'CVE-2025-38910', title: 'Palo Alto PAN-OS GlobalProtect Portal Authentication Bypass', severity: 'CRITICAL', affectedSystem: 'Perimeter Firewall A', discoveredDate: daysAgo(60).toISOString(), remediationDeadline: daysAgo(46).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-006', cveId: 'CVE-2025-28192', title: 'PostgreSQL Privileged Query Execution via Extension Loading', severity: 'HIGH', affectedSystem: 'Evidence Index DB', discoveredDate: daysAgo(75).toISOString(), remediationDeadline: daysAgo(61).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-007', cveId: 'CVE-2026-1102', title: 'SSH Daemon Weak CBC Cipher Suite Support', severity: 'LOW', affectedSystem: 'Backup Gateway Server', discoveredDate: daysAgo(20).toISOString(), remediationDeadline: daysFromNow(10).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-008', cveId: 'CVE-2026-3041', title: 'Docker Daemon Container Escape via User Namespace Misconfiguration', severity: 'HIGH', affectedSystem: 'Microservices Host 02', discoveredDate: daysAgo(16).toISOString(), remediationDeadline: daysAgo(2).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-009', cveId: 'CVE-2026-5129', title: 'Redis In-Memory Cache Unauthenticated RCE on Localhost Socket', severity: 'MEDIUM', affectedSystem: 'Market Tick Buffer', discoveredDate: daysAgo(22).toISOString(), remediationDeadline: daysFromNow(8).toISOString(), status: 'OPEN' },
  { id: 'VUL-010', cveId: 'CVE-2026-6411', title: 'Grafana Telemetry Dashboard Path Traversal Flaw', severity: 'LOW', affectedSystem: 'Monitoring Node', discoveredDate: daysAgo(10).toISOString(), remediationDeadline: daysFromNow(20).toISOString(), status: 'OPEN' },
  { id: 'VUL-011', cveId: 'CVE-2025-19401', title: 'Apache Tomcat HTTP/2 Connection Leak Denial of Service', severity: 'MEDIUM', affectedSystem: 'Internal Web Application', discoveredDate: daysAgo(90).toISOString(), remediationDeadline: daysAgo(76).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-012', cveId: 'CVE-2025-22405', title: 'RabbitMQ Message Broker Memory Exhaustion on Unacknowledged Channels', severity: 'LOW', affectedSystem: 'Trade Message Bus', discoveredDate: daysAgo(110).toISOString(), remediationDeadline: daysAgo(96).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-013', cveId: 'CVE-2026-7201', title: 'Python Cryptography Wheel Library Buffer Overflow', severity: 'MEDIUM', affectedSystem: 'Automated Reporting Scripts', discoveredDate: daysAgo(18).toISOString(), remediationDeadline: daysFromNow(12).toISOString(), status: 'OPEN' },
  { id: 'VUL-014', cveId: 'CVE-2026-8199', title: 'Elasticsearch Search Slow Query Resource Saturation', severity: 'LOW', affectedSystem: 'Log Analytics Node', discoveredDate: daysAgo(25).toISOString(), remediationDeadline: daysFromNow(5).toISOString(), status: 'OPEN' },
  { id: 'VUL-015', cveId: 'CVE-2025-41002', title: 'Thales HSM PKCS#11 API PIN Timing Attack Vulnerability', severity: 'HIGH', affectedSystem: 'Hardware Security Module', discoveredDate: daysAgo(120).toISOString(), remediationDeadline: daysAgo(106).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-016', cveId: 'CVE-2025-33010', title: 'Meinberg NTP Server Monlist Amplification Vector', severity: 'MEDIUM', affectedSystem: 'GPS Clock Server', discoveredDate: daysAgo(130).toISOString(), remediationDeadline: daysAgo(116).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-017', cveId: 'CVE-2026-9042', title: 'Node.js Runtime DNS Re-binding Vulnerability', severity: 'LOW', affectedSystem: 'Client Portal Backend', discoveredDate: daysAgo(30).toISOString(), remediationDeadline: daysFromNow(0).toISOString(), status: 'EXCEPTION_APPROVED' },
  { id: 'VUL-018', cveId: 'CVE-2025-18402', title: 'Windows 11 Workstation Kerberos Ticket Impersonation Flaw', severity: 'CRITICAL', affectedSystem: 'Trading Room Workstations', discoveredDate: daysAgo(140).toISOString(), remediationDeadline: daysAgo(126).toISOString(), status: 'REMEDIATED' },
  { id: 'VUL-019', cveId: 'CVE-2026-9901', title: 'Cisco ASA AnyConnect VPN Remote Code Execution Vulnerability', severity: 'CRITICAL', affectedSystem: 'Emergency VPN Gateway', discoveredDate: daysAgo(6).toISOString(), remediationDeadline: daysFromNow(8).toISOString(), status: 'OPEN' },
  { id: 'VUL-020', cveId: 'CVE-2026-4409', title: 'SQLite Database Corruption via Malformed Pragma Query', severity: 'LOW', affectedSystem: 'Local Client Cache', discoveredDate: daysAgo(15).toISOString(), remediationDeadline: daysFromNow(15).toISOString(), status: 'OPEN' },
];

// 6 Access Reviews
export const SEED_ACCESS_REVIEWS: AccessReviewRecord[] = [
  { id: 'REV-001', cycleName: 'Q3 FY26 Privileged Trading Desk Access Review', department: 'Trading Operations', reviewedDate: daysAgo(15).toISOString(), reviewedBy: 'Aarav Mehta', totalAccountsReviewed: 5, anomaliesDetected: 1, revocationsEnforced: 1, status: 'COMPLETED' },
  { id: 'REV-002', cycleName: 'Q3 FY26 Core Infrastructure & Root Console Review', department: 'Information Security', reviewedDate: daysAgo(20).toISOString(), reviewedBy: 'Vikram Shah', totalAccountsReviewed: 5, anomaliesDetected: 0, revocationsEnforced: 0, status: 'COMPLETED' },
  { id: 'REV-003', cycleName: 'Q2 FY26 Executive Governance Entitlement Cycle', department: 'Executive Governance', reviewedDate: daysAgo(100).toISOString(), reviewedBy: 'Rohan Desai', totalAccountsReviewed: 5, anomaliesDetected: 0, revocationsEnforced: 0, status: 'COMPLETED' },
  { id: 'REV-004', cycleName: 'Q2 FY26 Financial Settlement & Escrow Access Review', department: 'Risk Management', reviewedDate: daysAgo(105).toISOString(), reviewedBy: 'Priya Nair', totalAccountsReviewed: 5, anomaliesDetected: 0, revocationsEnforced: 0, status: 'COMPLETED' },
  { id: 'REV-005', cycleName: 'Q1 FY26 Full Institutional Identity Recertification', department: 'All Departments', reviewedDate: daysAgo(190).toISOString(), reviewedBy: 'Aarav Mehta', totalAccountsReviewed: 5, anomaliesDetected: 0, revocationsEnforced: 0, status: 'COMPLETED' },
  { id: 'REV-006', cycleName: 'Q4 FY26 Pre-Audit Identity Directory Audit (In Progress)', department: 'All Departments', reviewedDate: daysAgo(1).toISOString(), reviewedBy: 'Aarav Mehta', totalAccountsReviewed: 5, anomaliesDetected: 1, revocationsEnforced: 0, status: 'IN_PROGRESS' },
];

// 8 Outsourcing Register Entries
export const SEED_OUTSOURCING_REGISTER: OutsourcingRegisterEntry[] = [
  { id: 'OUT-001', serviceName: 'Primary Cloud Datacenter Infrastructure & Co-location', vendorName: 'CloudScale Global Infrastructure Pte Ltd', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-01-20', governingPolicy: 'POL-OUT-001', owner: 'Priya Nair' },
  { id: 'OUT-002', serviceName: 'Algorithmic Trading Risk Engine Software Maintenance', vendorName: 'QuantX Algorithmic Systems Mumbai', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-03-15', governingPolicy: 'POL-OUT-001', owner: 'Deepa Patel' },
  { id: 'OUT-003', serviceName: 'Real-Time Global Market Feeds Multicast Distribution', vendorName: 'Bloomberg Finance L.P.', materiality: 'NON_MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-02-10', governingPolicy: 'POL-OUT-002', owner: 'Deepa Patel' },
  { id: 'OUT-004', serviceName: 'External CERT-In Vulnerability Assessment and Penetration Testing', vendorName: 'CyberShield VAPT Specialists Ahmedabad', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-04-05', governingPolicy: 'POL-OUT-001', owner: 'Vikram Shah' },
  { id: 'OUT-005', serviceName: 'External Annual Statutory Compliance and Financial Audit', vendorName: 'Deloitte Touche Tohmatsu India LLP', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2022-12-01', governingPolicy: 'POL-OUT-001', owner: 'Aarav Mehta' },
  { id: 'OUT-006', serviceName: 'Optical Mesh Leased Telecommunications Link', vendorName: 'GIFT Telecommunications Ltd', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2022-11-20', governingPolicy: 'POL-OUT-001', owner: 'Vikram Shah' },
  { id: 'OUT-007', serviceName: 'FATF Sanction and PEP Intelligence Automated Screening Service', vendorName: 'Kroll Screening & Forensic Intelligence', materiality: 'NON_MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-05-18', governingPolicy: 'POL-OUT-002', owner: 'Aarav Mehta' },
  { id: 'OUT-008', serviceName: 'Cryptographic WORM Storage Vault Infrastructure Support', vendorName: 'SecurVault WORM Solutions Zurich', materiality: 'MATERIAL', regulatoryApprovalObtained: true, approvalDate: '2023-02-28', governingPolicy: 'POL-OUT-001', owner: 'Vikram Shah' },
];

// 6 BCP/DR Records
export const SEED_BCP_RECORDS: BCPRecord[] = [
  { id: 'BCP-001', testTitle: 'H2 FY26 Semi-Annual Live Trading Switch to Disaster Recovery Cluster', drillType: 'Primary Datacenter Failover', conductedDate: daysAgo(45).toISOString(), durationMinutes: 180, rtoTargetMinutes: 15, rtoAchievedMinutes: 8, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Vikram Shah' },
  { id: 'BCP-002', testTitle: 'Scheduled India INX Primary FIX Gateway Sudden Socket Severance', drillType: 'Exchange Outage Drill', conductedDate: daysAgo(110).toISOString(), durationMinutes: 60, rtoTargetMinutes: 15, rtoAchievedMinutes: 6, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Deepa Patel' },
  { id: 'BCP-003', testTitle: 'GIFT City Trading Desk Emergency Relocation to Secondary Workstations', drillType: 'Trading Desk Relocation', conductedDate: daysAgo(175).toISOString(), durationMinutes: 120, rtoTargetMinutes: 30, rtoAchievedMinutes: 19, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Rohan Desai' },
  { id: 'BCP-004', testTitle: 'H1 FY26 Comprehensive Exchange Full Day Contingency Trading Session', drillType: 'Exchange Outage Drill', conductedDate: daysAgo(230).toISOString(), durationMinutes: 360, rtoTargetMinutes: 15, rtoAchievedMinutes: 9, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Vikram Shah' },
  { id: 'BCP-005', testTitle: 'Redundant BGP Core Telecom Carrier Switchover Latency Stress Drill', drillType: 'Primary Datacenter Failover', conductedDate: daysAgo(290).toISOString(), durationMinutes: 45, rtoTargetMinutes: 5, rtoAchievedMinutes: 2, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Vikram Shah' },
  { id: 'BCP-006', testTitle: 'Automated Order Gateway Hardware Crash Benchmarking (RTO Verification)', drillType: 'Primary Datacenter Failover', conductedDate: daysAgo(350).toISOString(), durationMinutes: 90, rtoTargetMinutes: 15, rtoAchievedMinutes: 11, rpoTargetMinutes: 0, rpoAchievedMinutes: 0, result: 'SUCCESS', supervisedBy: 'Vikram Shah' },
];

// 5 Security Incident History Items
export const SEED_SECURITY_INCIDENT_HISTORY: SecurityIncidentHistoryItem[] = [
  { id: 'SEC-INC-001', incidentRef: 'INC-2026-014', title: '7-Minute FIX Gateway Session Interruption Flap', severity: 'CRITICAL', occurredDate: daysAgo(5).toISOString(), containmentTimeMinutes: 7, reportFiledToCertIn: true, closureAttestedBy: 'Vikram Shah' },
  { id: 'SEC-INC-002', incidentRef: 'INC-2026-016', title: 'Cloud Document Storage Provider Access Degradation', severity: 'MEDIUM', occurredDate: daysAgo(1).toISOString(), containmentTimeMinutes: 42, reportFiledToCertIn: false, closureAttestedBy: 'Vikram Shah' },
  { id: 'SEC-INC-003', incidentRef: 'INC-2025-003', title: 'Historical Line Card Switch Hardware Panic', severity: 'HIGH', occurredDate: daysAgo(120).toISOString(), containmentTimeMinutes: 11, reportFiledToCertIn: true, closureAttestedBy: 'Rohan Desai' },
  { id: 'SEC-INC-004', incidentRef: 'INC-2025-008', title: 'Credential Stuffing Anomaly Blocked at Web Ingress', severity: 'MEDIUM', occurredDate: daysAgo(160).toISOString(), containmentTimeMinutes: 4, reportFiledToCertIn: false, closureAttestedBy: 'Vikram Shah' },
  { id: 'SEC-INC-005', incidentRef: 'INC-2025-001', title: 'External DNS Resolver Latency Jitter Resolved via Secondary Root', severity: 'LOW', occurredDate: daysAgo(210).toISOString(), containmentTimeMinutes: 15, reportFiledToCertIn: false, closureAttestedBy: 'Vikram Shah' },
];

// 20 Cyber Checklist Items
export const SEED_CYBER_CHECKLIST: CyberChecklistItem[] = [
  { id: 'CHK-CYB-01', clauseRef: 'IFSCA-CSF-1.1', title: 'Asset Inventory & Classification', description: 'Hardware and software assets catalogued and mapped.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-02', clauseRef: 'IFSCA-CSF-1.2', title: 'Network Perimeter Demarcation', description: 'Dual next-gen firewalls in high-availability configuration.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-03', clauseRef: 'IFSCA-CSF-2.1', title: 'Privileged Access MFA Enforcement', description: 'Hardware tokens enforced on 100% administrative portals.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-04', clauseRef: 'IFSCA-CSF-2.2', title: 'Quarterly Access Entitlement Review', description: 'All 5 user role permissions reviewed and recertified.', status: 'COMPLIANT', verifiedBy: 'Aarav Mehta' },
  { id: 'CHK-CYB-05', clauseRef: 'IFSCA-CSF-3.1', title: 'Patch Management Cadence', description: 'Critical patches deployed within 14 calendar days.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-06', clauseRef: 'IFSCA-CSF-3.2', title: 'External Vulnerability Assessment (VAPT)', description: 'Quarterly external penetration test by CERT-In firm.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-07', clauseRef: 'IFSCA-CSF-4.1', title: 'WORM Immutable Audit Log Retention', description: '8-year write-once-read-many retention lock configured.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-08', clauseRef: 'IFSCA-CSF-4.2', title: 'GPS Atomic Time Synchronization', description: 'NTP drift verified under 1 millisecond variance.', status: 'COMPLIANT', verifiedBy: 'Deepa Patel' },
  { id: 'CHK-CYB-09', clauseRef: 'IFSCA-CSF-5.1', title: 'Security Incident Response Plan', description: 'Written plan updated and approved by Board.', status: 'COMPLIANT', verifiedBy: 'Rohan Desai' },
  { id: 'CHK-CYB-10', clauseRef: 'IFSCA-CSF-5.2', title: 'CERT-In 6-Hour Reporting Standard', description: 'Designated incident reporting channel configured.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-11', clauseRef: 'IFSCA-CSF-6.1', title: 'Disaster Recovery RTO < 15 Minutes', description: 'Semi-annual drill verified with 8m 42s RTO.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-12', clauseRef: 'IFSCA-CSF-6.2', title: 'Zero Data Loss (RPO = 0) Synchronous Replication', description: 'Synchronous transaction log mirroring verified.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-13', clauseRef: 'IFSCA-CSF-7.1', title: 'Material Outsourcing Regulatory Filings', description: 'Prior regulatory clearance secured for material cloud hosts.', status: 'COMPLIANT', verifiedBy: 'Priya Nair' },
  { id: 'CHK-CYB-14', clauseRef: 'IFSCA-CSF-7.2', title: 'Annual Vendor SOC-2 Type II Review', description: 'Audit dockets verified for all critical cloud suppliers.', status: 'COMPLIANT', verifiedBy: 'Priya Nair' },
  { id: 'CHK-CYB-15', clauseRef: 'IFSCA-CSF-8.1', title: 'Clean Desk and Mobile Phone Ban on Trading Floor', description: 'Strict physical enforcement on execution workstations.', status: 'COMPLIANT', verifiedBy: 'Aarav Mehta' },
  { id: 'CHK-CYB-16', clauseRef: 'IFSCA-CSF-8.2', title: 'Encrypted Voice Recording of Order Lines', description: 'All trading calls archived with SHA-256 integrity seal.', status: 'COMPLIANT', verifiedBy: 'Deepa Patel' },
  { id: 'CHK-CYB-17', clauseRef: 'IFSCA-CSF-9.1', title: 'Annual Employee Cyber Awareness Refresher', description: '100% completion recorded across all 5 staff members.', status: 'COMPLIANT', verifiedBy: 'Aarav Mehta' },
  { id: 'CHK-CYB-18', clauseRef: 'IFSCA-CSF-9.2', title: 'Cyber Phishing Drill Participation', description: 'Quarterly phishing training drill executed with 0% click rate.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
  { id: 'CHK-CYB-19', clauseRef: 'IFSCA-CSF-10.1', title: 'Pre-Trade Algorithmic Kill-Switch Circuit', description: 'Automatic emergency kill-switch verified under 150ms.', status: 'COMPLIANT', verifiedBy: 'Deepa Patel' },
  { id: 'CHK-CYB-20', clauseRef: 'IFSCA-CSF-10.2', title: 'Cryptographic Key Lifecycle and Hardware HSM Storage', description: 'FIPS 140-2 Level 3 HSM hardware module validated.', status: 'COMPLIANT', verifiedBy: 'Vikram Shah' },
];
