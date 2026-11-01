import React from 'react';
import { useEvent, NavigationTab } from '../../context/EventContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Wallet, 
  CheckSquare, 
  Users2, 
  Sparkles, 
  ShieldAlert, 
  Settings, 
  FileText,
  X,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const Sidebar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    activeEvent, 
    openEmergencyModal,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useEvent();

  const pendingTasks = activeEvent ? activeEvent.tasks.filter(t => t.status !== 'completed').length : 0;
  const vendorCount = activeEvent ? activeEvent.vendors.length : 0;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-events', label: 'My Events', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'event-detail', label: 'Event Plan', icon: <FileText className="w-4 h-4" /> },
    { id: 'budget', label: 'Smart Budget', icon: <Wallet className="w-4 h-4" /> },
    { 
      id: 'timeline', 
      label: 'Timeline & Tasks', 
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingTasks > 0 ? pendingTasks : undefined
    },
    { 
      id: 'vendors', 
      label: 'Vendor Manager', 
      icon: <Users2 className="w-4 h-4" />,
      badge: vendorCount > 0 ? vendorCount : undefined
    },
    { 
      id: 'simulator', 
      label: 'What If? Simulator', 
      icon: <Sparkles className="w-4 h-4 text-violet-600" />,
      badge: 'Core'
    },
    { 
      id: 'settings', 
      label: 'Settings & Data', 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  const handleSelectNav = (id: NavigationTab) => {
    setCurrentTab(id);
    setIsMobileMenuOpen(false);
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Mobile Header with Close button */}
        <div className="flex items-center justify-between md:hidden border-b border-charcoal-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-800 text-white flex items-center justify-center font-bold text-sm">
              PB
            </div>
            <span className="font-bold text-charcoal-900">PlanB AI Navigation</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-charcoal-500 hover:bg-charcoal-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Event Micro Card */}
        {activeEvent && (
          <div className="p-3.5 bg-gradient-to-br from-violet-50 to-white border border-violet-200/80 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">
                Current Plan
              </span>
              <span className="text-[10px] font-bold text-charcoal-600 bg-white px-2 py-0.5 rounded-full border border-charcoal-200">
                v{activeEvent.currentPlanVersion}.0
              </span>
            </div>
            <h4 className="text-sm font-bold text-charcoal-900 truncate mt-1" title={activeEvent.name}>
              {activeEvent.name}
            </h4>
            <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500">
              <span>{activeEvent.guestCount} guests</span>
              <span>•</span>
              <span className="capitalize">{activeEvent.type}</span>
            </div>

            {activeEvent.activeBackupPlan && (
              <div className="mt-2.5 pt-2 border-t border-violet-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Plan B Active</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-800 text-white shadow-card translate-x-0.5'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-charcoal-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <Badge 
                    variant={isActive ? 'violet' : typeof item.badge === 'number' ? 'amber' : 'default'} 
                    size="sm"
                    className={isActive ? 'bg-violet-700 text-white border-transparent' : ''}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Emergency Button & Storage Status */}
      <div className="space-y-3 pt-4 border-t border-charcoal-100">
        <button
          onClick={() => {
            openEmergencyModal();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-colors shadow-subtle hover:scale-[1.01]"
        >
          <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          <span>Emergency Triage SOS</span>
        </button>

        <div className="px-3 py-2 bg-charcoal-50 rounded-xl text-[11px] text-charcoal-500 border border-charcoal-100">
          <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Local Workspace Active</span>
          </div>
          <p className="mt-0.5 text-[10px] text-charcoal-400 leading-tight">
            Deterministic arithmetic & local persistence ready.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-white border-r border-charcoal-200/80 min-h-[calc(100vh-65px)] hidden md:block flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Pane */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full z-10 shadow-elevated animate-in slide-in-from-left duration-200 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
