// src/pages/Metrics/MetricsPage.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Download,
  FileText,
  ExternalLink,
  Layers,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DonutChart } from '../../components/ui/charts/DonutChart';
import { LineChart } from '../../components/ui/charts/LineChart';
import { BarChart } from '../../components/ui/charts/BarChart';
import { StackedBarChart } from '../../components/ui/charts/StackedBarChart';
import { ExportFormatModal } from '../../components/ui/ExportFormatModal';
import { buildLink } from '../../utils/buildLink';
import { useMetrics, useControls } from '../../store';

type DateRange = '3M' | '6M' | '12M' | 'YTD';

export const MetricsPage: React.FC = () => {
  const allMetrics = useMetrics();
  const controls = useControls();

  const [dateRange, setDateRange] = useState<DateRange>('12M');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtered metrics series based on date range
  const filteredMetrics = useMemo(() => {
    switch (dateRange) {
      case '3M':
        return allMetrics.slice(-3);
      case '6M':
        return allMetrics.slice(-6);
      case 'YTD':
        return allMetrics.slice(-2); // Q1 2026 points
      case '12M':
      default:
        return allMetrics;
    }
  }, [allMetrics, dateRange]);

  // Donut Chart: Controls Evaluation Distribution
  const controlDonutData = useMemo(() => {
    const pass = controls.filter((c) => c.status === 'PASS').length;
    const fail = controls.filter((c) => c.status === 'FAIL').length;
    const warn = controls.filter((c) => c.status === 'WARNING').length;
    const unknown = controls.filter((c) => c.status === 'UNKNOWN').length;

    return [
      { name: 'PASS', value: pass, color: '#10B981' },
      { name: 'FAIL', value: fail, color: '#EF4444' },
      { name: 'WARNING', value: warn, color: '#F59E0B' },
      { name: 'UNKNOWN', value: unknown, color: '#94A3B8', isUnknown: true },
    ];
  }, [controls]);

  // Line Chart: Compliance & Evidence Coverage Trend
  const complianceTrendData = useMemo(() => {
    return filteredMetrics.map((m) => ({
      month: m.month,
      compliance: m.compliancePercent,
      evidenceCoverage: m.evidenceCoveragePercent,
    }));
  }, [filteredMetrics]);

  // Bar Chart: Exception Counts & Data Anomalies
  const exceptionsBarData = useMemo(() => {
    return filteredMetrics.map((m) => ({
      month: m.month,
      exceptions: m.exceptionCount,
      accessAnomalies: m.accessAnomalyCount,
    }));
  }, [filteredMetrics]);

  // Stacked Bar Chart: Statutory Report Timeliness Breakdown
  const reportsStackedData = useMemo(() => {
    return filteredMetrics.map((m) => ({
      month: m.month,
      onTime: m.reportsOnTime,
      acknowledged: m.reportsAcknowledged,
      delayed: m.reportsLate,
    }));
  }, [filteredMetrics]);

  // Current headline compliance average
  const currentCompliance =
    filteredMetrics.length > 0
      ? filteredMetrics[filteredMetrics.length - 1].compliancePercent
      : 94;

  const currentCoverage =
    filteredMetrics.length > 0
      ? filteredMetrics[filteredMetrics.length - 1].evidenceCoveragePercent
      : 88;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Compliance Analytics & Trends"
        subtitle="12-month trailing regulatory metrics, control effectiveness, and statutory reporting indicators."
        actions={
          <div className="flex items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center bg-white border border-borderColor rounded-md p-0.5 shadow-2xs">
              {(['3M', '6M', '12M', 'YTD'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    dateRange === range
                      ? 'bg-brandNavy text-white shadow-xs'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-gray-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Export Analytics */}
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-borderColor text-textPrimary hover:bg-gray-50 rounded-md text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-textSecondary" />
              <span>Export analytics</span>
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Overall Compliance Score
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{currentCompliance}%</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            +2.4% vs prior quarter benchmark
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Evidence Vault Coverage
          </span>
          <p className="text-2xl font-bold text-brandNavy mt-1">{currentCoverage}%</p>
          <p className="text-[10px] text-textSecondary mt-0.5">
            Cryptographically sealed under WORM
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Mean Time to Detect (MTTD)
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">1.8 hrs</p>
          <p className="text-[10px] text-blue-700 mt-0.5">Automated surveillance feeds</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Mean Time to Resolve (MTTR)
          </span>
          <p className="text-2xl font-bold text-purple-700 mt-1">4.2 hrs</p>
          <p className="text-[10px] text-purple-700 mt-0.5">Well within statutory 24h floor</p>
        </div>
      </div>

      {/* Charts Grid: 4 Chart Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: LINE CHART (12-Month Compliance & Evidence Trend) */}
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-borderColor pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Compliance & Vault Readiness Trajectory ({dateRange})
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Composite compliance index (%) and cryptographic evidence coverage ratio.
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-brandNavy" />
          </div>
          <LineChart
            data={complianceTrendData}
            xAxisKey="month"
            series={[
              { dataKey: 'compliance', name: 'Compliance %', color: '#0F172A' },
              { dataKey: 'evidenceCoverage', name: 'Evidence Coverage %', color: '#3B82F6' },
            ]}
            height={240}
          />
        </div>

        {/* CHART 2: DONUT CHART (Control Status Distribution) */}
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-borderColor pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Internal Control Health Distribution
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Evaluation results across 20 statutory risk & governance controls.
              </p>
            </div>
            <Layers className="w-4 h-4 text-brandNavy" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            <div className="w-56 h-56">
              <DonutChart
                data={controlDonutData}
                height={220}
                innerRadius={55}
                outerRadius={80}
                centerText={{
                  value: controls.length,
                  label: 'Controls',
                }}
              />
            </div>
            <div className="space-y-2 text-xs">
              {controlDonutData.map((seg) => (
                <div key={seg.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-semibold text-textPrimary">{seg.name}:</span>
                  <span className="font-mono font-bold text-textPrimary">{seg.value}</span>
                  {seg.isUnknown && (
                    <span className="text-[10px] text-amber-700 italic">
                      (RMS sync required)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 3: BAR CHART (Exceptions by Month) */}
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-borderColor pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Monthly Regulatory Exceptions & Access Anomalies
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Policy breaches, segregation conflicts, and directory anomalies detected.
              </p>
            </div>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <BarChart
            data={exceptionsBarData}
            xAxisKey="month"
            series={[
              { dataKey: 'exceptions', name: 'Exceptions', color: '#EF4444' },
              { dataKey: 'accessAnomalies', name: 'Access Anomalies', color: '#F59E0B' },
            ]}
            height={240}
          />
        </div>

        {/* CHART 4: STACKED BAR CHART (Statutory Reports Timeliness) */}
        <div className="bg-white p-4 rounded-lg border border-borderColor shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-borderColor pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Statutory Filings Dispatch & Acknowledgement Velocity
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                On-time submissions, verified IFSCA receipts, and delay occurrences.
              </p>
            </div>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <StackedBarChart
            data={reportsStackedData}
            xAxisKey="month"
            series={[
              { dataKey: 'acknowledged', name: 'Receipt Acknowledged', color: '#10B981', stackId: 'a' },
              { dataKey: 'onTime', name: 'Submitted On-Time', color: '#3B82F6', stackId: 'a' },
              { dataKey: 'delayed', name: 'Delayed Filings', color: '#EF4444', stackId: 'a' },
            ]}
            height={240}
          />
        </div>
      </div>

      {/* Domain Drill-Down Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
          Compliance Domain Deep-Dive Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <Link
            to={buildLink('/controls', { tab: 'library' })}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Control Library & Real-Time Evaluations
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Inspect 20 internal controls and dependency graphs
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>

          <Link
            to={buildLink('/incidents')}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Statutory Incident Register & 14-Day RCA
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Monitor INC-2026-014 clock and Cert-In filings
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>

          <Link
            to={buildLink('/reports', { tab: 'dashboard' })}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Regulatory Calendar & Filing Vault
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Review submitted returns and official receipt seals
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>

          <Link
            to={buildLink('/evidence')}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Immutable WORM Evidence Room
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Audit findings, legal holds, and SHA-256 verifications
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>

          <Link
            to={buildLink('/cyber-vendors')}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Cyber Resilience & Third-Party Oversight
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Vendor reassessment cycles and BCP drill records
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>

          <Link
            to={buildLink('/integrations')}
            className="p-3.5 bg-white border border-borderColor rounded-lg hover:border-brandNavy transition-all shadow-xs flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-textPrimary text-xs group-hover:text-brandNavy">
                Data Connectors & Ingestion Streams
              </span>
              <p className="text-[11px] text-textSecondary mt-0.5">
                RMS, trading engine, and banking partner feeds
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-textSecondary group-hover:text-brandNavy" />
          </Link>
        </div>
      </div>

      {/* Export Format Modal */}
      <ExportFormatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Regulatory Analytics Export"
        onExport={(_format) => {
          setExportModalOpen(false);
        }}
      />
    </div>
  );
};

export default MetricsPage;
