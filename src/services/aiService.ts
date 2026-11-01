import { ExpenseItem, EventTask, ExpenseCategory } from '../types';

export interface AiPlanRequest {
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  venuePreference: string;
  theme?: string;
  notes?: string;
}

export interface AiPlanResponse {
  isLiveAi: boolean;
  model: string;
  conceptSummary: string;
  strategicAdvice: string[];
  budgetAllocations: ExpenseItem[];
  milestones: EventTask[];
  contingencyScenarios: {
    trigger: string;
    backupPlan: string;
    estimatedCostImpactINR: number;
  }[];
  notice?: string;
}

const LOCAL_KEY_STORAGE = 'planb_user_gemini_key';

export const aiService = {
  getUserApiKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(LOCAL_KEY_STORAGE) || '';
  },

  setUserApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    if (!key.trim()) {
      localStorage.removeItem(LOCAL_KEY_STORAGE);
    } else {
      localStorage.setItem(LOCAL_KEY_STORAGE, key.trim());
    }
  },

  async checkStatus(): Promise<{ hasKey: boolean; model: string; source: 'server' | 'user' | 'none' }> {
    const userKey = this.getUserApiKey();
    if (userKey) {
      return { hasKey: true, model: 'gemini-3.8-flash', source: 'user' };
    }

    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        return {
          hasKey: Boolean(data.hasKey),
          model: data.model || 'gemini-3.8-flash',
          source: data.hasKey ? 'server' : 'none'
        };
      }
    } catch {
      // Fallback
    }

    return { hasKey: false, model: 'gemini-3.8-flash', source: 'none' };
  },

  async generatePlan(req: AiPlanRequest): Promise<AiPlanResponse> {
    const userKey = this.getUserApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (userKey) {
      headers['x-gemini-api-key'] = userKey;
    }

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.plan) {
          const raw = json.plan;
          const expenses: ExpenseItem[] = (raw.budgetAllocations || []).map((item: any, i: number) => ({
            id: `ai-exp-${Date.now()}-${i}`,
            eventId: '',
            category: item.category as ExpenseCategory,
            name: item.name,
            allocatedAmount: Number(item.allocatedAmount) || 0,
            actualAmount: 0,
            paidAmount: 0,
            priority: item.priority || 'essential',
            notes: item.notes || 'AI allocated',
            isModifiedByPlanB: false
          }));

          const tasks: EventTask[] = (raw.milestones || []).map((m: any, i: number) => {
            const dueDate = new Date(req.date);
            const offset = Number(m.dueDaysBeforeEvent) || (i + 1) * 2;
            dueDate.setDate(dueDate.getDate() - offset);

            return {
              id: `ai-tsk-${Date.now()}-${i}`,
              eventId: '',
              title: m.title,
              description: m.description,
              category: m.category || 'general',
              dueDate: dueDate.toISOString().split('T')[0],
              priority: m.priority || 'medium',
              status: 'pending',
              isUrgent: m.priority === 'high'
            };
          });

          return {
            isLiveAi: true,
            model: 'gemini-3.8-flash',
            conceptSummary: raw.conceptSummary || `Tailored plan for ${req.name}`,
            strategicAdvice: raw.strategicAdvice || [],
            budgetAllocations: expenses,
            milestones: tasks,
            contingencyScenarios: raw.contingencyScenarios || [],
            notice: 'Generated live via Gemini 3.8 Flash'
          };
        }
      }
    } catch (err) {
      console.warn('Live Gemini API unavailable, generating via calibrated rule engine', err);
    }

    // High-fidelity calibrated fallback if Gemini API key is missing
    return this.generateCalibratedFallbackPlan(req);
  },

  generateCalibratedFallbackPlan(req: AiPlanRequest): AiPlanResponse {
    const numericBudget = req.totalBudget;
    const guests = req.guestCount;

    // Calibrated department shares based on event type
    let cateringRatio = 0.44;
    let venueRatio = 0.24;
    let avRatio = 0.14;
    let decorRatio = 0.10;

    if (req.type === 'wedding') {
      cateringRatio = 0.40;
      venueRatio = 0.30;
      decorRatio = 0.15;
      avRatio = 0.10;
    } else if (req.type === 'birthday') {
      cateringRatio = 0.45;
      venueRatio = 0.18;
      avRatio = 0.18;
      decorRatio = 0.12;
    }

    const cateringAmount = Math.round(numericBudget * cateringRatio);
    const venueAmount = Math.round(numericBudget * venueRatio);
    const avAmount = Math.round(numericBudget * avRatio);
    const decorAmount = Math.round(numericBudget * decorRatio);
    const contingencyAmount = Math.max(1000, numericBudget - (cateringAmount + venueAmount + avAmount + decorAmount));

    const expenses: ExpenseItem[] = [
      {
        id: `exp-cat-${Date.now()}`,
        eventId: '',
        category: 'catering',
        name: `Food & Beverages (${guests} guests @ ₹${Math.round(cateringAmount / guests)}/plate)`,
        allocatedAmount: cateringAmount,
        actualAmount: 0,
        paidAmount: 0,
        priority: 'essential',
        notes: 'Includes appetizers, main buffet, and beverages.',
        isModifiedByPlanB: false,
      },
      {
        id: `exp-ven-${Date.now()}`,
        eventId: '',
        category: 'venue',
        name: `${req.venuePreference === 'outdoor' ? 'Outdoor Lawn & Canopies' : 'Indoor Banquet / Hall'} Space Booking`,
        allocatedAmount: venueAmount,
        actualAmount: 0,
        paidAmount: 0,
        priority: 'essential',
        notes: `Space hire for ${req.location}.`,
        isModifiedByPlanB: false,
      },
      {
        id: `exp-av-${Date.now()}`,
        eventId: '',
        category: 'entertainment_av',
        name: 'Sound Reinforcement, Wireless Mics & Ambience Lights',
        allocatedAmount: avAmount,
        actualAmount: 0,
        paidAmount: 0,
        priority: 'flexible',
        notes: 'Audio console, microphones, and stage lighting.',
        isModifiedByPlanB: false,
      },
      {
        id: `exp-dec-${Date.now()}`,
        eventId: '',
        category: 'decor',
        name: `Themed Decor & Photo Backdrop (${req.theme || 'Celebration styling'})`,
        allocatedAmount: decorAmount,
        actualAmount: 0,
        paidAmount: 0,
        priority: 'flexible',
        notes: 'Entrance floral styling, photo booth wall, and badges.',
        isModifiedByPlanB: false,
      },
      {
        id: `exp-con-${Date.now()}`,
        eventId: '',
        category: 'contingency',
        name: 'Contingency Cash Buffer',
        allocatedAmount: contingencyAmount,
        actualAmount: 0,
        paidAmount: 0,
        priority: 'essential',
        notes: 'Reserved strictly for unexpected price surge or urgent refills.',
        isModifiedByPlanB: false,
      },
    ];

    const tasks: EventTask[] = [
      {
        id: `tsk-1-${Date.now()}`,
        eventId: '',
        title: 'Confirm venue contract & power distribution',
        description: `Verify setup access window for ${req.location}.`,
        category: 'venue',
        dueDate: req.date,
        priority: 'high',
        status: 'pending',
        isUrgent: true,
      },
      {
        id: `tsk-2-${Date.now()}`,
        eventId: '',
        title: `Lock in per-head food tasting for ${guests} guests`,
        description: 'Verify vegetarian options and allergy requirements.',
        category: 'catering',
        dueDate: req.date,
        priority: 'high',
        status: 'pending',
      },
      {
        id: `tsk-3-${Date.now()}`,
        eventId: '',
        title: 'Run AV soundcheck & lighting cue review',
        description: 'Test wireless microphone frequencies and background playlist.',
        category: 'entertainment_av',
        dueDate: req.date,
        priority: 'medium',
        status: 'pending',
      },
    ];

    return {
      isLiveAi: false,
      model: 'planb-calibrated-engine',
      conceptSummary: `Personalized blueprint for ${req.name}: Balanced allocation supporting ${guests} guests within ₹${numericBudget.toLocaleString('en-IN')}.`,
      strategicAdvice: [
        `Cap spending strictly at ₹${numericBudget.toLocaleString('en-IN')} using unitized per-guest allocations.`,
        'Maintain a non-zero cash contingency buffer to absorb unexpected day-of price fluctuations.',
        'Obtain written confirmation on power backup to avoid sudden audio/lighting shutdowns.'
      ],
      budgetAllocations: expenses,
      milestones: tasks,
      contingencyScenarios: [
        {
          trigger: 'Weather shift or sudden rain',
          backupPlan: 'Relocate to indoor covered banquet hall with zero net budget penalty.',
          estimatedCostImpactINR: 0
        },
        {
          trigger: 'Guest count surges by 25-50%',
          backupPlan: 'Activate bulk packaged snack boxes and emergency extra chair rentals.',
          estimatedCostImpactINR: Math.round(numericBudget * 0.15)
        }
      ],
      notice: 'Generated via PlanB Calibration Engine. Configure GEMINI_API_KEY in .env or Settings to activate live Gemini 3.8 Flash.'
    };
  }
};
