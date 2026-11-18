// src/pages/Incidents/IncidentDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Upload,
  Lock,
  Sparkles,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { useTicker } from '../../hooks/useTicker';
import {
  useIncidents,
  useCurrentUser,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { CountdownClock } from '../../components/ui/CountdownClock';
import { AIDraftBanner } from '../../components/ui/AIDraftBanner';
import { ApprovalPanel } from '../../components/ui/ApprovalPanel';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { useToast } from '../../components/ui/Toast';
import {
  IncidentFilingRecord,
  FilingStageType,
  StaffName,
} from '../../types';

export const IncidentDetailPage: React.FC = () => {
  useTicker();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();

  const incidents = useIncidents();
  const currentUser = useCurrentUser();
  const updateIncident = useAppStore((s) => s.updateIncident);
  const acknowledgeFiling = useAppStore((s) => s.acknowledgeFiling);

  const incident = incidents.find((i) => i.id === id);

  // Modals state
  const [qualifyModalOpen, setQualifyModalOpen] = useState(false);
  const [nonQualifyReason, setNonQualifyReason] = useState('');
  const [submitFilingConfirmOpen, setSubmitFilingConfirmOpen] = useState(false);
  const [activeFilingForSubmit, setActiveFilingForSubmit] = useState<IncidentFilingRecord | null>(null);

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [activeFilingForAck, setActiveFilingForAck] = useState<IncidentFilingRecord | null>(null);
  const [receiptRef, setReceiptRef] = useState('');

  const [addCAPAModalOpen, setAddCAPAModalOpen] = useState(false);
  const [capaAction, setCapaAction] = useState('');
  const [capaOwner, setCapaOwner] = useState<StaffName>('Vikram Shah');
  const [capaDueDate, setCapaDueDate] = useState(
    new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)
  );

  const [addTimelineModalOpen, setAddTimelineModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDetails, setEventDetails] = useState('');

  const [closureApprovalModalOpen, setClosureApprovalModalOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // Active AI draft banner state for filings
  const [aiDraftActive, setAiDraftActive] = useState<string | null>(null);

  if (!incident) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Incident File Not Found" subtitle={`No incident record found for ${id}`} />
        <div className="bg-white p-8 rounded-lg border border-borderColor text-center max-w-md mx-auto shadow-card">
          <p className="text-xs text-textSecondary mb-4">The requested incident dossier does not exist in the active store.</p>
          <button
            type="button"
            onClick={() => navigate(buildLink('/incidents'))}
            className="px-4 py-2 text-xs font-semibold bg-brandNavy text-white rounded hover:bg-brandNavy/90"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  // Qualification status (Qualifying if duration >= 5 minutes or explicitly marked)
  const isQualifying =
    incident.classification === 'QUALIFYING' ||
    (incident.classification !== 'NOT_QUALIFYING' && incident.durationMinutes >= 5);

  // Clock Target Times (calculated strictly from occurredAt)
  const occurredTime = new Date(incident.occurredAt).getTime();
  const noticeDeadline = new Date(occurredTime + 60 * 60_000).toISOString();
  const prelimDeadline = new Date(occurredTime + 24 * 3600_000).toISOString();
  const rcaDeadline = new Date(occurredTime + 14 * 86_400_000).toISOString();

  // Determine individual filing records
  const initialFiling = incident.filings.find((f) => f.type === 'INITIAL_NOTICE');
  const prelimFiling = incident.filings.find((f) => f.type === 'PRELIMINARY_REPORT');
  const rcaFiling = incident.filings.find((f) => f.type === 'RCA_REPORT');

  // Check closure readiness
  // Closure requires all 3 filings to be ACKNOWLEDGED (or not qualifying)
  const allFilingsAcknowledged =
    !isQualifying ||
    (initialFiling?.status === 'ACKNOWLEDGED' &&
      prelimFiling?.status === 'ACKNOWLEDGED' &&
      rcaFiling?.status === 'ACKNOWLEDGED');

  const capaPendingCount = (incident.capa || []).filter((c) => c.status !== 'COMPLETED').length;
  const isClosureAllowed = allFilingsAcknowledged && capaPendingCount === 0 && incident.status !== 'CLOSED';

  // Mark Restored
  const handleMarkRestored = () => {
    updateIncident(incident.id, {
      status: 'RESTORED',
      restoredAt: new Date().toISOString(),
    });
    show({ message: `Incident ${incident.id} marked as RESTORED. Service operational.`, variant: 'success' });
  };

  // Mark Qualifying
  const handleQualify = () => {
    updateIncident(incident.id, {
      classification: 'QUALIFYING',
    });
    show({ message: `Incident ${incident.id} confirmed as QUALIFYING technical glitch.`, variant: 'success' });
  };

  // Mark Not Qualifying Submit
  const handleConfirmNotQualifying = () => {
    if (!nonQualifyReason.trim()) return;
    updateIncident(incident.id, {
      classification: 'NOT_QUALIFYING',
      notQualifyingReason: nonQualifyReason.trim(),
    });
    setQualifyModalOpen(false);
    show({
      message: `Incident ${incident.id} designated as NON-QUALIFYING. 5-minute threshold exemption logged.`,
      variant: 'info',
    });
  };

  // Generate Draft Filing with AI
  const handleGenerateDraft = (type: FilingStageType) => {
    setAiDraftActive(type);
    show({
      message: `Preliminary draft regulatory filing generated for ${type}. Review required.`,
      variant: 'info',
    });
  };

  // Submit Filing via Official Channel (exact wording check)
  const handleConfirmSubmitFiling = () => {
    if (!activeFilingForSubmit) return;

    const updatedFilings = incident.filings.map((f) =>
      f.id === activeFilingForSubmit.id ? { ...f, status: 'SUBMITTED' as const, submittedAt: new Date().toISOString() } : f
    );

    updateIncident(incident.id, {
      filings: updatedFilings,
    });

    setSubmitFilingConfirmOpen(false);
    setActiveFilingForSubmit(null);
    show({
      message: `Filing ${activeFilingForSubmit.filingNumber} submitted via official channel to IFSCA.`,
      variant: 'success',
    });
  };

  // Upload Acknowledgement Receipt (Propagation Rule #3)
  const handleConfirmUploadReceipt = () => {
    if (!activeFilingForAck || !receiptRef.trim()) return;

    const updatedFilings = incident.filings.map((f) =>
      f.id === activeFilingForAck.id
        ? {
            ...f,
            status: 'ACKNOWLEDGED' as const,
            acknowledgedAt: new Date().toISOString(),
          }
        : f
    );

    updateIncident(incident.id, {
      filings: updatedFilings,
    });

    // Invoke propagation rule #3 for report sync
    acknowledgeFiling(`RPT-${incident.id}`, receiptRef.trim());

    setAckModalOpen(false);
    setActiveFilingForAck(null);
    setReceiptRef('');
    show({
      message: `Statutory acknowledgement receipt verified for ${activeFilingForAck.filingNumber}.`,
      variant: 'success',
    });
  };

  // Add CAPA
  const handleAddCAPASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capaAction.trim()) return;

    const newCapa = {
      id: `CAPA-${Date.now().toString().slice(-4)}`,
      action: capaAction.trim(),
      owner: capaOwner,
      dueDate: capaDueDate,
      status: 'OPEN' as const,
    };

    updateIncident(incident.id, {
      capa: [...(incident.capa || []), newCapa],
    });

    setAddCAPAModalOpen(false);
    setCapaAction('');
    show({ message: 'Corrective action plan item added', variant: 'success' });
  };

  // Add Timeline Event
  const handleAddTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      title: eventTitle.trim(),
      actor: currentUser.name,
      details: eventDetails.trim() || 'Logged to technical glitch investigation timeline.',
    };

    updateIncident(incident.id, {
      timeline: [...(incident.timeline || []), newEvent],
    });

    setAddTimelineModalOpen(false);
    setEventTitle('');
    setEventDetails('');
    show({ message: 'Timeline event recorded', variant: 'success' });
  };

  // Confirm Incident Close
  const handleConfirmCloseIncident = () => {
    updateIncident(incident.id, {
      status: 'CLOSED',
    });
    setCloseConfirmOpen(false);
    show({ message: `Incident ${incident.id} formally closed after full statutory attestation.`, variant: 'success' });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={`Incident Dossier: ${incident.id}`}
        subtitle={incident.title}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(buildLink('/incidents'))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-borderColor hover:bg-gray-50 rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-textSecondary" />
              <span>Back to Incidents</span>
            </button>
            {incident.status !== 'RESTORED' && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
              <button
                type="button"
                onClick={handleMarkRestored}
                className="px-3.5 py-1.5 text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 rounded shadow-sm"
              >
                Mark Restored
              </button>
            )}
          </div>
        }
      />

      {/* Top Header Card: Status, Duration & Qualification */}
      <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borderColor">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={incident.severity} size="md" />
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                incident.status === 'CLOSED'
                  ? 'bg-gray-100 text-gray-800'
                  : incident.status === 'RESTORED' || incident.status === 'RESOLVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              STATUS: {incident.status}
            </span>
            <span className="text-xs text-textSecondary font-mono tabular-nums">
              Duration: {incident.durationMinutes} Minutes Outage
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isQualifying ? (
              <button
                type="button"
                onClick={handleQualify}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 rounded"
              >
                Qualify Incident
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setQualifyModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-50 text-textSecondary border border-borderColor hover:bg-gray-100 rounded"
              >
                Mark Not Qualifying
              </button>
            )}
          </div>
        </div>

        {/* Qualification & 5-minute rule banner */}
        <div
          className={`p-3.5 rounded-md border text-xs flex items-start gap-2.5 ${
            isQualifying ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          {isQualifying ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">
              {isQualifying
                ? `Qualifying Technical Glitch (Duration ${incident.durationMinutes}m ≥ 5 Minutes)`
                : `Non-Qualifying Disruption (Duration ${incident.durationMinutes}m < 5 Minutes)`}
            </span>
            <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">
              {isQualifying
                ? 'Mandatory IFSCA glitch regulations apply. 1-Hour notice, T+1 report, and 14-Day comprehensive RCA submissions required with cryptographic hash seals.'
                : 'Disruptions lasting under 5 minutes do not trigger mandatory statutory notifications under the IFSCA Technical Glitch Framework unless explicitly ordered by the Authority.'}
            </p>
            {incident.notQualifyingReason && (
              <p className="mt-1 text-[11px] font-medium text-textPrimary">
                Recorded exemption rationale: {incident.notQualifyingReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3 Live Statutory Countdown Clocks */}
      {isQualifying && (
        <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brandNavy" />
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Statutory Regulatory Countdown Clocks
              </h3>
            </div>
            <span className="text-[11px] text-textSecondary font-mono">
              Clocks measured from: {incident.occurredAt.slice(0, 16)} IST
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1-Hour Clock */}
            <div className="p-4 bg-bgPage border border-borderColor rounded-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-textSecondary uppercase">1-Hour Initial Notice</span>
                <p className="text-xs font-semibold text-textPrimary mt-1">Exchange & IFSCA Surveillance</p>
              </div>
              <div className="py-3">
                <CountdownClock
                  targetTime={noticeDeadline}
                  fromTime={incident.occurredAt}
                  state={initialFiling?.status === 'ACKNOWLEDGED' || initialFiling?.status === 'SUBMITTED' ? 'MET' : 'RUNNING'}
                  label="1-Hour Target"
                />
              </div>
              <span className="text-[10px] text-textSecondary font-mono block">
                Status: {initialFiling?.status || 'PENDING'}
              </span>
            </div>

            {/* T+1 Preliminary Report Clock */}
            <div className="p-4 bg-bgPage border border-borderColor rounded-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-textSecondary uppercase">T+1 Preliminary Report</span>
                <p className="text-xs font-semibold text-textPrimary mt-1">Detailed Technical Assessment</p>
              </div>
              <div className="py-3">
                <CountdownClock
                  targetTime={prelimDeadline}
                  fromTime={incident.occurredAt}
                  state={prelimFiling?.status === 'ACKNOWLEDGED' || prelimFiling?.status === 'SUBMITTED' ? 'MET' : 'RUNNING'}
                  label="T+1 Target"
                />
              </div>
              <span className="text-[10px] text-textSecondary font-mono block">
                Status: {prelimFiling?.status || 'PENDING'}
              </span>
            </div>

            {/* 14-Day Comprehensive RCA Clock */}
            <div className="p-4 bg-bgPage border border-borderColor rounded-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-textSecondary uppercase">14-Day Comprehensive RCA</span>
                <p className="text-xs font-semibold text-textPrimary mt-1">Root Cause & Board Attestation</p>
              </div>
              <div className="py-3">
                <CountdownClock
                  targetTime={rcaDeadline}
                  fromTime={incident.occurredAt}
                  state={rcaFiling?.status === 'ACKNOWLEDGED' ? 'MET' : 'RUNNING'}
                  label="14-Day RCA Target"
                />
              </div>
              <span className="text-[10px] text-textSecondary font-mono block">
                Status: {rcaFiling?.status || 'IN_PROGRESS'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Filings Section */}
      <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-borderColor">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brandNavy" />
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Statutory Glitch Submissions (3 Filings)
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {incident.filings.map((filing: IncidentFilingRecord) => (
            <div key={filing.id} className="p-4 bg-bgPage border border-borderColor rounded-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-brandNavy">{filing.filingNumber}</span>
                  <p className="text-xs font-bold text-textPrimary mt-0.5">
                    {filing.type === 'INITIAL_NOTICE'
                      ? '1-Hour Initial Incident Notice'
                      : filing.type === 'PRELIMINARY_REPORT'
                      ? 'T+1 Preliminary Technical Glitch Report'
                      : '14-Day Comprehensive Root Cause Analysis Report'}
                  </p>
                  <p className="text-[11px] text-textSecondary mt-0.5">Recipient: {filing.recipient}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      filing.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : filing.status === 'SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {filing.status}
                  </span>
                </div>
              </div>

              {/* AI Draft Banner if draft active */}
              {aiDraftActive === filing.type && filing.status === 'DRAFT' && (
                <AIDraftBanner
                  title={`AI synthesized draft for ${filing.filingNumber}`}
                  onAccept={() => {
                    setAiDraftActive(null);
                    show({ message: 'Draft accepted and incorporated into filing dossier', variant: 'success' });
                  }}
                  onReject={(reason) => {
                    setAiDraftActive(null);
                    show({ message: `Draft rejected: ${reason}`, variant: 'info' });
                  }}
                />
              )}

              {/* Actions Toolbar for Filing */}
              <div className="pt-2 border-t border-borderColor/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-textSecondary font-mono">
                  Seal: {filing.hash ? `${filing.hash.slice(0, 16)}...` : 'Pending generation'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {filing.status === 'DRAFT' && (
                    <button
                      type="button"
                      onClick={() => handleGenerateDraft(filing.type)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate draft notice</span>
                    </button>
                  )}

                  {filing.status !== 'ACKNOWLEDGED' && filing.status !== 'SUBMITTED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilingForSubmit(filing);
                        setSubmitFilingConfirmOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded"
                    >
                      Mark as submitted via official channel
                    </button>
                  )}

                  {filing.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilingForAck(filing);
                        setAckModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload acknowledgement receipt</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrective & Preventive Actions (CAPA) */}
      <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-borderColor">
          <div>
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Corrective & Preventive Action Plan (CAPA)
            </h3>
            <p className="text-[11px] text-textSecondary">
              Mandatory institutional actions to prevent recurrence of trading socket interruption.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddCAPAModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add CAPA</span>
          </button>
        </div>

        <div className="space-y-2">
          {(incident.capa && incident.capa.length > 0) ? (
            incident.capa.map((capa) => (
              <div key={capa.id} className="p-3 bg-bgPage rounded border border-borderColor flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-textPrimary">{capa.action}</p>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Assigned: {capa.owner} · Due: {capa.dueDate}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {capa.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 bg-bgPage rounded border border-borderColor text-xs">
              <p className="font-bold text-textPrimary">
                Upgraded BGP dampening thresholds and enabled dual-homed cross-connects
              </p>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Owner: Vikram Shah · Target: Verified Operational in Colocation Suite
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chronological Incident Timeline */}
      <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-borderColor">
          <div>
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Chronological Incident Investigation Timeline
            </h3>
            <p className="text-[11px] text-textSecondary">
              Immutable sequence of telemetry, failover activations, and statutory notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddTimelineModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-brandNavy border border-blue-200 hover:bg-blue-100 rounded"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="space-y-3">
          {(incident.timeline && incident.timeline.length > 0) ? (
            incident.timeline.map((evt) => (
              <div key={evt.id} className="p-3 bg-bgPage rounded border border-borderColor flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-textPrimary">{evt.title}</span>
                    <span className="text-[10px] text-brandNavy bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                      {evt.actor}
                    </span>
                  </div>
                  <p className="text-textSecondary text-[11px] mt-1">{evt.details}</p>
                </div>
                <span className="text-[10px] font-mono text-textSecondary shrink-0 ml-3">
                  {evt.timestamp.slice(11, 19)} IST
                </span>
              </div>
            ))
          ) : (
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-bgPage rounded border border-borderColor flex items-start justify-between">
                <div>
                  <span className="font-bold text-textPrimary">Socket Dropout Occurred</span>
                  <p className="text-[11px] text-textSecondary mt-0.5">Primary router TCP keepalive timeout recorded.</p>
                </div>
                <span className="text-[10px] font-mono text-textSecondary">{incident.occurredAt.slice(11, 16)} IST</span>
              </div>
              <div className="p-3 bg-bgPage rounded border border-borderColor flex items-start justify-between">
                <div>
                  <span className="font-bold text-textPrimary">Automated BCP Failover</span>
                  <p className="text-[11px] text-textSecondary mt-0.5">Secondary gateway assumed routing responsibilities.</p>
                </div>
                <span className="text-[10px] font-mono text-textSecondary">
                  {new Date(new Date(incident.occurredAt).getTime() + 7 * 60_000).toISOString().slice(11, 16)} IST
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incident Closure Box */}
      <div className="bg-white p-6 rounded-lg border border-borderColor shadow-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-borderColor">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brandNavy" />
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Formal Incident Closure Workflow
            </h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isClosureAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isClosureAllowed ? 'READY FOR CLOSURE' : 'CLOSURE BLOCKED'}
          </span>
        </div>

        {!isClosureAllowed ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 space-y-1">
            <p className="font-bold">Incident closure is blocked pending regulatory requirements:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {!allFilingsAcknowledged && <li>All 3 statutory filings must be marked ACKNOWLEDGED with receipt proof.</li>}
              {capaPendingCount > 0 && <li>All corrective action items (CAPA) must be executed and verified.</li>}
            </ul>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center justify-between">
            <p className="font-semibold">All statutory filings ACKNOWLEDGED and CAPA items verified. Ready for sign-off.</p>
            <button
              type="button"
              onClick={() => setClosureApprovalModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded"
            >
              Request Closure Approval
            </button>
          </div>
        )}
      </div>

      {/* Modal: Mark Not Qualifying */}
      <Modal
        open={qualifyModalOpen}
        onClose={() => setQualifyModalOpen(false)}
        title="Mark Incident as Non-Qualifying"
        subtitle="Mandatory regulatory audit requirement: explain why disruption does not meet 5-minute qualifying threshold."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQualifyModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmNotQualifying}
              disabled={!nonQualifyReason.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Confirm Non-Qualifying
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <label className="block font-semibold text-textPrimary">
            Exemption Rationale <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={nonQualifyReason}
            onChange={(e) => setNonQualifyReason(e.target.value)}
            rows={3}
            placeholder="Explain why disruption lasted under 5 minutes or did not impact core order matching / market access..."
            className="w-full p-2.5 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
          />
        </div>
      </Modal>

      {/* ConfirmDialog: Mark as submitted via official channel (exact wording) */}
      <ConfirmDialog
        open={submitFilingConfirmOpen}
        onConfirm={handleConfirmSubmitFiling}
        onCancel={() => {
          setSubmitFilingConfirmOpen(false);
          setActiveFilingForSubmit(null);
        }}
        title="Mark as submitted via official channel"
        message={`Confirm that filing ${activeFilingForSubmit?.filingNumber} has been officially dispatched to ${activeFilingForSubmit?.recipient} via the designated IFSCA digital portal.`}
        confirmText="Confirm Submission"
        variant="primary"
      />

      {/* Modal: Upload Acknowledgement Receipt */}
      <Modal
        open={ackModalOpen}
        onClose={() => {
          setAckModalOpen(false);
          setActiveFilingForAck(null);
        }}
        title="Upload Statutory Acknowledgement Receipt"
        subtitle="Seal external receipt document and record official receipt reference number."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAckModalOpen(false);
                setActiveFilingForAck(null);
              }}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmUploadReceipt}
              disabled={!receiptRef.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded disabled:opacity-50"
            >
              Confirm Acknowledgement
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">
              Official Acknowledgement Reference Number <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="e.g. IFSCA/ACK/2026/049182"
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
              required
            />
          </div>

          <FileUploadBox
            onUpload={(_file, hash) => {
              show({ message: `Receipt sealed with SHA-256: ${hash.slice(0, 16)}...`, variant: 'success' });
            }}
          />
        </div>
      </Modal>

      {/* Modal: Add CAPA */}
      <Modal
        open={addCAPAModalOpen}
        onClose={() => setAddCAPAModalOpen(false)}
        title="Add Corrective & Preventive Action"
        subtitle="Schedule engineering or procedural fix to prevent glitch recurrence."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddCAPAModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCAPASubmit}
              disabled={!capaAction.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Save Action
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">CAPA Action Description</label>
            <input
              type="text"
              value={capaAction}
              onChange={(e) => setCapaAction(e.target.value)}
              className="w-full p-2 border border-borderColor rounded"
              placeholder="e.g. Implement secondary hot-standby heartbeat daemon"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Responsible Officer</label>
            <select
              value={capaOwner}
              onChange={(e) => setCapaOwner(e.target.value as StaffName)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            >
              <option value="Vikram Shah">Vikram Shah (CISO)</option>
              <option value="Aarav Mehta">Aarav Mehta (Compliance Officer)</option>
              <option value="Rohan Desai">Rohan Desai (Principal Officer)</option>
              <option value="Priya Nair">Priya Nair (Risk Officer)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Target Completion Date</label>
            <input
              type="date"
              value={capaDueDate}
              onChange={(e) => setCapaDueDate(e.target.value)}
              className="w-full p-2 border border-borderColor rounded bg-white"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Closure Approval Panel */}
      <Modal
        open={closureApprovalModalOpen}
        onClose={() => setClosureApprovalModalOpen(false)}
        title="Formal Incident Closure Sign-Off"
        subtitle="Requires dual maker-checker authorization by Principal Officer and Compliance Officer."
        size="md"
      >
        <ApprovalPanel
          currentUser={{ id: currentUser.id, name: currentUser.name }}
          maker={incident.owner}
          requiredSignoffs={2}
          state="PENDING_APPROVAL"
          assignedApprover="Rohan Desai"
          secondApprover="Aarav Mehta"
          onApprove={() => {
            setClosureApprovalModalOpen(false);
            setCloseConfirmOpen(true);
          }}
          onReject={(reason) => {
            setClosureApprovalModalOpen(false);
            show({ message: `Closure approval rejected: ${reason}`, variant: 'error' });
          }}
        />
      </Modal>

      {/* Dialog: Confirm Close Incident */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onConfirm={handleConfirmCloseIncident}
        onCancel={() => setCloseConfirmOpen(false)}
        title="Confirm Formal Incident Closure"
        message="Confirm that all regulatory filings have been acknowledged by IFSCA and the incident file can be archived."
        confirmText="Confirm Closure"
        variant="primary"
      />

      {/* Modal: Add Timeline Event */}
      <Modal
        open={addTimelineModalOpen}
        onClose={() => setAddTimelineModalOpen(false)}
        title="Add Incident Timeline Event"
        subtitle="Record technical finding or failover action to chronological record."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddTimelineModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddTimelineSubmit}
              disabled={!eventTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Save Event
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Event Summary</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Ingress buffer cleared on secondary switch"
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-textPrimary mb-1">Details & Log Excerpt</label>
            <textarea
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              rows={2}
              placeholder="Detailed technical notes..."
              className="w-full p-2 border border-borderColor rounded"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetailPage;
