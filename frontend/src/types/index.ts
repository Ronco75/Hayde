//Types for Categories
export interface Category {
    id: number;
    name: string;
    created_at: string;
  }
  
  //Types for Expenses
  export interface Expense {
    id: number;
    category_id: number;
    name: string;
    price_per_unit: string;
    quantity: number;
    amount_paid: string;
    created_at: string;

    //Calculated fields
    total_cost?: string;
    remaining_amount?: string;
  }

  //Types for Category Totals
  export interface CategoryTotals {
    category_id: number;
    total_cost: string;
    amount_paid: string;
    remaining_amount: string;
  }

  //Types for Groups
  export interface Group {
    id: number;
    name: string;
    created_at: string;
  }

  //Types for Guests
  export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

  export interface Guest {
    id: number;
    name: string;
    phone_number: string;
    group_id: number;
    number_of_guests: number;
    rsvp_status: RsvpStatus;
    invitation_sent_at?: string | null;
    reminder_sent_at?: string | null;
    notes?: string | null;
    created_at: string;
  }
  
  //Types for Guest Stats
  export interface GuestStats {
    total_guests: number;
    total_attendees: number;
    confirmed_guests: number;
    confirmed_attendees: number;
    declined_guests: number;
    pending_guests: number;
    invitations_sent: number;
  }

  // ============ DTOs ============
  // ============ Expense DTOs ============
  // For creating a new expense
  export interface CreateExpenseDto {
    category_id: number;
    name: string;
    price_per_unit: string;
    quantity?: number;
    amount_paid?: string;
  }
  
  // For updating an expense
  export interface UpdateExpenseDto {
    category_id: number;
    name: string;
    price_per_unit: string;
    quantity: number;
    amount_paid: string;
  }

  // ============ Category DTOs ============
// For creating a new category
export interface CreateCategoryDto {
  name: string;
}

// For updating a category
export interface UpdateCategoryDto {
  name: string;
}

// ============ Group DTOs ============
export interface CreateGroupDto {
  name: string;
}

// For updating a group
export interface UpdateGroupDto {
  name: string;
}

// ============ Guest DTOs ============
// For creating a new guest
export interface CreateGuestDto {
  name: string;
  phone_number: string;
  group_id: number;
  number_of_guests?: number;
  notes?: string;
}

// For updating a guest
export interface UpdateGuestDto {
  name: string;
  phone_number: string;
  group_id: number;
  number_of_guests: number;
  rsvp_status: RsvpStatus;
  notes?: string;
}

// For updating only RSVP status
export interface UpdateRsvpDto {
  rsvp_status: RsvpStatus;
}