import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { EventModel, EventType, VenuePreference } from '../../types';
import { Save } from 'lucide-react';
import { sanitizeTextInput } from '../../utils/validators';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventModel;
  onSave: (updates: Partial<EventModel>) => Promise<void>;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: EventType;
    date: string;
    time: string;
    location: string;
    guestCount: number;
    totalBudget: number;
    venuePreference: VenuePreference;
    theme: string;
    notes: string;
  }>({
    name: '',
    type: 'college',
    date: '',
    time: '',
    location: '',
    guestCount: 100,
    totalBudget: 25000,
    venuePreference: 'outdoor',
    theme: '',
    notes: '',
  });

  useEffect(() => {
    if (event) {
      setEditForm({
        name: event.name,
        type: event.type,
        date: event.date,
        time: event.time || '',
        location: event.location,
        guestCount: event.guestCount,
        totalBudget: event.totalBudget,
        venuePreference: event.venuePreference,
        theme: event.theme || '',
        notes: event.notes || '',
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.date || editForm.guestCount <= 0 || editForm.totalBudget <= 0) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name: sanitizeTextInput(editForm.name),
        type: editForm.type,
        date: editForm.date,
        time: sanitizeTextInput(editForm.time),
        location: sanitizeTextInput(editForm.location),
        guestCount: Number(editForm.guestCount),
        totalBudget: Number(editForm.totalBudget),
        venuePreference: editForm.venuePreference,
        theme: sanitizeTextInput(editForm.theme),
        notes: sanitizeTextInput(editForm.notes),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event Baseline"
      subtitle="Update event parameters, venue logistics, and budget ceiling."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="edit-event-name" className="text-xs font-semibold text-charcoal-800">
              Event Title *
            </label>
            <input
              id="edit-event-name"
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-type" className="text-xs font-semibold text-charcoal-800">
              Event Type
            </label>
            <select
              id="edit-event-type"
              value={editForm.type}
              onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as EventType }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            >
              <option value="college">College Event / Farewell</option>
              <option value="birthday">Birthday Party</option>
              <option value="wedding">Wedding / Reception</option>
              <option value="corporate">Corporate Gala</option>
              <option value="family">Family Celebration</option>
              <option value="other">Other Celebration</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-date" className="text-xs font-semibold text-charcoal-800">
              Target Date *
            </label>
            <input
              id="edit-event-date"
              type="date"
              required
              value={editForm.date}
              onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-time" className="text-xs font-semibold text-charcoal-800">
              Timings
            </label>
            <input
              id="edit-event-time"
              type="text"
              value={editForm.time}
              onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
              placeholder="e.g. 16:00 - 20:30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-location" className="text-xs font-semibold text-charcoal-800">
              Location / Venue
            </label>
            <input
              id="edit-event-location"
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-guests" className="text-xs font-semibold text-charcoal-800">
              Expected Guests *
            </label>
            <input
              id="edit-event-guests"
              type="number"
              min="1"
              required
              value={editForm.guestCount}
              onChange={(e) => setEditForm(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-event-budget" className="text-xs font-semibold text-charcoal-800">
              Total Budget (₹ INR) *
            </label>
            <input
              id="edit-event-budget"
              type="number"
              min="1000"
              step="500"
              required
              value={editForm.totalBudget}
              onChange={(e) => setEditForm(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-charcoal-800 block">
              Venue Preference
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Venue Preference">
              {[
                { value: 'outdoor', label: 'Outdoor' },
                { value: 'indoor', label: 'Indoor' },
                { value: 'hybrid', label: 'Hybrid' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={editForm.venuePreference === opt.value}
                  onClick={() => setEditForm(prev => ({ ...prev, venuePreference: opt.value as VenuePreference }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                    editForm.venuePreference === opt.value
                      ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold ring-1 ring-violet-600'
                      : 'border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="edit-event-theme" className="text-xs font-semibold text-charcoal-800">
              Theme / Dress Code
            </label>
            <input
              id="edit-event-theme"
              type="text"
              value={editForm.theme}
              onChange={(e) => setEditForm(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="e.g. Retro Bollywood"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="edit-event-notes" className="text-xs font-semibold text-charcoal-800">
              Notes & Special Directives
            </label>
            <textarea
              id="edit-event-notes"
              rows={2}
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
