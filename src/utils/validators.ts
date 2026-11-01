export interface EventFormData {
  name: string;
  type: string;
  date: string;
  time?: string;
  location: string;
  guestCount: number | string;
  totalBudget: number | string;
  venuePreference: string;
  theme?: string;
  notes?: string;
}

export interface ValidationErrors {
  name?: string;
  type?: string;
  date?: string;
  location?: string;
  guestCount?: string;
  totalBudget?: string;
  venuePreference?: string;
}

export function validateEventForm(data: EventFormData): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Event name is required (minimum 3 characters)';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Event name must be under 100 characters';
  }

  if (!data.type) {
    errors.type = 'Please select an event type';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  } else {
    // Check if date is valid
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      errors.date = 'Please provide a valid date';
    }
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Location is required (e.g., city, venue name or campus)';
  }

  const numericGuests = Number(data.guestCount);
  if (isNaN(numericGuests) || numericGuests <= 0) {
    errors.guestCount = 'Guest count must be at least 1 attendee';
  } else if (numericGuests > 50000) {
    errors.guestCount = 'Guest count cannot exceed 50,000 for standard planning';
  }

  const numericBudget = Number(data.totalBudget);
  if (isNaN(numericBudget) || numericBudget <= 0) {
    errors.totalBudget = 'Total budget must be a positive amount in INR (₹)';
  } else if (numericBudget < 1000) {
    errors.totalBudget = 'Minimum event budget is ₹1,000';
  }

  if (!data.venuePreference) {
    errors.venuePreference = 'Please select a venue preference (indoor, outdoor, or hybrid)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
