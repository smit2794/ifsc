// src/pages/Obligations/ObligationsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpenCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  ExternalLink,
  RotateCcw,
  FileText,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import {
  useObligations,
  useCurrentUser,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { CitationChip } from '../../components/ui/CitationChip';
import { MonthCalendar, CalendarEvent } from '../../components/ui/MonthCalendar';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Modal } from '../../components/ui/Modal';
import { ExportFormatModal } from '../../components/ui/ExportFormatModal';
import { BarChart } from '../../components/ui/charts/BarChart';
import { useToast } from '../../components/ui/Toast';
import {
  ObligationItem,
  ObligationCategory,
  ObligationFrequency,
  StaffName,
  StaffId,
  TaskItem,
} from '../../types';

const STAFF_MEMBERS: Array<{ id: StaffId; name: StaffName; role: string }> = [
  { id: 'USR-001', name: 'Aarav Mehta', role: 'Compliance Officer' },
  { id: 'USR-002', name: 'Rohan Desai', role: 'Principal Officer' },
  { id: 'USR-003', name: 'Priya Nair', role: 'Risk Officer' },
  { id: 'USR-004', name: 'Vikram Shah', role: 'Chief Information Security Officer' },
  { id: 'USR-005', name: 'Deepa Patel', role: 'Trading Desk Officer' },
];

export const ObligationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const obligations = useObligations();
  const currentUser = useCurrentUser();
  const updateObligation = useAppStore((s) => s.updateObligation);
  const addObligation = useAppStore((s) => s.addObligation);
  const createTask = useAppStore((s) => s.createTask);
  const addAuditRequest = useAppStore((s) => s.addAuditRequest);

  // Active drawer obligation
  const activeObligationId = searchParams.get('obligation');
  const activeObligation = obligations.find((o) => o.id === activeObligationId);

  // Active tab
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'critical' || rawTab === 'recurring') return 'all';
    if (['dashboard', 'all', 'calendar', 'overdue'].includes(rawTab)) return rawTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'all', 'calendar', 'overdue', 'critical', 'recurring'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/obligations', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'DUE_DATE' | 'CODE' | 'TITLE'>('DUE_DATE');

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<'owner' | 'reviewer'>('owner');
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [evidenceRequestModalOpen, setEvidenceRequestModalOpen] = useState(false);

  // Proposal Form State
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalCode, setProposalCode] = useState('');
  const [proposalCategory, setProposalCategory] = useState<ObligationCategory>('Governance & Officers');
  const [proposalFrequency, setProposalFrequency] = useState<ObligationFrequency>('QUARTERLY');
  const [proposalStatRef, setProposalStatRef] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalOwner, setProposalOwner] = useState<StaffName>(currentUser.name);
  const [proposalCritical, setProposalCritical] = useState(false);

  // Create Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Evidence Request Form State
  const [requestTitle, setRequestTitle] = useState('');
  const [requestAuditor, setRequestAuditor] = useState('Independent External Auditor');

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      dashboard: obligations.length,
      all: obligations.length,
      calendar: obligations.length,
      overdue: obligations.filter((o) => o.status === 'OVERDUE').length,
    };
  }, [obligations]);

  // KPI calculations
  const totalCount = obligations.length;
  const compliantCount = obligations.filter((o) => o.status === 'COMPLIANT').length;
  const upcomingCount = obligations.filter((o) => o.status === 'UPCOMING' || o.status === 'UNDER_REVIEW').length;
  const overdueCount = obligations.filter((o) => o.status === 'OVERDUE').length;

  // Category breakdown for chart
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {
      'Governance & Officers': 0,
      'Financial & Capital': 0,
      'Reporting & Filings': 0,
      'Cyber & Operations': 0,
      'Client & Conduct': 0,
    };

    obligations.forEach((o) => {
      if (counts[o.category] !== undefined) {
        counts[o.category]++;
      }
    });

    return [
      { category: 'Governance', count: counts['Governance & Officers'] },
      { category: 'Financial', count: counts['Financial & Capital'] },
      { category: 'Reporting', count: counts['Reporting & Filings'] },
      { category: 'Cyber/IT', count: counts['Cyber & Operations'] },
      { category: 'Client', count: counts['Client & Conduct'] },
    ];
  }, [obligations]);

  // Filtered and Sorted Obligations
  const filteredObligations = useMemo(() => {
    return obligations
      .filter((obl) => {
        // Tab filtering
        if (activeTab === 'overdue' && obl.status !== 'OVERDUE') return false;
        if (activeTab === 'critical' && !obl.criticalObligation) return false;
        if (activeTab === 'recurring') {
          const isRecurring =
            obl.frequency === 'CONTINUOUS' || obl.frequency === 'EVENT_DRIVEN' || obl.status === 'OVERDUE';
          if (!isRecurring) return false;
        }

        // Dropdown filters
        if (categoryFilter !== 'ALL' && obl.category !== categoryFilter) return false;
        if (frequencyFilter !== 'ALL' && obl.frequency !== frequencyFilter) return false;
        if (statusFilter !== 'ALL' && obl.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCode = obl.code.toLowerCase().includes(q);
          const matchesTitle = obl.title.toLowerCase().includes(q);
          const matchesRef = obl.statutoryReference.toLowerCase().includes(q);
          const matchesOwner = obl.owner.toLowerCase().includes(q);
          if (!matchesCode && !matchesTitle && !matchesRef && !matchesOwner) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.code.localeCompare(b.code);
        if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [obligations, activeTab, categoryFilter, frequencyFilter, statusFilter, searchQuery, sortBy]);

  // Calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return obligations.map((obl) => ({
      id: obl.id,
      date: obl.dueDate,
      title: `${obl.code} - ${obl.title}`,
      type: 'OBLIGATION',
      status: obl.status,
    }));
  }, [obligations]);

  // Tab switch
  const handleTabChange = (tabKey: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.tab = tabKey;
    navigate(buildLink('/obligations', params));
  };

  // Open obligation drawer
  const handleOpenObligation = (id: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.obligation = id;
    navigate(buildLink('/obligations', params));
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setFrequencyFilter('ALL');
    setStatusFilter('ALL');
  };

  // Submit Proposal
  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim()) return;

    const assignedStaff = STAFF_MEMBERS.find((s) => s.name === proposalOwner);
    const newId = `OBL-${(obligations.length + 1).toString().padStart(3, '0')}`;
    const code = proposalCode.trim() || `OBL-REG-${(obligations.length + 1).toString().padStart(3, '0')}`;

    const newObligation: ObligationItem = {
      id: newId,
      code,
      title: proposalTitle.trim(),
      category: proposalCategory,
      status: 'UPCOMING',
      criticalObligation: proposalCritical,
      dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      frequency: proposalFrequency,
      owner: proposalOwner,
      ownerId: assignedStaff ? assignedStaff.id : 'USR-001',
      maker: currentUser.name,
      approver: 'Rohan Desai',
      checkerApprover: proposalCritical ? 'Priya Nair' : undefined,
      statutoryReference: proposalStatRef.trim() || 'Schedule as configured per exchange template',
      linkedRegulationId: 'S2',
      description: proposalDesc.trim() || 'Institutional compliance obligation registered for governance monitoring.',
      evidenceCount: 0,
    };

    addObligation(newObligation);
    setProposalModalOpen(false);
    setProposalTitle('');
    setProposalCode('');
    setProposalStatRef('');
    setProposalDesc('');
    show({ message: `Obligation ${code} successfully registered`, variant: 'success' });
  };

  // Assign Owner or Reviewer
  const handleStaffAssign = (staff: { id: StaffId; name: StaffName }) => {
    if (!activeObligation) return;

    if (assignTarget === 'owner') {
      updateObligation(activeObligation.id, { owner: staff.name, ownerId: staff.id });
      show({ message: `Owner assigned to ${staff.name}`, variant: 'info' });
    } else {
      updateObligation(activeObligation.id, { approver: staff.name });
      show({ message: `Reviewer assigned to ${staff.name}`, variant: 'info' });
    }
    setAssignModalOpen(false);
  };

  // Open Create Task modal for obligation
  const handleOpenCreateTask = (obl: ObligationItem) => {
    setTaskTitle(`Execute compliance filing: ${obl.title}`);
    setTaskDueDate(obl.dueDate.slice(0, 10));
    setCreateTaskModalOpen(true);
  };

  const handleConfirmCreateTask = () => {
    if (!activeObligation || !taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title: taskTitle.trim(),
      priority: activeObligation.criticalObligation ? 'CRITICAL' : 'HIGH',
      status: 'OPEN',
      owner: activeObligation.owner,
      ownerId: activeObligation.ownerId,
      dueDate: new Date(taskDueDate).toISOString(),
      category: 'Obligations',
      linkedEntityType: 'OBLIGATION',
      linkedEntityId: activeObligation.id,
      description: `Action item created for obligation ${activeObligation.code} (${activeObligation.statutoryReference}).`,
    };

    createTask(newTask);
    setCreateTaskModalOpen(false);
    show({ message: `Task created and linked to ${activeObligation.code}`, variant: 'success' });
  };

  // Open Request Evidence Modal
  const handleOpenRequestEvidence = () => {
    if (!activeObligation) return;
    setRequestTitle(`Evidence verification dossier for ${activeObligation.code}`);
    setEvidenceRequestModalOpen(true);
  };

  const handleConfirmRequestEvidence = () => {
    if (!activeObligation || !requestTitle.trim()) return;

    addAuditRequest({
      title: requestTitle.trim(),
      auditor: requestAuditor.trim(),
      dueDate: activeObligation.dueDate,
      owner: activeObligation.owner,
    });

    setEvidenceRequestModalOpen(false);
    show({ message: 'Evidence request raised and added to audit room', variant: 'success' });
  };

  // Approve Obligation (calls updateObligation to set COMPLIANT)
  const handleObligationApproved = (approverName: StaffName) => {
    if (!activeObligation) return;
    updateObligation(activeObligation.id, {
      status: 'COMPLIANT',
      lastFiledDate: new Date().toISOString(),
    });
    show({
      message: `Obligation ${activeObligation.code} attested and approved by ${approverName}`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Regulatory Obligations"
        subtitle="Statutory compliance registry, regulatory calendar, and recurring filing tracking."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded-md text-textPrimary transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-textSecondary" />
              <span>Export list</span>
            </button>
            <button
              type="button"
              onClick={() => setProposalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded-md transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Obligation Proposal</span>
            </button>
          </div>
        }
      />

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Tracked</span>
            <BookOpenCheck className="w-4 h-4 text-brandNavy" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-textPrimary tabular-nums">{totalCount}</span>
            <span className="text-xs text-textSecondary">Obligations</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1">Across 5 statutory IFSC categories</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Compliant</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{compliantCount}</span>
            <span className="text-xs font-semibold text-emerald-700">
              {totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Attested with valid evidence dossiers</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Upcoming & Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700 tabular-nums">{upcomingCount}</span>
            <span className="text-xs text-textSecondary">Within 30–90 days</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1">Includes annual compliance audit filing</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700 tabular-nums">{overdueCount}</span>
            <span className="text-xs text-rose-700 font-semibold">{overdueCount === 0 ? 'Clear' : 'Action needed'}</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1">Zero statutory default tolerance</p>
        </div>
      </div>

      {/* Category Chart Strip */}
      <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4">
          <div>
            <h3 className="text-xs font-bold text-textPrimary tracking-tight">
              Obligation Distribution by Regulatory Category
            </h3>
            <p className="text-[11px] text-textSecondary">
              Breakdown across governance, capital adequacy, exchange filings, cyber risk, and conduct.
            </p>
          </div>
        </div>
        <BarChart
          data={categoryChartData}
          xAxisKey="category"
          series={[{ dataKey: 'count', name: 'Obligations', color: '#002147' }]}
          height={160}
        />
      </div>

      {/* Summary Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-borderColor pb-2 overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', count: tabCounts.dashboard },
          { key: 'all', label: 'All Obligations', count: tabCounts.all },
          { key: 'calendar', label: 'Regulatory Calendar', count: tabCounts.calendar },
          { key: 'overdue', label: 'Overdue', count: tabCounts.overdue },
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

      {/* Tab 2: Calendar View */}
      {activeTab === 'calendar' ? (
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-3 rounded border border-blue-200 text-xs text-brandNavy flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brandNavy" />
            <span>Click any event tag in the calendar below to inspect statutory details and evidence links.</span>
          </div>
          <MonthCalendar
            events={calendarEvents}
            onEventClick={(event) => handleOpenObligation(event.id)}
          />
        </div>
      ) : (
        <>
          {/* Filters & Search Controls */}
          <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search obligations by code, title, statute, owner..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-brandNavy"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="ALL">All Categories</option>
                <option value="Governance & Officers">Governance & Officers</option>
                <option value="Financial & Capital">Financial & Capital</option>
                <option value="Reporting & Filings">Reporting & Filings</option>
                <option value="Cyber & Operations">Cyber & Operations</option>
                <option value="Client & Conduct">Client & Conduct</option>
              </select>

              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="ALL">All Frequencies</option>
                <option value="ANNUAL">Annual</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CONTINUOUS">Continuous</option>
                <option value="EVENT_DRIVEN">Event Driven</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="OVERDUE">Overdue</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'DUE_DATE' | 'CODE' | 'TITLE')}
                className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
              >
                <option value="DUE_DATE">Sort: Due Date</option>
                <option value="CODE">Sort: Code</option>
                <option value="TITLE">Sort: Title</option>
              </select>

              {(categoryFilter !== 'ALL' || frequencyFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim()) && (
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

          {/* Obligations Data Table */}
          <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Code & Obligation Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Statutory Basis</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {filteredObligations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-textSecondary">
                        No obligations match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredObligations.map((obl) => (
                      <tr
                        key={obl.id}
                        onClick={() => handleOpenObligation(obl.id)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-brandNavy bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {obl.code}
                            </span>
                            <div>
                              <span className="font-medium text-textPrimary line-clamp-1">{obl.title}</span>
                              {obl.criticalObligation && (
                                <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Dual Sign-Off Required
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-textSecondary">{obl.category}</td>
                        <td className="py-3 px-3 text-textSecondary">
                          <span className="line-clamp-1">{obl.statutoryReference}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-textPrimary">{obl.frequency}</span>
                        </td>
                        <td className="py-3 px-3 tabular-nums text-textSecondary">
                          {obl.dueDate.slice(0, 10)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              obl.status === 'COMPLIANT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : obl.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {obl.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-textPrimary">{obl.owner}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === 'recurring' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreateTask(obl);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
                              >
                                Create Task
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenObligation(obl.id);
                              }}
                              className="text-xs font-semibold text-brandNavy hover:underline"
                            >
                              Details
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
        </>
      )}

      {/* Obligation Detail Drawer (?obligation=OBL-xxx) */}
      <DetailDrawer
        paramKey="obligation"
        title={activeObligation ? `${activeObligation.code} · Details` : 'Obligation Details'}
      >
        {activeObligation && (
          <div className="space-y-5 text-xs">
            {/* Header Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brandNavy">
                {activeObligation.category}
              </span>
              <div className="flex items-center gap-1.5">
                {activeObligation.criticalObligation && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Dual Checker Rule (2 Sign-Offs)
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    activeObligation.status === 'COMPLIANT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeObligation.status === 'OVERDUE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeObligation.status}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-sm font-bold text-textPrimary leading-snug">{activeObligation.title}</h3>
              <p className="text-textSecondary mt-2 leading-relaxed">{activeObligation.description}</p>
            </div>

            {/* Statutory Reference & Citation Chip */}
            <div className="p-3 bg-blue-50/60 rounded border border-blue-200 space-y-1.5">
              <span className="text-[10px] font-bold text-brandNavy uppercase block">Statutory Reference</span>
              <p className="font-semibold text-textPrimary">{activeObligation.statutoryReference}</p>
              <div className="pt-1">
                <CitationChip
                  code={activeObligation.linkedRegulationId || 'S2'}
                  clause={activeObligation.code}
                  sourceTitle={activeObligation.statutoryReference}
                  clauseText={activeObligation.description}
                  version="GIFT IFSC Gazetted"
                />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-bgPage rounded border border-borderColor">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Assigned Owner</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.owner}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Filing Cadence</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.frequency}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Statutory Due Date</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.dueDate.slice(0, 10)}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Maker Officer</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.maker}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Primary Approver</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.approver || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Independent Checker</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeObligation.checkerApprover || 'Not required'}</p>
              </div>
            </div>

            {/* Cross-Module Navigation Links (Section 9) */}
            <div className="p-3 bg-white border border-borderColor rounded-md space-y-2">
              <span className="text-[11px] font-bold text-textPrimary block">Audit Room & Evidence Links</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(buildLink('/evidence'))}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-brandNavy border border-borderColor rounded flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evidence Dossier ({activeObligation.evidenceCount} items)</span>
                  <ExternalLink className="w-3 h-3 text-textSecondary" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(buildLink('/ai', { tab: 'sources', source: activeObligation.linkedRegulationId || 'S2' }))}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-brandNavy border border-borderColor rounded flex items-center gap-1.5"
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>Inspect Regulation Source</span>
                  <ExternalLink className="w-3 h-3 text-textSecondary" />
                </button>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="p-3 bg-white border border-borderColor rounded-md space-y-2">
              <span className="text-[11px] font-bold text-textPrimary block">Obligation Actions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssignTarget('owner');
                    setAssignModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Assign Owner
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAssignTarget('reviewer');
                    setAssignModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Assign Reviewer
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreateTask(activeObligation)}
                  className="px-3 py-1.5 rounded bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 text-xs font-semibold"
                >
                  Create Task
                </button>

                <button
                  type="button"
                  onClick={handleOpenRequestEvidence}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Request Evidence
                </button>
              </div>
            </div>

            {/* Approval Panel with Maker-Checker Enforcement */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-textPrimary block">
                Statutory Attestation & Approval Workflow
              </span>
              <ApprovalPanel
                currentUser={{ id: currentUser.id, name: currentUser.name }}
                maker={activeObligation.maker}
                requiredSignoffs={activeObligation.criticalObligation ? 2 : 1}
                state={activeObligation.status === 'COMPLIANT' ? 'APPROVED' : 'PENDING_APPROVAL'}
                assignedApprover={activeObligation.approver}
                secondApprover={activeObligation.checkerApprover}
                approvedBy={activeObligation.status === 'COMPLIANT' ? [activeObligation.approver || 'Rohan Desai'] : []}
                onApprove={(approverName) => handleObligationApproved(approverName)}
                onReject={(reason) => {
                  updateObligation(activeObligation.id, { status: 'UNDER_REVIEW' });
                  show({ message: `Obligation rejected with reason: ${reason}`, variant: 'error' });
                }}
                onRoute={(approverName) => {
                  updateObligation(activeObligation.id, { approver: approverName });
                  show({ message: `Obligation routed to ${approverName}`, variant: 'info' });
                }}
              />
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: Add Obligation Proposal */}
      <Modal
        open={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title="Add Regulatory Obligation Proposal"
        subtitle="Submit new statutory requirement or exchange circular obligation for governance monitoring."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setProposalModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateProposal}
              disabled={!proposalTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Submit Obligation
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">
              Obligation Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="e.g. Schedule as configured per exchange template"
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Obligation Code</label>
              <input
                type="text"
                value={proposalCode}
                onChange={(e) => setProposalCode(e.target.value)}
                placeholder="e.g. OBL-REP-005"
                className="w-full p-2 border border-borderColor rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Category</label>
              <select
                value={proposalCategory}
                onChange={(e) => setProposalCategory(e.target.value as ObligationCategory)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="Governance & Officers">Governance & Officers</option>
                <option value="Financial & Capital">Financial & Capital</option>
                <option value="Reporting & Filings">Reporting & Filings</option>
                <option value="Cyber & Operations">Cyber & Operations</option>
                <option value="Client & Conduct">Client & Conduct</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Frequency</label>
              <select
                value={proposalFrequency}
                onChange={(e) => setProposalFrequency(e.target.value as ObligationFrequency)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CONTINUOUS">Continuous</option>
                <option value="EVENT_DRIVEN">Event Driven</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Assigned Owner</label>
              <select
                value={proposalOwner}
                onChange={(e) => setProposalOwner(e.target.value as StaffName)}
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
            <label className="block font-semibold text-textPrimary mb-1">Statutory Reference</label>
            <input
              type="text"
              value={proposalStatRef}
              onChange={(e) => setProposalStatRef(e.target.value)}
              placeholder="e.g. Schedule as configured per exchange template"
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Description & Requirements</label>
            <textarea
              value={proposalDesc}
              onChange={(e) => setProposalDesc(e.target.value)}
              rows={3}
              placeholder="Detail specific filing guidelines and evidence expectations..."
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="criticalCheck"
              checked={proposalCritical}
              onChange={(e) => setProposalCritical(e.target.checked)}
              className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
            />
            <label htmlFor="criticalCheck" className="font-semibold text-textPrimary">
              Critical Obligation (enforces dual maker-checker sign-off)
            </label>
          </div>
        </form>
      </Modal>

      {/* Modal: Staff Picker (Assign Owner / Reviewer) */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={assignTarget === 'owner' ? 'Assign Obligation Owner' : 'Assign Obligation Reviewer'}
        subtitle="Select designated officer from the 5 institutional staff members."
        size="sm"
      >
        <div className="space-y-2">
          {STAFF_MEMBERS.map((staff) => (
            <div
              key={staff.id}
              onClick={() => handleStaffAssign(staff)}
              className="p-3 border border-borderColor rounded hover:border-brandNavy hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-xs text-textPrimary">{staff.name}</p>
                <p className="text-[11px] text-textSecondary">{staff.role}</p>
              </div>
              <span className="text-[10px] font-mono text-textSecondary">{staff.id}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Create Linked Task */}
      <Modal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        title="Create Linked Compliance Task"
        subtitle="Schedule execution item in the task workspace."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCreateTask}
              disabled={!taskTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Request Evidence */}
      <Modal
        open={evidenceRequestModalOpen}
        onClose={() => setEvidenceRequestModalOpen(false)}
        title="Request Compliance Evidence"
        subtitle="Log statutory evidence collection requirement for auditor review."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEvidenceRequestModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRequestEvidence}
              disabled={!requestTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Raise Request
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Request Title</label>
            <input
              type="text"
              value={requestTitle}
              onChange={(e) => setRequestTitle(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Requesting Entity / Auditor</label>
            <input
              type="text"
              value={requestAuditor}
              onChange={(e) => setRequestAuditor(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Export Format */}
      <ExportFormatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Regulatory Obligations Docket"
      />
    </div>
  );
};

export default ObligationsPage;
