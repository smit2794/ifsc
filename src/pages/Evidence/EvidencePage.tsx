// src/pages/Evidence/EvidencePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderLock,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Clock,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  Package,
  Trash2,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { HashBadge } from '../../components/ui/HashBadge';
import { ManifestViewer, ManifestItem } from '../../components/ui/ManifestViewer';
import { ExportFormatModal } from '../../components/ui/ExportFormatModal';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Tooltip } from '../../components/ui/Tooltip';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import {
  useAppStore,
  useEvidence,
  useCurrentUser,
} from '../../store';
import {
  EvidenceItem,
  EvidenceCategory,
  LegalHoldItem,
  AuditRequestItem,
} from '../../types/evidence';

export const EvidencePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const evidenceList = useEvidence();
  const auditRequests = useAppStore((s) => s.auditRequests);
  const auditFindings = useAppStore((s) => s.auditFindings);
  const legalHolds = useAppStore((s) => s.legalHolds);
  const currentUser = useCurrentUser();

  const uploadEvidence = useAppStore((s) => s.uploadEvidence);
  const flagIntegrityMismatch = useAppStore((s) => s.flagIntegrityMismatch);
  const applyLegalHold = useAppStore((s) => s.applyLegalHold);
  const releaseLegalHold = useAppStore((s) => s.releaseLegalHold);
  const updateFinding = useAppStore((s) => s.updateFinding);
  const addFindingCAPA = useAppStore((s) => s.addFindingCAPA);
  const fulfilAuditRequest = useAppStore((s) => s.fulfilAuditRequest);

  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'evidence') return 'all';
    if (['dashboard', 'all', 'requests', 'findings', 'holds'].includes(rawTab)) return rawTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'all', 'requests', 'findings', 'holds', 'evidence'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/evidence', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);
  const selectedEvidenceId = searchParams.get('evidence');
  const selectedFindingId = searchParams.get('finding');

  const selectedEvidence = useMemo(() => {
    return evidenceList.find((e) => e.id === selectedEvidenceId);
  }, [evidenceList, selectedEvidenceId]);

  const selectedFinding = useMemo(() => {
    return auditFindings.find((f) => f.id === selectedFindingId);
  }, [auditFindings, selectedFindingId]);

  // Tab switching helper
  const handleTabChange = (tab: string) => {
    navigate(buildLink('/evidence', { tab }));
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [exportManifestOpen, setExportManifestOpen] = useState(false);
  const [exportFormatModalOpen, setExportFormatModalOpen] = useState(false);
  const [applyHoldModalOpen, setApplyHoldModalOpen] = useState(false);
  const [selectedHoldForRelease, setSelectedHoldForRelease] = useState<LegalHoldItem | null>(null);
  const [selectedRequestForFulfil, setSelectedRequestForFulfil] = useState<AuditRequestItem | null>(null);

  // New Evidence Upload Form state
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceCategory, setNewEvidenceCategory] = useState<EvidenceCategory>('Inspection Dossiers');
  const [newEvidenceHash, setNewEvidenceHash] = useState('');
  const [newEvidenceFileName, setNewEvidenceFileName] = useState('');
  const [newEvidenceFileSize, setNewEvidenceFileSize] = useState('');

  // Apply Legal Hold Form state
  const [holdEvidenceId, setHoldEvidenceId] = useState('EVD-040');
  const [holdCaseRef, setHoldCaseRef] = useState('CASE-2026-031');
  const [holdReason, setHoldReason] = useState('Pending regulatory investigation and evidentiary seal under CMI Reg. 16.');

  // Finding Management Response Form state
  const [findingResponseText, setFindingResponseText] = useState('');
  const [findingCapaText, setFindingCapaText] = useState('');

  // Integrity Verification State
  const [verifying, setVerifying] = useState(false);
  const [integrityVerifiedMsg, setIntegrityVerifiedMsg] = useState<string | null>(null);

  // KPI Calculations
  const totalEvidence = evidenceList.length;
  const legalHoldCount = evidenceList.filter((e) => e.legalHold || e.legalHoldId).length;
  const mismatchCount = evidenceList.filter((e) => e.hashStatus === 'MISMATCH').length;
  const activeRequestsCount = auditRequests.filter((r) => r.status === 'OPEN').length;
  const openFindingsCount = auditFindings.filter((f) => f.status === 'OPEN').length;

  // Filtered Evidence
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((ev) => {
      const matchesSearch =
        ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [evidenceList, searchQuery, categoryFilter]);

  // Handle Upload Evidence Submit (Propagation #5)
  const handleUploadEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceTitle.trim() || !newEvidenceHash) return;

    uploadEvidence({
      title: newEvidenceTitle.trim(),
      category: newEvidenceCategory,
      fileName: newEvidenceFileName || 'SEALED-DOCUMENT.pdf',
      fileSize: newEvidenceFileSize || '1.8 MB',
      hash: newEvidenceHash,
    });

    setUploadModalOpen(false);
    setNewEvidenceTitle('');
    setNewEvidenceHash('');
    toast.show({
      message: 'Evidence dossier uploaded, SHA-256 sealed, and recorded in WORM vault',
      variant: 'success',
    });
  };

  // Verify Integrity (Propagation #16 on MISMATCH)
  const handleVerifyIntegrity = (ev: EvidenceItem) => {
    setVerifying(true);
    setIntegrityVerifiedMsg(null);

    setTimeout(() => {
      setVerifying(false);
      if (ev.id === 'EVD-038') {
        // Seeded mismatch item
        flagIntegrityMismatch(ev.id);
        toast.show({
          message: 'CRITICAL ALERT: SHA-256 hash checksum mismatch detected on WORM storage document',
          variant: 'error',
        });
      } else {
        setIntegrityVerifiedMsg(`SHA-256 hash verified successfully: ${ev.hash.slice(0, 16)}...`);
        toast.show({
          message: `Integrity verified: SHA-256 matches verified genesis seal`,
          variant: 'success',
        });
      }
    }, 1000);
  };

  // Apply Legal Hold (Propagation #12)
  const handleApplyLegalHoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdEvidenceId || !holdCaseRef.trim() || !holdReason.trim()) return;

    applyLegalHold(holdEvidenceId, holdCaseRef.trim(), holdReason.trim());
    setApplyHoldModalOpen(false);
    toast.show({
      message: `Legal hold applied to evidence ${holdEvidenceId} for matter ${holdCaseRef}`,
      variant: 'success',
    });
  };

  // Convert evidence for ManifestViewer
  const manifestItems: ManifestItem[] = useMemo(() => {
    return evidenceList.slice(0, 10).map((ev) => ({
      id: ev.id,
      title: ev.title,
      category: ev.category,
      hash: ev.hash,
      sizeBytes: 1.4 * 1024 * 1024,
      retentionBasis: ev.retentionBasis,
    }));
  }, [evidenceList]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Audit Evidence Room & Immutable Vault"
        subtitle="Cryptographically sealed WORM document repository, audit request fulfilment, and regulatory legal holds."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportManifestOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-borderColor text-textPrimary rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-brandNavy" />
              <span>Build Export Package</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandNavy text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Evidence
            </button>
          </div>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Total Sealed Dossiers
          </span>
          <p className="text-2xl font-bold text-textPrimary mt-1">{totalEvidence}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">WORM Storage Immutable</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Active Legal Holds
          </span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{legalHoldCount}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Purge Protected</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Audit Requests
          </span>
          <p className="text-2xl font-bold text-brandNavy mt-1">{activeRequestsCount}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">External Auditor Dockets</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Open Findings
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{openFindingsCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Remediation CAPAs active</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Integrity Status
          </span>
          <p
            className={`text-2xl font-bold mt-1 ${
              mismatchCount > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {mismatchCount > 0 ? `${mismatchCount} Mismatch` : '100% Sealed'}
          </p>
          <p className="text-[10px] text-textSecondary mt-0.5">Cryptographic Checksum</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-borderColor">
        <button
          type="button"
          onClick={() => handleTabChange('dashboard')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
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
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'all' || activeTab === 'evidence'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>All Evidence Dossiers ({evidenceList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('requests')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Auditor Access & Requests ({auditRequests.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('findings')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'findings'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Audit Findings & CAPAs ({auditFindings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('holds')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'holds'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Legal Holds ({legalHolds.length})</span>
        </button>
      </div>

      {/* TAB 0: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Cryptographic Evidence & Chain of Custody Posture
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                All 40 evidence files sealed with SHA-256 genesis hashes and WORM immutable retention tags.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Browse All 40 Dossiers</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Legal Holds</span>
              <p className="text-2xl font-bold text-amber-700">{legalHolds.length} Active Holds</p>
              <p className="text-[11px] text-textSecondary">Purge prevention and litigation hold locks applied.</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Audit Findings</span>
              <p className="text-2xl font-bold text-brandNavy">{auditFindings.length} Recorded Findings</p>
              <p className="text-[11px] text-textSecondary">Independent external and internal audit tracking.</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Auditor Access</span>
              <p className="text-2xl font-bold text-emerald-700">{auditRequests.length} Active Requests</p>
              <p className="text-[11px] text-textSecondary">Role-based dossier extraction requests.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ALL EVIDENCE DOSSIERS */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-white border border-borderColor rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search dossiers by ID, title, or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-brandNavy focus:border-brandNavy"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
            >
              <option value="ALL">All 8 Evidence Categories</option>
              <option value="Governance & Appointments">Governance & Appointments</option>
              <option value="Trade Operations & Logs">Trade Operations & Logs</option>
              <option value="Cyber & IT Infrastructure">Cyber & IT Infrastructure</option>
              <option value="Financial Reconciliations">Financial Reconciliations</option>
              <option value="Statutory Submissions">Statutory Submissions</option>
              <option value="Inspection Dossiers">Inspection Dossiers</option>
            </select>
          </div>

          {/* Evidence Table */}
          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Dossier ID</th>
                    <th className="py-2.5 px-3.5">Title & Sealed Document</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Retention Basis</th>
                    <th className="py-2.5 px-3.5 text-center">Legal Hold</th>
                    <th className="py-2.5 px-3.5 text-right">Integrity Hash</th>
                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {filteredEvidence.map((ev) => {
                    const isHold = Boolean(ev.legalHold || ev.legalHoldId);
                    const isMismatch = ev.hashStatus === 'MISMATCH';

                    return (
                      <tr
                        key={ev.id}
                        onClick={() =>
                          navigate(buildLink('/evidence', { tab: 'evidence', evidence: ev.id }))
                        }
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                          isMismatch ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy flex items-center gap-1.5">
                          <span>{ev.id}</span>
                          {ev.id === 'EVD-040' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-brandNavy border border-blue-200">
                              Story A
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 max-w-sm">
                          <p className="font-semibold text-textPrimary truncate">{ev.title}</p>
                          <p className="text-[10px] text-textSecondary font-mono mt-0.5">
                            {ev.fileName} · {ev.fileSize}
                          </p>
                        </td>
                        <td className="py-2.5 px-3.5 text-textSecondary">{ev.category}</td>
                        <td className="py-2.5 px-3.5 font-mono text-[10px] text-textSecondary">
                          {ev.retentionBasis}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {isHold ? (
                            <Tooltip content="Immutable under active legal hold">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                <Lock className="w-3 h-3 text-rose-700" />
                                <span>LOCKED</span>
                              </span>
                            </Tooltip>
                          ) : (
                            <span className="text-textSecondary text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono">
                          <HashBadge hash={ev.hash} status={ev.hashStatus} />
                        </td>
                        <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(buildLink('/evidence', { tab: 'evidence', evidence: ev.id }))
                            }
                            className="text-brandNavy hover:text-slate-900 font-semibold text-[11px] hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-borderColor text-xs text-textSecondary flex items-center justify-between">
              <span>Showing {filteredEvidence.length} of {evidenceList.length} sealed evidence dossiers</span>
              <span>All files preserved on WORM immutable storage per IFSCA CMI Reg. 16</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITOR ACCESS & REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Request Ref</th>
                  <th className="py-2.5 px-3.5">Auditor / Entity</th>
                  <th className="py-2.5 px-3.5">Subject & Scope</th>
                  <th className="py-2.5 px-3.5">Access Scope Label</th>
                  <th className="py-2.5 px-3.5">Due Date</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {auditRequests.map((req) => {
                  const isFulfilled = req.status === 'FULFILLED';

                  return (
                    <tr key={req.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">{req.id}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">{req.auditor}</td>
                      <td className="py-2.5 px-3.5 max-w-sm">
                        <p className="font-medium text-textPrimary">{req.title}</p>
                        <p className="text-[10px] text-textSecondary">Period: {req.period}</p>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-brandNavy border border-blue-200">
                          Read-only, time-limited
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary font-mono text-[11px]">
                        {new Date(req.dueDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFulfilled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        {!isFulfilled ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequestForFulfil(req);
                            }}
                            className="px-2.5 py-1 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs"
                          >
                            Fulfil request
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Fulfilled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT FINDINGS & CAPAS */}
      {activeTab === 'findings' && (
        <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Finding Ref</th>
                  <th className="py-2.5 px-3.5">Title & Audit Observation</th>
                  <th className="py-2.5 px-3.5 text-center">Severity</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5">Assigned Owner</th>
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {auditFindings.map((fnd) => (
                  <tr
                    key={fnd.id}
                    onClick={() =>
                      navigate(buildLink('/evidence', { tab: 'findings', finding: fnd.id }))
                    }
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">{fnd.id}</td>
                    <td className="py-2.5 px-3.5 max-w-md">
                      <p className="font-semibold text-textPrimary">{fnd.title}</p>
                      <p className="text-[10px] text-textSecondary line-clamp-1 mt-0.5">
                        {fnd.recommendation || fnd.remediationSummary}
                      </p>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          fnd.severity === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {fnd.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          fnd.status === 'REMEDIATED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fnd.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-textPrimary">{fnd.owner || 'Aarav Mehta'}</td>
                    <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(buildLink('/evidence', { tab: 'findings', finding: fnd.id }))
                        }
                        className="text-brandNavy hover:text-slate-900 font-semibold text-[11px] hover:underline"
                      >
                        Inspect Drawer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL HOLDS */}
      {activeTab === 'holds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-textSecondary">
              Active regulatory legal holds prevent document purge or automated lifecycle retention deletion.
            </p>
            <button
              type="button"
              onClick={() => setApplyHoldModalOpen(true)}
              className="px-3 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs"
            >
              Apply Legal Hold
            </button>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Hold Ref</th>
                  <th className="py-2.5 px-3.5">Matter Reference</th>
                  <th className="py-2.5 px-3.5">Target Dossier</th>
                  <th className="py-2.5 px-3.5">Hold Justification</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {legalHolds.map((h) => (
                  <tr key={h.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">{h.id}</td>
                    <td className="py-2.5 px-3.5 font-mono text-brandNavy font-semibold">
                      {h.caseReference || h.matterReference}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-textPrimary">
                      {h.evidenceId || 'Multi-Dossier Hold'}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-sm text-textSecondary text-[11px]">
                      {h.reason}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'ACTIVE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {h.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHoldForRelease(h);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded"
                        >
                          Request Release
                        </button>
                      ) : (
                        <span className="text-textSecondary text-[11px] italic">Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVIDENCE DETAIL DRAWER (?evidence=EVD-xxx) */}
      {selectedEvidence && (
        <DetailDrawer
          title={`Evidence File: ${selectedEvidence.id}`}
          subtitle={selectedEvidence.title}
          paramKey="evidence"
          width="w-full sm:max-w-md lg:max-w-lg"
        >
          <div className="space-y-6 text-xs">
            {/* Header Strip */}
            <div className="p-3.5 rounded-lg border border-borderColor bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Category & Retention Period
                </span>
                <p className="text-xs font-bold text-textPrimary mt-0.5">
                  {selectedEvidence.category}
                </p>
                <p className="text-[11px] text-textSecondary mt-0.5 font-mono">
                  {selectedEvidence.retentionBasis} ({selectedEvidence.retentionYears} Years)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-textPrimary block">
                  {selectedEvidence.fileName}
                </span>
                <span className="text-[10px] text-textSecondary block mt-0.5">
                  {selectedEvidence.fileSize} · Uploaded by {selectedEvidence.uploadedBy}
                </span>
              </div>
            </div>

            {/* SHA-256 Hash & Integrity Check */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brandNavy" />
                  <span>Cryptographic SHA-256 Hash</span>
                </h4>
                <button
                  type="button"
                  disabled={verifying}
                  onClick={() => handleVerifyIntegrity(selectedEvidence)}
                  className="px-2.5 py-1 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs flex items-center gap-1"
                >
                  {verifying ? (
                    <>
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify integrity</span>
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-800 truncate mr-2">
                  {selectedEvidence.hash}
                </span>
                <HashBadge hash={selectedEvidence.hash} status={selectedEvidence.hashStatus} />
              </div>

              {integrityVerifiedMsg && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{integrityVerifiedMsg}</span>
                </div>
              )}

              {selectedEvidence.hashStatus === 'MISMATCH' && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs space-y-1 text-rose-950">
                  <span className="font-bold block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Integrity Checksum Discrepancy Flagged</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Automated background WORM check raised an incident. Current document hash differs from initial genesis timestamp.
                  </p>
                </div>
              )}
            </div>

            {/* Legal Hold Status */}
            {selectedEvidence.legalHold || selectedEvidence.legalHoldId ? (
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 text-xs space-y-1">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-700" />
                  <span>Active Regulatory Legal Hold Enforced</span>
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Purge protection active for matter {selectedEvidence.linkedCaseId || 'CASE-2026-031'}. Deletion and retention expiry disposal are locked.
                </p>
              </div>
            ) : null}

            {/* Cross-Module Links */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2 text-xs">
              <h4 className="font-bold text-textPrimary uppercase tracking-wider text-[11px]">
                Linked Compliance Records
              </h4>
              <div className="space-y-1.5">
                {selectedEvidence.linkedControlId && (
                  <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block">Linked Control</span>
                      <span className="font-mono font-bold text-brandNavy">
                        {selectedEvidence.linkedControlId}
                      </span>
                    </div>
                    <Link
                      to={buildLink('/controls', { control: selectedEvidence.linkedControlId })}
                      className="text-xs font-semibold text-brandNavy hover:underline flex items-center gap-1"
                    >
                      <span>Inspect Control</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {selectedEvidence.linkedCaseId && (
                  <div className="p-2 rounded bg-slate-50 border border-borderColor flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block">Linked Investigation Case</span>
                      <span className="font-mono font-bold text-brandNavy">
                        {selectedEvidence.linkedCaseId}
                      </span>
                    </div>
                    <Link
                      to={`/clients/cases/${selectedEvidence.linkedCaseId}`}
                      className="text-xs font-semibold text-brandNavy hover:underline flex items-center gap-1"
                    >
                      <span>Open Case</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-borderColor flex items-center justify-between">
              <span className="text-[10px] text-textSecondary">
                Preserved: WORM Node #04 (GIFT Data Centre)
              </span>

              {selectedEvidence.legalHold || selectedEvidence.legalHoldId ? (
                <Tooltip content="Immutable under active legal hold: CASE-2026-031">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed border border-gray-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dispose / Purge</span>
                  </button>
                </Tooltip>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    toast.show({
                      message: 'Disposal request routed to Compliance Officer',
                      variant: 'info',
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Disposal</span>
                </button>
              )}
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* FINDING DETAIL DRAWER (?finding=FND-xxx) - Opens Right-Side Drawer */}
      {selectedFinding && (
        <DetailDrawer
          title={`Audit Finding: ${selectedFinding.id}`}
          subtitle={selectedFinding.title}
          paramKey="finding"
          width="w-full sm:max-w-md lg:max-w-lg"
        >
          <div className="space-y-6 text-xs">
            <div className="p-3.5 rounded-lg border border-borderColor bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Audit Source & Severity
                </span>
                <p className="text-xs font-bold text-textPrimary mt-0.5">
                  {selectedFinding.sourceAudit || 'Annual Compliance Audit'}
                </p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Assigned Owner: <strong className="text-textPrimary">{selectedFinding.owner || 'Aarav Mehta'}</strong>
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  selectedFinding.severity === 'HIGH'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedFinding.severity}
              </span>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-2">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Auditor Recommendation
              </h4>
              <p className="text-textSecondary leading-relaxed">
                {selectedFinding.recommendation || 'Remediate identified exception and submit attestation.'}
              </p>
            </div>

            {/* Current Remediation & CAPA */}
            {selectedFinding.remediationSummary && (
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                <span className="font-bold text-emerald-900 block text-xs">
                  Active Management Response & CAPA:
                </span>
                <p className="text-emerald-950 whitespace-pre-wrap leading-relaxed">
                  {selectedFinding.remediationSummary}
                </p>
              </div>
            )}

            {/* Forms: Management Response & CAPA */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-textPrimary uppercase">
                  Add Management Response
                </label>
                <textarea
                  rows={3}
                  value={findingResponseText}
                  onChange={(e) => setFindingResponseText(e.target.value)}
                  placeholder="Record management remediation commitment..."
                  className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!findingResponseText.trim()) return;
                    updateFinding(selectedFinding.id, {
                      remediationSummary: findingResponseText.trim(),
                    });
                    setFindingResponseText('');
                    toast.show({
                      message: 'Management response saved to audit finding',
                      variant: 'success',
                    });
                  }}
                  className="px-3 py-1 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs"
                >
                  Save Response
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-borderColor">
                <label className="block text-[11px] font-bold text-textPrimary uppercase">
                  Add Corrective & Preventive Action (CAPA)
                </label>
                <textarea
                  rows={3}
                  value={findingCapaText}
                  onChange={(e) => setFindingCapaText(e.target.value)}
                  placeholder="Specify system collar, policy amendment, or script deployment..."
                  className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!findingCapaText.trim()) return;
                    addFindingCAPA(selectedFinding.id, findingCapaText.trim());
                    setFindingCapaText('');
                    toast.show({
                      message: 'CAPA logged; finding marked as REMEDIATED',
                      variant: 'success',
                    });
                  }}
                  className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 shadow-xs"
                >
                  Log CAPA & Mark Remediated
                </button>
              </div>
            </div>

            {/* Retest Request */}
            <div className="pt-2 border-t border-borderColor flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  toast.show({
                    message: 'Retest requested from External Compliance Auditor',
                    variant: 'info',
                  });
                }}
                className="px-3 py-1.5 bg-white border border-borderColor text-textPrimary rounded text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
              >
                Request retest
              </button>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Modal: Upload Evidence (Propagation #5) */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload & Seal Compliance Evidence Dossier"
        subtitle="Documents are SHA-256 hashed in-browser via Web Crypto and sealed in WORM vault."
        size="md"
      >
        <form onSubmit={handleUploadEvidenceSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Evidence Dossier Title
            </label>
            <input
              type="text"
              required
              value={newEvidenceTitle}
              onChange={(e) => setNewEvidenceTitle(e.target.value)}
              placeholder="e.g. India INX FIX Gateway Session Drop-Copy Audit Log"
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Statutory Evidence Category
            </label>
            <select
              value={newEvidenceCategory}
              onChange={(e) => setNewEvidenceCategory(e.target.value as EvidenceCategory)}
              className="w-full p-2 border border-borderColor rounded-md bg-white text-textPrimary"
            >
              <option value="Governance & Appointments">Governance & Appointments</option>
              <option value="Trade Operations & Logs">Trade Operations & Logs</option>
              <option value="Cyber & IT Infrastructure">Cyber & IT Infrastructure</option>
              <option value="Financial Reconciliations">Financial Reconciliations</option>
              <option value="Statutory Submissions">Statutory Submissions</option>
              <option value="Inspection Dossiers">Inspection Dossiers</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Select Document File (Computes Real SHA-256 Checksum)
            </label>
            <FileUploadBox
              accept=".pdf,.csv,.xlsx,.docx,.png"
              onUpload={(file: File, sha256: string) => {
                setNewEvidenceHash(sha256);
                setNewEvidenceFileName(file.name);
                setNewEvidenceFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
              }}
            />
          </div>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newEvidenceHash}
              className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs disabled:opacity-50"
            >
              Seal Evidence in Vault
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Export Package (ManifestViewer) */}
      {exportManifestOpen && (
        <Modal
          open={exportManifestOpen}
          onClose={() => setExportManifestOpen(false)}
          title="Regulatory Evidence Package Manifest"
          subtitle="Cryptographically sealed inspection dossier for IFSCA / External Audit delivery."
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExportManifestOpen(false)}
                className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportManifestOpen(false);
                  setExportFormatModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
              >
                Export Package Files
              </button>
            </div>
          }
        >
          <ManifestViewer items={manifestItems} />
        </Modal>
      )}

      {/* Modal: Export Format (PDF/CSV/XLSX) */}
      <ExportFormatModal
        open={exportFormatModalOpen}
        onClose={() => setExportFormatModalOpen(false)}
        onExport={(_format) => {
          setExportFormatModalOpen(false);
        }}
      />

      {/* Modal: Apply Legal Hold (Propagation #12) */}
      <Modal
        open={applyHoldModalOpen}
        onClose={() => setApplyHoldModalOpen(false)}
        title="Apply Regulatory Legal Hold"
        subtitle="Freezes target dossier against automated purge or retention deletion."
        size="md"
      >
        <form onSubmit={handleApplyLegalHoldSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Target Evidence Dossier
            </label>
            <select
              value={holdEvidenceId}
              onChange={(e) => setHoldEvidenceId(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md bg-white font-mono"
            >
              {evidenceList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Case / Regulatory Matter Reference
            </label>
            <input
              type="text"
              required
              value={holdCaseRef}
              onChange={(e) => setHoldCaseRef(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Legal Hold Justification & Statutory Ground
            </label>
            <textarea
              rows={3}
              required
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md"
            />
          </div>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setApplyHoldModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded shadow-xs"
            >
              Enact Legal Hold
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Release Legal Hold via Dual Sign-Off */}
      {selectedHoldForRelease && (
        <Modal
          open={Boolean(selectedHoldForRelease)}
          onClose={() => setSelectedHoldForRelease(null)}
          title={`Release Legal Hold: ${selectedHoldForRelease.id}`}
          subtitle={`Matter Reference: ${selectedHoldForRelease.caseReference || selectedHoldForRelease.matterReference}`}
          size="md"
        >
          <div className="space-y-3 text-xs">
            <p className="text-textSecondary">
              Release of regulatory hold requires independent officer authorization.
            </p>
            <ApprovalPanel
              currentUser={currentUser}
              maker={selectedHoldForRelease.appliedBy || 'Aarav Mehta'}
              requiredSignoffs={1}
              assignedApprover="Rohan Desai"
              onApprove={(approverName) => {
                releaseLegalHold(selectedHoldForRelease.id, approverName);
                setSelectedHoldForRelease(null);
                toast.show({
                  message: `Legal hold ${selectedHoldForRelease.id} released by ${approverName}`,
                  variant: 'success',
                });
              }}
              onReject={(reason) => {
                setSelectedHoldForRelease(null);
                toast.show({ message: `Hold release rejected: ${reason}`, variant: 'warning' });
              }}
            />
          </div>
        </Modal>
      )}

      {/* Modal: Fulfil Audit Request */}
      {selectedRequestForFulfil && (
        <Modal
          open={Boolean(selectedRequestForFulfil)}
          onClose={() => setSelectedRequestForFulfil(null)}
          title={`Fulfil Audit Request: ${selectedRequestForFulfil.id}`}
          subtitle={`Auditor: ${selectedRequestForFulfil.auditor} (${selectedRequestForFulfil.period})`}
          size="md"
        >
          <div className="space-y-3.5 text-xs">
            <p className="text-textSecondary leading-relaxed">
              Attach the verified workpaper extract or upload requested reconciliation ledger:
            </p>
            <FileUploadBox
              accept=".pdf,.csv,.xlsx"
              onUpload={(_file: File, hash: string) => {
                fulfilAuditRequest(selectedRequestForFulfil.id);
                setSelectedRequestForFulfil(null);
                toast.show({
                  message: `Audit request ${selectedRequestForFulfil.id} marked as FULFILLED with hash ${hash.slice(0, 16)}...`,
                  variant: 'success',
                });
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EvidencePage;
