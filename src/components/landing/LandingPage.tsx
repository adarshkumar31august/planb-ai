import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const LandingPage: React.FC = () => {
  const { setCurrentTab, selectEvent, events } = useEvent();
  
  // Interactive mini-simulator preview state
  const [activeScenario, setActiveScenario] = useState<'budget' | 'rain' | 'guests'>('budget');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLaunchCollegeEvent = () => {
    const college = events.find(e => e.id === 'evt-college-farewell-2026');
    if (college) {
      selectEvent(college.id);
    }
    setCurrentTab('simulator');
  };

  const faqs = [
    {
      q: 'How does PlanB AI ensure event budgets are never exceeded?',
      a: 'All calculations are executed in deterministic TypeScript arithmetic functions—never hallucinated by generative models. Every proposed backup plan enforces strict caps (such as capping the ₹25,000 college farewell at exactly ₹18,000) before presenting it to you.'
    },
    {
      q: 'Does PlanB AI claim vendors are booked without verification?',
      a: 'Never. PlanB AI has strict verification safeguards. Vendor quotations and statuses are user-maintained, and no third-party vendor is ever claimed to be booked or available without explicit manual confirmation.'
    },
    {
      q: 'Can I rollback to my original plan if I dislike the simulation?',
      a: 'Yes. PlanB AI saves an immutable snapshot of your baseline plan before any Plan B is applied. You can revert to any prior plan version with a single click.'
    },
    {
      q: 'What types of celebrations does PlanB AI support?',
      a: 'PlanB AI comes equipped with templates for college farewells & fests, weddings & sangeets, milestone birthdays, and family celebrations, with customizable category breakdowns for each.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-200/25 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200/90 text-violet-800 text-xs sm:text-sm font-semibold shadow-subtle animate-in fade-in slide-in-from-top-3">
            <Sparkles className="w-4 h-4 text-violet-700" />
            <span>PromptWars Challenge 5: Celebration & Event Planner</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-charcoal-900 leading-[1.12]">
              Your Celebration. Your Budget.{' '}
              <span className="text-violet-800 underline decoration-violet-300 decoration-wavy decoration-2">
                Your Backup Plan.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-charcoal-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Every event has a plan. <strong className="text-charcoal-900 font-bold">Great events have a Plan B.</strong> Organize seamless celebrations within your financial limits and adapt effortlessly when the unexpected occurs.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentTab('create-event')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold text-white bg-violet-800 hover:bg-violet-900 px-8 py-4 rounded-2xl shadow-elevated transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Plan My Event</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleLaunchCollegeEvent}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold text-charcoal-800 bg-white hover:bg-charcoal-50 border border-charcoal-300 px-7 py-4 rounded-2xl shadow-subtle transition-all hover:border-violet-400"
            >
              <Sparkles className="w-4 h-4 text-violet-700" />
              <span>Explore Live College Farewell Demo</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-charcoal-600 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deterministic Budget Caps</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No AI Hallucinated Math</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1-Click Snapshot Rollback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Feature Showcase: Interactive What If? Simulator Preview */}
      <section className="py-20 bg-white border-y border-charcoal-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-800 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-200">
              The Signature Capability
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
              The "What If?" Stress-Test Simulator
            </h2>
            <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
              Disruptions happen. PlanB AI simulates realistic crises with strict budget validation and generates a ready-to-execute backup plan with full category rationales in seconds.
            </p>
          </div>

          {/* Interactive Simulation Preview Box */}
          <div className="bg-background rounded-3xl border border-charcoal-200/90 p-6 sm:p-10 shadow-card">
            {/* Scenario Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-charcoal-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveScenario('budget')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeScenario === 'budget'
                      ? 'bg-violet-800 text-white shadow-card scale-[1.01]'
                      : 'bg-white text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200'
                  }`}
                >
                  Scenario: Cut Budget ₹25k → ₹18k
                </button>
                <button
                  onClick={() => setActiveScenario('rain')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeScenario === 'rain'
                      ? 'bg-violet-800 text-white shadow-card scale-[1.01]'
                      : 'bg-white text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200'
                  }`}
                >
                  Scenario: Outdoor Lawn Rainout
                </button>
                <button
                  onClick={() => setActiveScenario('guests')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeScenario === 'guests'
                      ? 'bg-violet-800 text-white shadow-card scale-[1.01]'
                      : 'bg-white text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200'
                  }`}
                >
                  Scenario: +50% Guest RSVP Surge
                </button>
              </div>

              <Badge variant="violet" size="md" className="font-bold">
                Live Interactive Sandbox
              </Badge>
            </div>

            {/* Dynamic Comparison Panel */}
            {activeScenario === 'budget' && (
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
                {/* Left: Original vs Proposed Metrics */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-charcoal-200 shadow-subtle space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                        Benchmark Case Study
                      </span>
                      <h3 className="text-xl font-black text-charcoal-900 mt-1">
                        Batch of '26 College Farewell
                      </h3>
                      <p className="text-xs text-charcoal-500 mt-0.5">100 graduating students & faculty awards</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-charcoal-100">
                      <div>
                        <span className="text-xs text-charcoal-500 font-semibold block">Original Budget</span>
                        <span className="text-2xl font-bold text-charcoal-900 line-through decoration-rose-500 decoration-2">
                          ₹25,000
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">Proposed Plan B Cap</span>
                        <span className="text-3xl font-black text-emerald-600">
                          ₹18,000
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Total Savings Achieved:</span>
                      <span>-₹7,000 (-28%)</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-charcoal-600 bg-charcoal-50 p-3 rounded-xl border border-charcoal-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Strictly capped: Exactly ₹18,000 allocated with zero rupee overrun.</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchCollegeEvent}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 py-3.5 rounded-xl shadow-card transition-all hover:scale-[1.01]"
                  >
                    <span>Launch Full Simulation in App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Concrete Plan B Changes */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                    Recommended Plan B Adjustments & Rationales
                  </h4>

                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" size="sm">Venue & Space</Badge>
                        <span className="text-sm font-bold text-charcoal-900">Relocate to Seminar Hall A</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">-₹4,000</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Relocate from paid outdoor lawn (₹6,000) to internal air-conditioned Seminar Hall A. Free hall access with nominal ₹2,000 housekeeping setup.
                    </p>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" size="sm">Catering & Food</Badge>
                        <span className="text-sm font-bold text-charcoal-900">Curated Student Snack Boxes</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">-₹1,500</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Replace open buffet (₹11,000) with sealed custom snack boxes (₹95/head = ₹9,500). Guarantees zero food wastage and eliminates catering service staff fees.
                    </p>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" size="sm">Sound & AV</Badge>
                        <span className="text-sm font-bold text-charcoal-900">Seminar Hall Sound + Wireless Mics</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">-₹1,000</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Use auditorium wall-mounted acoustic speakers; hire only 2 wireless microphones and light spots (₹2,500).
                    </p>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="slate" size="sm">Contingency Buffer</Badge>
                        <span className="text-sm font-bold text-charcoal-900">Safety Buffer</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">-₹500</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Maintained ₹1,500 cash reserve strictly for faculty honors and unexpected day-of supplies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeScenario === 'rain' && (
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-charcoal-200 shadow-subtle space-y-3">
                    <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
                      Weather Shock Contingency
                    </span>
                    <h3 className="text-xl font-black text-charcoal-900">
                      Outdoor Lawn Rain Mitigation
                    </h3>
                    <p className="text-xs text-charcoal-500">Precipitation storm forecast 6 hours prior to event</p>
                    <div className="p-3.5 bg-violet-50 rounded-xl border border-violet-200 text-xs text-violet-900 leading-relaxed">
                      <strong>Automatic Strategy:</strong> Migrates electrical connections, re-routes registration to covered foyer, and recalibrates acoustic volume for an enclosed room.
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('simulator')}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 py-3.5 rounded-xl shadow-card transition-all"
                  >
                    <span>Open in Full Simulator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-7 space-y-3">
                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-1.5">
                    <h4 className="text-sm font-bold text-charcoal-900">Immediate Action Protocol</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Zero net cost impact: Swaps outdoor lawn for pre-booked seminar hall. Eliminates costly tent canopy rentals while keeping guests completely dry.
                    </p>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-1.5">
                    <h4 className="text-sm font-bold text-charcoal-900">Sound & Electrical Safety</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Tapes down all indoor trunk cabling to prevent tripping hazards. Lowers bass amplification to eliminate indoor hall flutter echoes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeScenario === 'guests' && (
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-charcoal-200 shadow-subtle space-y-3">
                    <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
                      Scale Surge Protocol
                    </span>
                    <h3 className="text-xl font-black text-charcoal-900">
                      +50% Guest RSVP Spike
                    </h3>
                    <p className="text-xs text-charcoal-500">100 → 150 Attendees</p>
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <strong>Volume Strategy:</strong> Unlocks bulk catering tier (dropping per-head cost by 15%) and secures 50 additional banquet chairs before suppliers run dry.
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('simulator')}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 py-3.5 rounded-xl shadow-card transition-all"
                  >
                    <span>Open in Full Simulator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-7 space-y-3">
                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-1.5">
                    <h4 className="text-sm font-bold text-charcoal-900">Bulk Food Tiering</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Avoids linear price inflation by moving to wholesale snack packages, maintaining per-plate quality while protecting the budget ceiling.
                    </p>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-1.5">
                    <h4 className="text-sm font-bold text-charcoal-900">Capacity & Safety Marshalling</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Adds tasks for dual registration desks to prevent entry queues and verifies maximum permissible hall occupancy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Before & After: Traditional Planning vs PlanB AI */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            The Difference Between Hope and a Real Plan B
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base max-w-xl mx-auto">
            Traditional event planning breaks down when the unexpected occurs. PlanB AI keeps you in total control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Way */}
          <div className="bg-white p-7 rounded-3xl border border-rose-200 shadow-subtle space-y-5">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Without PlanB AI (Traditional Chaos)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-charcoal-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Budget cuts force frantic arbitrary slashes without understanding operational impact.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Vendor cancellations lead to panic calls, price gouging, and compromised quality.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Tasks scattered across messy spreadsheets, WhatsApp chats, and forgotten emails.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Organizers end up paying out-of-pocket for unexpected buffer overruns.</span>
              </li>
            </ul>
          </div>

          {/* PlanB AI Way */}
          <div className="bg-gradient-to-br from-violet-50 to-white p-7 rounded-3xl border border-violet-300 shadow-card space-y-5">
            <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-violet-700" />
              <span>With PlanB AI (Intelligent Architecture)</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-charcoal-700">
              <li className="flex items-start gap-2.5">
                <span className="text-violet-700 font-bold">•</span>
                <span>Deterministic algorithms recalculate every department while strictly respecting the new budget ceiling.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-violet-700 font-bold">•</span>
                <span>Instant pre-modeled backup workflows for weather, supplier delays, and guest surges.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-violet-700 font-bold">•</span>
                <span>Single consolidated workspace with verified checklists, assignees, and deadlines.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-violet-700 font-bold">•</span>
                <span>1-click immutable snapshot rollback allows you to experiment with zero risk.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-charcoal-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-500 bg-charcoal-100 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-extrabold text-charcoal-900">
              Everything You Need to Know About PlanB AI
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-charcoal-200 overflow-hidden transition-all bg-background"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-charcoal-900 text-sm sm:text-base hover:text-violet-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-charcoal-400 text-xl font-light">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-charcoal-600 leading-relaxed border-t border-charcoal-100/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-charcoal-900 text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Organize Your Next Event With Total Confidence?
          </h2>
          <p className="text-charcoal-300 max-w-xl mx-auto text-sm sm:text-base">
            Start organizing now, explore realistic templates, and test your contingency plans before committing a single rupee.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setCurrentTab('create-event')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold text-charcoal-900 bg-white hover:bg-charcoal-100 px-8 py-4 rounded-2xl shadow-card transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 text-violet-700" />
              <span>Create Your Event Plan</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
