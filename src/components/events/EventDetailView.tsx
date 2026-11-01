import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  History,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { 
  formatINR, 
  calculateTotalAllocated, 
  calculateCategoryBreakdown,
  getBudgetHealth 
} from '../../utils/budgetCalculations';
import { EventType, VenuePreference } from '../../types';

export const EventDetailView: React.FC = () => {
  const { 
    activeEvent, 
    setCurrentTab, 
    updateTask, 
    openEmergencyModal,
    rollbackPlanRevision,
    updateActiveEvent,
    showToast
  } = useEvent();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: EventType;
    date: string;
    time: string;
    location: string;
    guestCount: number;
    totalBudget: number;
    venuePreference: VenuePreference;
    theme: string;
    notes: string;
  }>({
    name: '',
    type: 'college',
    date: '',
    time: '',
    location: '',
    guestCount: 100,
    totalBudget: 25000,
    venuePreference: 'outdoor',
    theme: '',
    notes: '',
  });

  const openEditModal = () => {
    if (!activeEvent) return;
    setEditForm({
      name: activeEvent.name,
      type: activeEvent.type,
      date: activeEvent.date,
      time: activeEvent.time || '',
      location: activeEvent.location,
      guestCount: activeEvent.guestCount,
      totalBudget: activeEvent.totalBudget,
      venuePreference: activeEvent.venuePreference,
      theme: activeEvent.theme || '',
      notes: activeEvent.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    if (!editForm.name.trim()) {
      showToast('error', 'Name Required', 'Please enter an event name.');
      return;
    }
    if (!editForm.date) {
      showToast('error', 'Date Required', 'Please choose a valid event date.');
      return;
    }
    if (editForm.guestCount <= 0) {
      showToast('error', 'Invalid Guests', 'Guest count must be at least 1.');
      return;
    }
    if (editForm.totalBudget <= 0) {
      showToast('error', 'Invalid Budget', 'Total budget must be a positive number.');
      return;
    }

    try {
      setIsSaving(true);
      await updateActiveEvent({
        name: editForm.name.trim(),
        type: editForm.type,
        date: editForm.date,
        time: editForm.time.trim(),
        location: editForm.location.trim(),
        guestCount: Number(editForm.guestCount),
        totalBudget: Number(editForm.totalBudget),
        venuePreference: editForm.venuePreference,
        theme: editForm.theme.trim(),
        notes: editForm.notes.trim(),
      });
      showToast('success', 'Event Updated', 'Event baseline details have been successfully updated.');
      setIsEditModalOpen(false);
    } catch {
      showToast('error', 'Update Failed', 'Could not save event details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <h3 className="text-lg font-bold text-charcoal-900">No active event selected</h3>
        <p className="text-sm text-charcoal-500 mt-1">Please select an event from your workspace or create a new one.</p>
        <button
          onClick={() => setCurrentTab('create-event')}
          className="mt-4 px-4 py-2 bg-violet-800 text-white rounded-xl text-sm font-semibold"
        >
          Create Event
        </button>
      </div>
    );
  }

  const totalAllocated = calculateTotalAllocated(activeEvent.expenses);
  const budgetHealth = getBudgetHealth(activeEvent.totalBudget, totalAllocated);
  const categoryAggregates = calculateCategoryBreakdown(activeEvent.expenses, activeEvent.totalBudget);

  const completedTasks = activeEvent.tasks.filter(t => t.status === 'completed').length;
  const progressPercent = activeEvent.tasks.length > 0 
    ? Math.round((completedTasks / activeEvent.tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Event Hero Banner */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-charcoal-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={activeEvent.type === 'college' ? 'violet' : 'slate'} size="md">
                {activeEvent.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" size="md">
                Plan Version {activeEvent.currentPlanVersion}.0
              </Badge>
              {activeEvent.activeBackupPlan ? (
                <Badge variant="emerald" size="md" className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Plan B Active</span>
                </Badge>
              ) : (
                <Badge variant="slate" size="md">
                  Baseline Plan
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {activeEvent.name}
            </h1>

            {activeEvent.theme && (
              <p className="text-sm text-violet-800 font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Theme: {activeEvent.theme}</span>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 shadow-subtle transition-colors"
            >
              <Edit3 className="w-4 h-4 text-charcoal-500" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => setCurrentTab('simulator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Backup Scenarios</span>
            </button>
            <button
              onClick={openEmergencyModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* 4 Pillar Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-100">
            <span className="text-charcoal-400 font-medium block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-violet-700" /> Date & Time
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal-900 mt-1 block">
              {activeEvent.date}
            </span>
            <span className="text-xs text-charcoal-500">{activeEvent.time || '18:00 onwards'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-100">
            <span className="text-charcoal-400 font-medium block flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-violet-700" /> Location & Style
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal-900 mt-1 block truncate">
              {activeEvent.location}
            </span>
            <span className="text-xs text-charcoal-500 capitalize">{activeEvent.venuePreference} Preference</span>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-100">
            <span className="text-charcoal-400 font-medium block flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-700" /> Confirmed Scale
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal-900 mt-1 block">
              {activeEvent.guestCount} Guests
            </span>
            <span className="text-xs text-charcoal-500">Target RSVP count</span>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-100">
            <span className="text-charcoal-400 font-medium block flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Total Budget Cap
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal-900 mt-1 block">
              {formatINR(activeEvent.totalBudget)}
            </span>
            <span className={`text-xs font-semibold ${totalAllocated > activeEvent.totalBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
              {Math.round((totalAllocated / activeEvent.totalBudget) * 100)}% Allocated
            </span>
          </div>
        </div>

        {/* If Active Backup Plan is in effect, display special rationale banner */}
        {activeEvent.activeBackupPlan && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="font-bold text-emerald-950 block">
                  Active Backup Strategy: {activeEvent.activeBackupPlan}
                </span>
                <span className="text-emerald-800 text-xs">
                  Allocations, vendor expectations, and checklists have been updated according to this scenario.
                </span>
              </div>
            </div>

            {activeEvent.revisions.length > 0 && (
              <button
                onClick={() => rollbackPlanRevision(activeEvent.revisions[0].id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors self-start sm:self-auto"
              >
                <History className="w-3.5 h-3.5" />
                <span>Revert to Prior Version</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout: Left Budget Breakdown, Right Preparation Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Smart Budget Allocation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Budget Allocation</h2>
                <p className="text-xs text-charcoal-500">Category-wise division of ₹{activeEvent.totalBudget.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => setCurrentTab('budget')}
                className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                <span>Manage Expenses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-3 rounded-full bg-charcoal-100 overflow-hidden flex shadow-inner">
              {categoryAggregates.map((cat) => (
                <div
                  key={cat.category}
                  style={{
                    width: `${cat.percentageOfTotal}%`,
                    backgroundColor: cat.color,
                  }}
                  title={`${cat.label}: ${formatINR(cat.allocated)} (${cat.percentageOfTotal}%)`}
                />
              ))}
            </div>

            {/* Category Cards List */}
            <div className="space-y-3 pt-2">
              {categoryAggregates.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl border border-charcoal-100 hover:border-charcoal-200 bg-charcoal-50/40 flex items-center justify-between text-xs sm:text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <span className="font-semibold text-charcoal-900 block">{cat.label}</span>
                      <span className="text-xs text-charcoal-500">{cat.itemCount} line-items</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-charcoal-900 block">
                      {formatINR(cat.allocated)}
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {cat.percentageOfTotal}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Health Alert */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
              budgetHealth.status === 'exceeded' 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : budgetHealth.status === 'caution'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {budgetHealth.status === 'exceeded' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {budgetHealth.status === 'exceeded' ? 'Budget Exceeded Warning' : 'Budget Verification'}
                </span>
                <p className="mt-0.5 text-xs opacity-90">{budgetHealth.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Tasks & Vendors (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preparation Tasks Card */}
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Preparation Tasks</h2>
                <p className="text-xs text-charcoal-500">{completedTasks} of {activeEvent.tasks.length} completed ({progressPercent}%)</p>
              </div>
              <button
                onClick={() => setCurrentTab('timeline')}
                className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                <span>Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Task list preview */}
            <div className="space-y-2.5">
              {activeEvent.tasks.slice(0, 4).map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => updateTask(task.id, { status: isDone ? 'pending' : 'completed' })}
                    className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 cursor-pointer transition-all ${
                      isDone 
                        ? 'bg-charcoal-50/50 border-charcoal-100 opacity-60' 
                        : 'bg-white border-charcoal-200 hover:border-violet-300 shadow-subtle'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 rounded text-violet-700 focus:ring-violet-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold truncate ${isDone ? 'line-through text-charcoal-500' : 'text-charcoal-900'}`}>
                          {task.title}
                        </span>
                        {task.isUrgent && !isDone && (
                          <Badge variant="rose" size="sm">Urgent</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal-500">
                        <span>Due: {task.dueDate}</span>
                        {task.assignedTo && (
                          <>
                            <span>•</span>
                            <span className="truncate">{task.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vendor Checklist Preview Card */}
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Vendors & Partners</h2>
                <p className="text-xs text-charcoal-500">{activeEvent.vendors.length} recorded contractors</p>
              </div>
              <button
                onClick={() => setCurrentTab('vendors')}
                className="text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                <span>All Vendors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {activeEvent.vendors.length === 0 ? (
              <p className="text-xs text-charcoal-500 py-4 text-center">
                No vendors recorded yet. You can add catering, sound, and venue contracts in Vendor Manager.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl border border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-charcoal-900 block">{v.name}</span>
                      <span className="text-[11px] text-charcoal-500">{v.contactPerson} • {v.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-charcoal-900 block">{formatINR(v.quotedAmount)}</span>
                      <Badge variant={v.status === 'booked' ? 'emerald' : 'slate'} size="sm">
                        {v.status === 'booked' ? 'Booked' : v.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Event Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-charcoal-900">Edit Event Baseline</h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Update event parameters, venue logistics, and budget ceiling.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-charcoal-800">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Event Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as EventType }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="college">College Event / Farewell</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="wedding">Wedding / Reception</option>
                    <option value="corporate">Corporate Gala</option>
                    <option value="family">Family Celebration</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Timings</label>
                  <input
                    type="text"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g. 16:00 - 20:30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Location / Venue</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Expected Guests *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.guestCount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-800">Total Budget (₹ INR) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={editForm.totalBudget}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-charcoal-800 block">Venue Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'outdoor', label: 'Outdoor' },
                      { value: 'indoor', label: 'Indoor' },
                      { value: 'hybrid', label: 'Hybrid' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, venuePreference: opt.value as VenuePreference }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                          editForm.venuePreference === opt.value
                            ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold ring-1 ring-violet-600'
                            : 'border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-charcoal-800">Theme / Dress Code</label>
                  <input
                    type="text"
                    value={editForm.theme}
                    onChange={(e) => setEditForm(prev => ({ ...prev, theme: e.target.value }))}
                    placeholder="e.g. Retro Bollywood"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-charcoal-800">Notes & Special Directives</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
