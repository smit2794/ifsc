// src/pages/Governance/GovernancePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building,
  UserCheck,
  AlertTriangle,
  Clock,
  Plus,
  Download,
  Search,
  Shield,
  Edit2,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import {
  useGovernance,
  useAdminState,
  useCurrentUser,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { CountdownClock } from '../../components/ui/CountdownClock';
import { ChecklistItem } from '../../components/ui/ChecklistItem';
import { OrgChart } from '../../components/ui/OrgChart';
import { RosterGrid } from '../../components/ui/RosterGrid';
import { PermissionMatrix, RoleColumn, PersonPermissions } from '../../components/ui/PermissionMatrix';
import { WizardModal, WizardStep } from '../../components/ui/WizardModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { ExportFormatModal } from '../../components/ui/ExportFormatModal';
import { useToast } from '../../components/ui/Toast';
import {
  StaffName,
  StaffId,
  OfficerCardData,
  KMPProfile,
  ConflictOfInterestEntry,
  UserProfile,
} from '../../types';

const STAFF_MEMBERS: Array<{ id: StaffId; name: StaffName; role: string; department: string }> = [
  { id: 'USR-001', name: 'Aarav Mehta', role: 'Compliance Officer', department: 'Compliance' },
  { id: 'USR-002', name: 'Rohan Desai', role: 'Principal Officer', department: 'Executive Governance' },
  { id: 'USR-003', name: 'Priya Nair', role: 'Risk Officer', department: 'Risk Management' },
  { id: 'USR-004', name: 'Vikram Shah', role: 'Chief Information Security Officer', department: 'Information Security' },
  { id: 'USR-005', name: 'Deepa Patel', role: 'Trading Desk Officer', department: 'Trading Operations' },
];

export const GovernancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const governance = useGovernance();
  const adminState = useAdminState();
  const currentUser = useCurrentUser();
  const startOfficerChange = useAppStore((s) => s.startOfficerChange);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const addCOIEntry = useAppStore((s) => s.addCOIEntry);
  const setBackupOfficer = useAppStore((s) => s.setBackupOfficer);
  const updateLegalEntitySettings = useAppStore((s) => s.updateLegalEntitySettings);

  // Active Tab from URL
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab && ['overview', 'organization', 'officers', 'people', 'roles', 'training'].includes(rawTab)) return rawTab;
    return 'overview';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['overview', 'organization', 'officers', 'people', 'roles', 'training'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'overview';
      navigate(buildLink('/governance', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Active Drawers from URL
  const activeOfficerKey = searchParams.get('officer'); // 'po' | 'co'
  const activeEmployeeId = searchParams.get('employee'); // 'EMP-xxx' | 'USR-xxx'

  // Modals State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [officerChangeConfirmOpen, setOfficerChangeConfirmOpen] = useState(false);
  const [backupOfficerModalOpen, setBackupOfficerModalOpen] = useState(false);
  const [uploadQualModalOpen, setUploadQualModalOpen] = useState(false);
  const [addCOIModalOpen, setAddCOIModalOpen] = useState(false);
  const [editEntityModalOpen, setEditEntityModalOpen] = useState(false);
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [exportRosterModalOpen, setExportRosterModalOpen] = useState(false);

  // Search in People directory
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Add Appointment Wizard Form State
  const [wizardOfficer, setWizardOfficer] = useState<StaffName>('Aarav Mehta');
  const [wizardRole, setWizardRole] = useState<'Principal Officer' | 'Compliance Officer'>('Compliance Officer');
  const [wizardCertNo, setWizardCertNo] = useState('');
  const [wizardEffectiveDate, setWizardEffectiveDate] = useState(
    new Date(Date.now() + 15 * 86_400_000).toISOString().slice(0, 10)
  );
  const [wizardConflictError, setWizardConflictError] = useState<string | null>(null);

  // Edit Legal Entity Settings Form State
  const [entityName, setEntityName] = useState(adminState.legalEntitySettings.legalName);
  const [entityRegNo, setEntityRegNo] = useState(adminState.legalEntitySettings.ifscRegistrationNo);
  const [entityAddress, setEntityAddress] = useState(adminState.legalEntitySettings.registeredAddress);

  // Add COI Form State
  const [coiStaffName, setCoiStaffName] = useState<StaffName>('Aarav Mehta');
  const [coiEntity, setCoiEntity] = useState('');
  const [coiNature, setCoiNature] = useState('');
  const [coiProtocol, setCoiProtocol] = useState('');

  // Selected employee for drawer
  const selectedEmployee = useMemo(() => {
    if (!activeEmployeeId) return null;
    return governance.staff.find((s) => s.id === activeEmployeeId || s.name === activeEmployeeId);
  }, [activeEmployeeId, governance.staff]);

  // Selected officer for drawer
  const selectedOfficer: OfficerCardData | null = useMemo(() => {
    if (activeOfficerKey === 'po') return governance.officers.po;
    if (activeOfficerKey === 'co') return governance.officers.co;
    return null;
  }, [activeOfficerKey, governance.officers]);

  // Separation check validation
  const isSeparationPassing = governance.officers.po.name !== governance.officers.co.name;

  // Run separation check action
  const handleRunSeparationCheck = () => {
    if (isSeparationPassing) {
      show({
        message: `Separation Check: PASS. Principal Officer (${governance.officers.po.name}) and Compliance Officer (${governance.officers.co.name}) held by separate individuals.`,
        variant: 'success',
      });
    } else {
      show({
        message: 'Separation Check: FAIL. Dual appointment detected without independent segregation.',
        variant: 'error',
      });
    }
  };

  // Tab switch
  const handleTabChange = (tabKey: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.tab = tabKey;
    navigate(buildLink('/governance', params));
  };

  // Open Officer Drawer
  const handleOpenOfficerDrawer = (roleKey: 'po' | 'co') => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.officer = roleKey;
    navigate(buildLink('/governance', params));
  };

  // Open Employee Drawer
  const handleOpenEmployeeDrawer = (empId: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.employee = empId;
    navigate(buildLink('/governance', params));
  };

  // Handle Wizard Submission
  const handleFinishWizard = () => {
    // Check PO != CO rule
    if (wizardRole === 'Principal Officer' && wizardOfficer === governance.officers.co.name) {
      setWizardConflictError(`Conflict Detected: ${wizardOfficer} currently serves as Compliance Officer.`);
      return;
    }
    if (wizardRole === 'Compliance Officer' && wizardOfficer === governance.officers.po.name) {
      setWizardConflictError(`Conflict Detected: ${wizardOfficer} currently serves as Principal Officer.`);
      return;
    }

    setWizardOpen(false);
    show({
      message: `Appointment initiated: ${wizardOfficer} as ${wizardRole} effective ${wizardEffectiveDate}`,
      variant: 'success',
    });
  };

  // Handle Start Officer Change Confirmation
  const handleConfirmOfficerChange = () => {
    startOfficerChange({
      officer: 'Aarav Mehta',
      role: 'Compliance Officer',
      effectiveDate: new Date(Date.now() + 15 * 86_400_000).toISOString().slice(0, 10),
    });
    setOfficerChangeConfirmOpen(false);
    show({
      message: '15-Day statutory officer change notice created and clock started.',
      variant: 'success',
    });
  };

  // Handle Backup Officer Designation
  const handleSelectBackupOfficer = (staffName: StaffName) => {
    setBackupOfficer(staffName);
    setBackupOfficerModalOpen(false);
    show({
      message: `Officer designated: ${staffName} assigned as Backup Compliance Officer`,
      variant: 'success',
    });
  };

  // Handle Save Legal Entity Settings
  const handleSaveLegalEntity = (e: React.FormEvent) => {
    e.preventDefault();
    updateLegalEntitySettings({
      legalName: entityName.trim(),
      ifscRegistrationNo: entityRegNo.trim(),
      registeredAddress: entityAddress.trim(),
    });
    setEditEntityModalOpen(false);
    show({
      message: 'Settings saved',
      variant: 'success',
    });
  };

  // Handle Add Conflict of Interest
  const handleAddCOISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coiEntity.trim()) return;

    const assigned = STAFF_MEMBERS.find((s) => s.name === coiStaffName);
    const newEntry: ConflictOfInterestEntry = {
      id: `COI-${(governance.coiRegister.length + 1).toString().padStart(3, '0')}`,
      staffId: assigned ? assigned.id : 'USR-001',
      staffName: coiStaffName,
      entityName: coiEntity.trim(),
      natureOfHolding: coiNature.trim() || 'Direct equity and non-executive directorship',
      disclosedDate: new Date().toISOString().slice(0, 10),
      status: 'UNDER_REVIEW',
      mitigationProtocol: coiProtocol.trim() || 'Recusal from supervisory approvals relating to declared counterparty.',
      reviewedBy: currentUser.name,
    };

    addCOIEntry(newEntry);
    setAddCOIModalOpen(false);
    setCoiEntity('');
    setCoiNature('');
    setCoiProtocol('');
    show({
      message: 'Conflict of interest declaration recorded in statutory register',
      variant: 'success',
    });
  };

  // Wizard Steps for "Add appointment"
  const appointmentWizardSteps: WizardStep[] = [
    {
      title: 'Select Officer',
      description: 'Choose qualified officer from the 5 staff members',
      content: (
        <div className="space-y-3">
          <label className="block font-semibold text-textPrimary">Institutional Officer</label>
          <div className="space-y-2">
            {STAFF_MEMBERS.map((s) => (
              <label
                key={s.id}
                className={`p-3 border rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                  wizardOfficer === s.name ? 'border-brandNavy bg-blue-50/60' : 'border-borderColor hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-bold text-xs text-textPrimary">{s.name}</p>
                  <p className="text-[11px] text-textSecondary">{s.role} · {s.department}</p>
                </div>
                <input
                  type="radio"
                  name="officerRadio"
                  checked={wizardOfficer === s.name}
                  onChange={() => {
                    setWizardOfficer(s.name);
                    setWizardConflictError(null);
                  }}
                  className="text-brandNavy focus:ring-brandNavy"
                />
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Target Role',
      description: 'Select key governance office under IFSCA CMI guidelines',
      content: (
        <div className="space-y-3">
          <label className="block font-semibold text-textPrimary">Governance Designation</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'Principal Officer' as const, desc: 'Overall leadership and exchange liaison' },
              { role: 'Compliance Officer' as const, desc: 'Regulatory assurance, surveillance, and disclosures' },
            ].map((r) => (
              <div
                key={r.role}
                onClick={() => {
                  setWizardRole(r.role);
                  setWizardConflictError(null);
                }}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  wizardRole === r.role ? 'border-brandNavy bg-blue-50/60' : 'border-borderColor hover:bg-gray-50'
                }`}
              >
                <p className="font-bold text-xs text-textPrimary">{r.role}</p>
                <p className="text-[11px] text-textSecondary mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Qualifications & NISM',
      description: 'Record certification numbers and statutory exemptions',
      content: (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">NISM / Regulatory Certification</label>
            <input
              type="text"
              value={wizardCertNo}
              onChange={(e) => setWizardCertNo(e.target.value)}
              placeholder="e.g. NISM-Series-III-A Cert No. 2026-40192"
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
            />
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200 text-textSecondary">
            <p className="font-semibold text-brandNavy">Regulatory Note</p>
            <p className="mt-1">
              Pursuant to IFSCA CMI Reg. 9(2), the Compliance Officer must hold valid NISM-Series-III-A or recognized professional qualification (CS/CA/LLB).
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Effective Date & Auto-Check',
      description: 'Validate PO ≠ CO separation rule and confirm appointment',
      content: (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Effective Appointment Date</label>
            <input
              type="date"
              value={wizardEffectiveDate}
              onChange={(e) => setWizardEffectiveDate(e.target.value)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-borderColor rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-textPrimary">Automated PO ≠ CO Separation Validation:</span>
              {(wizardRole === 'Principal Officer' && wizardOfficer === governance.officers.co.name) ||
              (wizardRole === 'Compliance Officer' && wizardOfficer === governance.officers.po.name) ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  CONFLICT DETECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  VALIDATION PASS
                </span>
              )}
            </div>
            <p className="text-[11px] text-textSecondary">
              Appointee ({wizardOfficer}) must maintain strictly distinct operational responsibilities.
            </p>
          </div>

          {wizardConflictError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{wizardConflictError}</span>
            </div>
          )}
        </div>
      ),
      validate: () => {
        if (wizardRole === 'Principal Officer' && wizardOfficer === governance.officers.co.name) {
          setWizardConflictError(`Conflict: ${wizardOfficer} currently serves as Compliance Officer.`);
          return false;
        }
        if (wizardRole === 'Compliance Officer' && wizardOfficer === governance.officers.po.name) {
          setWizardConflictError(`Conflict: ${wizardOfficer} currently serves as Principal Officer.`);
          return false;
        }
        return true;
      },
    },
  ];

  // Permission Matrix Setup
  const roleColumns: RoleColumn[] = [
    { key: 'trading', label: 'Trading Execution', isTradingRole: true },
    { key: 'orders', label: 'Order Placement', isTradingRole: true },
    { key: 'funds', label: 'Client Fund Access' },
    { key: 'compliance', label: 'Compliance Attestation' },
    { key: 'riskOverride', label: 'Risk Parameter Override' },
  ];

  const peoplePermissions: PersonPermissions[] = [
    {
      id: 'USR-001',
      name: 'Aarav Mehta',
      department: 'Compliance',
      primaryRole: 'Compliance Officer',
      roles: { trading: false, orders: false, funds: false, compliance: true, riskOverride: false },
    },
    {
      id: 'USR-002',
      name: 'Rohan Desai',
      department: 'Executive Governance',
      primaryRole: 'Principal Officer',
      roles: { trading: false, orders: false, funds: true, compliance: false, riskOverride: true },
    },
    {
      id: 'USR-003',
      name: 'Priya Nair',
      department: 'Risk Management',
      primaryRole: 'Risk Officer',
      roles: { trading: false, orders: false, funds: false, compliance: false, riskOverride: true },
    },
    {
      id: 'USR-004',
      name: 'Vikram Shah',
      department: 'Information Security',
      primaryRole: 'Chief Information Security Officer',
      roles: { trading: false, orders: false, funds: false, compliance: false, riskOverride: false },
    },
    {
      id: 'USR-005',
      name: 'Deepa Patel',
      department: 'Trading Operations',
      primaryRole: 'Trading Desk Officer',
      roles: { trading: true, orders: true, funds: false, compliance: true, riskOverride: false },
      hasConflict: true,
      conflictDetails: {
        roleKey: 'compliance',
        caseId: 'CASE-2026-031',
        message: 'Segregation of Duties Conflict: Trading Desk Officer holds compliance privilege.',
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Governance & People"
        subtitle="Key managerial appointments, organizational hierarchy, staff duty roster, and segregation of duties."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded-md transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Appointment</span>
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-borderColor pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview & Separation' },
          { key: 'organization', label: 'Org Tree & Regulated Entity' },
          { key: 'officers', label: 'Officers & Key Appointments' },
          { key: 'people', label: 'People, Roster & Conduct' },
          { key: 'roles', label: 'Roles & Permission Matrix' },
          { key: 'training', label: 'Training & Certification' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-brandNavy text-white shadow-sm'
                : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* PO/CO Separation Banner */}
          <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-textPrimary">
                    Principal Officer & Compliance Officer Separation
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PASS · STATUTORY INDEPENDENCE
                  </span>
                </div>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                  Principal Officer held by <span className="font-bold text-textPrimary">{governance.officers.po.name}</span> ·
                  Compliance Officer held by <span className="font-bold text-textPrimary">{governance.officers.co.name}</span>.
                  Distinct individuals satisfied per IFSCA (Capital Market Intermediaries) Regulations, 2021.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunSeparationCheck}
              className="px-3 py-2 text-xs font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded-md transition-all shrink-0"
            >
              Run separation check
            </button>
          </div>

          {/* 15-Day Notice Tracker (if active) */}
          {governance.changeNotice && (
            <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-lg shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    15-Day Statutory Officer Change Notice Active
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    STATUS: {governance.changeNotice.status}
                  </span>
                </div>
                <p className="text-xs text-textPrimary mt-1">
                  Officer: <span className="font-bold">{governance.changeNotice.officer}</span> · Target Role:{' '}
                  <span className="font-bold">{governance.changeNotice.role}</span> · Effective Date:{' '}
                  <span className="font-bold">{governance.changeNotice.effectiveDate}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <CountdownClock
                  targetTime={new Date(new Date(governance.changeNotice.startedAt).getTime() + 15 * 86_400_000).toISOString()}
                  label="Notice Deadline"
                />
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/tasks'))}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
                >
                  View Task
                </button>
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/reports'))}
                  className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
                >
                  View Report
                </button>
              </div>
            </div>
          )}

          {/* Middle Row: KMPs & Office Opening Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KMP List Card */}
            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brandNavy" />
                  <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                    Key Managerial Personnel (KMPs)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-textSecondary">4 Certified KMPs</span>
              </div>

              <div className="divide-y divide-borderColor">
                {governance.kmps.map((kmp: KMPProfile) => (
                  <div
                    key={kmp.id}
                    onClick={() => handleOpenEmployeeDrawer(kmp.id)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 rounded transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-textPrimary">{kmp.name}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">{kmp.designation}</p>
                      <p className="text-[10px] text-textSecondary font-mono mt-0.5">Ref: {kmp.dinOrRegistration}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Fit & Proper Attested
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Opening Readiness Checklist (8 items) */}
            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-brandNavy" />
                  <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                    Trading Day Opening Readiness Checklist (GIFT IFSC)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-textSecondary font-mono">
                  {governance.officeReadiness.filter((i) => i.status === 'CONFIRMED').length} of{' '}
                  {governance.officeReadiness.length} checks confirmed
                </span>
              </div>

              <div className="space-y-2">
                {governance.officeReadiness.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    status={item.status}
                    onChange={() => toggleChecklistItem('office', item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATION */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          {/* Org Tree Card */}
          <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-borderColor mb-6">
              <div>
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Organizational Hierarchy & Supervisory Lines
                </h3>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Visual reporting chart representing 5 institutional staff nodes. Click any box to inspect profile.
                </p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-brandNavy px-2.5 py-1 rounded border border-blue-200">
                5 Active Staff Nodes
              </span>
            </div>

            <div className="overflow-x-auto py-4 flex justify-center">
              <OrgChart
                data={governance.orgTree}
                onNodeClick={(node) => handleOpenEmployeeDrawer(node.id)}
              />
            </div>
          </div>

          {/* Legal Entity Registration Profile */}
          <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-borderColor mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-brandNavy" />
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Regulated Legal Entity & Activity Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditEntityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
              >
                <Edit2 className="w-3.5 h-3.5 text-textSecondary" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-bgPage rounded border border-borderColor">
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Entity Legal Name</span>
                <p className="font-bold text-textPrimary mt-0.5">{adminState.legalEntitySettings.legalName}</p>
                <p className="text-[11px] text-textSecondary mt-1">{adminState.legalEntitySettings.entityType}</p>
              </div>
              <div className="p-3 bg-bgPage rounded border border-borderColor">
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Regulatory Registration No.</span>
                <p className="font-bold text-brandNavy font-mono mt-0.5">{adminState.legalEntitySettings.ifscRegistrationNo}</p>
                <p className="text-[11px] text-textSecondary mt-1">GIFT SEZ Unit Authority</p>
              </div>
              <div className="p-3 bg-bgPage rounded border border-borderColor">
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Global Access Flag</span>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {adminState.legalEntitySettings.globalAccess ? 'Enabled' : 'Restricted (Domestic SEZ Scope)'}
                </p>
                <p className="text-[11px] text-textSecondary mt-1">No cross-border retail solicitation</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-borderColor">
              <span className="text-[11px] font-bold text-textPrimary block mb-2">Permitted Regulated Activities:</span>
              <div className="flex flex-wrap gap-2">
                {adminState.legalEntitySettings.activities.map((act) => (
                  <span
                    key={act}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-brandNavy border border-blue-200"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICERS */}
      {activeTab === 'officers' && (
        <div className="space-y-6">
          {/* Officer Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Principal Officer Card */}
            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brandNavy" />
                    <h3 className="text-xs font-bold text-textPrimary tracking-tight">Principal Officer (PO)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {governance.officers.po.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-sm font-bold text-textPrimary">{governance.officers.po.name}</span>
                    <p className="text-[11px] text-textSecondary">{governance.officers.po.appointedSince}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">Residency Status</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.po.residencyStatus}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">Qualifications & Experience</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.po.qualificationSummary}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">NISM Regulatory Standing</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.po.regulatoryNISM}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-borderColor mt-4 flex items-center justify-between">
                <span className="text-[11px] text-textSecondary">
                  Annual attestation: {governance.officers.po.annualCertificationDate.slice(0, 10)}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenOfficerDrawer('po')}
                  className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Compliance Officer Card */}
            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brandNavy" />
                    <h3 className="text-xs font-bold text-textPrimary tracking-tight">Compliance Officer (CO)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {governance.officers.co.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-sm font-bold text-textPrimary">{governance.officers.co.name}</span>
                    <p className="text-[11px] text-textSecondary">{governance.officers.co.appointedSince}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">Residency Status</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.co.residencyStatus}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">Qualifications & Experience</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.co.qualificationSummary}</p>
                  </div>
                  <div className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase">NISM Regulatory Standing</span>
                    <p className="font-medium text-textPrimary mt-0.5">{governance.officers.co.regulatoryNISM}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-borderColor mt-4 flex items-center justify-between">
                <span className="text-[11px] text-textSecondary">
                  Annual attestation: {governance.officers.co.annualCertificationDate.slice(0, 10)}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenOfficerDrawer('co')}
                  className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-textPrimary">Officer Lifecycle Operations</h4>
              <p className="text-[11px] text-textSecondary">
                Manage statutory appointment notices, backup succession, and empanelment files.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOfficerChangeConfirmOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 rounded"
              >
                Start Officer Change (15-Day Clock)
              </button>

              <button
                type="button"
                onClick={() => setBackupOfficerModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
              >
                Assign Backup Officer
              </button>

              <button
                type="button"
                onClick={() => setUploadQualModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
              >
                Upload Qualification Document
              </button>
            </div>
          </div>

          {governance.backupOfficer && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Active Backup Compliance Officer:</span> {governance.backupOfficer}
              </div>
              <span className="text-[10px] font-semibold bg-teal-100 px-2 py-0.5 rounded">Designated</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PEOPLE & CONDUCT */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          {/* Staff Directory Table */}
          <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
            <div className="p-4 border-b border-borderColor flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder="Search staff members..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
                />
              </div>

              <button
                type="button"
                onClick={() => setAddEmployeeModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Name & Ref</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">KMP Standing</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {governance.staff
                    .filter((s) => s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()))
                    .map((person: UserProfile) => (
                      <tr
                        key={person.id}
                        onClick={() => handleOpenEmployeeDrawer(person.id)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-brandNavy flex items-center justify-center font-bold text-xs">
                              {person.avatarInitials}
                            </div>
                            <div>
                              <p className="font-semibold text-textPrimary">{person.name}</p>
                              <p className="text-[10px] text-textSecondary font-mono">{person.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-textPrimary">{person.role}</td>
                        <td className="py-3 px-3 text-textSecondary">{person.department}</td>
                        <td className="py-3 px-3 text-textSecondary">
                          <p>{person.email}</p>
                          <p className="text-[10px]">{person.phone}</p>
                        </td>
                        <td className="py-3 px-3">
                          {person.isKMP ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brandNavy">
                              Key Managerial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                              Operations
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEmployeeDrawer(person.id);
                            }}
                            className="text-xs font-semibold text-brandNavy hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roster Grid (5 Staff x 7 Days) */}
          <div className="space-y-3">
            <RosterGrid roster={governance.roster} />
          </div>

          {/* Conflict of Interest Register */}
          <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4">
              <div>
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Conflict of Interest Register (Statutory Disclosures)
                </h3>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Records declared external business directorships, equity holdings, and mitigation protocols.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddCOIModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Entry</span>
              </button>
            </div>

            <div className="divide-y divide-borderColor">
              {governance.coiRegister.map((coi: ConflictOfInterestEntry) => (
                <div key={coi.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-textPrimary">{coi.staffName}</span>
                      <span className="text-[10px] font-mono text-textSecondary bg-gray-100 px-1.5 py-0.2 rounded">
                        {coi.id}
                      </span>
                    </div>
                    <p className="text-textSecondary mt-0.5">
                      Entity: <span className="font-medium text-textPrimary">{coi.entityName}</span> · {coi.natureOfHolding}
                    </p>
                    <p className="text-[11px] text-brandNavy mt-0.5">
                      Protocol: {coi.mitigationProtocol}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coi.status === 'MITIGATED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : coi.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {coi.status}
                    </span>
                    <span className="text-[11px] text-textSecondary font-mono">{coi.disclosedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding & Offboarding Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
              <h3 className="text-xs font-bold text-textPrimary mb-3">Onboarding Compliance Checklist (10 Items)</h3>
              <div className="space-y-2">
                {governance.onboardingChecklist.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    status={item.status}
                    onChange={() => toggleChecklistItem('onboarding', item.id)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
              <h3 className="text-xs font-bold text-textPrimary mb-3">Offboarding & Revocation Checklist (10 Items)</h3>
              <div className="space-y-2">
                {governance.offboardingChecklist.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    status={item.status}
                    onChange={() => toggleChecklistItem('offboarding', item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ROLES & PERMISSION MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-borderColor mb-4">
              <div>
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Institutional Segregation of Duties (SoD) Permission Matrix
                </h3>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Clicking the red conflict cell navigates to the active remediation investigation case.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExportRosterModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
              >
                <Download className="w-3.5 h-3.5 text-textSecondary" />
                <span>Export Roster</span>
              </button>
            </div>

            <PermissionMatrix
              roles={roleColumns}
              people={peoplePermissions}
            />
          </div>
        </div>
      )}

      {/* TAB 6: TRAINING & CERTIFICATION */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
            <div className="p-4 border-b border-borderColor flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Mandatory Regulatory Training Records (15 Records)
                </h3>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Includes AML/CFT, Market Conduct, Information Security, and Ethics modules across all 5 staff members.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Staff Name</th>
                    <th className="py-2.5 px-3">Module Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Completed Date</th>
                    <th className="py-2.5 px-3">Validity</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {governance.trainingRecords.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => handleOpenEmployeeDrawer(t.staffId)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-textPrimary">{t.staffName}</td>
                      <td className="py-3 px-3 text-textPrimary">{t.moduleTitle}</td>
                      <td className="py-3 px-3 text-textSecondary">{t.category}</td>
                      <td className="py-3 px-3 tabular-nums font-bold text-brandNavy">{t.scorePercent}%</td>
                      <td className="py-3 px-3 tabular-nums text-textSecondary">{t.completedDate}</td>
                      <td className="py-3 px-3 tabular-nums text-textSecondary">{t.validUntil}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
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

      {/* Detail Drawer: Officer Details (?officer=po | ?officer=co) */}
      <DetailDrawer
        paramKey="officer"
        title={selectedOfficer ? `${selectedOfficer.role} · ${selectedOfficer.name}` : 'Officer Details'}
      >
        {selectedOfficer && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brandNavy">
                {selectedOfficer.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {selectedOfficer.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-textPrimary">{selectedOfficer.name}</h3>
              <p className="text-textSecondary mt-1">{selectedOfficer.qualificationSummary}</p>
            </div>

            <div className="space-y-2.5 p-3 bg-bgPage rounded border border-borderColor">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Appointment Authority</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedOfficer.appointedSince}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Residency Mandate</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedOfficer.residencyStatus}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Regulatory Certifications</span>
                <p className="font-bold text-brandNavy mt-0.5">{selectedOfficer.regulatoryNISM}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUploadQualModalOpen(true)}
                className="w-full py-2 bg-brandNavy text-white hover:bg-brandNavy/90 rounded text-xs font-semibold"
              >
                Upload Qualification Document
              </button>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Detail Drawer: Employee Profile (?employee=EMP-xxx) */}
      <DetailDrawer
        paramKey="employee"
        title={selectedEmployee ? `${selectedEmployee.name} · Profile` : 'Employee Details'}
      >
        {selectedEmployee && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brandNavy">
                {selectedEmployee.id}
              </span>
              {selectedEmployee.isKMP && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Key Managerial Personnel
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-textPrimary">{selectedEmployee.name}</h3>
              <p className="text-brandNavy font-medium mt-0.5">{selectedEmployee.role}</p>
              <p className="text-textSecondary text-[11px] mt-0.5">{selectedEmployee.department}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-bgPage rounded border border-borderColor">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Email</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedEmployee.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Phone</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedEmployee.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Appointed Date</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedEmployee.appointmentDate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Registration No.</span>
                <p className="font-bold text-textPrimary mt-0.5">{selectedEmployee.regulatoryRegistrationNo || 'N/A'}</p>
              </div>
            </div>

            {/* Employee's Declared Conflicts */}
            <div>
              <span className="text-[11px] font-bold text-textPrimary block mb-2">Declared Interests:</span>
              {governance.coiRegister.filter((c) => c.staffId === selectedEmployee.id).length === 0 ? (
                <p className="p-3 bg-gray-50 border border-borderColor rounded text-textSecondary">
                  Zero active conflicts of interest declared.
                </p>
              ) : (
                governance.coiRegister
                  .filter((c) => c.staffId === selectedEmployee.id)
                  .map((c) => (
                    <div key={c.id} className="p-2.5 bg-blue-50/50 border border-blue-200 rounded">
                      <p className="font-bold text-brandNavy">{c.entityName}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">{c.natureOfHolding}</p>
                      <p className="text-[10px] text-brandNavy mt-0.5">Protocol: {c.mitigationProtocol}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: Add Appointment Wizard (4 steps) */}
      <WizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Institutional Officer Appointment Wizard"
        steps={appointmentWizardSteps}
        onFinish={handleFinishWizard}
        finishLabel="Confirm & Appoint"
      />

      {/* Dialog: Confirm Officer Change (Starts 15-day notice) */}
      <ConfirmDialog
        open={officerChangeConfirmOpen}
        onConfirm={handleConfirmOfficerChange}
        onCancel={() => setOfficerChangeConfirmOpen(false)}
        title="Start Statutory Officer Change Notice"
        message="Pursuant to IFSCA General Clauses Reg. 14, initiating this change notice starts an irrevocable 15-day statutory notification clock to the Authority and schedules filing generation."
        confirmText="Start 15-Day Clock"
        variant="warning"
      />

      {/* Modal: Assign Backup Officer */}
      <Modal
        open={backupOfficerModalOpen}
        onClose={() => setBackupOfficerModalOpen(false)}
        title="Assign Backup Compliance Officer"
        subtitle="Select qualified officer to assume operational compliance duties in primary officer absence."
        size="sm"
      >
        <div className="space-y-2">
          {STAFF_MEMBERS.map((s) => (
            <div
              key={s.id}
              onClick={() => handleSelectBackupOfficer(s.name)}
              className="p-3 border border-borderColor rounded hover:border-brandNavy hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-xs text-textPrimary">{s.name}</p>
                <p className="text-[11px] text-textSecondary">{s.role}</p>
              </div>
              <span className="text-[10px] font-mono text-textSecondary">{s.id}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Upload Qualification Document */}
      <Modal
        open={uploadQualModalOpen}
        onClose={() => setUploadQualModalOpen(false)}
        title="Upload Qualification Attestation Document"
        subtitle="Compute cryptographic SHA-256 seal and archive in officer verification docket."
        size="md"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setUploadQualModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Close
            </button>
          </div>
        }
      >
        <FileUploadBox
          onUpload={(_file, hash) => {
            setUploadQualModalOpen(false);
            show({
              message: `Qualification document uploaded (SHA-256: ${hash.slice(0, 16)}...)`,
              variant: 'success',
            });
          }}
        />
      </Modal>

      {/* Modal: Edit Legal Entity Settings */}
      <Modal
        open={editEntityModalOpen}
        onClose={() => setEditEntityModalOpen(false)}
        title="Edit Regulated Legal Entity Settings"
        subtitle="Update entity registration number, office domicile, and active authorizations."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditEntityModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLegalEntity}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
            >
              Save Settings
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveLegalEntity} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Entity Legal Name</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">IFSC Registration Ref</label>
            <input
              type="text"
              value={entityRegNo}
              onChange={(e) => setEntityRegNo(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Registered SEZ Address</label>
            <textarea
              value={entityAddress}
              onChange={(e) => setEntityAddress(e.target.value)}
              rows={2}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Add Conflict of Interest Entry */}
      <Modal
        open={addCOIModalOpen}
        onClose={() => setAddCOIModalOpen(false)}
        title="Record Conflict of Interest Declaration"
        subtitle="Mandatory annual and event-driven declaration of external interests."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddCOIModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCOISubmit}
              disabled={!coiEntity.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Record Declaration
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddCOISubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Declaring Officer</label>
              <select
                value={coiStaffName}
                onChange={(e) => setCoiStaffName(e.target.value as StaffName)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">External Entity Name</label>
              <input
                type="text"
                value={coiEntity}
                onChange={(e) => setCoiEntity(e.target.value)}
                placeholder="e.g. FinTech Alpha Ventures Ltd"
                className="w-full p-2 border border-borderColor rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Nature of Holding / Directorship</label>
            <input
              type="text"
              value={coiNature}
              onChange={(e) => setCoiNature(e.target.value)}
              placeholder="e.g. 5.2% non-controlling equity holding and non-executive advisory board"
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Mitigation & Recusal Protocol</label>
            <textarea
              value={coiProtocol}
              onChange={(e) => setCoiProtocol(e.target.value)}
              rows={2}
              placeholder="Detail required recusal protocols from trading and approval workflows..."
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Add Employee Placeholder */}
      <Modal
        open={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        title="Add Institutional Staff Member"
        subtitle="Institutional staff is fixed to the 5 approved institutional profiles in GIFT IFSC."
        size="sm"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAddEmployeeModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Close
            </button>
          </div>
        }
      >
        <p className="text-xs text-textSecondary leading-relaxed">
          The institutional roster for Meridian Securities IFSC Limited is governed strictly by the 5 statutory officers
          (Aarav Mehta, Rohan Desai, Priya Nair, Vikram Shah, Deepa Patel) under the active broker-dealer licence.
        </p>
      </Modal>

      {/* Modal: Export Roster */}
      <ExportFormatModal
        open={exportRosterModalOpen}
        onClose={() => setExportRosterModalOpen(false)}
        title="Staff Duty Roster & SoD Matrix"
      />
    </div>
  );
};

export default GovernancePage;
