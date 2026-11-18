// src/components/layout/UniversalSearch.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  FileText,
  CheckSquare,
  MessageSquare,
  FolderLock,
  Users,
  Building,
  ExternalLink,
  Command,
  X,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import {
  useControls,
  useIncidents,
  useCases,
  useObligations,
  useTasks,
  useComplaints,
  useReports,
  useEvidence,
  useClients,
  useVendors,
} from '../../store';

const SYSTEM_PAGES = [
  { id: 'page-cmd', name: 'Command Centre', description: 'Real-time compliance dashboard and daily status', path: '/' },
  { id: 'page-tasks', name: 'Today & Task Workspace', description: 'Daily operational checklists and regulatory tasks', path: '/tasks' },
  { id: 'page-obligations', name: 'Statutory Obligations', description: 'IFSCA regulatory register, calendar and deadlines', path: '/obligations' },
  { id: 'page-governance', name: 'Governance & Key Persons', description: 'KMP appointments, org hierarchy and training register', path: '/governance' },
  { id: 'page-clients', name: 'Clients & Onboarding', description: 'Client register, KYC onboarding and investigation cases', path: '/clients' },
  { id: 'page-controls', name: 'Internal Controls Library', description: 'Internal controls matrix, SoD and re-evaluation', path: '/controls' },
  { id: 'page-incidents', name: 'Incidents & Technical Glitches', description: 'Incident clock, glitch disclosures and root cause analysis', path: '/incidents' },
  { id: 'page-cyber-vendors', name: 'Cyber Risk & Third-Party Vendors', description: 'Vendor risk, outsourcing register and IT assets', path: '/cyber-vendors' },
  { id: 'page-complaints', name: 'Client Complaints & Redressal', description: 'Grievance register, merit reviews and escalation', path: '/complaints' },
  { id: 'page-reports', name: 'Regulatory Reports & Filings', description: 'Statutory reports, exchange templates and submission history', path: '/reports' },
  { id: 'page-evidence', name: 'Evidence Vault & Integrity', description: 'Cryptographic SHA-256 evidence dossiers and chain of custody', path: '/evidence' },
  { id: 'page-ai', name: 'AI Copilot & Investigations', description: 'Grounded intelligence, statutory query analysis and diffs', path: '/ai' },
  { id: 'page-integrations', name: 'Connected Systems & Integrations', description: 'Core connector health, freshness monitors and catalogue', path: '/integrations' },
  { id: 'page-admin', name: 'System Administration & Audit', description: 'Audit trail, policies, role access and user directory', path: '/admin' },
];

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ElementType;
  link: string;
}

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const controls = useControls();
  const incidents = useIncidents();
  const cases = useCases();
  const obligations = useObligations();
  const tasks = useTasks();
  const complaints = useComplaints();
  const reports = useReports();
  const evidence = useEvidence();
  const clients = useClients();
  const vendors = useVendors();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate and filter results across all 11 entity types (pages, obligations, controls, cases, incidents, evidence, complaints, vendors, clients, reports, tasks)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Pages
    SYSTEM_PAGES.forEach((page) => {
      if (page.name.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
        results.push({
          id: page.id,
          title: page.name,
          subtitle: `Navigation Page · ${page.description}`,
          category: 'Navigation Pages',
          icon: ExternalLink,
          link: buildLink(page.path),
        });
      }
    });

    // 2. Controls
    controls.forEach((c) => {
      if (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q)
      ) {
        results.push({
          id: c.id,
          title: `${c.id} — ${c.title}`,
          subtitle: `Control · ${c.domain} · Status: ${c.status}`,
          category: 'Internal Controls',
          icon: ShieldCheck,
          link: buildLink('/controls', { control: c.id }),
        });
      }
    });

    // 2. Incidents
    incidents.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: inc.id,
          title: `${inc.id} — ${inc.title}`,
          subtitle: `Incident · Severity: ${inc.severity} · Status: ${inc.status}`,
          category: 'Incidents & Glitches',
          icon: AlertTriangle,
          link: buildLink(`/incidents/${inc.id}`),
        });
      }
    });

    // 3. Cases
    cases.forEach((cs) => {
      if (
        cs.id.toLowerCase().includes(q) ||
        cs.title.toLowerCase().includes(q) ||
        cs.owner.toLowerCase().includes(q)
      ) {
        results.push({
          id: cs.id,
          title: `${cs.id} — ${cs.title}`,
          subtitle: `Case · Owner: ${cs.owner} · Status: ${cs.status}`,
          category: 'Investigation Cases',
          icon: Briefcase,
          link: buildLink(`/clients/cases/${cs.id}`),
        });
      }
    });

    // 4. Obligations
    obligations.forEach((o) => {
      if (
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.statutoryReference.toLowerCase().includes(q)
      ) {
        results.push({
          id: o.id,
          title: `${o.id} — ${o.title}`,
          subtitle: `Obligation · ${o.statutoryReference} · Cadence: ${o.frequency}`,
          category: 'Statutory Obligations',
          icon: FileText,
          link: buildLink('/obligations', { obligation: o.id }),
        });
      }
    });

    // 5. Tasks
    tasks.forEach((t) => {
      if (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.id,
          title: `${t.id} — ${t.title}`,
          subtitle: `Task · Owner: ${t.owner} · Priority: ${t.priority}`,
          category: 'Compliance Tasks',
          icon: CheckSquare,
          link: buildLink('/tasks', { task: t.id }),
        });
      }
    });

    // 6. Complaints
    complaints.forEach((cmp) => {
      if (
        cmp.id.toLowerCase().includes(q) ||
        cmp.summary.toLowerCase().includes(q) ||
        cmp.clientName.toLowerCase().includes(q)
      ) {
        results.push({
          id: cmp.id,
          title: `${cmp.id} — ${cmp.summary}`,
          subtitle: `Complaint · Client: ${cmp.clientName} · Status: ${cmp.status}`,
          category: 'Client Complaints',
          icon: MessageSquare,
          link: buildLink(`/complaints/${cmp.id}`),
        });
      }
    });

    // 7. Reports
    reports.forEach((rpt) => {
      if (
        rpt.id.toLowerCase().includes(q) ||
        rpt.title.toLowerCase().includes(q) ||
        rpt.period.toLowerCase().includes(q)
      ) {
        results.push({
          id: rpt.id,
          title: `${rpt.id} — ${rpt.title}`,
          subtitle: `Report · Period: ${rpt.period} · Status: ${rpt.status}`,
          category: 'Regulatory Filings',
          icon: FileText,
          link: buildLink('/reports', { report: rpt.id }),
        });
      }
    });

    // 8. Evidence
    evidence.forEach((ev) => {
      if (
        ev.id.toLowerCase().includes(q) ||
        ev.title.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: ev.id,
          title: `${ev.id} — ${ev.title}`,
          subtitle: `Evidence · ${ev.category} · SHA-256 Digest`,
          category: 'Evidence Dossiers',
          icon: FolderLock,
          link: buildLink('/evidence', { evidence: ev.id }),
        });
      }
    });

    // 9. Clients
    clients.forEach((cl) => {
      if (
        cl.id.toLowerCase().includes(q) ||
        cl.legalName.toLowerCase().includes(q) ||
        cl.countryOfIncorporation.toLowerCase().includes(q)
      ) {
        results.push({
          id: cl.id,
          title: `${cl.id} — ${cl.legalName}`,
          subtitle: `Client · ${cl.countryOfIncorporation} · KYC: ${cl.kycStatus}`,
          category: 'Onboarded Clients',
          icon: Users,
          link: buildLink('/clients', { client: cl.id }),
        });
      }
    });

    // 10. Vendors
    vendors.forEach((vnd) => {
      if (
        vnd.id.toLowerCase().includes(q) ||
        vnd.name.toLowerCase().includes(q) ||
        vnd.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: vnd.id,
          title: `${vnd.id} — ${vnd.name}`,
          subtitle: `Vendor · ${vnd.category} · Risk: ${vnd.riskRating}`,
          category: 'Third-Party Vendors',
          icon: Building,
          link: buildLink('/cyber-vendors', { vendor: vnd.id }),
        });
      }
    });

    return results;
  }, [
    query,
    controls,
    incidents,
    cases,
    obligations,
    tasks,
    complaints,
    reports,
    evidence,
    clients,
    vendors,
  ]);

  // Group by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    searchResults.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [searchResults]);

  const handleSelectResult = (link: string) => {
    onClose();
    navigate(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-borderColor overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-borderColor bg-white px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-textSecondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all 11 entity types (controls, incidents, cases, obligations, tasks...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none bg-transparent"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-textSecondary hover:text-textPrimary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-textSecondary bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-textSecondary">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-40 text-brandNavy" />
              <p className="text-xs font-semibold text-textPrimary">Search IFSC TrustOps</p>
              <p className="text-[11px] mt-1">
                Type an identifier like <code className="bg-slate-100 px-1 py-0.5 rounded text-brandNavy">GOV-SOD-001</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-brandNavy">INC-2026-014</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-brandNavy">CASE-2026-031</code>, or any staff name.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-textSecondary">
              <p className="text-xs font-semibold text-textPrimary">No matching records found</p>
              <p className="text-[11px] mt-1">No entities match "{query}" across the 11 registers.</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider px-2">
                  {category} ({items.length})
                </span>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectResult(item.link)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-blue-100 text-brandNavy flex items-center justify-center shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-textPrimary group-hover:text-brandNavy truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-textSecondary truncate">{item.subtitle}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-textSecondary group-hover:text-brandNavy shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-borderColor bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-textSecondary">
          <div className="flex items-center gap-3">
            <span>
              Matches: <strong className="text-textPrimary">{searchResults.length}</strong>
            </span>
            <span>•</span>
            <span>All 11 Registers Indexed</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-textPrimary font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
