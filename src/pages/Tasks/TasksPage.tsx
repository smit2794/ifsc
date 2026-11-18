// src/pages/Tasks/TasksPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Upload,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { formatTimeIST } from '../../utils/dateHelpers';
import { useTicker } from '../../hooks/useTicker';
import {
  useTasks,
  useCurrentUser,
  useGovernance,
  useAppStore,
} from '../../store';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { Modal } from '../../components/ui/Modal';
import { FileUploadBox } from '../../components/ui/FileUploadBox';
import { CommentBox } from '../../components/ui/CommentBox';
import { useToast } from '../../components/ui/Toast';
import { TaskItem, TaskPriority, TaskCategory, StaffName, StaffId } from '../../types';

const STAFF_MEMBERS: Array<{ id: StaffId; name: StaffName; role: string }> = [
  { id: 'USR-001', name: 'Aarav Mehta', role: 'Compliance Officer' },
  { id: 'USR-002', name: 'Rohan Desai', role: 'Principal Officer' },
  { id: 'USR-003', name: 'Priya Nair', role: 'Risk Officer' },
  { id: 'USR-004', name: 'Vikram Shah', role: 'Chief Information Security Officer' },
  { id: 'USR-005', name: 'Deepa Patel', role: 'Trading Desk Officer' },
];

export const TasksPage: React.FC = () => {
  useTicker();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const tasks = useTasks();
  const currentUser = useCurrentUser();
  const governance = useGovernance();
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const createTask = useAppStore((s) => s.createTask);
  const addTaskComment = useAppStore((s) => s.addTaskComment);
  const uploadEvidence = useAppStore((s) => s.uploadEvidence);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);

  // Active drawer task ID from URL search params
  const activeTaskId = searchParams.get('task');
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Active filter tab from URL search params (?tab=...)
  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (!rawTab) return 'my-tasks';
    if (rawTab === 'all') return 'my-tasks';
    if (rawTab === 'dueToday') return 'due-today';
    if (rawTab === 'criticalHigh' || rawTab === 'completed') return 'pending';
    if (['my-tasks', 'pending', 'overdue', 'due-today', 'upcoming'].includes(rawTab)) return rawTab;
    return 'my-tasks';
  }, [rawTab]);

  // Fallback redirect if invalid ?tab=
  useEffect(() => {
    if (
      rawTab &&
      !['my-tasks', 'pending', 'overdue', 'due-today', 'upcoming', 'all', 'dueToday', 'criticalHigh', 'completed'].includes(rawTab)
    ) {
      const p: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        p[k] = v;
      });
      p.tab = 'my-tasks';
      navigate(buildLink('/tasks', p), { replace: true });
    }
  }, [rawTab, navigate, searchParams]);

  // Local Filter States
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [uploadEvidenceModalOpen, setUploadEvidenceModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Obligations');
  const [newOwner, setNewOwner] = useState<StaffName>(currentUser.name);
  const [newDueDate, setNewDueDate] = useState<string>(new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10));
  const [newDescription, setNewDescription] = useState('');

  // Tab counts
  const tabCounts = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      myTasks: tasks.filter((t) => t.owner === currentUser.name && t.status !== 'COMPLETED').length,
      pending: tasks.filter((t) => t.status !== 'COMPLETED').length,
      overdue: tasks.filter((t) => new Date(t.dueDate) < new Date(todayStr) && t.status !== 'COMPLETED').length,
      dueToday: tasks.filter((t) => t.dueDate.slice(0, 10) === todayStr && t.status !== 'COMPLETED').length,
      upcoming: tasks.filter((t) => new Date(t.dueDate) > new Date(todayStr) && t.status !== 'COMPLETED').length,
    };
  }, [tasks, currentUser.name]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return tasks.filter((task) => {
      // 1. Tab filter
      if (activeTab === 'my-tasks') {
        if (task.owner !== currentUser.name) return false;
      } else if (activeTab === 'pending') {
        if (task.status === 'COMPLETED') return false;
      } else if (activeTab === 'overdue') {
        if (new Date(task.dueDate) >= new Date(todayStr) || task.status === 'COMPLETED') return false;
      } else if (activeTab === 'due-today') {
        if (task.dueDate.slice(0, 10) !== todayStr || task.status === 'COMPLETED') return false;
      } else if (activeTab === 'upcoming') {
        if (new Date(task.dueDate) <= new Date(todayStr) || task.status === 'COMPLETED') return false;
      }

      // 2. Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;

      // 3. Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesOwner = task.owner.toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        const matchesCategory = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOwner && !matchesId && !matchesCategory) return false;
      }

      return true;
    });
  }, [tasks, activeTab, currentUser.name, priorityFilter, statusFilter, searchQuery]);

  // Handle Tab Switch (preserves all other params)
  const handleTabChange = (tabKey: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.tab = tabKey;
    navigate(buildLink('/tasks', params));
  };

  // Open Task Drawer
  const handleOpenTask = (taskId: string) => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    params.task = taskId;
    navigate(buildLink('/tasks', params));
  };

  // Reset Filters
  const handleClearFilters = () => {
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  // Create Task Submit
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedStaff = STAFF_MEMBERS.find((s) => s.name === newOwner);
    const id = `TSK-${(tasks.length + 1).toString().padStart(3, '0')}`;

    const newTask: TaskItem = {
      id,
      title: newTitle.trim(),
      priority: newPriority,
      status: 'OPEN',
      owner: newOwner,
      ownerId: assignedStaff ? assignedStaff.id : 'USR-001',
      category: newCategory,
      dueDate: new Date(newDueDate).toISOString(),
      description: newDescription.trim() || 'Task created from task workspace.',
      comments: [
        {
          id: `comm-${Date.now().toString().slice(-6)}`,
          author: currentUser.name,
          text: 'Task initialized in TrustOps workspace.',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    createTask(newTask);
    setNewTaskModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    show({ message: `Task ${id} created`, variant: 'success' });
  };

  // Reassign Task
  const handleAssignSubmit = (staff: { id: StaffId; name: StaffName }) => {
    if (!activeTaskId) return;
    updateTask(activeTaskId, { owner: staff.name, ownerId: staff.id });
    setAssignModalOpen(false);
    show({ message: `Task reassigned to ${staff.name}`, variant: 'info' });
  };

  // Mark ready for review
  const handleMarkReadyForReview = () => {
    if (!activeTaskId) return;
    updateTask(activeTaskId, { status: 'READY_FOR_REVIEW' });
    show({ message: 'Task marked as ready for review', variant: 'info' });
  };

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!activeTaskId || !rejectReason.trim()) return;
    updateTask(activeTaskId, { status: 'OPEN' });
    addTaskComment(activeTaskId, currentUser.name, `Review Rejected: ${rejectReason.trim()}`);
    setRejectModalOpen(false);
    setRejectReason('');
    show({ message: 'Task returned to Open status with review note', variant: 'info' });
  };

  // Complete Task (Propagation #14)
  const handleCompleteTask = () => {
    if (!activeTaskId) return;
    completeTask(activeTaskId);
    show({ message: 'Task marked as COMPLETED', variant: 'success' });
  };

  // Get cross-module navigation target for linked entity
  const getLinkedEntityTarget = (task: TaskItem) => {
    if (!task.linkedEntityId) return null;
    const id = task.linkedEntityId;

    if (id.startsWith('CASE-')) {
      return { path: `/clients/cases/${id}`, label: `Case ${id}` };
    }
    if (id.startsWith('INC-')) {
      return { path: `/incidents/${id}`, label: `Incident ${id}` };
    }
    if (id.startsWith('OBL-')) {
      return { path: `/obligations`, params: { obligation: id }, label: `Obligation ${id}` };
    }
    if (id.startsWith('GOV-') || id.startsWith('TRADE-') || id.startsWith('FIN-') || id.startsWith('CYB-')) {
      return { path: `/controls`, params: { control: id }, label: `Control ${id}` };
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Today & Task Workspace"
        subtitle="Operational checklists, regulatory obligations, and audit readiness tasks."
        actions={
          <button
            type="button"
            onClick={() => setNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded-md transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        }
      />

      {/* Daily Readiness Checklist Bar */}
      <div className="bg-white p-5 rounded-lg border border-borderColor shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-borderColor">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brandNavy" />
            <h2 className="text-xs font-bold text-textPrimary tracking-tight">
              Trading Day Opening Readiness Checklist (GIFT IFSC)
            </h2>
          </div>
          <span className="text-[11px] text-textSecondary font-mono">
            {governance.officeReadiness.filter((i) => i.status === 'CONFIRMED').length} of{' '}
            {governance.officeReadiness.length} checks confirmed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {governance.officeReadiness.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem('office', item.id)}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-start gap-2 ${
                item.status === 'CONFIRMED'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                  : 'bg-bgPage border-borderColor hover:border-gray-400'
              }`}
            >
              <div className="mt-0.5">
                {item.status === 'CONFIRMED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded border border-gray-400 bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${item.status === 'CONFIRMED' ? 'text-emerald-900' : 'text-textPrimary'}`}>
                  {item.label}
                </p>
                <p className="text-[11px] text-textSecondary line-clamp-1 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-borderColor pb-2 overflow-x-auto">
        {[
          { key: 'my-tasks', label: 'My Tasks', count: tabCounts.myTasks },
          { key: 'pending', label: 'Pending Review', count: tabCounts.pending },
          { key: 'overdue', label: 'Overdue', count: tabCounts.overdue },
          { key: 'due-today', label: 'Due Today', count: tabCounts.dueToday },
          { key: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
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

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-borderColor shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, category, owner..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-borderColor rounded-md focus:outline-none focus:ring-2 focus:ring-brandNavy"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-borderColor rounded-md bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
          >
            <option value="ALL">All Priorities</option>
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
            <option value="IN_PROGRESS">In Progress</option>
            <option value="READY_FOR_REVIEW">Ready for Review</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {(priorityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim()) && (
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

      {/* Task List Table */}
      <div className="bg-white rounded-lg border border-borderColor shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bgPage border-b border-borderColor text-textSecondary font-semibold">
              <tr>
                <th className="py-2.5 px-4">Task Ref & Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-textSecondary">
                    No tasks match the active filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleOpenTask(t.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-brandNavy bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {t.id}
                        </span>
                        <span className="font-medium text-textPrimary line-clamp-1">{t.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-textSecondary">{t.category}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : t.priority === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-textPrimary">{t.owner}</span>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-textSecondary">
                      {t.dueDate.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'READY_FOR_REVIEW'
                            ? 'bg-purple-100 text-purple-800'
                            : t.status === 'APPROVED'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTask(t.id);
                        }}
                        className="text-xs font-semibold text-brandNavy hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Drawer (?task=TSK-xxx) */}
      <DetailDrawer paramKey="task" title={activeTask ? `${activeTask.id} · Details` : 'Task Details'}>
        {activeTask && (
          <div className="space-y-5 text-xs">
            {/* Header / Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-borderColor">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTask.priority === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800'
                    : activeTask.priority === 'HIGH'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activeTask.priority} PRIORITY
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  activeTask.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                STATUS: {activeTask.status}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-sm font-bold text-textPrimary leading-snug">{activeTask.title}</h3>
              <p className="text-textSecondary mt-2 leading-relaxed">{activeTask.description}</p>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-bgPage rounded border border-borderColor">
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Assigned Officer</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeTask.owner}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Due Date</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeTask.dueDate.slice(0, 10)}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Category</span>
                <p className="font-bold text-textPrimary mt-0.5">{activeTask.category}</p>
              </div>
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-semibold">Jurisdiction</span>
                <p className="font-bold text-textPrimary mt-0.5">GIFT IFSC</p>
              </div>
            </div>

            {/* Linked Entity Cross-Navigation (Section 9) */}
            {activeTask.linkedEntityId && (
              <div className="p-3 bg-blue-50/60 rounded border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brandNavy font-semibold uppercase">Linked Regulatory Entity</span>
                  <p className="font-bold text-brandNavy text-xs mt-0.5">{activeTask.linkedEntityId}</p>
                </div>
                {(() => {
                  const target = getLinkedEntityTarget(activeTask);
                  return target ? (
                    <button
                      type="button"
                      onClick={() => navigate(buildLink(target.path, target.params))}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-brandNavy text-brandNavy rounded hover:bg-blue-100 flex items-center gap-1"
                    >
                      <span>Open {target.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : null;
                })()}
              </div>
            )}

            {/* Action Buttons Toolbar */}
            <div className="p-3 bg-white border border-borderColor rounded-md space-y-2">
              <span className="text-[11px] font-bold text-textPrimary block">Workflow Actions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium"
                >
                  Assign / Reassign
                </button>

                {activeTask.status !== 'COMPLETED' && activeTask.status !== 'READY_FOR_REVIEW' && (
                  <button
                    type="button"
                    onClick={handleMarkReadyForReview}
                    className="px-3 py-1.5 rounded bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 text-xs font-semibold"
                  >
                    Mark Ready for Review
                  </button>
                )}

                {activeTask.status === 'READY_FOR_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateTask(activeTask.id, { status: 'APPROVED' })}
                      className="px-3 py-1.5 rounded bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 text-xs font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectModalOpen(true)}
                      className="px-3 py-1.5 rounded bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}

                {activeTask.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={handleCompleteTask}
                    className="px-3 py-1.5 rounded bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold"
                  >
                    Complete Task
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setUploadEvidenceModalOpen(true)}
                  className="px-3 py-1.5 rounded border border-borderColor hover:bg-gray-50 text-xs font-medium flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5 text-textSecondary" />
                  <span>Upload Evidence</span>
                </button>
              </div>
            </div>

            {/* Comments and Audit Timeline */}
            <div className="space-y-3 pt-3 border-t border-borderColor">
              <span className="text-[11px] font-bold text-textPrimary block">Compliance Log & Discussion</span>
              <CommentBox
                onSubmit={(text) => addTaskComment(activeTask.id, currentUser.name, text)}
                placeholder="Record compliance log note or review remarks..."
              />
              <div className="space-y-2 mt-2">
                {(activeTask.comments || []).map((comm) => (
                  <div key={comm.id} className="p-2.5 bg-bgPage rounded border border-borderColor">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-textPrimary text-[11px]">{comm.author}</span>
                      <span className="text-[10px] text-textSecondary font-mono">
                        {formatTimeIST(new Date(comm.timestamp))}
                      </span>
                    </div>
                    <p className="text-textSecondary text-xs mt-1 leading-normal">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: New Task Creation */}
      <Modal
        open={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        title="Create Regulatory & Governance Task"
        subtitle="Schedule regulatory filings, control evaluations, or audit follow-ups."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewTaskModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTaskSubmit}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-brandNavy/90 rounded disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-textPrimary mb-1">
              Task Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Prepare Form CMI-15 Officer Appointment Notice"
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                <option value="Obligations">Obligations</option>
                <option value="Governance">Governance</option>
                <option value="Controls">Controls</option>
                <option value="Incidents">Incidents</option>
                <option value="Reporting">Reporting</option>
                <option value="Cyber">Cyber</option>
                <option value="Clients">Clients</option>
                <option value="REGULATORY_FILING">Regulatory Filing</option>
                <option value="EXCEPTION_REMEDIATION">Exception Remediation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Assignee</label>
              <select
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value as StaffName)}
                className="w-full p-2 border border-borderColor rounded bg-white"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 border border-borderColor rounded bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-textPrimary mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Detail specific statutory requirements, evidence to collect, and review criteria..."
              className="w-full p-2 border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Assign / Reassign Staff Picker */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Reassign Task Owner"
        subtitle="Select qualified officer responsible for execution and evidence collection."
        size="sm"
      >
        <div className="space-y-2">
          {STAFF_MEMBERS.map((staff) => (
            <div
              key={staff.id}
              onClick={() => handleAssignSubmit(staff)}
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

      {/* Modal: Reject Reason Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Task Submission"
        subtitle="Mandatory requirement: record why task does not satisfy completion criteria."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explain required revisions or missing verification documents..."
            className="w-full p-2 text-xs border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy"
          />
        </div>
      </Modal>

      {/* Modal: Upload Evidence Modal */}
      <Modal
        open={uploadEvidenceModalOpen}
        onClose={() => setUploadEvidenceModalOpen(false)}
        title="Upload Verification Evidence"
        subtitle="Compute cryptographic SHA-256 hash and link to task audit record."
        size="md"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setUploadEvidenceModalOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Done
            </button>
          </div>
        }
      >
        {activeTask && (
          <FileUploadBox
            onUpload={(file: File, hash: string) => {
              uploadEvidence({
                title: `${activeTask.title} Attestation`,
                fileName: file.name,
                fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                hash,
                linkedControlId: activeTask.linkedEntityId,
              });
              show({ message: 'Evidence uploaded and cryptographically sealed', variant: 'success' });
              setUploadEvidenceModalOpen(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default TasksPage;
