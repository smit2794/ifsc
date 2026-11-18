// src/pages/Incidents/IncidentsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Plus,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { minutesAgo } from '../../utils/dateHelpers';
import {
  useIncidents,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { IncidentItem, Severity } from '../../types';

export const IncidentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const incidents = useIncidents();
  const declareIncident = useAppStore((s) => s.declareIncident);

  // Active Tab (?tab=dashboard | all)
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab === 'all') return 'all';
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !['dashboard', 'all'].includes(rawTab)) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/incidents', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [glitchOnly, setGlitchOnly] = useState(false);

  // Declare Incident Modal State (pre-filled per specifications)
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [decTitle, setDecTitle] = useState('FIX Order Router Socket Disconnect and Route Fallback');
  const [decSeverity, setDecSeverity] = useState<Severity>('CRITICAL');
  const [decOccurredAt, setDecOccurredAt] = useState(minutesAgo(25).toISOString().slice(0, 16));
  const [decDetectedAt, setDecDetectedAt] = useState(minutesAgo(18).toISOString().slice(0, 16));
  const [decDuration, setDecDuration] = useState(7);
  const [decTimeConfirmed, setDecTimeConfirmed] = useState(true);
  const [decSystems, setDecSystems] = useState('FIX Order Gateway 01, Market Connectivity');
  const [decDescription, setDecDescription] = useState(
    'Socket reset during active derivatives trading session triggered order queue backlog. Automatic failover initiated.'
  );

  // KPI Calculations
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status !== 'CLOSED').length;
  const qualifyingGlitches = incidents.filter((i) => i.isGlitch && i.durationMinutes >= 5).length;
  const nonQualifyingIncidents = incidents.filter((i) => i.durationMinutes < 5).length;

  // Filtered Incidents List
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (glitchOnly && !inc.isGlitch) return false;
      if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        const matchesOwner = inc.owner.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesOwner) return false;
      }

      return true;
    });
  }, [incidents, glitchOnly, severityFilter, statusFilter, searchQuery]);

  // Handle Declare Incident Submit
  const handleDeclareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decTitle.trim()) return;

    const nextNumber = incidents.length + 15;
    const generatedId = `INC-2026-${nextNumber.toString().padStart(3, '0')}`;

    declareIncident({
      id: generatedId,
      title: decTitle.trim(),
      severity: decSeverity,
      occurredAt: new Date(decOccurredAt).toISOString(),
      detectedAt: new Date(decDetectedAt).toISOString(),
      durationMinutes: decDuration,
      description: decDescription.trim(),
      impactedSystems: decSystems.split(',').map((s) => s.trim()),
    });

    setDeclareModalOpen(false);
    const isQualifying = decDuration >= 5;
    show({
      message: isQualifying
        ? `Incident declared: ${generatedId} classified as QUALIFYING (${decDuration} ≥ 5 min). Statutory clocks running.`
        : `Incident declared: ${generatedId} classified as NOT_QUALIFYING (${decDuration} < 5 min lag). Duration below statutory threshold; logged for internal tracking.`,
      variant: isQualifying ? 'success' : 'info',
    });

    // Navigate immediately to the newly declared incident file
    navigate(buildLink(`/incidents/${generatedId}`));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setGlitchOnly(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Technical Glitch & Incident Management"
        subtitle="Mandatory IFSCA glitch reporting, statutory countdown clocks, and submission tracking."
        actions={
          <button
            type="button"
            onClick={() => {
              // Refresh pre-filled values to current minutesAgo
              setDecOccurredAt(minutesAgo(25).toISOString().slice(0, 16));
              setDecDetectedAt(minutesAgo(18).toISOString().slice(0, 16));
              setDecDuration(7);
              setDecTimeConfirmed(true);
              setDeclareModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-md transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Declare Incident</span>
          </button>
        }
      />

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-borderColor pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            const p: Record<string, string> = {};
            searchParams.forEach((v, k) => {
              p[k] = v;
            });
            p.tab = 'dashboard';
            navigate(buildLink('/incidents', p));
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-brandNavy text-white shadow-sm'
              : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Incident Dashboard</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {totalIncidents}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            const p: Record<string, string> = {};
            searchParams.forEach((v, k) => {
              p[k] = v;
            });
            p.tab = 'all';
            navigate(buildLink('/incidents', p));
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'all'
              ? 'bg-brandNavy text-white shadow-sm'
              : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>All Incidents & Dossiers</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {totalIncidents}
          </span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Recorded</span>
            <Activity className="w-4 h-4 text-brandNavy" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-textPrimary tabular-nums">{totalIncidents}</span>
            <span className="text-xs text-textSecondary">Dossiers</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1">All operational telemetry interruptions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Open / In Progress</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700 tabular-nums">{openIncidents}</span>
            <span className="text-xs font-semibold text-amber-800">Active Dossiers</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">Includes active RCA reporting clocks</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Qualifying Glitches</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700 tabular-nums">{qualifyingGlitches}</span>
            <span className="text-xs font-semibold text-rose-800">Duration ≥ 5 Min</span>
          </div>
          <p className="text-[11px] text-rose-800 mt-1">Mandatory 1-Hour, T+1, and 14-Day RCA clocks</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Non-Qualifying</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{nonQualifyingIncidents}</span>
            <span className="text-xs text-textSecondary">Below 5 Min Rule</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1">E.g. INC-2026-015 (3m tick jitter logged)</p>
        </div>
      </div>

      {/* Statutory Guidance Callout */}
      <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-200 text-xs text-textSecondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-brandNavy shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-brandNavy">IFSCA Technical Glitch Framework Statutory Mandate:</span>
            <p className="mt-0.5">
              Any technological disruption of 5 minutes or more is deemed a Qualifying Technical Glitch.
              Requires: (1) Preliminary 1-Hour notice, (2) Detailed T+1 report, (3) 14-Day Comprehensive RCA submission with board sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents by ref, title, system..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-brandNavy"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESTORED">Restored</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-textPrimary px-2 cursor-pointer">
            <input
              type="checkbox"
              checked={glitchOnly}
              onChange={(e) => setGlitchOnly(e.target.checked)}
              className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
            />
            <span>Glitches Only</span>
          </label>

          {(severityFilter !== 'ALL' || statusFilter !== 'ALL' || glitchOnly || searchQuery.trim()) && (
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

      {/* Incidents Table */}
      <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
              <tr>
                <th className="py-2.5 px-4">Incident Ref & Title</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Classification & Duration</th>
                <th className="py-2.5 px-3">Occurred At (IST)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-textSecondary">
                    No incidents match the active filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc: IncidentItem) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(buildLink(`/incidents/${inc.id}`))}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-brandNavy bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {inc.id}
                        </span>
                        <div>
                          <span className="font-medium text-textPrimary line-clamp-1">{inc.title}</span>
                          {inc.impactedSystems && inc.impactedSystems.length > 0 && (
                            <span className="text-[10px] text-textSecondary line-clamp-1 mt-0.5">
                              {inc.impactedSystems.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            inc.durationMinutes >= 5
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {inc.durationMinutes}m {inc.durationMinutes >= 5 ? '(Qualifying Glitch)' : '(Non-Qualifying)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-textSecondary">
                      {inc.occurredAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-800'
                            : inc.status === 'RESOLVED' || inc.status === 'RESTORED'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-textPrimary">{inc.owner}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(buildLink(`/incidents/${inc.id}`));
                        }}
                        className="text-xs font-semibold text-brandNavy hover:underline"
                      >
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Declare Incident (pre-filled per specifications) */}
      <Modal
        open={declareModalOpen}
        onClose={() => setDeclareModalOpen(false)}
        title="Declare Operational Incident / Technical Glitch"
        subtitle="Mandatory declaration initiating statutory regulatory clocks."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeclareModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeclareSubmit}
              disabled={!decTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded disabled:opacity-50"
            >
              Confirm & Start Clocks
            </button>
          </div>
        }
      >
        <form onSubmit={handleDeclareSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">
              Incident Summary Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={decTitle}
              onChange={(e) => setDecTitle(e.target.value)}
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Severity Assessment</label>
              <select
                value={decSeverity}
                onChange={(e) => setDecSeverity(e.target.value as Severity)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="CRITICAL">Critical (Trading Outage)</option>
                <option value="HIGH">High (Major Degradation)</option>
                <option value="MEDIUM">Medium (Secondary Function)</option>
                <option value="LOW">Low (Minor Non-Trading)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Outage Duration (Minutes)</label>
              <input
                type="number"
                value={decDuration}
                onChange={(e) => setDecDuration(Number(e.target.value))}
                min={1}
                className="w-full p-2 border border-borderColor rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">
                Occurred At (IST) <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={decOccurredAt}
                onChange={(e) => setDecOccurredAt(e.target.value)}
                className="w-full p-2 border border-borderColor rounded bg-white"
                required
              />
              <span className="text-[10px] text-textSecondary mt-0.5 block">
                Statutory clocks measure from this time.
              </span>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Detected At (IST)</label>
              <input
                type="datetime-local"
                value={decDetectedAt}
                onChange={(e) => setDecDetectedAt(e.target.value)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Impacted Systems</label>
            <input
              type="text"
              value={decSystems}
              onChange={(e) => setDecSystems(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Technical Observation Details</label>
            <textarea
              value={decDescription}
              onChange={(e) => setDecDescription(e.target.value)}
              rows={2}
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={decTimeConfirmed}
                onChange={(e) => setDecTimeConfirmed(e.target.checked)}
                className="rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
              />
              <span className="font-semibold text-amber-900">
                Occurrence time confirmed from gateway timestamp logs
              </span>
            </label>
            {decDuration >= 5 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-900 border border-rose-300 rounded">
                {decDuration} min ≥ 5 min (QUALIFYING GLITCH)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded">
                {decDuration} min &lt; 5 min (NOT_QUALIFYING — internal record only, no statutory filing clocks)
              </span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncidentsPage;
