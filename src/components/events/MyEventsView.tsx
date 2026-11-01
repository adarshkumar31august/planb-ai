import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  Search,
  Filter
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatINR, calculateTotalAllocated } from '../../utils/budgetCalculations';

export const MyEventsView: React.FC = () => {
  const { events, selectEvent, setCurrentTab, deleteEvent } = useEvent();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || evt.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-charcoal-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900">My Planned Celebrations</h1>
            <Badge variant="violet" size="sm">{events.length} Events Total</Badge>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Access your active events, review budget breakdowns, and stress-test backup plans.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('create-event')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-charcoal-200 shadow-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event name or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-violet-600 border border-charcoal-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-charcoal-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-violet-600 bg-white"
          >
            <option value="all">All Types</option>
            <option value="college">College Events</option>
            <option value="birthday">Birthdays</option>
            <option value="wedding">Weddings</option>
            <option value="family">Family Gatherings</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-charcoal-200 text-charcoal-400">
            No events found matching your search.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const allocated = calculateTotalAllocated(evt.expenses);
            const isOverBudget = allocated > evt.totalBudget;

            return (
              <Card
                key={evt.id}
                className="p-6 flex flex-col justify-between hover:border-violet-300 hover:shadow-card transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={evt.type === 'college' ? 'violet' : evt.type === 'wedding' ? 'amber' : 'slate'} size="sm">
                      {evt.type.toUpperCase()}
                    </Badge>
                    {evt.activeBackupPlan ? (
                      <Badge variant="emerald" size="sm">Plan B Active</Badge>
                    ) : (
                      <Badge variant="slate" size="sm">v{evt.currentPlanVersion}.0</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900 line-clamp-1">{evt.name}</h3>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-charcoal-50 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-charcoal-400 block text-[11px]">Event Date</span>
                      <span className="font-semibold text-charcoal-800">{evt.date}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[11px]">Guest Count</span>
                      <span className="font-semibold text-charcoal-800">{evt.guestCount} Attendees</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-charcoal-400 block text-[11px]">Total Budget</span>
                      <span className="font-extrabold text-charcoal-900 text-sm">
                        {formatINR(evt.totalBudget)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-charcoal-400 block text-[11px]">Allocated</span>
                      <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatINR(allocated)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-charcoal-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      selectEvent(evt.id);
                      setCurrentTab('event-detail');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-800 hover:text-violet-950"
                  >
                    <span>View Plan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        selectEvent(evt.id);
                        setCurrentTab('simulator');
                      }}
                      title="Run Simulator"
                      className="p-1.5 rounded-lg text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(evt.id)}
                      title="Delete Event"
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
