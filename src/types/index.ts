export type EventType = 
  | 'birthday' 
  | 'wedding' 
  | 'college' 
  | 'family' 
  | 'corporate' 
  | 'other';

export type VenuePreference = 'indoor' | 'outdoor' | 'hybrid';

export type EventStatus = 
  | 'planning' 
  | 'ready' 
  | 'adapted' 
  | 'in_progress' 
  | 'completed' 
  | 'emergency';

export type ExpenseCategory = 
  | 'venue' 
  | 'catering' 
  | 'decor' 
  | 'entertainment_av' 
  | 'photography' 
  | 'logistics' 
  | 'contingency' 
  | 'other';

export type ExpensePriority = 'essential' | 'flexible' | 'discretionary';

export interface ExpenseItem {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  name: string;
  allocatedAmount: number; // in INR
  actualAmount: number;    // in INR
  paidAmount: number;      // in INR
  notes?: string;
  priority: ExpensePriority;
  isModifiedByPlanB?: boolean;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: ExpenseCategory | 'general';
  dueDate: string; // ISO date string YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  isUrgent?: boolean;
  isAffectedByPlanB?: boolean;
  alternativeSolution?: string;
}

export type VendorStatus = 
  | 'not_contacted' 
  | 'contacted' 
  | 'quotation_received' 
  | 'booked';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: ExpenseCategory | 'other';
  contactPerson: string;
  phone: string;
  email: string;
  quotedAmount: number; // in INR
  actualAmount?: number;
  notes: string;
  status: VendorStatus;
  bookingVerified: boolean; // Must always be verified before claiming booked
}

export interface PlanChangeItem {
  category: string;
  changeType: 'reduced' | 'increased' | 'relocated' | 'swapped' | 'deferred' | 'cancelled';
  itemTitle: string;
  description: string;
  budgetDelta: number; // negative for savings, positive for increases
  rationale: string;
}

export interface BudgetDeltaSummary {
  originalTotal: number;
  proposedTotal: number;
  difference: number;
  percentageChange: number;
  isWithinBudget: boolean;
  categoryBreakdown: {
    category: ExpenseCategory;
    original: number;
    proposed: number;
    delta: number;
  }[];
}

export interface PlanRevision {
  id: string;
  eventId: string;
  createdAt: string;
  appliedAt?: string;
  scenarioKey: string;
  scenarioTitle: string;
  summary: string;
  previousBudget: number;
  newBudget: number;
  changes: PlanChangeItem[];
  strategicAdvice: string[];
  status: 'draft' | 'applied' | 'rejected' | 'reverted';
  previousStateSnapshot?: string; // JSON snapshot for clean rollback
}

export interface EventModel {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  guestCount: number;
  totalBudget: number; // INR ₹
  venuePreference: VenuePreference;
  theme?: string;
  notes?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  currentPlanVersion: number;
  activeBackupPlan?: string; // Name of scenario if active
  
  // Embedded or linked collections
  expenses: ExpenseItem[];
  tasks: EventTask[];
  vendors: Vendor[];
  revisions: PlanRevision[];
}

export type ScenarioPreset = 
  | 'budget_reduction_30'
  | 'budget_cut_college_farewell' // specific to 25k -> 18k test case
  | 'guest_surge_50'
  | 'outdoor_venue_rain'
  | 'caterer_cancellation_48h'
  | 'time_shift';

export interface SimulationResult {
  scenarioKey: string;
  scenarioTitle: string;
  scenarioDescription: string;
  originalEvent: EventModel;
  proposedEvent: EventModel;
  deltaSummary: BudgetDeltaSummary;
  changes: PlanChangeItem[];
  affectedTasks: {
    taskId: string;
    taskTitle: string;
    impact: string;
    actionRequired: string;
  }[];
  strategicAdvice: string[];
  isBudgetCompliant: boolean;
  maxAllowedBudget: number;
}

export interface EmergencyActionItem {
  id: string;
  phase: 'Immediate (0-60 mins)' | 'Secondary (1-3 hours)' | 'Mitigation / Alternatives';
  action: string;
  owner: string;
  costImpactINR: number;
  isUnverifiedSample: boolean; // Explicit labeling requirement
}

export interface EmergencySolution {
  issue: string;
  hoursRemaining: number;
  budgetAvailableINR: number;
  triagePriority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  actions: EmergencyActionItem[];
  contingencyAdvice: string;
}
