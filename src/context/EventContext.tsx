import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EventModel, ExpenseItem, EventTask, Vendor, PlanRevision } from '../types';
import { eventRepository } from '../services/eventRepository';

export type NavigationTab = 
  | 'landing'
  | 'overview'
  | 'my-events'
  | 'create-event'
  | 'event-detail'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'simulator'
  | 'emergency'
  | 'settings';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface EventContextType {
  events: EventModel[];
  activeEvent: EventModel | null;
  activeEventId: string | null;
  currentTab: NavigationTab;
  isLoading: boolean;
  toasts: ToastMessage[];
  isEmergencyModalOpen: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  setCurrentTab: (tab: NavigationTab) => void;
  selectEvent: (id: string) => void;
  createEvent: (data: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt' | 'currentPlanVersion' | 'revisions'>) => Promise<EventModel>;
  updateActiveEvent: (updates: Partial<EventModel>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Expenses
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'eventId'>) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<ExpenseItem>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  // Tasks
  addTask: (task: Omit<EventTask, 'id' | 'eventId'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<EventTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Vendors
  addVendor: (vendor: Omit<Vendor, 'id' | 'eventId'>) => Promise<void>;
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (vendorId: string) => Promise<void>;

  // Simulation & Approval
  applyPlanRevision: (
    revisionData: Omit<PlanRevision, 'id' | 'eventId' | 'createdAt' | 'appliedAt' | 'status'>,
    updatedEvent: EventModel
  ) => Promise<void>;
  rollbackPlanRevision: (revisionId: string) => Promise<void>;

  // Emergency Modal
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;

  // Utilities
  resetToSampleData: () => Promise<void>;
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initial load
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await eventRepository.getAllEvents();
      setEvents(list);
      if (list.length > 0 && !activeEventId) {
        // Default to college farewell event if present, otherwise first
        const collegeEvent = list.find(e => e.id === 'evt-college-farewell-2026') || list[0];
        setActiveEventId(collegeEvent.id);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Storage Error', 'Could not load event data from local repository');
    } finally {
      setIsLoading(false);
    }
  }, [activeEventId, showToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const activeEvent = events.find(e => e.id === activeEventId) || null;

  const selectEvent = (id: string) => {
    setActiveEventId(id);
    const evt = events.find(e => e.id === id);
    if (evt) {
      showToast('info', 'Event Loaded', `Switched to "${evt.name}"`);
    }
  };

  const createEvent = async (data: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt' | 'currentPlanVersion' | 'revisions'>) => {
    const created = await eventRepository.createEvent(data);
    setEvents(prev => [created, ...prev]);
    setActiveEventId(created.id);
    setCurrentTab('event-detail');
    showToast('success', 'Event Created Successfully', `"${created.name}" is now ready for planning.`);
    return created;
  };

  const updateActiveEvent = async (updates: Partial<EventModel>) => {
    if (!activeEventId) return;
    const updated = await eventRepository.updateEvent(activeEventId, updates);
    setEvents(prev => prev.map(e => e.id === activeEventId ? updated : e));
    showToast('success', 'Event Updated', 'Changes have been saved to local workspace.');
  };

  const deleteEvent = async (id: string) => {
    const success = await eventRepository.deleteEvent(id);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== id));
      if (activeEventId === id) {
        const remaining = events.filter(e => e.id !== id);
        setActiveEventId(remaining.length > 0 ? remaining[0].id : null);
        setCurrentTab('overview');
      }
      showToast('info', 'Event Removed', 'Event has been deleted from local storage.');
    }
  };

  // Expenses
  const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'eventId'>) => {
    if (!activeEventId) return;
    const newExp = await eventRepository.addExpense(activeEventId, expense);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return { ...e, expenses: [...e.expenses, newExp] };
      }
      return e;
    }));
    showToast('success', 'Expense Added', `Added "${newExp.name}"`);
  };

  const updateExpense = async (expenseId: string, updates: Partial<ExpenseItem>) => {
    if (!activeEventId) return;
    const updated = await eventRepository.updateExpense(activeEventId, expenseId, updates);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          expenses: e.expenses.map(exp => exp.id === expenseId ? updated : exp),
        };
      }
      return e;
    }));
    showToast('success', 'Expense Updated', 'Budget allocation saved.');
  };

  const deleteExpense = async (expenseId: string) => {
    if (!activeEventId) return;
    await eventRepository.deleteExpense(activeEventId, expenseId);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          expenses: e.expenses.filter(exp => exp.id !== expenseId),
        };
      }
      return e;
    }));
    showToast('info', 'Expense Removed', 'Line-item deleted.');
  };

  // Tasks
  const addTask = async (task: Omit<EventTask, 'id' | 'eventId'>) => {
    if (!activeEventId) return;
    const newTask = await eventRepository.addTask(activeEventId, task);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return { ...e, tasks: [...e.tasks, newTask] };
      }
      return e;
    }));
    showToast('success', 'Task Added', `"${newTask.title}" added to checklist.`);
  };

  const updateTask = async (taskId: string, updates: Partial<EventTask>) => {
    if (!activeEventId) return;
    const updated = await eventRepository.updateTask(activeEventId, taskId, updates);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          tasks: e.tasks.map(t => t.id === taskId ? updated : t),
        };
      }
      return e;
    }));
    if (updates.status === 'completed') {
      showToast('success', 'Task Completed', `"${updated.title}" marked done.`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!activeEventId) return;
    await eventRepository.deleteTask(activeEventId, taskId);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          tasks: e.tasks.filter(t => t.id !== taskId),
        };
      }
      return e;
    }));
    showToast('info', 'Task Removed', 'Task removed from timeline.');
  };

  // Vendors
  const addVendor = async (vendor: Omit<Vendor, 'id' | 'eventId'>) => {
    if (!activeEventId) return;
    const newVendor = await eventRepository.addVendor(activeEventId, vendor);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return { ...e, vendors: [...e.vendors, newVendor] };
      }
      return e;
    }));
    showToast('success', 'Vendor Recorded', `Added "${newVendor.name}"`);
  };

  const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    if (!activeEventId) return;
    const updated = await eventRepository.updateVendor(activeEventId, vendorId, updates);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          vendors: e.vendors.map(v => v.id === vendorId ? updated : v),
        };
      }
      return e;
    }));
    showToast('success', 'Vendor Updated', `Updated details for "${updated.name}"`);
  };

  const deleteVendor = async (vendorId: string) => {
    if (!activeEventId) return;
    await eventRepository.deleteVendor(activeEventId, vendorId);
    setEvents(prev => prev.map(e => {
      if (e.id === activeEventId) {
        return {
          ...e,
          vendors: e.vendors.filter(v => v.id !== vendorId),
        };
      }
      return e;
    }));
    showToast('info', 'Vendor Removed', 'Vendor deleted from directory.');
  };

  // Plan Approval Workflow
  const applyPlanRevision = async (
    revisionData: Omit<PlanRevision, 'id' | 'eventId' | 'createdAt' | 'appliedAt' | 'status'>,
    updatedEvent: EventModel
  ) => {
    if (!activeEventId) return;
    const saved = await eventRepository.applyPlanRevision(activeEventId, revisionData, updatedEvent);
    setEvents(prev => prev.map(e => e.id === activeEventId ? saved : e));
    showToast('success', 'Plan B Applied Successfully!', `Plan updated to Version ${saved.currentPlanVersion}. Changes are now active.`);
  };

  const rollbackPlanRevision = async (revisionId: string) => {
    if (!activeEventId) return;
    const restored = await eventRepository.rollbackPlanRevision(activeEventId, revisionId);
    setEvents(prev => prev.map(e => e.id === activeEventId ? restored : e));
    showToast('info', 'Plan Reverted', 'Successfully restored prior plan snapshot.');
  };

  const resetToSampleData = async () => {
    const samples = await eventRepository.resetToSampleData();
    setEvents(samples);
    const collegeEvent = samples.find(e => e.id === 'evt-college-farewell-2026') || samples[0];
    setActiveEventId(collegeEvent ? collegeEvent.id : null);
    showToast('info', 'Sample Data Restored', 'Reset to default College Farewell and sample celebrations.');
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        currentTab,
        isLoading,
        toasts,
        isEmergencyModalOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        setCurrentTab,
        selectEvent,
        createEvent,
        updateActiveEvent,
        deleteEvent,
        addExpense,
        updateExpense,
        deleteExpense,
        addTask,
        updateTask,
        deleteTask,
        addVendor,
        updateVendor,
        deleteVendor,
        applyPlanRevision,
        rollbackPlanRevision,
        openEmergencyModal: () => setIsEmergencyModalOpen(true),
        closeEmergencyModal: () => setIsEmergencyModalOpen(false),
        resetToSampleData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
