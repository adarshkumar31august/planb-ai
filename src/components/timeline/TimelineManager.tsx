import React, { useState, useMemo } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { TaskPriority, ExpenseCategory } from '../../types';
import { CATEGORY_LABELS } from '../../utils/budgetCalculations';
import { sanitizeTextInput } from '../../utils/validators';

type TaskFilterType = 'all' | 'pending' | 'completed' | 'urgent';

export const TimelineManager: React.FC = () => {
  const { activeEvent, addTask, updateTask, deleteTask, showToast } = useEvent();

  const [statusFilter, setStatusFilter] = useState<TaskFilterType>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for detailed modal
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory | 'general'>('general');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);

  const completedCount = useMemo(
    () => activeEvent ? activeEvent.tasks.filter(t => t.status === 'completed').length : 0,
    [activeEvent?.tasks]
  );
  const urgentCount = useMemo(
    () => activeEvent ? activeEvent.tasks.filter(t => t.isUrgent && t.status !== 'completed').length : 0,
    [activeEvent?.tasks]
  );
  const progressPercent = useMemo(
    () => (activeEvent && activeEvent.tasks.length > 0)
      ? Math.round((completedCount / activeEvent.tasks.length) * 100) 
      : 0,
    [activeEvent?.tasks, completedCount]
  );

  const filteredTasks = useMemo(() => {
    if (!activeEvent) return [];
    return activeEvent.tasks.filter((t) => {
      if (statusFilter === 'completed') return t.status === 'completed';
      if (statusFilter === 'pending') return t.status !== 'completed';
      if (statusFilter === 'urgent') return t.isUrgent && t.status !== 'completed';
      return true;
    });
  }, [activeEvent?.tasks, statusFilter]);

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <p className="text-charcoal-600">Select an event to view timeline and tasks</p>
      </div>
    );
  }

  // Fast inline task addition
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: sanitizeTextInput(quickTitle),
      description: 'Added via quick entry',
      category: 'general',
      dueDate: activeEvent.date,
      priority: 'medium',
      status: 'pending',
      isUrgent: false,
      isAffectedByPlanB: false,
    });

    showToast('success', 'Milestone Created', `Added "${quickTitle.trim()}" to timeline.`);
    setQuickTitle('');
  };

  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory('general');
    setFormDueDate(activeEvent.date);
    setFormPriority('medium');
    setFormAssignedTo('');
    setFormIsUrgent(false);
    setIsAddModalOpen(true);
  };

  const handleSaveDetailedTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    await addTask({
      title: sanitizeTextInput(formTitle),
      description: sanitizeTextInput(formDesc),
      category: formCategory,
      dueDate: formDueDate || activeEvent.date,
      priority: formPriority,
      status: 'pending',
      assignedTo: formAssignedTo.trim() ? sanitizeTextInput(formAssignedTo) : undefined,
      isUrgent: formIsUrgent,
      isAffectedByPlanB: false,
    });

    showToast('success', 'Task Scheduled', `Milestone "${formTitle.trim()}" added.`);
    setIsAddModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      await deleteTask(taskId);
      showToast('info', 'Task Removed', `Deleted milestone "${taskTitle}".`);
    }
  };

  // Helper for user avatar initials
  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Timeline & Operational Tasks</h1>
            <Badge variant="violet" size="sm" className="font-semibold">{activeEvent.tasks.length} Milestones</Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Track execution deadlines, coordinate volunteers, and verify emergency action items.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Detailed Task Modal</span>
        </button>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 hover:border-violet-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-charcoal-400 font-bold uppercase tracking-wider">Overall Progress</span>
            <span className="text-xs font-black text-violet-800">{progressPercent}% Done</span>
          </div>
          <div className="w-full h-2.5 bg-charcoal-100 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-violet-800 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="text-xs text-charcoal-500 mt-2 block font-medium">
            {completedCount} of {activeEvent.tasks.length} items completed
          </span>
        </Card>

        <Card className="p-5 hover:border-violet-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-charcoal-400 font-bold uppercase tracking-wider">Urgent Action Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {urgentCount} Pending
          </div>
          <span className="text-xs text-charcoal-500 mt-1 block">
            Requires immediate attention
          </span>
        </Card>

        <Card className="p-5 hover:border-violet-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-charcoal-400 font-bold uppercase tracking-wider">Target Event Day</span>
            <Calendar className="w-4 h-4 text-violet-700" />
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-1">
            {activeEvent.date}
          </div>
          <span className="text-xs text-charcoal-500 mt-1 block">
            {activeEvent.time || '18:00 onwards'}
          </span>
        </Card>
      </div>

      {/* Quick Add Inline Bar */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-charcoal-200 shadow-subtle focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
        <Plus className="w-4 h-4 text-charcoal-400 ml-2 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          aria-label="Add a new milestone quickly"
          placeholder="Add a new milestone quickly... (e.g. Call caterer to verify 15 Jain food boxes)"
          className="w-full bg-transparent text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-800 hover:bg-violet-900 disabled:opacity-40 transition-all shrink-0"
        >
          Add Task
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-charcoal-200 pb-3" role="tablist" aria-label="Task status filters">
        {(
          [
            { id: 'all', label: `All Tasks (${activeEvent.tasks.length})` },
            { id: 'pending', label: `Pending (${activeEvent.tasks.length - completedCount})` },
            { id: 'urgent', label: `Urgent (${urgentCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={statusFilter === tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-violet-800 text-white shadow-subtle'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-charcoal-200 text-charcoal-400 text-sm">
            No milestones found matching this filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-charcoal-50/50 border-charcoal-200/60 opacity-65'
                    : task.isUrgent
                    ? 'bg-white border-rose-300 shadow-subtle hover:border-rose-400'
                    : 'bg-white border-charcoal-200 shadow-subtle hover:border-violet-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => updateTask(task.id, { status: isDone ? 'pending' : 'completed' })}
                    aria-label={isDone ? `Mark milestone "${task.title}" as incomplete` : `Mark milestone "${task.title}" as completed`}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-charcoal-300 hover:border-violet-600 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-bold ${isDone ? 'line-through text-charcoal-500' : 'text-charcoal-900'}`}>
                        {task.title}
                      </h3>

                      {task.isUrgent && !isDone && (
                        <Badge variant="rose" size="sm">Urgent</Badge>
                      )}

                      {task.isAffectedByPlanB && (
                        <Badge variant="violet" size="sm">Plan B Direct Action</Badge>
                      )}

                      <Badge
                        variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'slate'}
                        size="sm"
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className={`text-xs sm:text-sm ${isDone ? 'text-charcoal-400' : 'text-charcoal-600'} leading-relaxed`}>
                        {task.description}
                      </p>
                    )}

                    {task.alternativeSolution && (
                      <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-950 font-medium mt-2 border border-violet-100">
                        <strong>Plan B Mitigation Directive:</strong> {task.alternativeSolution}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-400 pt-1.5">
                      <span className="flex items-center gap-1 font-medium text-charcoal-600">
                        <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>Deadline: {task.dueDate}</span>
                      </span>

                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5 text-charcoal-800 font-semibold">
                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(task.assignedTo)}
                          </span>
                          <span>{task.assignedTo}</span>
                        </div>
                      )}

                      {task.category !== 'general' && (
                        <span>• Dept: {CATEGORY_LABELS[task.category as ExpenseCategory]}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    title="Delete milestone"
                    aria-label={`Delete milestone "${task.title}"`}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Operational Task"
        subtitle="Create a milestone with owner and deadline."
      >
        <form onSubmit={handleSaveDetailedTask} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="task-title" className="text-xs font-semibold text-charcoal-800">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Conduct sound check with acoustic guitar band"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="task-desc" className="text-xs font-semibold text-charcoal-800">
              Description
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="e.g. Test microphone balance, ensure 2 backup wireless batteries..."
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="task-category" className="text-xs font-semibold text-charcoal-800">
                Department
              </label>
              <select
                id="task-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ExpenseCategory | 'general')}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                <option value="general">General Operations</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="task-priority" className="text-xs font-semibold text-charcoal-800">
                Priority
              </label>
              <select
                id="task-priority"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="task-due" className="text-xs font-semibold text-charcoal-800">
                Deadline Date
              </label>
              <input
                id="task-due"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="task-assigned" className="text-xs font-semibold text-charcoal-800">
                Assigned Person
              </label>
              <input
                id="task-assigned"
                type="text"
                value={formAssignedTo}
                onChange={(e) => setFormAssignedTo(e.target.value)}
                placeholder="e.g. Vikram (Lead Org)"
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label htmlFor="task-urgent" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
              <input
                id="task-urgent"
                type="checkbox"
                checked={formIsUrgent}
                onChange={(e) => setFormIsUrgent(e.target.checked)}
                className="rounded text-violet-700 focus:ring-violet-500"
              />
              <span>Mark as Urgent Action Item</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card"
            >
              Add Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
