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

/**
 * Strips potentially dangerous script tags, executable HTML, and leading/trailing whitespace.
 */
export function sanitizeTextInput(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Validates an expense item entry
 */
export function validateExpenseItem(data: { name: string; allocatedAmount: number | string; category: string }): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Item title must be at least 2 characters';
  } else if (data.name.trim().length > 80) {
    errors.name = 'Item title must be under 80 characters';
  }

  const numericAllocated = Number(data.allocatedAmount);
  if (isNaN(numericAllocated) || numericAllocated < 0) {
    errors.allocatedAmount = 'Allocated amount must be a non-negative number';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a task or operational milestone
 */
export function validateTaskItem(data: { title: string; dueDate?: string }): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 2) {
    errors.title = 'Milestone title must be at least 2 characters';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Milestone title must be under 120 characters';
  }

  if (data.dueDate) {
    const parsedDate = new Date(data.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.dueDate = 'Please provide a valid deadline date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a contractor or vendor record
 */
export function validateVendorItem(data: { name: string; quotedAmount?: number | string; email?: string; phone?: string }): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Vendor name must be at least 2 characters';
  }

  if (data.quotedAmount !== undefined && data.quotedAmount !== '') {
    const numericQuote = Number(data.quotedAmount);
    if (isNaN(numericQuote) || numericQuote < 0) {
      errors.quotedAmount = 'Quoted price must be 0 or higher';
    }
  }

  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
