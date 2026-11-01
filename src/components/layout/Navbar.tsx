import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  Menu, 
  X, 
  ChevronDown, 
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    events, 
    activeEvent, 
    selectEvent, 
    openEmergencyModal,
    resetToSampleData,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useEvent();

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Calculate days remaining to active event
  const getDaysRemaining = () => {
    if (!activeEvent?.date) return null;
    const target = new Date(activeEvent.date);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-charcoal-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Hamburger (Mobile) & Brand Logo */}
        <div className="flex items-center gap-3">
          {currentTab !== 'landing' && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button 
            type="button"
            className="flex items-center gap-2.5 group text-left focus:outline-none focus:ring-2 focus:ring-violet-600 rounded-xl p-1" 
            onClick={() => setCurrentTab('landing')}
            aria-label="PlanB AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-800 text-white flex items-center justify-center font-bold shadow-subtle group-hover:bg-violet-900 transition-colors shrink-0">
              <span className="text-base tracking-tight">PB</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-charcoal-900 group-hover:text-violet-900 transition-colors">
                  PlanB AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full border border-violet-200">
                  Pro
                </span>
              </div>
              <p className="hidden lg:block text-[11px] text-charcoal-500 font-medium">
                Every event has a plan. Great events have a Plan B.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Interactive Active Event Selector (visible on app tabs) */}
        {currentTab !== 'landing' && activeEvent && (
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
              aria-expanded={isEventDropdownOpen}
              aria-haspopup="listbox"
              aria-label={`Current event: ${activeEvent.name}. Click to switch celebration.`}
              className="flex items-center gap-2.5 bg-charcoal-50 hover:bg-charcoal-100/80 border border-charcoal-200/90 rounded-xl px-3.5 py-1.5 text-xs font-medium text-charcoal-800 transition-all shadow-subtle focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <div className="text-left max-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-charcoal-900 truncate block">
                    {activeEvent.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-charcoal-500">
                  <span>{activeEvent.guestCount} Guests</span>
                  <span>•</span>
                  <span>v{activeEvent.currentPlanVersion}.0</span>
                  {activeEvent.activeBackupPlan && (
                    <span className="text-emerald-700 font-semibold">• Plan B</span>
                  )}
                </div>
              </div>
            </button>

            {/* Event Dropdown Menu */}
            {isEventDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsEventDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-charcoal-200/90 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider">
                    Switch Active Celebration
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto pt-1">
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          selectEvent(evt.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between gap-2 ${
                          activeEvent.id === evt.id 
                            ? 'bg-violet-50 text-violet-900 font-bold border border-violet-200' 
                            : 'hover:bg-charcoal-50 text-charcoal-800'
                        }`}
                      >
                        <div className="truncate">
                          <span className="block truncate font-semibold">{evt.name}</span>
                          <span className="text-[11px] text-charcoal-500">{evt.date} • {evt.guestCount} guests</span>
                        </div>
                        {activeEvent.id === evt.id && (
                          <span className="text-violet-700 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-charcoal-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsEventDropdownOpen(false);
                        setCurrentTab('create-event');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-violet-800 hover:bg-violet-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Another Event</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentTab === 'landing' ? (
            <>
              <button
                onClick={() => setCurrentTab('overview')}
                className="text-xs sm:text-sm font-semibold text-charcoal-700 hover:text-violet-800 px-3 py-2 rounded-xl hover:bg-charcoal-100 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentTab('simulator')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-violet-800 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 rounded-xl transition-colors border border-violet-200"
              >
                <Sparkles className="w-4 h-4 text-violet-700" />
                <span>What If? Simulator</span>
              </button>
              <button
                onClick={() => setCurrentTab('create-event')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 px-4 py-2.5 rounded-xl shadow-card transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Plan My Event</span>
              </button>
            </>
          ) : (
            <>
              {/* Event Countdown Pill if upcoming */}
              {daysRemaining !== null && daysRemaining > 0 && (
                <div className="hidden xl:flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-900 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-violet-700" />
                  <span>{daysRemaining} days to event</span>
                </div>
              )}

              {/* Reset Data Button */}
              <button
                type="button"
                onClick={resetToSampleData}
                aria-label="Reset workspace to PromptWars realistic sample data"
                title="Reset sample data"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-800 px-2.5 py-2 rounded-lg hover:bg-charcoal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>

              {/* Emergency Mode Button */}
              <button
                onClick={openEmergencyModal}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-subtle hover:scale-[1.02]"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                <span className="hidden xs:inline">Emergency SOS</span>
                <span className="xs:hidden">SOS</span>
              </button>

              {/* Create New Event */}
              <button
                onClick={() => setCurrentTab('create-event')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 px-3.5 py-2 rounded-xl shadow-subtle transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Event</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
