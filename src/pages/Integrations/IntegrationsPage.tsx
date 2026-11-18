// src/pages/Integrations/IntegrationsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plug,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ExternalLink,
  FolderSync,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { StatusChip } from '../../components/ui/StatusChip';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import {
  useAppStore,
  useIntegrations,
  useConnectorCatalogue,
  useImportHistory,
  useDataQualityAlerts,
  useControls,
} from '../../store';
import { ConnectedSystemItem } from '../../types/integration';

type IntegrationTab = 'dashboard' | 'connected' | 'catalogue' | 'imports' | 'quality';
const VALID_TABS: IntegrationTab[] = ['dashboard', 'connected', 'catalogue', 'imports', 'quality'];

export const IntegrationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const integrations = useIntegrations();
  const catalogue = useConnectorCatalogue();
  const importHistory = useImportHistory();
  const alerts = useDataQualityAlerts();
  const controls = useControls();

  const syncConnector = useAppStore((s) => s.syncConnector);
  const evaluateControl = useAppStore((s) => s.evaluateControl);
  const resolveDataQualityAlert = useAppStore((s) => s.resolveDataQualityAlert);

  // Tab handling from URL (?tab=...)
  const rawTab = searchParams.get('tab');
  const activeTab: IntegrationTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'connectors') return 'connected';
    if (rawTab === 'alerts') return 'quality';
    if (rawTab === 'history') return 'imports';
    if (VALID_TABS.includes(rawTab as IntegrationTab)) return rawTab as IntegrationTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (rawTab && !VALID_TABS.includes(rawTab as IntegrationTab) && rawTab !== 'connectors' && rawTab !== 'alerts' && rawTab !== 'history') {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/integrations', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Drawer connector (?connector=...)
  const activeConnectorId = searchParams.get('connector');
  const activeConnector = useMemo(() => {
    if (!activeConnectorId) return null;
    return (
      integrations.find(
        (c) =>
          c.id.toLowerCase() === activeConnectorId.toLowerCase() ||
          c.code.toLowerCase() === activeConnectorId.toLowerCase()
      ) || null
    );
  }, [integrations, activeConnectorId]);

  const [syncingConnectorId, setSyncingConnectorId] = useState<string | null>(null);
  const [syncSuccessModalConnector, setSyncSuccessModalConnector] = useState<ConnectedSystemItem | null>(null);

  // Manual File Upload Attestation Modal State
  const [uploadModalConnector, setUploadModalConnector] = useState<ConnectedSystemItem | null>(null);
  const [uploadedFileHash, setUploadedFileHash] = useState('');
  const [attestationChecked, setAttestationChecked] = useState(false);

  // Filtered lists
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.status === 'ACTIVE');
  }, [alerts]);

  const handleTabChange = (tabKey: IntegrationTab) => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      p[k] = v;
    });
    p.tab = tabKey;
    navigate(buildLink('/integrations', p));
  };

  const handleOpenConnector = (connectorId: string) => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      p[k] = v;
    });
    p.connector = connectorId;
    navigate(buildLink('/integrations', p));
  };

  // Handle "Sync now" (2-second network refresh delay -> Propagation #4)
  const handleSyncNow = (conn: ConnectedSystemItem) => {
    setSyncingConnectorId(conn.id);
    setTimeout(() => {
      syncConnector(conn.id);
      setSyncingConnectorId(null);
      setSyncSuccessModalConnector(conn);
      toast.show({
        message: `${conn.name} synchronized successfully`,
        variant: 'success',
      });
    }, 2000);
  };

  // Re-evaluate all affected RMS controls
  const handleReevaluateAllAffected = () => {
    const affectedControlIds = ['TRADE-REC-001', 'TRADE-REC-002', 'TRADE-ACCESS-003', 'TRADE-RISK-004'];
    affectedControlIds.forEach((id) => evaluateControl(id));
    toast.show({
      message: 'All 4 RMS-dependent controls re-evaluated to PASS',
      variant: 'success',
    });
  };

  // Handle Manual File Upload with Attestation
  const handleManualUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalConnector || !attestationChecked || !uploadedFileHash) return;

    syncConnector(uploadModalConnector.id);
    const connName = uploadModalConnector.name;
    setUploadModalConnector(null);
    setAttestationChecked(false);
    setUploadedFileHash('');

    toast.show({
      message: `Attested data file for ${connName} ingested. Dependent controls updated.`,
      variant: 'success',
    });
  };

  // Handle Resolve Alert
  const handleResolveAlert = (alertId: string) => {
    resolveDataQualityAlert(alertId);
    toast.show({
      message: `Data quality alert ${alertId} resolved and logged`,
      variant: 'success',
    });
  };

  // RMS dependent controls list
  const rmsAffectedControls = useMemo(() => {
    return controls.filter((c) =>
      ['TRADE-REC-001', 'TRADE-REC-002', 'TRADE-ACCESS-003', 'TRADE-RISK-004'].includes(c.id)
    );
  }, [controls]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Automated Data Ingestion & Connectors"
        subtitle="Authoritative feeds from trading engines, RMS, depositories, banking partners, and enterprise IAM."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Connected Systems
          </span>
          <p className="text-2xl font-bold text-brandNavy mt-1">{integrations.length}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">
            {integrations.filter((i) => i.status === 'HEALTHY').length} Healthy ·{' '}
            {integrations.filter((i) => i.status === 'STALE').length} Stale
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Active Quality Alerts
          </span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{activeAlerts.length}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Data anomalies requiring review</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Records Ingested (24h)
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {(
              integrations.reduce((acc, i) => acc + i.recordsSyncedLast24h, 0) / 1000
            ).toFixed(1)}
            k
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5">mTLS & FIX Encrypted Streams</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Ingestion Pipeline
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">99.98%</p>
          <p className="text-[10px] text-blue-700 mt-0.5">Payload Hash Verification Rate</p>
        </div>
      </div>

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
          onClick={() => handleTabChange('connected')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'connected'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Plug className="w-4 h-4" />
          <span>Connected Systems ({integrations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('catalogue')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'catalogue'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalogue ({catalogue.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('imports')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'imports'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Imports ({importHistory.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('quality')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'quality'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Data Quality ({activeAlerts.length})</span>
        </button>
      </div>

      {/* TAB 0: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Health Summary Banner */}
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Ingestion Health & Authoritative Gateway Status
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                {integrations.filter((i) => i.status === 'HEALTHY').length} of {integrations.length} automated connector pipelines are running in synchronized state.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('connected')}
                className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs inline-flex items-center gap-1.5"
              >
                <span>View All 8 Connectors</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Connectors Quick View Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Core Enterprise Connectors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {integrations.map((conn) => (
                <div
                  key={conn.id}
                  onClick={() => handleOpenConnector(conn.id)}
                  className="p-3.5 rounded-lg border border-borderColor bg-white hover:border-brandNavy cursor-pointer transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-textSecondary uppercase">
                        {conn.code}
                      </span>
                      <h5 className="text-xs font-bold text-textPrimary line-clamp-1">{conn.name}</h5>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        conn.status === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : conn.status === 'STALE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {conn.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-textSecondary space-y-0.5">
                    <p>Protocol: <strong className="text-textPrimary">{conn.protocol}</strong></p>
                    <p>Error Rate: <strong className="text-textPrimary">{conn.errorRatePercent}%</strong></p>
                  </div>
                  <div className="pt-2 border-t border-borderColor flex items-center justify-between text-[11px] text-brandNavy font-semibold">
                    <span>Inspect details</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Data Quality Alerts Preview */}
          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Active Ingestion Alerts ({activeAlerts.length})
                </h4>
                <button
                  type="button"
                  onClick={() => handleTabChange('quality')}
                  className="text-xs text-brandNavy hover:underline font-semibold"
                >
                  View all in Data Quality
                </button>
              </div>
              <div className="bg-white border border-rose-200 rounded-lg overflow-hidden shadow-xs divide-y divide-rose-100">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="p-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brandNavy">{alert.id}</span>
                        <span className="font-bold text-textPrimary">{alert.title}</span>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <p className="text-[11px] text-textSecondary mt-0.5">{alert.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded shrink-0 shadow-2xs"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: CONNECTORS GRID */}
      {activeTab === 'connected' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((conn) => {
              const isSyncing = syncingConnectorId === conn.id;

              return (
                <div
                  key={conn.id}
                  className={`p-4 rounded-lg border bg-white shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                    conn.status === 'STALE'
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-borderColor hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => handleOpenConnector(conn.id)}
                        className="cursor-pointer hover:opacity-80"
                      >
                        <span className="font-mono text-[10px] font-bold text-textSecondary uppercase">
                          {conn.code}
                        </span>
                        <h4 className="text-sm font-bold text-textPrimary leading-snug">
                          {conn.name}
                        </h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          conn.status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : conn.status === 'STALE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {conn.status}
                      </span>
                    </div>

                    <p className="text-xs text-textSecondary">
                      Protocol: <strong className="text-textPrimary">{conn.protocol}</strong>
                    </p>

                    {conn.staleReason && conn.status === 'STALE' && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                        {conn.staleReason}
                      </div>
                    )}

                    <div className="pt-2 border-t border-borderColor grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-textSecondary block">Last Synced:</span>
                        <span className="font-mono font-medium text-textPrimary">
                          {conn.lastSyncTimestamp ? new Date(conn.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-textSecondary block">Error Rate:</span>
                        <span className="font-mono font-medium text-textPrimary">
                          {conn.errorRatePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-borderColor flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenConnector(conn.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-borderColor text-brandNavy hover:bg-slate-100 rounded shadow-2xs"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadModalConnector(conn)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded shadow-2xs inline-flex items-center gap-1"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => handleSyncNow(conn)}
                      className="px-3 py-1 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 disabled:bg-slate-400 rounded shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DATA QUALITY ALERTS */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Automated Data Quality & Schema Integrity Alerts
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Real-time anomaly detection across API ingestion streams.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs divide-y divide-borderColor">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brandNavy">{alert.id}</span>
                    <span className="font-bold text-textPrimary">{alert.title}</span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <p className="text-textSecondary leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-textSecondary">
                    <span>
                      Metric: <strong className="text-textPrimary">{alert.metric}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Connector: <strong className="text-textPrimary">{alert.connectorId}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono">{alert.detectedAt}</span>
                  </div>
                </div>

                <div>
                  {alert.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded bg-white border border-borderColor text-textPrimary hover:bg-gray-50 text-xs font-semibold shadow-2xs"
                    >
                      Resolve alert
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT HISTORY */}
      {activeTab === 'imports' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Cryptographically Verified Ingestion Log
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Historical batches with SHA-256 payload checksums.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Batch ID</th>
                    <th className="py-2.5 px-3.5">Connector</th>
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Record Count</th>
                    <th className="py-2.5 px-3.5">Duration</th>
                    <th className="py-2.5 px-3.5">Payload Checksum (SHA-256)</th>
                    <th className="py-2.5 px-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {importHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {item.id}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">
                        {item.connectorName}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {item.importedAt}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-textPrimary">
                        {item.recordCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {item.durationMs}ms
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {item.payloadChecksum.slice(0, 18)}...
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.status}
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

      {/* TAB 4: CONNECTOR CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              IFSCA Standard Connector Catalogue
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Certified enterprise adapters supporting mTLS, FIX protocol, and automated reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogue.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                    {entry.category}
                  </span>
                  <h4 className="text-sm font-bold text-textPrimary mt-0.5">{entry.name}</h4>
                  <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                    {entry.description}
                  </p>
                  <p className="text-[11px] text-textSecondary mt-2">
                    Auth Method: <strong className="text-textPrimary">{entry.authMethod}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-borderColor flex items-center justify-between">
                  <span className="text-[10px] text-textSecondary">Vendor: {entry.vendor}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.installed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {entry.installed ? 'Installed' : 'Available'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DetailDrawer: Connector Details & Re-evaluate Affected Controls */}
      {activeConnector && (
        <DetailDrawer
          paramKey="connector"
          title={activeConnector.name}
          subtitle={`${activeConnector.code} · ${activeConnector.protocol}`}
          width="w-full sm:max-w-lg lg:max-w-xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Status Card */}
            <div className="p-4 rounded-lg border border-borderColor bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brandNavy">{activeConnector.code}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeConnector.status === 'HEALTHY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeConnector.status === 'STALE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {activeConnector.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-textSecondary block text-[11px]">Protocol</span>
                  <span className="font-semibold text-textPrimary">{activeConnector.protocol}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Lead Engineer</span>
                  <span className="font-semibold text-textPrimary">{activeConnector.leadEngineer}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Last Synchronization</span>
                  <span className="font-mono text-textPrimary">
                    {activeConnector.lastSyncTimestamp
                      ? new Date(activeConnector.lastSyncTimestamp).toLocaleString()
                      : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Error Rate</span>
                  <span className="font-mono text-textPrimary">{activeConnector.errorRatePercent}%</span>
                </div>
              </div>

              {activeConnector.staleReason && activeConnector.status === 'STALE' && (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <strong className="block font-semibold mb-0.5">Stale Feed Rationale:</strong>
                  {activeConnector.staleReason}
                </div>
              )}
            </div>

            {/* Affected Controls Section (Rule 4) */}
            {(activeConnector.id === 'rms' || activeConnector.code === 'CON-RMS-01') && (
              <div className="space-y-3 p-4 rounded-lg border border-blue-200 bg-blue-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brandNavy" />
                    <h4 className="text-xs font-bold text-brandNavy uppercase tracking-wider">
                      Affected Internal Controls ({rmsAffectedControls.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-brandNavy/80">RMS Direct Dependency</span>
                </div>
                <p className="text-[11px] text-textSecondary leading-relaxed">
                  These 4 trading controls rely exclusively on real-time RMS trade streaming feeds. When the connector is synchronized, they require institutional re-evaluation.
                </p>

                <div className="space-y-2 pt-1">
                  {rmsAffectedControls.map((ctrl) => (
                    <div
                      key={ctrl.id}
                      className="p-3 bg-white rounded border border-borderColor flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-brandNavy">{ctrl.code}</span>
                          <span className="font-semibold text-textPrimary truncate text-xs">{ctrl.title}</span>
                        </div>
                        <p className="text-[10px] text-textSecondary mt-0.5">{ctrl.domain}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ctrl.needsRevaluation && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Re-evaluation needed
                          </span>
                        )}
                        <StatusChip status={ctrl.status} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Re-evaluate all affected button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReevaluateAllAffected}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded-md shadow-xs transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Re-evaluate all affected</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-3 border-t border-borderColor space-y-2">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                Connector Actions
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={syncingConnectorId === activeConnector.id}
                  onClick={() => handleSyncNow(activeConnector)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingConnectorId === activeConnector.id ? 'animate-spin' : ''}`} />
                  <span>{syncingConnectorId === activeConnector.id ? 'Syncing...' : 'Sync now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadModalConnector(activeConnector)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload attested file</span>
                </button>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Modal: Post-Sync Notice with "Open affected controls" button */}
      {syncSuccessModalConnector && (
        <Modal
          open={Boolean(syncSuccessModalConnector)}
          onClose={() => setSyncSuccessModalConnector(null)}
          title={`Connector Synchronized: ${syncSuccessModalConnector.name}`}
          subtitle="Feed validated. Dependent regulatory controls flagged for re-evaluation."
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-textSecondary leading-relaxed">
              Connector status is now <strong className="text-emerald-700">HEALTHY</strong>. The 4 RMS-dependent controls (TRADE-REC-001, TRADE-REC-002, TRADE-ACCESS-003, TRADE-RISK-004) have been flagged with <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Re-evaluation needed</span>.
            </p>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
              <span className="font-bold text-brandNavy block text-xs">
                Verification Scope:
              </span>
              <p className="text-brandNavy text-[11px]">
                GOV-SOD-001 remains unaffected as it relies solely on IAM/HR directory freshness.
              </p>
            </div>

            <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSyncSuccessModalConnector(null)}
                className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSyncSuccessModalConnector(null);
                  navigate('/controls?tab=library&status=UNKNOWN');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Open affected controls</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Manual File Upload with Attestation */}
      {uploadModalConnector && (
        <Modal
          open={Boolean(uploadModalConnector)}
          onClose={() => setUploadModalConnector(null)}
          title={`Attested Ingestion: ${uploadModalConnector.name}`}
          subtitle="Upload official export file to restore connector freshness."
          size="md"
        >
          <form onSubmit={handleManualUploadSubmit} className="space-y-4 text-xs">
            <div>
              <p className="text-textSecondary mb-2 leading-relaxed">
                Provide the signed export file. Client-side Web Crypto will compute the SHA-256 digest before recording the batch.
              </p>
              <FileUploadBox
                accept=".csv,.xlsx,.json,.xml"
                onUpload={(_file: File, hash: string) => {
                  setUploadedFileHash(hash);
                }}
              />
              {uploadedFileHash && (
                <div className="mt-2 p-2 rounded bg-slate-50 border border-borderColor font-mono text-[10px] break-all">
                  SHA-256: {uploadedFileHash}
                </div>
              )}
            </div>

            {/* Statutory Attestation Checkbox */}
            <label className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={attestationChecked}
                onChange={(e) => setAttestationChecked(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-brandNavy focus:ring-brandNavy"
              />
              <span className="text-[11px] text-textPrimary leading-relaxed">
                I attest under penalty of regulatory sanctions that this file export originated directly from the authoritative system of record and has not undergone unauthorised modification.
              </span>
            </label>

            <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalConnector(null)}
                className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!attestationChecked || !uploadedFileHash}
                className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 disabled:bg-slate-300 rounded shadow-xs"
              >
                Ingest & Resync Connector
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default IntegrationsPage;
