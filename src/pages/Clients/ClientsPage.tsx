// src/pages/Clients/ClientsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  FolderLock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { CountdownClock } from '../../components/ui/CountdownClock';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { Stepper } from '../../components/ui/Stepper';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import { useAppStore, useClients, useCases, useCurrentUser } from '../../store';
import { ClientItem, ClientCategory, KYCStatus } from '../../types/client';
import { CaseItem } from '../../types/case';
import { SeverityLevel } from '../../design/tokens';

export const ClientsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab === 'cases') return 'cases';
    return 'clients';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['clients', 'cases'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'clients';
      navigate(buildLink('/clients', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);
  const selectedClientId = searchParams.get('client');

  const clients = useClients();
  const cases = useCases();
  const currentUser = useCurrentUser();

  const addClient = useAppStore((s) => s.addClient);
  const updateClientKyc = useAppStore((s) => s.updateClientKyc);
  const incrementClientDocuments = useAppStore((s) => s.incrementClientDocuments);
  const disambiguateClientAlert = useAppStore((s) => s.disambiguateClientAlert);
  const addCase = useAppStore((s) => s.addCase);
  const createTask = useAppStore((s) => s.createTask);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');
  const [caseSeverityFilter, setCaseSeverityFilter] = useState<string>('ALL');

  const toast = useToast();
  // Modals state
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [docRequestModalOpen, setDocRequestModalOpen] = useState(false);
  const [disambiguateModalOpen, setDisambiguateModalOpen] = useState(false);
  const [escalateConfirmOpen, setEscalateConfirmOpen] = useState(false);

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientCategory, setNewClientCategory] = useState<ClientCategory>('Institutional Broker Dealer');
  const [newClientCountry, setNewClientCountry] = useState('GIFT IFSC (India)');
  const [newClientRisk, setNewClientRisk] = useState<SeverityLevel>('MEDIUM');
  const [newClientTurnover, setNewClientTurnover] = useState(50000000);

  // Selected client for detail drawer
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Tab switching helper
  const handleTabChange = (tab: string) => {
    navigate(buildLink('/clients', { tab }));
  };

  // KPI Calculations
  const totalClients = clients.length;
  const kycCompleteCount = clients.filter((c) => c.kycStatus === 'VERIFIED').length;
  const kycPendingCount = clients.filter((c) => c.kycStatus !== 'VERIFIED').length;
  const highRiskCount = clients.filter((c) => c.riskRating === 'HIGH' || c.riskRating === 'CRITICAL').length;
  const totalAlerts = clients.reduce((acc, c) => acc + c.activeScreeningAlerts, 0);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.maskedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.countryOfIncorporation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesRisk = riskFilter === 'ALL' || c.riskRating === riskFilter;
      const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;
      return matchesSearch && matchesCategory && matchesRisk && matchesKyc;
    });
  }, [clients, searchQuery, categoryFilter, riskFilter, kycFilter]);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = caseSeverityFilter === 'ALL' || c.severity === caseSeverityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [cases, searchQuery, caseSeverityFilter]);

  // Handle Add Client Submit
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const nextNum = clients.length + 1;
    const newId = `CLT-${nextNum.toString().padStart(3, '0')}`;
    const newMaskedId = `CLT-***-${(900 + nextNum).toString()}`;

    const newRecord: ClientItem = {
      id: newId,
      maskedId: newMaskedId,
      legalName: newClientName.trim(),
      category: newClientCategory,
      countryOfIncorporation: newClientCountry,
      riskRating: newClientRisk,
      kycStatus: 'PENDING_DOCUMENTS',
      lastKycDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 180 * 86_400_000).toISOString(),
      activeScreeningAlerts: 0,
      relationshipOfficer: currentUser.name,
      annualTurnoverUsd: newClientTurnover,
      documentsSealedCount: 1,
    };

    addClient(newRecord);
    setAddClientModalOpen(false);
    setNewClientName('');
    toast.show({
      message: `Client ${newId} (${newRecord.legalName}) onboarded successfully`,
      variant: 'success',
    });
  };

  // Handle Mark KYC Reviewed
  const handleMarkKycReviewed = () => {
    if (!selectedClient) return;
    updateClientKyc(selectedClient.id, 'VERIFIED');
    toast.show({
      message: `Client ${selectedClient.maskedId} KYC verified and attestation logged`,
      variant: 'success',
    });
  };

  // Handle Escalate to Compliance
  const handleEscalateConfirm = () => {
    if (!selectedClient) return;
    const taskId = `TSK-${Date.now().toString().slice(-3)}`;
    createTask({
      id: taskId,
      title: `Compliance Review Escalation: ${selectedClient.legalName} (${selectedClient.maskedId})`,
      priority: 'HIGH',
      status: 'OPEN',
      owner: 'Aarav Mehta',
      ownerId: 'USR-001',
      dueDate: new Date(Date.now() + 48 * 3600_000).toISOString(),
      category: 'Clients',
      description: `Escalated compliance risk assessment for client ${selectedClient.maskedId}. High scrutiny review required.`,
    });
    setEscalateConfirmOpen(false);
    toast.show({
      message: `Escalation task ${taskId} assigned to Compliance Officer Aarav Mehta`,
      variant: 'success',
    });
  };

  // Handle Open Case from Client
  const handleCreateCaseFromClient = () => {
    if (!selectedClient) return;
    const caseId = `CASE-2026-${(cases.length + 32).toString().padStart(3, '0')}`;
    const newCase: CaseItem = {
      id: caseId,
      title: `Special Inquiry: ${selectedClient.legalName} (${selectedClient.maskedId})`,
      severity: selectedClient.riskRating === 'HIGH' ? 'HIGH' : 'MEDIUM',
      status: 'TRIAGED',
      owner: 'Aarav Mehta',
      ownerId: 'USR-001',
      maker: 'Aarav Mehta',
      reviewer: 'Priya Nair',
      approver: 'Rohan Desai',
      createdAt: new Date().toISOString(),
      description: `Targeted investigation opened from client record ${selectedClient.maskedId}. Requires KYC remediation and adverse media verification.`,
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          action: 'Case Initialized',
          detail: `Case created directly from Client ${selectedClient.maskedId} profile.`,
        },
      ],
    };

    addCase(newCase);
    navigate(`/clients/cases/${caseId}`);
  };

  // KYC Stepper Status calculation
  const getKycStepIndex = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING_DOCUMENTS':
        return 0;
      case 'RE_KYC_DUE':
        return 1;
      case 'RESTRICTED':
        return 2;
      case 'VERIFIED':
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Clients & Investigation Cases"
        subtitle="Customer due diligence, KYC lifecycle oversight, screening exceptions, and compliance casework."
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'clients' ? (
              <button
                type="button"
                onClick={() => setAddClientModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandNavy text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Client
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/clients/cases/CASE-2026-031')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandNavy text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Inspect Active Case
              </button>
            )}
          </div>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">Total Clients</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{totalClients}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">20 Seeded Broker / Institutional</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">KYC Complete</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{kycCompleteCount}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Verified & Attested</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">Pending / Re-KYC</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{kycPendingCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Action Required</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">High Risk Entities</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{highRiskCount}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Enhanced Scrutiny</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">Screening Alerts</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{totalAlerts}</p>
          <p className="text-[10px] text-purple-700 mt-0.5">PEP / Watchlist Matches</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-borderColor">
        <button
          type="button"
          onClick={() => handleTabChange('clients')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'clients'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Institutional Clients ({clients.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('cases')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cases'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Investigation Cases ({cases.length})</span>
        </button>
      </div>

      {/* TAB 1: CLIENTS */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-white border border-borderColor rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by legal name, masked ID, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-brandNavy focus:border-brandNavy"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
              >
                <option value="ALL">All Categories</option>
                <option value="Institutional Broker Dealer">Broker Dealer</option>
                <option value="Corporate Treasury">Corporate Treasury</option>
                <option value="Eligible Foreign Investor">Eligible Foreign Investor</option>
                <option value="HNW Individual">HNW Individual</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
              >
                <option value="ALL">All Risk Ratings</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>

              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
              >
                <option value="ALL">All KYC Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING_DOCUMENTS">Pending Documents</option>
                <option value="RE_KYC_DUE">Re-KYC Due</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>
          </div>

          {/* Client Table */}
          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Masked Client ID</th>
                    <th className="py-2.5 px-3.5">Legal Entity Name</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Jurisdiction</th>
                    <th className="py-2.5 px-3.5 text-center">Risk Rating</th>
                    <th className="py-2.5 px-3.5 text-center">KYC Status</th>
                    <th className="py-2.5 px-3.5 text-right">Turnover (USD)</th>
                    <th className="py-2.5 px-3.5">Next Periodic Review</th>
                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor text-xs">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-textSecondary italic">
                        No clients matching search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const isHighRisk = client.riskRating === 'HIGH' || client.riskRating === 'CRITICAL';
                      const isVerified = client.kycStatus === 'VERIFIED';

                      return (
                        <tr
                          key={client.id}
                          onClick={() => navigate(buildLink('/clients', { tab: 'clients', client: client.id }))}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3.5 font-mono text-brandNavy font-semibold">
                            {client.maskedId}
                          </td>
                          <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                            <div className="flex items-center gap-1.5">
                              <span>{client.legalName}</span>
                              {client.activeScreeningAlerts > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  {client.activeScreeningAlerts} Alert
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 text-textSecondary">{client.category}</td>
                          <td className="py-2.5 px-3.5 text-textSecondary">{client.countryOfIncorporation}</td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isHighRisk
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : client.riskRating === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {client.riskRating}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : client.kycStatus === 'RESTRICTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {client.kycStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-textPrimary">
                            ${(client.annualTurnoverUsd / 1_000_000).toFixed(1)}M
                          </td>
                          <td className="py-2.5 px-3.5 text-textSecondary text-[11px]">
                            {new Date(client.nextReviewDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => navigate(buildLink('/clients', { tab: 'clients', client: client.id }))}
                              className="text-brandNavy hover:text-slate-900 font-semibold text-[11px] hover:underline"
                            >
                              View Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-borderColor text-xs text-textSecondary flex items-center justify-between">
              <span>Showing {filteredClients.length} of {clients.length} institutional clients</span>
              <span>Identifiers masked per CMI data protection protocol</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASES */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {/* Case Filter Bar */}
          <div className="p-3 bg-white border border-borderColor rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search cases by ID, title, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-brandNavy focus:border-brandNavy"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={caseSeverityFilter}
                onChange={(e) => setCaseSeverityFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Case ID</th>
                    <th className="py-2.5 px-3.5">Investigation Summary</th>
                    <th className="py-2.5 px-3.5">Linked Control</th>
                    <th className="py-2.5 px-3.5 text-center">Severity</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3.5">Case Owner</th>
                    <th className="py-2.5 px-3.5">Created Date</th>
                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor text-xs">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-textSecondary italic">
                        No cases match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((cs) => {
                      const isHigh = cs.severity === 'HIGH' || cs.severity === 'CRITICAL';
                      const isClosed = cs.status === 'CLOSED';

                      return (
                        <tr
                          key={cs.id}
                          onClick={() => navigate(`/clients/cases/${cs.id}`)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                            cs.id === 'CASE-2026-031' ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy flex items-center gap-1.5">
                            <span>{cs.id}</span>
                            {cs.id === 'CASE-2026-031' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-brandNavy border border-blue-200">
                                Story A
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 font-semibold text-textPrimary max-w-md">
                            <p className="line-clamp-1">{cs.title}</p>
                            <p className="text-[10px] text-textSecondary font-normal line-clamp-1 mt-0.5">
                              {cs.description}
                            </p>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[11px] text-brandNavy">
                            {cs.linkedControlId ? (
                              <Link
                                to={buildLink('/controls', { control: cs.linkedControlId })}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline flex items-center gap-1"
                              >
                                <span>{cs.linkedControlId}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            ) : cs.linkedIncidentId ? (
                              <Link
                                to={`/incidents/${cs.linkedIncidentId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline flex items-center gap-1 text-purple-700"
                              >
                                <span>{cs.linkedIncidentId}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            ) : (
                              <span className="text-textSecondary italic">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isHigh
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {cs.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isClosed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cs.status === 'TRIAGED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {cs.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-textPrimary">{cs.owner}</td>
                          <td className="py-2.5 px-3.5 text-textSecondary text-[11px]">
                            {new Date(cs.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/clients/cases/${cs.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-borderColor hover:border-brandNavy text-brandNavy rounded text-[11px] font-semibold transition-colors"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-borderColor text-xs text-textSecondary flex items-center justify-between">
              <span>Showing {filteredCases.length} of {cases.length} investigation cases</span>
              <span>All case resolutions require maker-checker sign-off</span>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT DETAIL DRAWER */}
      {selectedClient && (
        <DetailDrawer
          title={`Client Profile: ${selectedClient.maskedId}`}
          subtitle={selectedClient.legalName}
          paramKey="client"
          width="w-full sm:max-w-md lg:max-w-lg"
        >
          <div className="space-y-6">
            {/* Header Strip */}
            <div className="p-3.5 rounded-lg border border-borderColor bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Category & Country
                </p>
                <p className="text-xs font-bold text-textPrimary mt-0.5">
                  {selectedClient.category} · {selectedClient.countryOfIncorporation}
                </p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Relationship Officer: <span className="font-semibold text-textPrimary">{selectedClient.relationshipOfficer}</span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                    selectedClient.riskRating === 'HIGH' || selectedClient.riskRating === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedClient.riskRating} Risk
                </span>
                <p className="text-[10px] text-textSecondary mt-1">
                  Turnover: ${(selectedClient.annualTurnoverUsd / 1_000_000).toFixed(1)}M USD
                </p>
              </div>
            </div>

            {/* KYC Stepper */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  KYC Lifecycle & Verification Stage
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-brandNavy border border-blue-200">
                  {selectedClient.kycStatus}
                </span>
              </div>

              <Stepper
                steps={[
                  'Documents Collected',
                  'Screening Passed',
                  'Risk Scored',
                  'Compliance Attested',
                ]}
                currentStep={getKycStepIndex(selectedClient.kycStatus)}
              />

              <div className="pt-2 flex items-center justify-between border-t border-borderColor">
                <span className="text-[11px] text-textSecondary">
                  Last verified: {new Date(selectedClient.lastKycDate).toLocaleDateString('en-GB')}
                </span>
                {selectedClient.kycStatus !== 'VERIFIED' && (
                  <button
                    type="button"
                    onClick={handleMarkKycReviewed}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    Mark KYC Reviewed
                  </button>
                )}
              </div>
            </div>

            {/* Periodic Review Schedule with CountdownClock */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brandNavy" />
                  <span>Periodic Re-KYC Review Schedule</span>
                </h4>
                <span className="text-[11px] text-textSecondary">
                  Due: {new Date(selectedClient.nextReviewDate).toLocaleDateString('en-GB')}
                </span>
              </div>

              <CountdownClock
                targetTime={selectedClient.nextReviewDate}
                label="Periodic Review Countdown"
              />
            </div>

            {/* Structured Risk Assessment Section */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2.5">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brandNavy" />
                <span>Client Risk Assessment Matrix</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-borderColor">
                  <span className="text-[10px] text-textSecondary block">Jurisdiction Risk</span>
                  <span className="font-semibold text-textPrimary">
                    {selectedClient.countryOfIncorporation.includes('Cayman') || selectedClient.countryOfIncorporation.includes('Mauritius')
                      ? 'Elevated (Offshore Domicile)'
                      : 'Standard (FATF Compliant)'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-borderColor">
                  <span className="text-[10px] text-textSecondary block">Product Complexity</span>
                  <span className="font-semibold text-textPrimary">High-Leverage FX & Index Derivatives</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-borderColor">
                  <span className="text-[10px] text-textSecondary block">Watchlist Screening</span>
                  <span className={`font-semibold ${selectedClient.activeScreeningAlerts > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {selectedClient.activeScreeningAlerts > 0 ? `${selectedClient.activeScreeningAlerts} Active Match Alert` : 'Clear (Zero Matches)'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-borderColor">
                  <span className="text-[10px] text-textSecondary block">Assigned Risk Score</span>
                  <span className="font-semibold text-textPrimary">
                    {selectedClient.riskRating === 'HIGH' ? 'Score: 84/100 (Tier 1)' : 'Score: 42/100 (Tier 2)'}
                  </span>
                </div>
              </div>

              {selectedClient.activeScreeningAlerts > 0 && (
                <div className="p-2.5 rounded bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-900 block">Active Watchlist Match</span>
                    <span className="text-[11px] text-purple-700">Fuzzy name similarity 88% on OFAC / UN list.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisambiguateModalOpen(true)}
                    className="px-2 py-1 bg-purple-700 text-white rounded text-[11px] font-semibold hover:bg-purple-800"
                  >
                    Disambiguate
                  </button>
                </div>
              )}
            </div>

            {/* Client Sealed Documents List & Upload */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-brandNavy" />
                  <span>Sealed Client Documents ({selectedClient.documentsSealedCount})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setDocRequestModalOpen(true)}
                  className="text-[11px] font-semibold text-brandNavy hover:underline"
                >
                  Request Documents
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-textSecondary" />
                    <span className="font-medium text-textPrimary">Certificate of Incorporation & Byelaws.pdf</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    SEALED
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-textSecondary" />
                    <span className="font-medium text-textPrimary">FATF Beneficial Ownership Attestation.pdf</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    SEALED
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-textSecondary" />
                    <span className="font-medium text-textPrimary">Audited Financial Statements (FY25).pdf</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    SEALED
                  </span>
                </div>
              </div>

              {/* Upload Document Box */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-textSecondary mb-1.5">
                  Upload & Compute SHA-256 Checksum:
                </p>
                <FileUploadBox
                  accept=".pdf,.csv,.xlsx,.docx"
                  onUpload={(_file: File, hash: string) => {
                    incrementClientDocuments(selectedClient.id);
                    toast.show({
                      message: `Document sealed with SHA-256: ${hash.slice(0, 16)}...`,
                      variant: 'success',
                    });
                  }}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-borderColor flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEscalateConfirmOpen(true)}
                className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                Escalate to Compliance
              </button>
              <button
                type="button"
                onClick={handleCreateCaseFromClient}
                className="px-3 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
              >
                Open Investigation Case
              </button>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Modal: Add Client */}
      <Modal
        open={addClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
        title="Register Institutional Client"
        subtitle="Onboard Broker Dealer, Eligible Foreign Investor, or Corporate Treasury entity."
        size="md"
      >
        <form onSubmit={handleAddClientSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Legal Entity Name
            </label>
            <input
              type="text"
              required
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="e.g. Apex Global Securities SPC"
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Category
              </label>
              <select
                value={newClientCategory}
                onChange={(e) => setNewClientCategory(e.target.value as ClientCategory)}
                className="w-full p-2 border border-borderColor rounded-md bg-white"
              >
                <option value="Institutional Broker Dealer">Institutional Broker Dealer</option>
                <option value="Corporate Treasury">Corporate Treasury</option>
                <option value="Eligible Foreign Investor">Eligible Foreign Investor</option>
                <option value="HNW Individual">HNW Individual</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Country of Incorporation
              </label>
              <input
                type="text"
                value={newClientCountry}
                onChange={(e) => setNewClientCountry(e.target.value)}
                placeholder="e.g. Singapore / Cayman Islands"
                className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Risk Rating
              </label>
              <select
                value={newClientRisk}
                onChange={(e) => setNewClientRisk(e.target.value as SeverityLevel)}
                className="w-full p-2 border border-borderColor rounded-md bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Annual Turnover (USD)
              </label>
              <input
                type="number"
                value={newClientTurnover}
                onChange={(e) => setNewClientTurnover(Number(e.target.value))}
                className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
              />
            </div>
          </div>

          <p className="text-[10px] text-textSecondary italic pt-1">
            Institutional clients onboarded under IFSCA guidelines are assigned a masked identifier and sealed in the KYC repository.
          </p>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddClientModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Onboard Client
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Document Request */}
      <Modal
        open={docRequestModalOpen}
        onClose={() => setDocRequestModalOpen(false)}
        title="Request Additional KYC Evidence"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDocRequestModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setDocRequestModalOpen(false);
                toast.show({
                  message: 'Document request transmitted to Relationship Officer',
                  variant: 'success',
                });
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded"
            >
              Send Request
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-textSecondary leading-relaxed">
            Specify missing verification items required under IFSCA client due diligence guidelines:
          </p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-borderColor" />
              <span>Ultimate Beneficial Ownership (UBO) declaration &gt; 10%</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-borderColor" />
              <span>Board resolution authorising exchange trading operations</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-borderColor" />
              <span>GIFT SEZ dual-currency account attestation</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal: Disambiguate Screening Alert */}
      <Modal
        open={disambiguateModalOpen}
        onClose={() => setDisambiguateModalOpen(false)}
        title="Disambiguate Watchlist Match"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDisambiguateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedClient) disambiguateClientAlert(selectedClient.id);
                setDisambiguateModalOpen(false);
                toast.show({
                  message: 'Screening alert confirmed as False Positive and resolved',
                  variant: 'success',
                });
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded"
            >
              Confirm False Positive
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-xs leading-relaxed text-textSecondary">
          <p>
            The fuzzy match on OFAC SDN List #2948 matches a known entity with distinct date of birth and passport jurisdiction.
          </p>
          <p className="font-semibold text-textPrimary">
            Attestation: Confirmed non-match against verified passport and corporate registry records.
          </p>
        </div>
      </Modal>

      {/* Confirm Dialog: Escalate */}
      <ConfirmDialog
        open={escalateConfirmOpen}
        onCancel={() => setEscalateConfirmOpen(false)}
        onConfirm={handleEscalateConfirm}
        title="Escalate Client to Compliance?"
        message="This action will initialize a High-Priority compliance review task assigned to Compliance Officer Aarav Mehta."
        confirmText="Confirm Escalation"
        variant="warning"
      />
    </div>
  );
};

export default ClientsPage;
