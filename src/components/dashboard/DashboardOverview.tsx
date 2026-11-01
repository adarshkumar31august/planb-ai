import React from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Calendar, 
  Wallet, 
  CheckSquare, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Users, 
  Layers,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatINR, calculateTotalAllocated, getBudgetHealth } from '../../utils/budgetCalculations';

export const DashboardOverview: React.FC = () => {
  const { 
    events, 
    activeEvent, 
    selectEvent, 
    setCurrentTab,
    openEmergencyModal 
  } = useEvent();

  // Metrics
  const totalEvents = events.length;
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date(now.toDateString()));
  const totalPlannedBudget = events.reduce((sum, e) => sum + e.totalBudget, 0);
  
  const pendingTasksCount = events.reduce(
    (sum, e) => sum + e.tasks.filter(t => t.status !== 'completed').length, 
    0
  );

  // Compute Active Event Readiness Score (0-100%)
  const calculateReadinessScore = () => {
    if (!activeEvent) return 0;
    let score = 0;
    
    // 1. Budget allocated check (up to 30 pts)
    const allocated = calculateTotalAllocated(activeEvent.expenses);
    if (allocated > 0 && allocated <= activeEvent.totalBudget) score += 30;
    else if (allocated > activeEvent.totalBudget) score += 10;

    // 2. Tasks completed ratio (up to 40 pts)
    if (activeEvent.tasks.length > 0) {
      const completed = activeEvent.tasks.filter(t => t.status === 'completed').length;
      score += Math.round((completed / activeEvent.tasks.length) * 40);
    } else {
      score += 20;
    }

    // 3. Vendor coverage (up to 30 pts)
    if (activeEvent.vendors.length > 0) {
      const booked = activeEvent.vendors.filter(v => v.status === 'booked').length;
      score += Math.round((booked / activeEvent.vendors.length) * 30);
    } else {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const readinessScore = calculateReadinessScore();

  // Active event financial health
  const activeAllocated = activeEvent ? calculateTotalAllocated(activeEvent.expenses) : 0;
  const activeHealth = activeEvent ? getBudgetHealth(activeEvent.totalBudget, activeAllocated) : null;

  // Days remaining calculation
  const getDaysLeft = (dateStr: string) => {
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Event Operations Hub
            </h1>
            <Badge variant="violet" size="sm" className="font-semibold">
              Live Workspace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-2xl">
            Real-time control center for budgets, vendor milestones, and automated backup strategies.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentTab('simulator')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-all shadow-subtle hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4 text-violet-700" />
            <span>Stress-Test Plan B</span>
          </button>

          <button
            onClick={openEmergencyModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-all shadow-subtle hover:scale-[1.01]"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Crisis Triage SOS</span>
          </button>

          <button
            onClick={() => setCurrentTab('create-event')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex items-start justify-between relative overflow-hidden group hover:border-violet-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
              Total Celebrations
            </span>
            <div className="text-3xl font-black text-charcoal-900">
              {totalEvents}
            </div>
            <span className="text-xs text-violet-700 font-semibold block">
              {events.filter(e => e.status === 'adapted').length} active on Plan B
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-start justify-between relative overflow-hidden group hover:border-violet-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
              Upcoming Events
            </span>
            <div className="text-3xl font-black text-charcoal-900">
              {upcomingEvents.length}
            </div>
            <span className="text-xs text-charcoal-500 font-medium block">
              Nearest: {events[0]?.date || 'None'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-start justify-between relative overflow-hidden group hover:border-violet-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
              Planned Budget Cap
            </span>
            <div className="text-3xl font-black text-charcoal-900">
              {formatINR(totalPlannedBudget)}
            </div>
            <span className="text-xs text-emerald-700 font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arithmetic Verified</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-start justify-between relative overflow-hidden group hover:border-violet-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
              Pending Milestones
            </span>
            <div className="text-3xl font-black text-charcoal-900">
              {pendingTasksCount}
            </div>
            <span className="text-xs text-amber-700 font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Action Items Active</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Featured / Active Focus Event Spotlight Card */}
      {activeEvent && (
        <div className="bg-gradient-to-r from-violet-950 via-charcoal-900 to-violet-900 text-white p-6 sm:p-8 rounded-3xl shadow-card relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                    Active Focus Project
                  </span>
                  {activeEvent.activeBackupPlan ? (
                    <Badge variant="emerald" size="sm" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Plan B Active (v{activeEvent.currentPlanVersion}.0)
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm" className="bg-white/10 text-white/90 border-transparent">
                      Baseline Plan (v{activeEvent.currentPlanVersion}.0)
                    </Badge>
                  )}
                  <span className="text-xs text-violet-200">
                    • In {getDaysLeft(activeEvent.date)} Days
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{activeEvent.name}</h2>
                <p className="text-xs sm:text-sm text-charcoal-200 line-clamp-2 leading-relaxed">
                  {activeEvent.notes || `${activeEvent.guestCount} guests • ${activeEvent.location}`}
                </p>

                {/* Quick Info Grid */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-charcoal-200 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-300" />
                    <span>{activeEvent.date} ({activeEvent.time || '18:00'})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-violet-300" />
                    <span className="truncate max-w-[200px]">{activeEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-violet-300" />
                    <span>{activeEvent.guestCount} Attendees</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">
                      Budget: {formatINR(activeEvent.totalBudget)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Readiness Gauge & Action Hub */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-end justify-between gap-4 bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-md">
                <div className="text-center sm:text-left lg:text-right">
                  <span className="text-[11px] font-bold text-violet-200 uppercase tracking-wider block">
                    Execution Readiness
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-black text-white">{readinessScore}%</span>
                    <Badge variant={readinessScore >= 80 ? 'emerald' : 'amber'} size="sm">
                      {readinessScore >= 80 ? 'Ready' : 'In Progress'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-charcoal-300 block mt-0.5">
                    {activeHealth?.message || 'Budget locked & safe'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentTab('event-detail')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-charcoal-900 bg-white hover:bg-charcoal-100 px-4 py-2.5 rounded-xl shadow-subtle transition-all"
                  >
                    <span>View Plan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('simulator')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-xl shadow-subtle transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Plan B</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">Your Celebration Callboard</h2>
            <p className="text-xs text-charcoal-500">
              Click any celebration to view line-items, tweak tasks, or stress-test contingencies
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('my-events')}
            className="text-xs sm:text-sm font-bold text-violet-800 hover:text-violet-950 flex items-center gap-1"
          >
            <span>All Celebrations ({events.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => {
            const isSelected = activeEvent?.id === evt.id;
            const allocated = calculateTotalAllocated(evt.expenses);
            const isOverBudget = allocated > evt.totalBudget;
            const daysLeft = getDaysLeft(evt.date);

            return (
              <Card
                key={evt.id}
                hoverEffect
                onClick={() => {
                  selectEvent(evt.id);
                  setCurrentTab('event-detail');
                }}
                className={`p-6 flex flex-col justify-between transition-all ${
                  isSelected ? 'ring-2 ring-violet-600 border-transparent shadow-card' : ''
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={evt.type === 'college' ? 'violet' : evt.type === 'wedding' ? 'amber' : 'slate'} size="sm">
                      {evt.type.toUpperCase()}
                    </Badge>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-charcoal-500">
                      <Clock className="w-3 h-3 text-charcoal-400" />
                      <span>{daysLeft}d left</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-charcoal-900 line-clamp-1 hover:text-violet-800 transition-colors">
                      {evt.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-charcoal-50 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-charcoal-400 block text-[11px]">Date</span>
                      <span className="font-semibold text-charcoal-800">{evt.date}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[11px]">Attendees</span>
                      <span className="font-semibold text-charcoal-800">{evt.guestCount} Guests</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-charcoal-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-charcoal-400 block">Total Budget</span>
                    <span className="text-sm font-black text-charcoal-900">
                      {formatINR(evt.totalBudget)}
                    </span>
                  </div>

                  {evt.activeBackupPlan ? (
                    <Badge variant="emerald" size="sm" className="text-[10px]">
                      Plan B Active
                    </Badge>
                  ) : isOverBudget ? (
                    <Badge variant="rose" size="sm" className="text-[10px]">
                      Cap Exceeded
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm" className="text-[10px]">
                      v{evt.currentPlanVersion}.0 Ready
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
