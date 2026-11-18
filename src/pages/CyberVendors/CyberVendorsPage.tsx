// src/pages/CyberVendors/CyberVendorsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Server,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Building,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { Modal } from '../../components/ui/Modal';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { useToast } from '../../components/ui/Toast';
import { buildLink } from '../../utils/buildLink';
import {
  useAppStore,
  useVendors,
  useCyber,
} from '../../store';
import { VendorItem } from '../../types/vendor';
import { OutsourcingRegisterEntry } from '../../types/cyber';

type CyberTab = 'dashboard' | 'assets' | 'risk' | 'vendors' | 'bcp';
const VALID_CYBER_TABS: CyberTab[] = ['dashboard', 'assets', 'risk', 'vendors', 'bcp'];

export const CyberVendorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const vendors = useVendors();
  const cyber = useCyber();
  const startVendorReassessment = useAppStore((s) => s.startVendorReassessment);
  const addOutsourcingRegisterEntry = useAppStore((s) => s.addOutsourcingRegisterEntry);
  const toggleCyberChecklistItem = useAppStore((s) => s.toggleCyberChecklistItem);

  const rawTab = searchParams.get('tab');
  const activeTab: CyberTab = useMemo(() => {
    if (!rawTab) return 'dashboard';
    if (rawTab === 'outsourcing') return 'vendors';
    if (rawTab === 'checklist' || rawTab === 'incidents') return 'risk';
    if (VALID_CYBER_TABS.includes(rawTab as CyberTab)) return rawTab as CyberTab;
    return 'dashboard';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (
      rawTab &&
      !VALID_CYBER_TABS.includes(rawTab as CyberTab) &&
      rawTab !== 'outsourcing' &&
      rawTab !== 'checklist' &&
      rawTab !== 'incidents'
    ) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'dashboard';
      navigate(buildLink('/cyber-vendors', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  const handleTabChange = (tabKey: string) => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      p[k] = v;
    });
    p.tab = tabKey;
    navigate(buildLink('/cyber-vendors', p));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('ALL');

  // Outsourcing entry modal
  const [newOutsourcingModalOpen, setNewOutsourcingModalOpen] = useState(false);
  const [outService, setOutService] = useState('');
  const [outVendor, setOutVendor] = useState('');
  const [outMateriality, setOutMateriality] = useState<'MATERIAL' | 'NON_MATERIAL'>('MATERIAL');
  const [outPolicy, setOutPolicy] = useState('IFSCA Outsourcing Guidelines Cl. 4');

  // Drawer selection for ?vendor=VND-xxx
  const selectedVendorId = searchParams.get('vendor');
  const selectedVendor = useMemo(() => {
    if (!selectedVendorId) return null;
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.primaryContact.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = vendorCategoryFilter === 'ALL' || v.category === vendorCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [vendors, searchQuery, vendorCategoryFilter]);

  // Handle Add Outsourcing Entry
  const handleAddOutsourcingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outService.trim() || !outVendor.trim()) return;

    const newEntry: OutsourcingRegisterEntry = {
      id: `OUT-${(cyber.outsourcingRegister.length + 1).toString().padStart(3, '0')}`,
      serviceName: outService.trim(),
      vendorName: outVendor.trim(),
      materiality: outMateriality,
      regulatoryApprovalObtained: outMateriality === 'MATERIAL',
      approvalDate: new Date().toISOString().split('T')[0],
      governingPolicy: outPolicy,
      owner: 'Vikram Shah',
    };

    addOutsourcingRegisterEntry(newEntry);
    setNewOutsourcingModalOpen(false);
    setOutService('');
    setOutVendor('');
    toast.show({
      message: `Outsourcing entry ${newEntry.id} registered successfully`,
      variant: 'success',
    });
  };

  // Handle Start Reassessment (Propagation #15)
  const handleStartReassessment = (vendor: VendorItem) => {
    startVendorReassessment(vendor.id);
    toast.show({
      message: `Vendor reassessment initiated for ${vendor.name}. Task assigned to Vikram Shah.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cyber Resilience & Third-Party Vendors"
        subtitle="Critical ICT providers, outsourcing registers, system redundancy, and cybersecurity posture."
      />

      {/* Prominent Statutory Note */}
      <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-amber-900">
            Regulatory Notice: Dashboard status is not an audit or assurance report.
          </span>
          <span className="text-amber-800 hidden md:inline">
            All vendor certifications, SOC-2 Type II workpapers, and annual reassessments must be independently verified by the CISO.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
          IFSCA Cyber Reg. 18
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Active Vendors
          </span>
          <p className="text-2xl font-bold text-brandNavy mt-1">{vendors.length}</p>
          <p className="text-[10px] text-textSecondary mt-0.5">
            {vendors.filter((v) => v.criticality === 'CRITICAL').length} Critical Tier-1 ICT Partners
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Material Outsourcing
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {cyber.outsourcingRegister.filter((o) => o.materiality === 'MATERIAL').length}
          </p>
          <p className="text-[10px] text-blue-700 mt-0.5">Approved under IFSCA Board Mandate</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Cyber Checklist
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {cyber.cyberChecklist.filter((c) => c.status === 'COMPLIANT').length} / {cyber.cyberChecklist.length}
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Mandatory controls validated</p>
        </div>
        <div className="p-3.5 rounded-lg border border-borderColor bg-white shadow-xs">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            BCP & Redundancy
          </span>
          <p className="text-2xl font-bold text-purple-700 mt-1">100%</p>
          <p className="text-[10px] text-purple-700 mt-0.5">RTO &lt; 15m Drill Pass Rate</p>
        </div>
      </div>

      {/* Tab Navigation */}
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
          onClick={() => handleTabChange('assets')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'assets'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Assets & Inventory ({cyber.itAssets.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('risk')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'risk'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Risk & Checklist ({cyber.securityRisks.length + cyber.cyberChecklist.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('vendors')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Vendors & Outsourcing ({vendors.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('bcp')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bcp'
              ? 'border-brandNavy text-brandNavy bg-blue-50/40'
              : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>BCP & DR Drills ({cyber.bcpRecords.length})</span>
        </button>
      </div>

      {/* TAB 0: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Cyber Security & Third-Party Outsourcing Overview
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Comprehensive posture tracking across {vendors.length} cloud vendors, {cyber.itAssets.length} enterprise IT assets, and {cyber.securityRisks.length} active risk mitigations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('vendors')}
                className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs inline-flex items-center gap-1.5"
              >
                <span>View All Vendors</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Outsourcing Register</span>
              <p className="text-2xl font-bold text-brandNavy">{cyber.outsourcingRegister.length} Statutory Entries</p>
              <p className="text-[11px] text-textSecondary">IFSCA Outsourcing Guidelines Cl. 4 compliance.</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Critical Risk Ratings</span>
              <p className="text-2xl font-bold text-rose-700">{vendors.filter(v => v.riskRating === 'CRITICAL' || v.riskRating === 'HIGH').length} Vendors</p>
              <p className="text-[11px] text-textSecondary">Subject to mandatory annual reassessment and pen-testing.</p>
            </div>
            <div className="p-4 rounded-lg border border-borderColor bg-white shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">BCP & Recovery Drills</span>
              <p className="text-2xl font-bold text-emerald-700">{cyber.bcpRecords.length} Completed Drills</p>
              <p className="text-[11px] text-textSecondary">100% verified failover under 15-minute RTO target.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: VENDORS DIRECTORY */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-borderColor">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-textSecondary" />
              <input
                type="text"
                placeholder="Search vendor name, code, contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-brandNavy"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={vendorCategoryFilter}
                onChange={(e) => setVendorCategoryFilter(e.target.value)}
                className="text-xs border border-borderColor rounded-md px-2.5 py-1.5 bg-white text-textPrimary"
              >
                <option value="ALL">All Categories</option>
                <option value="Trading System">Trading System</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Market Data">Market Data</option>
                <option value="Legal & Audit">Legal & Audit</option>
                <option value="Security Operations">Security Operations</option>
              </select>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Vendor Code</th>
                    <th className="py-2.5 px-3.5">Vendor Name</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Criticality</th>
                    <th className="py-2.5 px-3.5">Risk Rating</th>
                    <th className="py-2.5 px-3.5">Due Diligence</th>
                    <th className="py-2.5 px-3.5">SLA %</th>
                    <th className="py-2.5 px-3.5">Next Reassessment</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {v.id}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Link
                          to={buildLink('/cyber-vendors', { vendor: v.id })}
                          className="font-bold text-textPrimary hover:text-brandNavy hover:underline"
                        >
                          {v.name}
                        </Link>
                        <p className="text-[10px] text-textSecondary">{v.primaryContact}</p>
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{v.category}</td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.criticality === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : v.criticality === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {v.criticality}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <SeverityBadge severity={v.riskRating} />
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.dueDiligenceStatus === 'CURRENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.dueDiligenceStatus === 'UNDER_REVIEW'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {v.dueDiligenceStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-textPrimary">
                        {v.slaAdherencePercent}%
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {v.nextReassessmentDate}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartReassessment(v)}
                            title="Start reassessment (Propagation #15)"
                            className="px-2 py-1 bg-white border border-borderColor hover:bg-gray-50 text-[11px] font-semibold text-brandNavy rounded shadow-2xs"
                          >
                            Reassess
                          </button>
                          <Link
                            to={buildLink('/cyber-vendors', { vendor: v.id })}
                            className="px-2 py-1 bg-brandNavy text-white hover:bg-slate-900 text-[11px] font-semibold rounded shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OUTSOURCING REGISTER */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-borderColor">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                IFSCA Statutory Outsourcing Register (Reg. 14)
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Mandatory disclosure of material financial, IT, and operational delegated functions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewOutsourcingModalOpen(true)}
              className="px-3 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Outsourcing Entry</span>
            </button>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Entry Code</th>
                    <th className="py-2.5 px-3.5">Delegated Service</th>
                    <th className="py-2.5 px-3.5">Service Provider</th>
                    <th className="py-2.5 px-3.5">Materiality</th>
                    <th className="py-2.5 px-3.5">Regulatory Clearance</th>
                    <th className="py-2.5 px-3.5">Governing Policy</th>
                    <th className="py-2.5 px-3.5">Accountable Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {cyber.outsourcingRegister.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {o.id}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{o.serviceName}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{o.vendorName}</td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.materiality === 'MATERIAL'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {o.materiality}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        {o.regulatoryApprovalObtained ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved ({o.approvalDate})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Exempt / Non-Material</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{o.governingPolicy}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">{o.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRACT & POLICY CHECKLIST */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Third-Party & Cyber Statutory Checklist (20 Clauses)
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Periodic attestations under IFSC Cyber Security & Outsourcing Regulations. Click status to toggle attestation.
              </p>
            </div>
            <span className="text-xs font-bold text-brandNavy bg-blue-50 px-2.5 py-1 rounded">
              {cyber.cyberChecklist.filter((c) => c.status === 'COMPLIANT').length} / {cyber.cyberChecklist.length} Validated
            </span>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs divide-y divide-borderColor">
            {cyber.cyberChecklist.map((c) => (
              <div
                key={c.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brandNavy">{c.clauseRef}</span>
                    <span className="font-bold text-textPrimary">{c.title}</span>
                  </div>
                  <p className="text-textSecondary leading-relaxed">{c.description}</p>
                  <p className="text-[10px] text-textSecondary">
                    Verified By: <strong className="text-textPrimary">{c.verifiedBy}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCyberChecklistItem(c.id)}
                  className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-colors ${
                    c.status === 'COMPLIANT'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {c.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY INCIDENT HISTORY */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Security Incident Register & CERT-In Filings
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Historical breaches, cyber anomalies, and external regulatory communications.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Ref</th>
                    <th className="py-2.5 px-3.5">Incident Title</th>
                    <th className="py-2.5 px-3.5">Severity</th>
                    <th className="py-2.5 px-3.5">Occurred Date</th>
                    <th className="py-2.5 px-3.5">Containment Time</th>
                    <th className="py-2.5 px-3.5">CERT-In Filing</th>
                    <th className="py-2.5 px-3.5">Attested By</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {cyber.securityIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {inc.incidentRef}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{inc.title}</td>
                      <td className="py-2.5 px-3.5">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {inc.occurredDate}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-textPrimary">
                        {inc.containmentTimeMinutes} mins
                      </td>
                      <td className="py-2.5 px-3.5">
                        {inc.reportFiledToCertIn ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            Filed within 6h
                          </span>
                        ) : (
                          <span className="text-textSecondary text-[11px]">Not Required</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                        {inc.closureAttestedBy}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          to={buildLink(`/incidents/${inc.incidentRef}`)}
                          className="text-brandNavy font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>View dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IT ASSETS & SYSTEM INVENTORY */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Protected IT Asset Inventory & Critical Systems
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Production nodes, market gateways, and network appliances housed at GIFT IFSC Data Center.
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Tag</th>
                    <th className="py-2.5 px-3.5">Asset Name</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">IP / Subnet</th>
                    <th className="py-2.5 px-3.5">Criticality</th>
                    <th className="py-2.5 px-3.5">Patch Status</th>
                    <th className="py-2.5 px-3.5">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {cyber.itAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-brandNavy">
                        {asset.assetTag}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{asset.name}</td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{asset.category}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {asset.ipAddress}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            asset.criticality === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            asset.patchStatus === 'CURRENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {asset.patchStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">{asset.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BCP / DR DRILLS */}
      {activeTab === 'bcp' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-borderColor">
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Business Continuity & Disaster Recovery Drill Records
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Scheduled failover validations against statutory Recovery Time Objectives (RTO &lt; 15 mins).
            </p>
          </div>

          <div className="bg-white border border-borderColor rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-textSecondary border-b border-borderColor font-semibold">
                    <th className="py-2.5 px-3.5">Drill Title</th>
                    <th className="py-2.5 px-3.5">Type</th>
                    <th className="py-2.5 px-3.5">Conducted Date</th>
                    <th className="py-2.5 px-3.5">RTO Target</th>
                    <th className="py-2.5 px-3.5">RTO Achieved</th>
                    <th className="py-2.5 px-3.5">RPO Target vs Achieved</th>
                    <th className="py-2.5 px-3.5">Result</th>
                    <th className="py-2.5 px-3.5">Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {cyber.bcpRecords.map((bcp) => (
                    <tr key={bcp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-textPrimary">{bcp.testTitle}</td>
                      <td className="py-2.5 px-3.5 text-textSecondary">{bcp.drillType}</td>
                      <td className="py-2.5 px-3.5 font-mono text-textSecondary">
                        {bcp.conductedDate}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {bcp.rtoTargetMinutes}m
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700">
                        {bcp.rtoAchievedMinutes}m
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-textSecondary">
                        {bcp.rpoTargetMinutes}m / {bcp.rpoAchievedMinutes}m
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {bcp.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-textPrimary">
                        {bcp.supervisedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR PROFILE DRAWER (?vendor=VND-xxx) */}
      {selectedVendor && (
        <DetailDrawer
          title={`Vendor Profile: ${selectedVendor.id}`}
          subtitle={selectedVendor.name}
          paramKey="vendor"
          width="w-full sm:max-w-md lg:max-w-lg"
        >
          <div className="space-y-6 text-xs">
            {/* Header Summary */}
            <div className="p-3.5 rounded-lg border border-borderColor bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Criticality & Classification
                </span>
                <p className="text-sm font-bold text-textPrimary mt-0.5">{selectedVendor.category}</p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Contact: <strong className="text-textPrimary">{selectedVendor.primaryContact}</strong>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <SeverityBadge severity={selectedVendor.riskRating} />
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedVendor.dueDiligenceStatus === 'CURRENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedVendor.dueDiligenceStatus}
                </span>
              </div>
            </div>

            {/* Statutory Reassessment Prompt */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-brandNavy block text-xs">
                  Annual Third-Party Due Diligence
                </span>
                <span className="text-textSecondary text-[11px]">
                  Next scheduled reassessment: {selectedVendor.nextReassessmentDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStartReassessment(selectedVendor)}
                className="px-3 py-1.5 bg-brandNavy text-white rounded text-xs font-semibold hover:bg-slate-900 shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Start Reassessment</span>
              </button>
            </div>

            {/* Technical Due Diligence Checklist */}
            <div className="p-4 rounded-lg border border-borderColor bg-white space-y-3">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Due Diligence Verification Checklist
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between py-1.5 border-b border-borderColor">
                  <span className="text-textPrimary">SOC-2 Type II Independent Audit Report</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-borderColor">
                  <span className="text-textPrimary">ISO 27001 Information Security Certification</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-borderColor">
                  <span className="text-textPrimary">GIFT IFSC Data Sovereignty & Storage</span>
                  <span className="text-brandNavy font-semibold">{selectedVendor.dataLocation}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-borderColor">
                  <span className="text-textPrimary">Contract SLA Adherence Floor</span>
                  <span className="font-mono font-bold text-textPrimary">
                    {selectedVendor.slaAdherencePercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-textPrimary">Accountable Vendor Manager</span>
                  <span className="font-semibold text-textPrimary">{selectedVendor.owner}</span>
                </div>
              </div>
            </div>

            {/* Contract & Spend Details */}
            <div className="p-4 rounded-lg border border-borderColor bg-slate-50 space-y-2">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Commercial Contract
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-textSecondary block">Contract Expiry:</span>
                  <span className="font-mono font-bold text-textPrimary">
                    {selectedVendor.contractEndDate}
                  </span>
                </div>
                <div>
                  <span className="text-textSecondary block">Annual Spend:</span>
                  <span className="font-mono font-bold text-brandNavy">
                    ${selectedVendor.annualSpendUsd.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Modal: Add Outsourcing Entry */}
      <Modal
        open={newOutsourcingModalOpen}
        onClose={() => setNewOutsourcingModalOpen(false)}
        title="Register Third-Party Outsourcing Arrangement"
        subtitle="Mandatory reporting under IFSCA Outsourcing of Financial Services Regulations."
        size="md"
      >
        <form onSubmit={handleAddOutsourcingSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Delegated Financial / Technical Service
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Core Trade Routing & Matching Service"
              value={outService}
              onChange={(e) => setOutService(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
              Third-Party Vendor Entity
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NASDAQ Financial Technologies Inc."
              value={outVendor}
              onChange={(e) => setOutVendor(e.target.value)}
              className="w-full p-2 border border-borderColor rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Materiality Classification
              </label>
              <select
                value={outMateriality}
                onChange={(e) => setOutMateriality(e.target.value as 'MATERIAL' | 'NON_MATERIAL')}
                className="w-full p-2 border border-borderColor rounded-md bg-white"
              >
                <option value="MATERIAL">MATERIAL (Board Approval Mandated)</option>
                <option value="NON_MATERIAL">NON-MATERIAL (Internal Attestation)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-textPrimary uppercase mb-1">
                Governing Policy
              </label>
              <input
                type="text"
                required
                value={outPolicy}
                onChange={(e) => setOutPolicy(e.target.value)}
                className="w-full p-2 border border-borderColor rounded-md"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewOutsourcingModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-slate-900 rounded shadow-xs"
            >
              Register Outsourcing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CyberVendorsPage;
