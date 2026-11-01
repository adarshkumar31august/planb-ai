import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { EventFormData, validateEventForm, ValidationErrors } from '../../utils/validators';
import { EventType, VenuePreference, ExpenseItem, EventTask } from '../../types';
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  Bot, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2,
  X 
} from 'lucide-react';
import { aiService, AiPlanResponse } from '../../services/aiService';
import { formatINR } from '../../utils/budgetCalculations';
import { Badge } from '../common/Badge';

export const EventCreationForm: React.FC = () => {
  const { createEvent, setCurrentTab, showToast } = useEvent();

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'college',
    date: '',
    time: '16:00 - 20:30',
    location: '',
    guestCount: '',
    totalBudget: '',
    venuePreference: 'outdoor',
    theme: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiPlanResponse | null>(null);
  const [useAiAllocations, setUseAiAllocations] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field being edited
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Quick pre-fill for the College Farewell test case
  const handleLoadCollegeTemplate = () => {
    setFormData({
      name: "Batch of '26 College Farewell & Honors",
      type: 'college',
      date: '2026-11-20',
      time: '16:00 - 20:30',
      location: "St. Xavier's Campus Main Quadrangle",
      guestCount: 100,
      totalBudget: 25000,
      venuePreference: 'outdoor',
      theme: 'Retro Bollywood & Golden Sunset Memories',
      notes: 'Graduating senior batch farewell with faculty awards and acoustic performances.',
    });
    setErrors({});
  };

  const handleGenerateWithAi = async () => {
    const { isValid, errors: validationErrors } = validateEventForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      showToast('error', 'Form Incomplete', 'Please fill in the event name, date, budget, and guest count before consulting the AI Architect.');
      return;
    }

    try {
      setIsAiGenerating(true);
      const plan = await aiService.generatePlan({
        name: formData.name.trim(),
        type: formData.type,
        date: formData.date,
        location: formData.location.trim() || 'TBD Venue',
        guestCount: Number(formData.guestCount),
        totalBudget: Number(formData.totalBudget),
        venuePreference: formData.venuePreference,
        theme: formData.theme?.trim(),
        notes: formData.notes?.trim(),
      });

      setAiPlan(plan);
      setUseAiAllocations(true);
      showToast(
        'success', 
        plan.isLiveAi ? 'Gemini 3.8 Flash Plan Formulated' : 'Calibrated AI Plan Formulated',
        plan.isLiveAi ? 'Live Gemini AI generated custom allocations and milestones.' : 'Generated custom allocations and contingency advice.'
      );
    } catch {
      showToast('error', 'AI Generation Failed', 'Could not formulate AI plan.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateEventForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const numericBudget = Number(formData.totalBudget);
      const numericGuests = Number(formData.guestCount);

      // Generate intelligent baseline starter expenses proportional to budget
      const cateringAmount = Math.round(numericBudget * 0.44);
      const venueAmount = Math.round(numericBudget * 0.24);
      const avAmount = Math.round(numericBudget * 0.14);
      const decorAmount = Math.round(numericBudget * 0.10);
      const contingencyAmount = numericBudget - (cateringAmount + venueAmount + avAmount + decorAmount);

      const initialExpenses: ExpenseItem[] = [
        {
          id: `exp-cat-${Date.now()}`,
          eventId: '',
          category: 'catering',
          name: `Food & Beverages (${numericGuests} guests)`,
          allocatedAmount: cateringAmount,
          actualAmount: cateringAmount,
          paidAmount: 0,
          notes: 'Initial catering allocation based on expected guest turnout.',
          priority: 'essential',
          isModifiedByPlanB: false,
        },
        {
          id: `exp-ven-${Date.now()}`,
          eventId: '',
          category: 'venue',
          name: 'Venue Booking & Seating Setup',
          allocatedAmount: venueAmount,
          actualAmount: venueAmount,
          paidAmount: 0,
          notes: `${formData.venuePreference === 'outdoor' ? 'Outdoor' : 'Indoor'} space hire & chairs setup.`,
          priority: 'essential',
          isModifiedByPlanB: false,
        },
        {
          id: `exp-av-${Date.now()}`,
          eventId: '',
          category: 'entertainment_av',
          name: 'Sound, Stage Mics & Lighting',
          allocatedAmount: avAmount,
          actualAmount: avAmount,
          paidAmount: 0,
          notes: 'Audio console, 2 wireless microphones, and ambience lighting.',
          priority: 'flexible',
          isModifiedByPlanB: false,
        },
        {
          id: `exp-dec-${Date.now()}`,
          eventId: '',
          category: 'decor',
          name: 'Decor, Photo Backdrop & Badges',
          allocatedAmount: decorAmount,
          actualAmount: decorAmount,
          paidAmount: 0,
          notes: 'Theme banners, memory tokens, and photo booth styling.',
          priority: 'flexible',
          isModifiedByPlanB: false,
        },
        {
          id: `exp-con-${Date.now()}`,
          eventId: '',
          category: 'contingency',
          name: 'Emergency Buffer',
          allocatedAmount: contingencyAmount,
          actualAmount: 0,
          paidAmount: 0,
          notes: 'Reserved strictly for unexpected surge costs.',
          priority: 'essential',
          isModifiedByPlanB: false,
        },
      ];

      const initialTasks: EventTask[] = [
        {
          id: `tsk-1-${Date.now()}`,
          eventId: '',
          title: 'Confirm primary venue permissions & time window',
          description: `Obtain official clearance for ${formData.location}.`,
          category: 'venue',
          dueDate: formData.date,
          priority: 'high',
          status: 'pending',
          isUrgent: true,
        },
        {
          id: `tsk-2-${Date.now()}`,
          eventId: '',
          title: 'Finalize catering menu & dietary preferences',
          description: `Lock in per-head menu for ${numericGuests} attendees.`,
          category: 'catering',
          dueDate: formData.date,
          priority: 'high',
          status: 'pending',
        },
        {
          id: `tsk-3-${Date.now()}`,
          eventId: '',
          title: 'Perform AV sound check & test mics',
          description: 'Ensure acoustics and stage lighting operate without feedback.',
          category: 'entertainment_av',
          dueDate: formData.date,
          priority: 'medium',
          status: 'pending',
        },
      ];

      const finalExpenses: ExpenseItem[] = (useAiAllocations && aiPlan && aiPlan.budgetAllocations.length > 0)
        ? aiPlan.budgetAllocations
        : initialExpenses;

      const finalTasks: EventTask[] = (useAiAllocations && aiPlan && aiPlan.milestones.length > 0)
        ? aiPlan.milestones
        : initialTasks;

      await createEvent({
        name: formData.name.trim(),
        type: formData.type as EventType,
        date: formData.date,
        time: formData.time || '18:00 - 22:00',
        location: formData.location.trim(),
        guestCount: numericGuests,
        totalBudget: numericBudget,
        venuePreference: formData.venuePreference as VenuePreference,
        theme: formData.theme?.trim(),
        notes: formData.notes?.trim(),
        status: 'planning',
        expenses: finalExpenses,
        tasks: finalTasks,
        vendors: [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentTab('overview')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          type="button"
          onClick={handleLoadCollegeTemplate}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load College Farewell Template (₹25k)</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-card p-6 sm:p-8">
        <div className="space-y-2 border-b border-charcoal-100 pb-5">
          <h1 className="text-2xl font-bold text-charcoal-900">Create New Celebration Plan</h1>
          <p className="text-sm text-charcoal-500">
            Provide the baseline event details. PlanB AI will formulate your smart budget allocation and pre-arm your contingency backup plans.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pt-6 space-y-6">
          {/* Event Name */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
              <span>Event Name *</span>
              {errors.name && (
                <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Batch of '26 College Farewell & Honors"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-charcoal-200 focus:border-violet-600 focus:ring-violet-100'
              }`}
            />
          </div>

          {/* Event Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
                <span>Event Type *</span>
                {errors.type && <span className="text-xs text-rose-600">{errors.type}</span>}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 bg-white"
              >
                <option value="college">College Event / Farewell</option>
                <option value="birthday">Birthday Party</option>
                <option value="wedding">Wedding / Sangeet</option>
                <option value="family">Family Celebration / Reunion</option>
                <option value="corporate">Corporate / Department Meet</option>
                <option value="other">Other Celebration</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
                <span>Event Date *</span>
                {errors.date && <span className="text-xs text-rose-600">{errors.date}</span>}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 bg-white"
              />
            </div>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
                <span>Location / Venue *</span>
                {errors.location && <span className="text-xs text-rose-600">{errors.location}</span>}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. St. Xavier's Main Quadrangle"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Event Timings
              </label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. 16:00 - 20:30"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Guest Count & Total Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
                <span>Number of Guests *</span>
                {errors.guestCount && (
                  <span className="text-xs text-rose-600">{errors.guestCount}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="guestCount"
                  min="1"
                  value={formData.guestCount}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                />
                <span className="absolute right-4 top-3.5 text-xs text-charcoal-400 font-medium">
                  Attendees
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center justify-between">
                <span>Total Budget in INR (₹) *</span>
                {errors.totalBudget && (
                  <span className="text-xs text-rose-600">{errors.totalBudget}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalBudget"
                  min="1000"
                  step="500"
                  value={formData.totalBudget}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-semibold"
                />
                <span className="absolute right-4 top-3.5 text-xs text-charcoal-500 font-bold">
                  ₹ INR
                </span>
              </div>
            </div>
          </div>

          {/* Indoor / Outdoor Preference */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-charcoal-800 block">
              Venue Preference *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'outdoor', label: 'Outdoor Lawn / Open Air' },
                { value: 'indoor', label: 'Indoor Hall / Auditorium' },
                { value: 'hybrid', label: 'Hybrid (Indoor + Lawn)' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, venuePreference: opt.value }))}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-medium text-center transition-all ${
                    formData.venuePreference === opt.value
                      ? 'border-violet-600 bg-violet-50 text-violet-900 font-semibold shadow-subtle ring-1 ring-violet-600'
                      : 'border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Additional Notes */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Theme / Dress Code (Optional)
              </label>
              <input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="e.g. Retro Bollywood & Golden Hour Memories"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Additional Requirements / Special Constraints
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Vegetarian snacks requirement, acoustic guitar plug-in, faculty certificates..."
                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* AI Event Architect Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/60 via-charcoal-50/40 to-white border border-violet-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-800 text-white flex items-center justify-center shrink-0 shadow-subtle">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-charcoal-900">PlanB AI Architect</h3>
                    <Badge variant="violet" size="sm">Gemini 3.8 Flash</Badge>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    Analyze your venue, scale, and budget to generate custom line-items and milestones.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all disabled:opacity-50 self-start sm:self-auto shrink-0"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Architecting Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Plan</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Plan Preview Box */}
            {aiPlan && (
              <div className="mt-3 p-4 bg-white rounded-xl border border-violet-200 shadow-subtle space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">AI Architecture Formulation</span>
                    <Badge variant={aiPlan.isLiveAi ? 'emerald' : 'slate'} size="sm">
                      {aiPlan.isLiveAi ? 'Live Gemini 3.8 Flash' : 'Calibrated Event Architect'}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPlan(null);
                      setUseAiAllocations(false);
                    }}
                    className="text-charcoal-400 hover:text-charcoal-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wide">Concept Summary</span>
                  <p className="text-xs text-charcoal-700 leading-relaxed bg-violet-50/50 p-2.5 rounded-lg border border-violet-100">
                    {aiPlan.conceptSummary}
                  </p>
                </div>

                {aiPlan.strategicAdvice && aiPlan.strategicAdvice.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">Strategic Advice</span>
                    <ul className="space-y-1">
                      {aiPlan.strategicAdvice.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-charcoal-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-700 shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Proposed Budget Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">Proposed Allocations</span>
                    <span className="text-[11px] text-charcoal-500 font-semibold">{aiPlan.budgetAllocations.length} categories</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiPlan.budgetAllocations.map((exp, i) => (
                      <div key={i} className="p-2 rounded-lg bg-charcoal-50/60 border border-charcoal-100 flex items-center justify-between text-xs">
                        <span className="font-medium text-charcoal-800 truncate mr-2">{exp.name}</span>
                        <span className="font-bold text-charcoal-900 shrink-0">{formatINR(exp.allocatedAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Plan Toggle */}
                <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAiAllocations}
                      onChange={(e) => setUseAiAllocations(e.target.checked)}
                      className="rounded text-violet-700 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-charcoal-800">
                      Apply these AI allocations and milestones upon creation
                    </span>
                  </label>
                  {useAiAllocations ? (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Enabled
                    </span>
                  ) : (
                    <span className="text-xs text-charcoal-400">Standard Ratios</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setCurrentTab('overview')}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Event...' : 'Generate Event & Smart Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
