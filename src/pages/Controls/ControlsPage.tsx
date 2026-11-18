// src/pages/Controls/ControlsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  Plus,
  Download,
  ArrowRight,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { waitDelay } from '../../utils/delay';
import {
  useControls,
  useIntegrations,
  useCurrentUser,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { StatusChip } from '../../components/ui/StatusChip';
import { CitationChip } from '../../components/ui/CitationChip';
import { DonutChart, DonutSegment } from '../../components/ui/charts/DonutChart';
import { RelationshipGraph, GraphNode, GraphEdge } from '../../components/ui/RelationshipGraph';
import { Modal } from '../../components/ui/Modal';
import { ExportFormatModal } from '../../components/ui/ExportFormatModal';
import { useToast } from '../../components/ui/Toast';
import {
  ControlItem,
  ControlDomain,
  ControlFrequency,
  StaffName,
  StaffId,
} from '../../types';

const STAFF_MEMBERS: Array<{ id: StaffId; name: StaffName; role: string }> = [
  { id: 'USR-001', name: 'Aarav Mehta', role: 'Compliance Officer' },
  { id: 'USR-002', name: 'Rohan Desai', role: 'Principal Officer' },
  { id: 'USR-003', name: 'Priya Nair', role: 'Risk Officer' },
  { id: 'USR-004', name: 'Vikram Shah', role: 'Chief Information Security Officer' },
  { id: 'USR-005', name: 'Deepa Patel', role: 'Trading Desk Officer' },
];

export const ControlsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const controls = useControls();
  const integrations = useIntegrations();
  const currentUser = useCurrentUser();
  const evaluateControl = useAppStore((s) => s.evaluateControl);
  const createControl = useAppStore((s) => s.createControl);
  const updateControl = useAppStore((s) => s.updateControl);

  // Active drawer control
  const activeControlId = searchParams.get('control');
  const activeControl = controls.find((c) => c.id === activeControlId || c.code === activeControlId);

  // Active Tab from URL (?tab=dashboard | library | exceptions | map)
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'overview') return 'dashboard';
    if (rawTab === 'graph') return 'map';
    if (['dashboard', 'library', 'exceptions', 'map'].includes(rawTab)) return rawTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'library', 'exceptions', 'map', 'overview', 'graph'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/controls', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'CODE' | 'TITLE' | 'STATUS'>('CODE');

  // Evaluating loading state for live test execution
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationNote, setEvaluationNote] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [remediationModalOpen, setRemediationModalOpen] = useState(false);
  const [retestModalOpen, setRetestModalOpen] = useState(false);
  const [linkEvidenceModalOpen, setLinkEvidenceModalOpen] = useState(false);

  // Create Control Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState<ControlDomain>('Governance & Staffing');
  const [newFrequency, setNewFrequency] = useState<ControlFrequency>('CONTINUOUS');
  const [newOwner, setNewOwner] = useState<StaffName>(currentUser.name);
  const [newDescription, setNewDescription] = useState('');

  // Remediation Action Form State
  const [remediationAction, setRemediationAction] = useState('');
  const [remediationOwner, setRemediationOwner] = useState<StaffName>('Aarav Mehta');
  const [remediationDueDate, setRemediationDueDate] = useState(
    new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)
  );

  // Retest Schedule Form State
  const [retestDate, setRetestDate] = useState(
    new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
  );

  // Evidence Link Form State
  const [evidenceSelection, setEvidenceSelection] = useState('EVD-001');

  // KPI calculations
  const passCount = controls.filter((c) => c.status === 'PASS').length;
  const failCount = controls.filter((c) => c.status === 'FAIL').length;
  const warningCount = controls.filter((c) => c.status === 'WARNING').length;
  const unknownCount = controls.filter((c) => c.status === 'UNKNOWN').length;

  // Formula: UNKNOWN is strictly excluded from compliant % denominator
  const evaluatedDenominator = passCount + failCount + warningCount;
  const compliantPercentage = evaluatedDenominator > 0
    ? Math.round((passCount / evaluatedDenominator) * 100)
    : 100;

  // Donut chart data with hatched UNKNOWN segment
  const donutData: DonutSegment[] = useMemo(() => [
    { name: 'PASS', value: passCount, color: '#10B981' },
    { name: 'FAIL', value: failCount, color: '#EF4444' },
    { name: 'WARNING', value: warningCount, color: '#F59E0B' },
    { name: 'UNKNOWN', value: unknownCount, isUnknown: true },
  ], [passCount, failCount, warningCount, unknownCount]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    overview: controls.length,
    library: controls.length,
    exceptions: controls.filter((c) => c.status === 'FAIL' || c.status === 'WARNING').length,
    graph: controls.length,
  }), [controls]);

  // Filtered and Sorted Controls
  const filteredControls = useMemo(() => {
    return controls
      .filter((c) => {
        if (activeTab === 'exceptions' && c.status !== 'FAIL' && c.status !== 'WARNING') return false;
        if (domainFilter !== 'ALL' && c.domain !== domainFilter) return false;
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCode = c.code.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
          const matchesTitle = c.title.toLowerCase().includes(q);
          const matchesDesc = c.description.toLowerCase().includes(q);
          const matchesOwner = c.owner.toLowerCase().includes(q);
          if (!matchesCode && !matchesTitle && !matchesDesc && !matchesOwner) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.code.localeCompare(b.code);
        if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
        return a.status.localeCompare(b.status);
      });
  }, [controls, activeTab, domainFilter, statusFilter, searchQuery, sortBy]);

  // Tab switch
  const handleTabChange = (tabKey: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.tab = tabKey;
    navigate(buildLink('/controls', params));
  };

  // Open Control Drawer
  const handleOpenControl = (ctrlId: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.control = ctrlId;
    navigate(buildLink('/controls', params));
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDomainFilter('ALL');
    setStatusFilter('ALL');
  };

  // Run Evaluation Action (Story A & Story B logic)
  const handleRunEvaluation = async () => {
    if (!activeControl) return;
    setIsEvaluating(true);
    setEvaluationNote(null);

    await waitDelay(1500);
    const result = evaluateControl(activeControl.id);
    setIsEvaluating(false);

    if (activeControl.id === 'GOV-SOD-001') {
      if (result === 'PASS') {
        setEvaluationNote('Evaluation passed: CASE-2026-031 closed and remediation evidence verified.');
        show({ message: 'GOV-SOD-001 evaluation: PASS. Access conflict resolved.', variant: 'success' });
      } else {
        setEvaluationNote(
          'Evaluation FAIL: Deepa Patel still holds conflicting compliance privilege in Okta directory. SSO/IAM and HR connectors are HEALTHY (connector freshness is not the blocking factor). Resolve CASE-2026-031 to pass.'
        );
        show({ message: 'GOV-SOD-001 evaluation: FAIL. Segregation of duties conflict persists.', variant: 'error' });
      }
    } else if (['TRADE-REC-001', 'TRADE-REC-002', 'TRADE-ACCESS-003', 'TRADE-RISK-004'].includes(activeControl.id)) {
      if (result === 'UNKNOWN') {
        setEvaluationNote(
          'Evaluation UNKNOWN: Upstream Risk Management System (RMS) connector is STALE (>4 hours). Telemetry cannot be verified until RMS is resynced in Integrations.'
        );
        show({ message: `${activeControl.id} evaluation: UNKNOWN. RMS connector is STALE.`, variant: 'warning' });
      } else {
        setEvaluationNote('Evaluation PASS: RMS feed freshly synced and trade order telemetry reconciled.');
        show({ message: `${activeControl.id} evaluation: PASS. Trade reconciliation verified.`, variant: 'success' });
      }
    } else {
      show({ message: `Evaluation completed: ${activeControl.code} status confirmed as ${result}`, variant: 'success' });
    }
  };

  // Create Control Submit
  const handleCreateControlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assigned = STAFF_MEMBERS.find((s) => s.name === newOwner);
    const newId = `CTL-${(controls.length + 1).toString().padStart(3, '0')}`;
    const code = newCode.trim() || `CTL-OPS-${(controls.length + 1).toString().padStart(3, '0')}`;

    const newCtrl: ControlItem = {
      id: newId,
      code,
      title: newTitle.trim(),
      domain: newDomain,
      status: 'PASS',
      frequency: newFrequency,
      owner: newOwner,
      ownerId: assigned ? assigned.id : 'USR-001',
      connectorDependencies: [],
      lastEvaluated: new Date().toISOString(),
      evidenceCount: 0,
      description: newDescription.trim() || 'Institutional operational control for IFSC governance compliance.',
      evaluationLogic: 'Automated event-stream telemetry verification.',
      sourceRegulationId: 'S2',
    };

    createControl(newCtrl);
    setCreateModalOpen(false);
    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    show({ message: `Control ${code} created`, variant: 'success' });
  };

  // Add Remediation Plan
  const handleAddRemediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeControl || !remediationAction.trim()) return;

    const currentPlan = activeControl.remediationPlan || [];
    const newAction = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      action: remediationAction.trim(),
      owner: remediationOwner,
      dueDate: remediationDueDate,
    };

    updateControl(activeControl.id, {
      remediationPlan: [...currentPlan, newAction],
    });

    setRemediationModalOpen(false);
    setRemediationAction('');
    show({ message: 'Remediation action added to control plan', variant: 'success' });
  };

  // Schedule Retest
  const handleScheduleRetest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeControl) return;

    updateControl(activeControl.id, {
      retestDate,
    });

    setRetestModalOpen(false);
    show({ message: `Retest scheduled for ${retestDate}`, variant: 'info' });
  };

  // Link Evidence
  const handleLinkEvidence = () => {
    if (!activeControl) return;

    updateControl(activeControl.id, {
      evidenceCount: activeControl.evidenceCount + 1,
    });

    setLinkEvidenceModalOpen(false);
    show({ message: `Evidence ${evidenceSelection} linked to control`, variant: 'success' });
  };

  // Dependency Graph nodes & edges
  const graphNodes: GraphNode[] = [
    { id: 'S2', label: 'IFSCA CMI Regs 2021', kind: 'REGULATION', status: 'ACTIVE' },
    { id: 'S7', label: 'Glitch Framework 2024', kind: 'REGULATION', status: 'ACTIVE' },
    { id: 'OBL-001', label: 'OBL-001 PO/CO Separation', kind: 'OBLIGATION', status: 'COMPLIANT' },
    { id: 'OBL-005', label: 'OBL-005 1-Hr Glitch Notice', kind: 'OBLIGATION', status: 'COMPLIANT' },
    { id: 'GOV-SOD-001', label: 'GOV-SOD-001 Segregation of Duties', kind: 'CONTROL', status: 'FAIL' },
    { id: 'TRADE-REC-001', label: 'TRADE-REC-001 Trade Reconciliation', kind: 'CONTROL', status: 'UNKNOWN' },
    { id: 'FIN-CAP-001', label: 'FIN-CAP-001 Net Worth Floor', kind: 'CONTROL', status: 'PASS' },
    { id: 'sso', label: 'SSO / Okta IAM', kind: 'SYSTEM', status: 'HEALTHY' },
    { id: 'hr', label: 'HR Directory (HRMS)', kind: 'SYSTEM', status: 'HEALTHY' },
    { id: 'rms', label: 'Risk Management System', kind: 'SYSTEM', status: 'STALE' },
    { id: 'CASE-2026-031', label: 'CASE-2026-031 SoD Remediation', kind: 'CASE', status: 'OPEN' },
    { id: 'EVD-001', label: 'EVD-001 Board Resolutions', kind: 'EVIDENCE', status: 'VERIFIED' },
  ];

  const graphEdges: GraphEdge[] = [
    { from: 'S2', to: 'OBL-001', label: 'Mandates' },
    { from: 'OBL-001', to: 'GOV-SOD-001', label: 'Enforces' },
    { from: 'sso', to: 'GOV-SOD-001', label: 'Telemetry' },
    { from: 'hr', to: 'GOV-SOD-001', label: 'Roster Feed' },
    { from: 'GOV-SOD-001', to: 'CASE-2026-031', label: 'Triggers' },
    { from: 'rms', to: 'TRADE-REC-001', label: 'Order Log' },
    { from: 'S7', to: 'OBL-005', label: 'Mandates' },
    { from: 'EVD-001', to: 'GOV-SOD-001', label: 'Attests' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Continuous Controls Monitoring"
        subtitle="Automated compliance control evaluation, dependency graph, and exception logs."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded-md text-textPrimary transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-textSecondary" />
              <span>Export results</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded-md transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Control</span>
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-borderColor pb-2 overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard & Posture', count: tabCounts.overview },
          { key: 'library', label: 'Control Library', count: tabCounts.library },
          { key: 'exceptions', label: 'Active Exceptions', count: tabCounts.exceptions },
          { key: 'map', label: 'Dependency Map', count: tabCounts.graph },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-brandNavy text-white shadow-sm'
                : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & DASHBOARD */}
      {(activeTab === 'dashboard' || activeTab === 'overview') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart: Posture & Readiness */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                    Control Compliance Standing
                  </h3>
                  <span className="text-[10px] text-textSecondary font-mono">
                    {evaluatedDenominator} Evaluated
                  </span>
                </div>

                <div className="py-4">
                  <DonutChart
                    data={donutData}
                    height={190}
                    centerText={{
                      value: `${compliantPercentage}%`,
                      label: 'Readiness',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-3 border-t border-borderColor">
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold block">PASS</span>
                  <span className="text-sm font-bold text-emerald-800 tabular-nums">{passCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-700 font-bold block">FAIL</span>
                  <span className="text-sm font-bold text-rose-800 tabular-nums">{failCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold block">WARN</span>
                  <span className="text-sm font-bold text-amber-800 tabular-nums">{warningCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-700 font-bold block">UNKNOWN</span>
                  <span className="text-sm font-bold text-slate-800 tabular-nums">{unknownCount}</span>
                </div>
              </div>
            </div>

            {/* Active Top Risks Card */}
            <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                      Critical Exceptions & Remediation Actions
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('exceptions')}
                    className="text-xs font-semibold text-brandNavy hover:underline"
                  >
                    View all exceptions ({tabCounts.exceptions})
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {controls
                    .filter((c) => c.status === 'FAIL')
                    .map((ctrl) => (
                      <div
                        key={ctrl.id}
                        className="p-4 bg-rose-50/70 border border-rose-200 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-rose-900 bg-rose-200 px-1.5 py-0.5 rounded">
                              {ctrl.id}
                            </span>
                            <span className="font-semibold text-textPrimary text-xs">{ctrl.title}</span>
                          </div>
                          <p className="text-[11px] text-rose-800 leading-relaxed">
                            {ctrl.exceptionDetail || ctrl.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenControl(ctrl.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(buildLink('/clients/cases/CASE-2026-031'))}
                            className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded flex items-center gap-1"
                          >
                            <span>Open Exception Case</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Stale RMS Dependent Controls Notice */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                          RMS DEPENDENCY
                        </span>
                        <span className="font-semibold text-textPrimary text-xs">
                          4 Trade Log Reconciliation Controls Stale
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        TRADE-REC-001, TRADE-REC-002, TRADE-ACCESS-003, and TRADE-RISK-004 require RMS resync.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(buildLink('/integrations'))}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded shrink-0"
                    >
                      Resync RMS Connector
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-borderColor text-[11px] text-textSecondary flex items-center justify-between">
                <span>UNKNOWN controls are strictly excluded from the readiness denominator.</span>
                <span className="font-semibold text-brandNavy">GIFT IFSC Rule 9 Assurance Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: CONTROL LIBRARY & ACTIVE EXCEPTIONS TABLE */}
      {(activeTab === 'library' || activeTab === 'exceptions') && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls by code, title, owner..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-brandNavy"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="ALL">All Domains</option>
                <option value="Governance & Staffing">Governance & Staffing</option>
                <option value="Market Operations">Market Operations</option>
                <option value="Cyber & Vendor Risk">Cyber & Vendor Risk</option>
                <option value="Financial & Capital">Financial & Capital</option>
                <option value="Client & AML">Client & Conduct</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="ALL">All Statuses</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="WARNING">Warning</option>
                <option value="UNKNOWN">Unknown</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'CODE' | 'TITLE' | 'STATUS')}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="CODE">Sort: Code</option>
                <option value="TITLE">Sort: Title</option>
                <option value="STATUS">Sort: Status</option>
              </select>

              {(domainFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim()) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-2.5 py-1.5 text-xs text-textSecondary hover:text-brandNavy hover:bg-gray-50 rounded border border-borderColor flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Controls Data Table */}
          <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Control Ref & Title</th>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Last Evaluated</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {filteredControls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-textSecondary">
                        No controls match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredControls.map((ctrl) => (
                      <tr
                        key={ctrl.id}
                        onClick={() => handleOpenControl(ctrl.id)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-brandNavy bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {ctrl.code}
                            </span>
                            <div>
                              <span className="font-medium text-textPrimary line-clamp-1">{ctrl.title}</span>
                              {ctrl.needsRevaluation && (
                                <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Re-evaluation needed
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-textSecondary">{ctrl.domain}</td>
                        <td className="py-3 px-3">
                          <StatusChip status={ctrl.status} />
                        </td>
                        <td className="py-3 px-3">{ctrl.frequency}</td>
                        <td className="py-3 px-3">{ctrl.owner}</td>
                        <td className="py-3 px-3 tabular-nums text-textSecondary">
                          {ctrl.lastEvaluated.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ctrl.status === 'FAIL' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(buildLink('/clients/cases/CASE-2026-031'));
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 rounded"
                              >
                                Open Case
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenControl(ctrl.id);
                              }}
                              className="text-xs font-semibold text-brandNavy hover:underline"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEPENDENCY GRAPH */}
      {(activeTab === 'map' || activeTab === 'graph') && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4">
              <div>
                <h3 className="text-xs font-bold text-textPrimary tracking-tight">
                  Regulatory, Operational & Systems Dependency Map
                </h3>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Visual relationship network connecting statutes, continuous controls, connectors, and remediation cases.
                </p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-brandNavy px-2.5 py-1 rounded border border-blue-200">
                12 Node Interactive Topology
              </span>
            </div>

            <RelationshipGraph
              nodes={graphNodes}
              edges={graphEdges}
              onNodeClick={(node) => {
                if (node.kind === 'CONTROL') {
                  handleOpenControl(node.id);
                } else if (node.kind === 'CASE') {
                  navigate(buildLink(`/clients/cases/${node.id}`));
                } else if (node.kind === 'OBLIGATION') {
                  navigate(buildLink('/obligations', { obligation: node.id }));
                } else if (node.kind === 'SYSTEM') {
                  navigate(buildLink('/integrations'));
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Control Detail Drawer (?control=CTL-xxx) */}
      <DetailDrawer
        paramKey="control"
        title={activeControl ? `${activeControl.code} · Detail` : 'Control Details'}
      >
        {activeControl && (
          <div className="space-y-5 text-xs">
            {/* Header Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brandNavy">
                {activeControl.domain}
              </span>
              <div className="flex items-center gap-1.5">
                {activeControl.needsRevaluation && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Re-evaluation needed
                  </span>
                )}
                <StatusChip status={activeControl.status} />
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-sm font-bold text-textPrimary leading-snug">{activeControl.title}</h3>
              <p className="text-textSecondary mt-2 leading-relaxed">{activeControl.description}</p>
            </div>

            {/* Statutory Reference & Citation */}
            <div className="p-3 bg-blue-50/60 rounded border border-blue-200 space-y-1.5">
              <span className="text-[10px] font-bold text-brandNavy uppercase block">Statutory Reference</span>
              <p className="font-semibold text-textPrimary">IFSCA (Capital Market Intermediaries) Regulations</p>
              <div className="pt-1">
                <CitationChip
                  code={activeControl.sourceRegulationId || 'S2'}
                  clause={activeControl.code}
                  sourceTitle="IFSCA Capital Market Intermediaries Framework"
                  clauseText={activeControl.description}
                  version="v2.4 (Active)"
                />
              </div>
            </div>

            {/* Live Evaluation Box */}
            <div className="p-3 bg-gray-50 border border-borderColor rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textPrimary">Live Automated Telemetry Evaluation</span>
                <button
                  type="button"
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded flex items-center gap-1 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                  <span>{isEvaluating ? 'Running Telemetry...' : 'Run evaluation'}</span>
                </button>
              </div>

              {evaluationNote && (
                <div
                  className={`p-2.5 rounded text-[11px] leading-relaxed border ${
                    activeControl.status === 'PASS'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : activeControl.status === 'UNKNOWN'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {evaluationNote}
                </div>
              )}
            </div>

            {/* Connector Dependencies & Health */}
            <div className="p-3 bg-white border border-borderColor rounded-md space-y-2">
              <span className="text-[10px] font-bold text-textSecondary uppercase block">Connector Dependencies</span>
              {activeControl.connectorDependencies.length === 0 ? (
                <p className="text-textSecondary">Internal telemetry (no external upstream connector dependency).</p>
              ) : (
                <div className="space-y-1.5">
                  {activeControl.connectorDependencies.map((dep) => {
                    const conn = integrations.find((i) => i.id === dep || i.code.toLowerCase().includes(dep));
                    const isHealthy = conn ? conn.status === 'HEALTHY' : false;
                    return (
                      <div key={dep} className="flex items-center justify-between p-2 bg-bgPage rounded border border-borderColor">
                        <span className="font-semibold text-textPrimary uppercase">{dep}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isHealthy ? 'HEALTHY' : 'STALE (>4H)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-bgPage rounded border border-borderColor">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Assigned Officer</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeControl.owner}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Cadence</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeControl.frequency}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Last Evaluated</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeControl.lastEvaluated.slice(0, 10)}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Evidence Count</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeControl.evidenceCount} dossiers</p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="p-3 bg-white border border-borderColor rounded-md space-y-2">
              <span className="text-[11px] font-bold text-textPrimary block">Remediation & Review Actions</span>
              <div className="flex flex-wrap gap-2">
                {activeControl.status === 'FAIL' && (
                  <button
                    type="button"
                    onClick={() => navigate(buildLink('/clients/cases/CASE-2026-031'))}
                    className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Open Exception Case</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setRemediationModalOpen(true)}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Add Remediation Action
                </button>

                <button
                  type="button"
                  onClick={() => setRetestModalOpen(true)}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Schedule Retest
                </button>

                <button
                  type="button"
                  onClick={() => setLinkEvidenceModalOpen(true)}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Link Evidence
                </button>
              </div>
            </div>

            {/* Active Remediation Plan */}
            {activeControl.remediationPlan && activeControl.remediationPlan.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-textPrimary block">Scheduled Remediation Actions</span>
                <div className="space-y-1.5">
                  {activeControl.remediationPlan.map((act) => (
                    <div key={act.id} className="p-2.5 bg-bgPage rounded border border-borderColor text-xs">
                      <p className="font-semibold text-textPrimary">{act.action}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        Owner: {act.owner} · Target: {act.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Modal: Create Control */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Operational Compliance Control"
        subtitle="Define continuous or event-driven evaluation logic for regulatory posture."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateControlSubmit}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Register Control
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateControlSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">
              Control Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Real-Time BMC Margin Requirement Monitoring"
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Control Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. CTL-FIN-009"
                className="w-full p-2 border border-borderColor rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Domain</label>
              <select
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value as ControlDomain)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="Governance & Staffing">Governance & Staffing</option>
                <option value="Market Operations">Market Operations</option>
                <option value="Cyber & Vendor Risk">Cyber & Vendor Risk</option>
                <option value="Financial & Capital">Financial & Capital</option>
                <option value="Client & AML">Client & Conduct</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Evaluation Cadence</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as ControlFrequency)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="CONTINUOUS">Continuous (Real-time)</option>
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Assigned Officer</label>
              <select
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value as StaffName)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Description & Objective</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Detail testing procedure, verification thresholds, and data feeds..."
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Add Remediation Action */}
      <Modal
        open={remediationModalOpen}
        onClose={() => setRemediationModalOpen(false)}
        title="Add Remediation Action"
        subtitle="Log corrective operational step to address control finding."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRemediationModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddRemediation}
              disabled={!remediationAction.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Add Action
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Remediation Action</label>
            <input
              type="text"
              value={remediationAction}
              onChange={(e) => setRemediationAction(e.target.value)}
              placeholder="e.g. Revoke Okta compliance permission in directory"
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Target Owner</label>
            <select
              value={remediationOwner}
              onChange={(e) => setRemediationOwner(e.target.value as StaffName)}
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
            <label className="block font-semibold text-textPrimary mb-1">Target Completion Date</label>
            <input
              type="date"
              value={remediationDueDate}
              onChange={(e) => setRemediationDueDate(e.target.value)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Schedule Retest */}
      <Modal
        open={retestModalOpen}
        onClose={() => setRetestModalOpen(false)}
        title="Schedule Control Retest"
        subtitle="Set scheduled evaluation date after corrective remediation."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRetestModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleScheduleRetest}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
            >
              Save Schedule
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Retest Date</label>
            <input
              type="date"
              value={retestDate}
              onChange={(e) => setRetestDate(e.target.value)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Link Evidence */}
      <Modal
        open={linkEvidenceModalOpen}
        onClose={() => setLinkEvidenceModalOpen(false)}
        title="Link Verification Evidence"
        subtitle="Attach sealed cryptographic evidence dossier to control record."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLinkEvidenceModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLinkEvidence}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
            >
              Confirm Link
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Select Evidence Dossier</label>
            <select
              value={evidenceSelection}
              onChange={(e) => setEvidenceSelection(e.target.value)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            >
              <option value="EVD-001">EVD-001 · Board Resolutions & Officer Appointments</option>
              <option value="EVD-002">EVD-002 · FIX Order Gateway Technical Telemetry Log</option>
              <option value="EVD-003">EVD-003 · Quarterly Capital Adequacy BMC Certificate</option>
              <option value="EVD-004">EVD-004 · Okta User Permission Directory Export</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal: Export Format */}
      <ExportFormatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Continuous Controls Assurance Ledger"
      />
    </div>
  );
};

export default ControlsPage;
