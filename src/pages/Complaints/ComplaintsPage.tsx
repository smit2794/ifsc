// src/pages/Complaints/ComplaintsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Plus,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Layers,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { PageHeader } from '../../components/layout/PageHeader';
import { BarChart } from '../../components/ui/charts/BarChart';
import { DonutChart } from '../../components/ui/charts/DonutChart';
import { LineChart } from '../../components/ui/charts/LineChart';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useAppStore, useComplaints, useCurrentUser, useMetrics } from '../../store';
import { ComplaintItem, ComplaintCategory } from '../../types/complaint';

export const ComplaintsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const complaints = useComplaints();
  const currentUser = useCurrentUser();
  const metrics = useMetrics();
  const addComplaint = useAppStore((s) => s.addComplaint);

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
      navigate(buildLink('/complaints', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Complaint Modal State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientId, setNewClientId] = useState('CLT-***-901');
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('Order Execution');
  const [newType, setNewType] = useState<'RETAIL' | 'INSTITUTIONAL'>('INSTITUTIONAL');
  const [newSummary, setNewSummary] = useState('');

  // 1. Ageing Buckets calculation (0–3, 4–7, 8–15, 16–30, 30+ days)
  const ageingData = useMemo(() => {
    let b0_3 = 0;
    let b4_7 = 0;
    let b8_15 = 0;
    let b16_30 = 0;
    let b30plus = 0;

    complaints.forEach((c) => {
      const age = c.ageDays;
      if (age <= 3) b0_3 += 1;
      else if (age <= 7) b4_7 += 1;
      else if (age <= 15) b8_15 += 1;
      else if (age <= 30) b16_30 += 1;
      else b30plus += 1;
    });

    return [
      { bucket: '0–3d', count: b0_3 },
      { bucket: '4–7d', count: b4_7 },
      { bucket: '8–15d', count: b8_15 },
      { bucket: '16–30d', count: b16_30 },
      { bucket: '30+d', count: b30plus },
    ];
  }, [complaints]);

  // 2. Retail vs Non-Retail Donut Data
  const donutData = useMemo(() => {
    const retailCount = complaints.filter((c) => c.type === 'RETAIL' || c.isRetail).length;
    const nonRetailCount = complaints.length - retailCount;

    return [
      { name: 'Retail Clients', value: retailCount, color: '#3B82F6' },
      { name: 'Institutional', value: nonRetailCount, color: '#0F172A' },
    ];
  }, [complaints]);

  // 3. Resolution Trend Line Data
  const resolutionTrendData = useMemo(() => {
    return metrics.map((m) => ({
      month: m.month,
      resolved: Math.max(1, 10 - Math.floor(m.exceptionCount / 3)),
      timeliness: m.compliancePercent,
    }));
  }, [metrics]);

  // 4. SLA At Risk count
  const slaAtRiskCount = useMemo(() => {
    return complaints.filter((c) => {
      if (c.status === 'CLOSED' || c.status === 'DISPOSED') return false;
      if (c.ageDays >= 20) return true;
      if (c.retailClocks) {
        if (
          (c.retailClocks.acknowledgementDaysRemaining ?? 99) <= 1 ||
          (c.retailClocks.disposalTargetDaysRemaining ?? 99) <= 2
        ) {
          return true;
        }
      }
      return false;
    }).length;
  }, [complaints]);

  // Filtered Complaints Table
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [complaints, searchQuery, categoryFilter, typeFilter, statusFilter]);

  // Handle New Complaint Submit
  const handleCreateComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newSummary.trim()) return;

    const nextId = `CMP-2026-${(complaints.length + 1).toString().padStart(3, '0')}`;
    const isRetail = newType === 'RETAIL';

    const newRecord: ComplaintItem = {
      id: nextId,
      clientName: newClientName.trim(),
      clientId: newClientId,
      category: newCategory,
      status: 'OPEN',
      type: newType,
      isRetail,
      classificationConfirmed: false,
      filedDate: new Date().toISOString(),
      ageDays: 0,
      owner: currentUser.name,
      ownerId: currentUser.id,
      summary: newSummary.trim(),
    };

    addComplaint(newRecord);
    setNewModalOpen(false);
    setNewClientName('');
    setNewSummary('');
    toast.show({
      message: `Complaint ${nextId} registered. Pending classification confirmation.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Complaints & Redressal Management"
        subtitle="IFSCA retail and institutional investor redressal timeline oversight, statutory SLA tracking, and resolution auditing."
        actions={
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandNavy text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Complaint
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
            navigate(buildLink('/complaints', p));
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-brandNavy text-white shadow-sm'
              : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard & Analytics</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {complaints.length}
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
            navigate(buildLink('/complaints', p));
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'all'
              ? 'bg-brandNavy text-white shadow-sm'
              : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>All Complaints & Register</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {complaints.length}
          </span>
        </button>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total & SLA at Risk */}
        <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                Total Complaints
              </span>
              <MessageSquare className="w-4 h-4 text-brandNavy" />
            </div>
            <p className="text-3xl font-extrabold text-textPrimary mt-2">{complaints.length}</p>
            <p className="text-[11px] text-textSecondary mt-0.5">Active & Historical Matters</p>
          </div>

          <div className="mt-4 pt-3 border-t border-borderColor flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>SLA At Risk:</span>
            </span>
            <span className="text-xs font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {slaAtRiskCount} Matters
            </span>
          </div>
        </div>

        {/* Chart 1: Ageing Buckets BarChart */}
        <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-brandNavy" />
              <span>Ageing Buckets (Days)</span>
            </span>
            <span className="text-[10px] text-textSecondary">0-30+</span>
          </div>
          <BarChart
            data={ageingData}
            xAxisKey="bucket"
            series={[{ dataKey: 'count', name: 'Matters', color: '#0F172A' }]}
            height={130}
          />
        </div>

        {/* Chart 2: Retail vs Non-Retail DonutChart */}
        <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-brandNavy" />
              <span>Retail vs Institutional</span>
            </span>
            <span className="text-[10px] text-textSecondary">Total: {complaints.length}</span>
          </div>
          <DonutChart
            data={donutData}
            height={130}
            innerRadius={32}
            outerRadius={52}
            centerText={{ value: complaints.length, label: 'Matters' }}
          />
        </div>

        {/* Chart 3: Resolution Trend LineChart */}
        <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>12M Resolution Trend</span>
            </span>
            <span className="text-[10px] text-textSecondary">Monthly</span>
          </div>
          <LineChart
            data={resolutionTrendData.slice(-6)}
            xAxisKey="month"
            series={[{ dataKey: 'resolved', name: 'Closed', color: '#10B981' }]}
            height={130}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-borderColor rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, client name, or summary..."
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
            <option value="Order Execution">Order Execution</option>
            <option value="Settlement & Funds">Settlement & Funds</option>
            <option value="Billing & Fee Charges">Billing & Fee Charges</option>
            <option value="KYC & Onboarding">KYC & Onboarding</option>
            <option value="Unauthorized Trades">Unauthorized Trades</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
          >
            <option value="ALL">All Client Types</option>
            <option value="RETAIL">Retail</option>
            <option value="INSTITUTIONAL">Institutional</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-1 focus:ring-brandNavy"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="DISPOSED">Disposed</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-borderColor text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Complaint ID</th>
                <th className="py-2.5 px-3.5">Complainant / Client</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5 text-center">Type</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-center">Age (Days)</th>
                <th className="py-2.5 px-3.5">Assigned CRO</th>
                <th className="py-2.5 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-textSecondary italic">
                    No complaints matching your filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isRetail = c.type === 'RETAIL' || c.isRetail;
                  const isClosed = c.status === 'CLOSED' || c.status === 'DISPOSED';
                  const isSlaWarning = c.ageDays >= 20 && !isClosed;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-brandNavy">
                        {c.id}
                      </td>
                      <td className="py-2.5 px-3.5 max-w-sm">
                        <p className="font-semibold text-textPrimary truncate">{c.clientName}</p>
                        <p className="text-[11px] text-textSecondary line-clamp-1">{c.summary}</p>
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{c.category}</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRetail
                              ? 'bg-blue-50 text-brandNavy border border-blue-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isClosed
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'INVESTIGATING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-mono">
                        <span className={isSlaWarning ? 'font-bold text-rose-700' : 'text-textPrimary'}>
                          {c.ageDays}d
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-textPrimary">{c.owner}</td>
                      <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/complaints/${c.id}`}
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
          <span>Showing {filteredComplaints.length} of {complaints.length} complaints</span>
          <span>Retail statutory deadlines (3d / 5d / 15d / 30d) activate upon classification confirmation</span>
        </div>
      </div>

      {/* Modal: New Complaint */}
      <Modal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Register Investor Complaint"
        subtitle="Log incoming redressal grievance under IFSCA (Conduct of Business) Rules."
        size="md"
      >
        <form onSubmit={handleCreateComplaintSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Complainant Legal / Registered Name
            </label>
            <input
              type="text"
              required
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="e.g. Apex Global Arbitrage Fund SPC"
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Client ID Reference
              </label>
              <input
                type="text"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                placeholder="e.g. CLT-***-901"
                className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
                className="w-full p-2 border border-borderColor rounded-md bg-white"
              >
                <option value="Order Execution">Order Execution</option>
                <option value="Settlement & Funds">Settlement & Funds</option>
                <option value="Billing & Fee Charges">Billing & Fee Charges</option>
                <option value="KYC & Onboarding">KYC & Onboarding</option>
                <option value="Unauthorized Trades">Unauthorized Trades</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Initial Investor Type Classification
            </label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={newType === 'INSTITUTIONAL'}
                  onChange={() => setNewType('INSTITUTIONAL')}
                  className="text-brandNavy"
                />
                <span className="font-semibold text-textPrimary">Institutional Broker / Treasury</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={newType === 'RETAIL'}
                  onChange={() => setNewType('RETAIL')}
                  className="text-brandNavy"
                />
                <span className="font-semibold text-textPrimary">Retail / Individual Investor</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Grievance Summary & Background
            </label>
            <textarea
              rows={3}
              required
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Detail the alleged trade execution discrepancy, fee mismatch, or transfer delay..."
              className="w-full p-2 border border-borderColor rounded-md focus:ring-1 focus:ring-brandNavy"
            />
          </div>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Register Matter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
