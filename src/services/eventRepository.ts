import { EventModel, ExpenseItem, EventTask, Vendor, PlanRevision } from '../types';
import { SAMPLE_EVENTS } from '../data/sampleData';

export interface IEventRepository {
  getAllEvents(): Promise<EventModel[]>;
  getEventById(id: string): Promise<EventModel | null>;
  createEvent(event: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt' | 'currentPlanVersion' | 'revisions'>): Promise<EventModel>;
  updateEvent(id: string, updates: Partial<EventModel>): Promise<EventModel>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Expenses
  addExpense(eventId: string, expense: Omit<ExpenseItem, 'id' | 'eventId'>): Promise<ExpenseItem>;
  updateExpense(eventId: string, expenseId: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem>;
  deleteExpense(eventId: string, expenseId: string): Promise<boolean>;

  // Tasks
  addTask(eventId: string, task: Omit<EventTask, 'id' | 'eventId'>): Promise<EventTask>;
  updateTask(eventId: string, taskId: string, updates: Partial<EventTask>): Promise<EventTask>;
  deleteTask(eventId: string, taskId: string): Promise<boolean>;

  // Vendors
  addVendor(eventId: string, vendor: Omit<Vendor, 'id' | 'eventId'>): Promise<Vendor>;
  updateVendor(eventId: string, vendorId: string, updates: Partial<Vendor>): Promise<Vendor>;
  deleteVendor(eventId: string, vendorId: string): Promise<boolean>;

  // Plan Revisions / Approval Workflow
  applyPlanRevision(eventId: string, revision: Omit<PlanRevision, 'id' | 'eventId' | 'createdAt' | 'appliedAt' | 'status'>, updatedEventState: EventModel): Promise<EventModel>;
  rollbackPlanRevision(eventId: string, revisionId: string): Promise<EventModel>;

  // Reset to default sample data
  resetToSampleData(): Promise<EventModel[]>;
}

const STORAGE_KEY = 'planb_ai_events_v1';

export class LocalStorageEventRepository implements IEventRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadFromStorage(): EventModel[] {
    if (!this.isBrowser()) return SAMPLE_EVENTS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with realistic sample events
        this.saveToStorage(SAMPLE_EVENTS);
        return SAMPLE_EVENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse PlanB events from local storage, falling back to sample data', e);
      return SAMPLE_EVENTS;
    }
  }

  private saveToStorage(events: EventModel[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  async getAllEvents(): Promise<EventModel[]> {
    return this.loadFromStorage();
  }

  async getEventById(id: string): Promise<EventModel | null> {
    const events = this.loadFromStorage();
    return events.find(e => e.id === id) || null;
  }

  async createEvent(data: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt' | 'currentPlanVersion' | 'revisions'>): Promise<EventModel> {
    const events = this.loadFromStorage();
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newEvent: EventModel = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      currentPlanVersion: 1,
      revisions: [],
      expenses: data.expenses || [],
      tasks: data.tasks || [],
      vendors: data.vendors || [],
    };

    events.unshift(newEvent);
    this.saveToStorage(events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<EventModel>): Promise<EventModel> {
    const events = this.loadFromStorage();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Event with id ${id} not found`);

    const updated: EventModel = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updated;
    this.saveToStorage(events);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const events = this.loadFromStorage();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    this.saveToStorage(filtered);
    return true;
  }

  async addExpense(eventId: string, expense: Omit<ExpenseItem, 'id' | 'eventId'>): Promise<ExpenseItem> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const newExpense: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}`,
      eventId,
    };

    const updatedExpenses = [...event.expenses, newExpense];
    await this.updateEvent(eventId, { expenses: updatedExpenses });
    return newExpense;
  }

  async updateExpense(eventId: string, expenseId: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const index = event.expenses.findIndex(e => e.id === expenseId);
    if (index === -1) throw new Error('Expense item not found');

    const updatedExpense: ExpenseItem = {
      ...event.expenses[index],
      ...updates,
    };

    const newExpenses = [...event.expenses];
    newExpenses[index] = updatedExpense;
    await this.updateEvent(eventId, { expenses: newExpenses });
    return updatedExpense;
  }

  async deleteExpense(eventId: string, expenseId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const filtered = event.expenses.filter(e => e.id !== expenseId);
    if (filtered.length === event.expenses.length) return false;

    await this.updateEvent(eventId, { expenses: filtered });
    return true;
  }

  async addTask(eventId: string, task: Omit<EventTask, 'id' | 'eventId'>): Promise<EventTask> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const newTask: EventTask = {
      ...task,
      id: `task-${Date.now()}`,
      eventId,
    };

    const updatedTasks = [...event.tasks, newTask];
    await this.updateEvent(eventId, { tasks: updatedTasks });
    return newTask;
  }

  async updateTask(eventId: string, taskId: string, updates: Partial<EventTask>): Promise<EventTask> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const index = event.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    const updatedTask: EventTask = {
      ...event.tasks[index],
      ...updates,
    };

    const newTasks = [...event.tasks];
    newTasks[index] = updatedTask;
    await this.updateEvent(eventId, { tasks: newTasks });
    return updatedTask;
  }

  async deleteTask(eventId: string, taskId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const filtered = event.tasks.filter(t => t.id !== taskId);
    if (filtered.length === event.tasks.length) return false;

    await this.updateEvent(eventId, { tasks: filtered });
    return true;
  }

  async addVendor(eventId: string, vendor: Omit<Vendor, 'id' | 'eventId'>): Promise<Vendor> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const newVendor: Vendor = {
      ...vendor,
      id: `ven-${Date.now()}`,
      eventId,
      bookingVerified: false, // Default to unverified for honesty
    };

    const updatedVendors = [...event.vendors, newVendor];
    await this.updateEvent(eventId, { vendors: updatedVendors });
    return newVendor;
  }

  async updateVendor(eventId: string, vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const index = event.vendors.findIndex(v => v.id === vendorId);
    if (index === -1) throw new Error('Vendor not found');

    const updatedVendor: Vendor = {
      ...event.vendors[index],
      ...updates,
    };

    const newVendors = [...event.vendors];
    newVendors[index] = updatedVendor;
    await this.updateEvent(eventId, { vendors: newVendors });
    return updatedVendor;
  }

  async deleteVendor(eventId: string, vendorId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const filtered = event.vendors.filter(v => v.id !== vendorId);
    if (filtered.length === event.vendors.length) return false;

    await this.updateEvent(eventId, { vendors: filtered });
    return true;
  }

  /**
   * Signature Approval Workflow:
   * Records a PlanRevision entry, saves previous state snapshot for instant rollback,
   * updates the event budget & allocations, increments version.
   */
  async applyPlanRevision(
    eventId: string,
    revisionData: Omit<PlanRevision, 'id' | 'eventId' | 'createdAt' | 'appliedAt' | 'status'>,
    updatedEventState: EventModel
  ): Promise<EventModel> {
    const currentEvent = await this.getEventById(eventId);
    if (!currentEvent) throw new Error('Event not found');

    const now = new Date().toISOString();
    const revision: PlanRevision = {
      ...revisionData,
      id: `rev-${Date.now()}`,
      eventId,
      createdAt: now,
      appliedAt: now,
      status: 'applied',
      previousStateSnapshot: JSON.stringify(currentEvent),
    };

    const updatedEvent: EventModel = {
      ...updatedEventState,
      updatedAt: now,
      currentPlanVersion: (currentEvent.currentPlanVersion || 1) + 1,
      status: 'adapted',
      revisions: [revision, ...(currentEvent.revisions || [])],
    };

    return this.updateEvent(eventId, updatedEvent);
  }

  /**
   * Rollback to snapshot state
   */
  async rollbackPlanRevision(eventId: string, revisionId: string): Promise<EventModel> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const revIndex = event.revisions.findIndex(r => r.id === revisionId);
    if (revIndex === -1) throw new Error('Revision record not found');

    const revision = event.revisions[revIndex];
    if (!revision.previousStateSnapshot) {
      throw new Error('No historical snapshot available for this revision');
    }

    const previousSnapshot: EventModel = JSON.parse(revision.previousStateSnapshot);
    
    // Mark revision as reverted
    revision.status = 'reverted';
    const updatedRevisions = [...event.revisions];
    updatedRevisions[revIndex] = revision;

    const rolledBackEvent: EventModel = {
      ...previousSnapshot,
      updatedAt: new Date().toISOString(),
      currentPlanVersion: event.currentPlanVersion + 1,
      status: 'planning',
      activeBackupPlan: undefined,
      revisions: updatedRevisions,
    };

    return this.updateEvent(eventId, rolledBackEvent);
  }

  async resetToSampleData(): Promise<EventModel[]> {
    this.saveToStorage(SAMPLE_EVENTS);
    return SAMPLE_EVENTS;
  }
}

// Global singleton instance
export const eventRepository: IEventRepository = new LocalStorageEventRepository();
