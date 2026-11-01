import React from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EventCreationForm } from './components/events/EventCreationForm';
import { EventDetailView } from './components/events/EventDetailView';
import { MyEventsView } from './components/events/MyEventsView';
import { BudgetManager } from './components/budget/BudgetManager';
import { TimelineManager } from './components/timeline/TimelineManager';
import { VendorManager } from './components/vendors/VendorManager';
import { WhatIfSimulator } from './components/simulator/WhatIfSimulator';
import { SettingsView } from './components/settings/SettingsView';
import { EmergencyModeModal } from './components/emergency/EmergencyModeModal';
import { ToastContainer } from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { currentTab, isLoading } = useEvent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
        <div className="w-12 h-12 rounded-2xl bg-violet-800 text-white flex items-center justify-center font-bold text-xl animate-pulse">
          PB
        </div>
        <div className="text-sm font-semibold text-charcoal-600">
          Loading PlanB Workspace...
        </div>
      </div>
    );
  }

  // Landing Page has full width view
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-violet-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-elevated focus:outline-none"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          <LandingPage />
        </main>
        <EmergencyModeModal />
        <ToastContainer />
      </div>
    );
  }

  // Dashboard & App Views have Sidebar layout
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-violet-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-elevated focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto focus:outline-none" tabIndex={-1}>
          {currentTab === 'overview' && <DashboardOverview />}
          {currentTab === 'my-events' && <MyEventsView />}
          {currentTab === 'create-event' && <EventCreationForm />}
          {currentTab === 'event-detail' && <EventDetailView />}
          {currentTab === 'budget' && <BudgetManager />}
          {currentTab === 'timeline' && <TimelineManager />}
          {currentTab === 'vendors' && <VendorManager />}
          {currentTab === 'simulator' && <WhatIfSimulator />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <EmergencyModeModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <EventProvider>
        <AppContent />
      </EventProvider>
    </ErrorBoundary>
  );
};

export default App;
