// src/pages/Admin/AdminPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Lock,
  History,
  Settings,
  Bell,
  CheckCircle2,
  Save,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { PageHeader } from '../../components/layout/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { useToast } from '../../components/ui/Toast';
import {
  useAppStore,
  useAdminState,
  useCurrentUser,
} from '../../store';
import { PolicyDocumentItem } from '../../types/admin';

type AdminTab = 'dashboard' | 'settings' | 'users' | 'policies' | 'security' | 'log';
const VALID_ADMIN_TABS: AdminTab[] = ['dashboard', 'settings', 'users', 'policies', 'security', 'log'];

export const AdminPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useCurrentUser();
  const adminState = useAdminState();

  const approvePolicy = useAppStore((s) => s.approvePolicy);
  const updateLegalEntitySettings = useAppStore((s) => s.updateLegalEntitySettings);
  const updateNotificationSettings = useAppStore((s) => s.updateNotificationSettings);
  const updateSecuritySettings = useAppStore((s) => s.updateSecuritySettings);

  const rawTab = searchParams.get('tab');
  const activeTab: AdminTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'audit' || rawTab === 'changes') return 'log';
    if (rawTab === 'retention' || rawTab === 'access') return 'security';
    if (rawTab === 'entity') return 'settings';
    if (VALID_ADMIN_TABS.includes(rawTab as AdminTab)) return rawTab as AdminTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (
      rawTab &&
      !VALID_ADMIN_TABS.includes(rawTab as AdminTab) &&
      !['audit', 'changes', 'retention', 'access', 'entity'].includes(rawTab)
    ) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/admin', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  const handleTabChange = (tabKey: AdminTab) => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      p[k] = v;
    });
    p.tab = tabKey;
    navigate(buildLink('/admin', p));
  };

  // Policy Approval Modal State (Propagation #13)
  const [selectedPolicyForApproval, setSelectedPolicyForApproval] = useState<PolicyDocumentItem | null>(null);

  // Legal Entity Form State
  const [legalName, setLegalName] = useState(adminState.legalEntitySettings.legalName);
  const [entityType, setEntityType] = useState(adminState.legalEntitySettings.entityType);
  const [regNumber, setRegNumber] = useState(adminState.legalEntitySettings.ifscRegistrationNo);
  const [address, setAddress] = useState(adminState.legalEntitySettings.registeredAddress);

  // Handle Legal Entity Save
  const handleSaveLegalEntity = (e: React.FormEvent) => {
    e.preventDefault();
    updateLegalEntitySettings({
      legalName,
      entityType,
      ifscRegistrationNo: regNumber,
      registeredAddress: address,
    });
    toast.show({
      message: 'Legal entity profile saved and stamped in audit log',
      variant: 'success',
    });
  };

  // Handle Notification Toggle
  const handleToggleNotification = (key: keyof typeof adminState.notificationSettings) => {
    const currentValue = adminState.notificationSettings[key];
    if (typeof currentValue === 'boolean') {
      updateNotificationSettings({ [key]: !currentValue });
      toast.show({
        message: `Notification preference updated`,
        variant: 'info',
      });
    }
  };

  // Handle Security Toggle
  const handleToggleSecurity = (key: keyof typeof adminState.securitySettings) => {
    const currentValue = adminState.securitySettings[key];
    if (typeof currentValue === 'boolean') {
      updateSecuritySettings({ [key]: !currentValue });
      toast.show({
        message: `Security configuration updated`,
        variant: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Administration & Compliance Governance"
        subtitle="Staff authorization, policy lifecycle approvals, cryptographic audit logs, and statutory data retention."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-borderColor overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('dashboard')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('settings')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({adminState.adminUsers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('policies')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'policies'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Policies ({adminState.policies.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('security')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Retention</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('log')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'log'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log ({adminState.auditLog.length})</span>
        </button>
      </div>

      {/* TAB 0: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                System Administration & Institutional Controls
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Role authorizations, immutable cryptographic audit logs, and statutory policy lifecycle governance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('log')}
                className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Inspect Audit Log</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Admin Staff</span>
              <p className="text-2xl font-bold text-brandNavy">{adminState.adminUsers.length} Officers</p>
              <p className="text-[10px] text-textSecondary">Designated institutional personnel</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Active Policies</span>
              <p className="text-2xl font-bold text-emerald-700">{adminState.policies.length} Documents</p>
              <p className="text-[10px] text-emerald-700">Annual board review schedule</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Audit Trail</span>
              <p className="text-2xl font-bold text-brandNavy">{adminState.auditLog.length} Records</p>
              <p className="text-[10px] text-textSecondary">SHA-256 hash-chained log</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Retention Rules</span>
              <p className="text-2xl font-bold text-purple-700">{adminState.retentionRules.length} Schedules</p>
              <p className="text-[10px] text-purple-700">Statutory IFSCA basis</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ADMIN USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Statutory Staff Accounts (Exactly 5 Personnel)
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Role-based access matrix enforced under IFSCA Governance Reg. 7.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Staff ID</th>
                    <th className="py-2.5 px-3.5">Staff Name</th>
                    <th className="py-2.5 px-3.5">Role</th>
                    <th className="py-2.5 px-3.5">Department</th>
                    <th className="py-2.5 px-3.5">MFA Status</th>
                    <th className="py-2.5 px-3.5">Last Login (IST)</th>
                    <th className="py-2.5 px-3.5">Permissions Count</th>
                    <th className="py-2.5 px-3.5 text-right">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {user.id}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">
                        {user.name}
                        {user.id === currentUser.id && (
                          <span className="ml-1.5 px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-800 rounded font-semibold">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{user.role}</td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{user.department}</td>
                      <td className="py-2.5 px-3.5">
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hardware FIDO2</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {user.lastLoginIST}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-textPrimary">
                        {user.permissionsCount}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POLICY GOVERNANCE */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Statutory Policies & Mandatory Dual Sign-Off Approval
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Self-approval is strictly prohibited. Policies authored by Aarav Mehta require independent officer authorization.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Code</th>
                    <th className="py-2.5 px-3.5">Policy Title</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Version</th>
                    <th className="py-2.5 px-3.5">Effective Date</th>
                    <th className="py-2.5 px-3.5">Cadence</th>
                    <th className="py-2.5 px-3.5">Author (Maker)</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {policy.code}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{policy.title}</td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{policy.category}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px]">{policy.version}</td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {policy.effectiveDate}
                      </td>
                      <td className="py-2.5 px-3.5 text-[11px] text-textSecondary">
                        {policy.reviewCadence}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                        {policy.owner}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            policy.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        {policy.status === 'UNDER_REVISION' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPolicyForApproval(policy)}
                            className="px-2.5 py-1 bg-brandNavy text-white hover:bg-slate-900 rounded text-xs font-semibold shadow-2xs"
                          >
                            Approve policy
                          </button>
                        ) : (
                          <span className="text-textSecondary text-[11px]">Enforced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CRYPTOGRAPHIC AUDIT LOG */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Cryptographic Previous-Hash Audit Trail
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Every state mutation creates a SHA-256 block linked to the prior block. Immutable and tamper-evident.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-brandNavy bg-blue-50 px-2.5 py-1 rounded">
              Chain Genesis: Validated
            </span>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Timestamp (IST)</th>
                    <th className="py-2.5 px-3.5">Actor</th>
                    <th className="py-2.5 px-3.5">Action Code</th>
                    <th className="py-2.5 px-3.5">Entity</th>
                    <th className="py-2.5 px-3.5">Audit Hash Chain (Previous → Current)</th>
                    <th className="py-2.5 px-3.5">Audit Record Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.auditLog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3.5 font-mono text-[11px] text-textSecondary whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3.5 font-semibold text-textPrimary whitespace-nowrap">
                        {log.actor}
                      </td>
                      <td className="py-2 px-3.5 font-mono text-[11px] text-brandNavy font-bold whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-2 px-3.5 font-mono text-[11px] text-textSecondary whitespace-nowrap">
                        {log.targetEntity}:{log.entityId}
                      </td>
                      <td className="py-2 px-3.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                        <span className="text-slate-400">{log.previousHash.slice(0, 8)}...</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="text-brandNavy font-bold">{log.currentHash.slice(0, 8)}...</span>
                      </td>
                      <td className="py-2 px-3.5 text-textPrimary text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA RETENTION RULES */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Statutory Data Retention & Disposal Schedule
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Enforced retention schedules under IFSCA (Capital Market Intermediaries) Regulations.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Record Type</th>
                    <th className="py-2.5 px-3.5">Mandatory Retention</th>
                    <th className="py-2.5 px-3.5">Statutory Basis</th>
                    <th className="py-2.5 px-3.5">Storage Tier</th>
                    <th className="py-2.5 px-3.5 text-right">Enforcement Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.retentionRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                        {rule.category}
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{rule.recordType}</td>
                      <td className="py-2.5 px-3.5 font-bold text-brandNavy font-mono">
                        {rule.retentionYears} Years
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-800">
                        {rule.statutoryBasis}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {rule.storageTier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {rule.enforcementMode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACCESS HISTORY */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Identity & Access Session History (Last 20 Logins)
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              mTLS and FIDO2 authentication events across IFSCA enterprise portals.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Staff Officer</th>
                    <th className="py-2.5 px-3.5">Application</th>
                    <th className="py-2.5 px-3.5">Auth Protocol</th>
                    <th className="py-2.5 px-3.5">Source IP</th>
                    <th className="py-2.5 px-3.5 text-right">Auth Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.accessHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {row.timestamp}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{row.staffName}</td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{row.application}</td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-800">{row.authMethod}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {row.ipAddress}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHANGE APPROVAL HISTORY */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Change Management & Dual Authorization Register
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Historical ledger of policy revisions, control modifications, and legal hold actions.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Change Ref</th>
                    <th className="py-2.5 px-3.5">Requested At</th>
                    <th className="py-2.5 px-3.5">Change Type</th>
                    <th className="py-2.5 px-3.5">Target Entity</th>
                    <th className="py-2.5 px-3.5">Maker</th>
                    <th className="py-2.5 px-3.5">Approver</th>
                    <th className="py-2.5 px-3.5">Verification Code</th>
                    <th className="py-2.5 px-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {adminState.changeApprovals.map((change) => (
                    <tr key={change.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {change.id}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {change.requestedAt}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                        {change.changeType}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {change.targetEntity}
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{change.requestedBy}</td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">
                        {change.approvedBy}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-brandNavy">
                        {change.signoffVerificationCode}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {change.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LEGAL ENTITY PROFILE */}
      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Licensed Broker-Dealer & Clearing Member Entity Settings
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Statutory registration parameters registered with International Financial Services Centres Authority.
            </p>
          </div>

          <form
            onSubmit={handleSaveLegalEntity}
            className="bg-white p-5 rounded-lg border border-borderColor shadow-xs space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                  Legal Corporate Name
                </label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full p-2 border border-borderColor rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                  Entity Category & Licensing
                </label>
                <input
                  type="text"
                  required
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full p-2 border border-borderColor rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                  IFSCA Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full p-2 border border-borderColor rounded-md font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                  Registered IFSC Office Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-borderColor rounded-md"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-borderColor flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save legal entity settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: SECURITY & NOTIFICATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notification Settings */}
          <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-borderColor pb-3">
              <Bell className="w-4 h-4 text-brandNavy" />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Regulatory Notification Preferences
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">Immediate Email Dispatches</span>
                <input
                  type="checkbox"
                  checked={adminState.notificationSettings.emailAlerts}
                  onChange={() => handleToggleNotification('emailAlerts')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">
                  SMS Alerts for Critical Glitches (&lt; 2h)
                </span>
                <input
                  type="checkbox"
                  checked={adminState.notificationSettings.smsUrgentGlitchAlerts}
                  onChange={() => handleToggleNotification('smsUrgentGlitchAlerts')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">In-App Audio Tone for Priority Events</span>
                <input
                  type="checkbox"
                  checked={adminState.notificationSettings.inAppNotificationSound}
                  onChange={() => handleToggleNotification('inAppNotificationSound')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">
                  Automatic Dispatch for Severity-1 Incident Filing
                </span>
                <input
                  type="checkbox"
                  checked={adminState.notificationSettings.criticalIncidentImmediateDispatch}
                  onChange={() => handleToggleNotification('criticalIncidentImmediateDispatch')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-borderColor pb-3">
              <Lock className="w-4 h-4 text-brandNavy" />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                System Security & IAM Hardening
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">Mandatory Hardware Token (FIDO2)</span>
                <input
                  type="checkbox"
                  checked={adminState.securitySettings.mandatoryMfa}
                  onChange={() => handleToggleSecurity('mandatoryMfa')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="text-textPrimary font-semibold">IP Subnet Whitelisting Enforced</span>
                <input
                  type="checkbox"
                  checked={adminState.securitySettings.ipAllowlistEnabled}
                  onChange={() => handleToggleSecurity('ipAllowlistEnabled')}
                  className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
                />
              </label>

              <div className="p-2.5 rounded bg-slate-50 flex items-center justify-between">
                <span className="text-textPrimary font-semibold">Idle Session Timeout</span>
                <span className="font-mono font-bold text-brandNavy">
                  {adminState.securitySettings.sessionTimeoutMinutes} minutes
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 flex items-center justify-between">
                <span className="text-textPrimary font-semibold">Max Failed Auth Attempts</span>
                <span className="font-mono font-bold text-brandNavy">
                  {adminState.securitySettings.maxFailedAttempts} attempts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Policy Dual Sign-Off Approval (Propagation #13) */}
      {selectedPolicyForApproval && (
        <Modal
          open={Boolean(selectedPolicyForApproval)}
          onClose={() => setSelectedPolicyForApproval(null)}
          title={`Approve Policy: ${selectedPolicyForApproval.code}`}
          subtitle={selectedPolicyForApproval.title}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-textSecondary leading-relaxed">
              Under IFSCA Governance Mandate, statutory policies must be independently authorized by a designated executive officer. Author self-approval is strictly forbidden.
            </p>

            <ApprovalPanel
              currentUser={currentUser}
              maker={selectedPolicyForApproval.owner}
              requiredSignoffs={1}
              assignedApprover="Rohan Desai"
              onApprove={(approverName) => {
                approvePolicy(selectedPolicyForApproval.id);
                setSelectedPolicyForApproval(null);
                toast.show({
                  message: `Policy ${selectedPolicyForApproval.code} approved by ${approverName} and marked ACTIVE.`,
                  variant: 'success',
                });
              }}
              onReject={(reason) => {
                setSelectedPolicyForApproval(null);
                toast.show({
                  message: `Policy approval rejected: ${reason}`,
                  variant: 'warning',
                });
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;
