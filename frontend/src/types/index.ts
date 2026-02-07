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
    expense_count?: number;
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
    gift_amount: number;
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
    total_gifts: number;
  }

  //Types for Import
  export interface ImportPreviewResponse {
    summary: {
      total: number;
      valid: number;
      duplicates: number;
      errors: number;
    };
    valid: ParsedGuest[];
    duplicates: Array<{
      newGuest: ParsedGuest;
      existingGuest: Guest;
    }>;
    errors: Array<{
      row: number;
      field: string;
      value: any;
      message: string;
    }>;
  }

  export interface ImportConfirmRequest {
    guests: GuestToImport[];
    replaceExisting: boolean;
  }

  export interface ImportConfirmResponse {
    success: boolean;
    message: string;
    results: {
      created: number;
      updated: number;
      failed: number;
    };
  }

  // Types for Guest to Import
export interface GuestToImport {
  groupName: string;
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
}

// Guest parsed from Excel (before saving)
export interface ParsedGuest {
  groupName: string;
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  rowNumber: number;
}


  // ========================= DTOs =========================
  // ============ Expense DTOs ============
  // For creating a new expense
  export interface CreateExpenseDto {
    category_id: number;
    name: string;
    price_per_unit: number;
    quantity?: number;
    amount_paid?: number;
  }

  // For updating an expense
  export interface UpdateExpenseDto {
    category_id: number;
    name: string;
    price_per_unit: number;
    quantity: number;
    amount_paid: number;
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
  rsvp_status?: RsvpStatus;
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

// For updating gift amount
export interface UpdateGiftAmountDto {
  gift_amount: number;
}

// ============ Bulk Guest DTOs ============
// For bulk deleting guests
export interface BulkDeleteGuestsDto {
  ids: number[];
}

// For bulk updating RSVP status
export interface BulkUpdateRsvpDto {
  ids: number[];
  rsvp_status: RsvpStatus;
}

// For bulk updating group
export interface BulkUpdateGroupDto {
  ids: number[];
  group_id: number;
}

// Bulk operation response
export interface BulkOperationResponse {
  deleted?: number;
  updated?: number;
  message: string;
}

// ========================= Authentication & Wedding Types =========================
// User (authenticated user)
export interface User {
  id: number;
  email: string;
  created_at: string;
}

// Wedding (user's wedding details)
export interface Wedding {
  id: number;
  user_id: number;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue?: string | null;
  address?: string | null;
  budget?: number | null;
  invitation_image_url?: string | null;
  created_at: string;
}

// ============ Auth DTOs ============
// For login
export interface LoginDto {
  email: string;
  password: string;
}

// For registration
export interface RegisterDto {
  email: string;
  password: string;
}

// Auth response from backend
export interface AuthResponse {
  token: string;
  user: User;
}

// ============ Password Reset DTOs ============
// For forgot password request
export interface ForgotPasswordDto {
  email: string;
}

// For reset password request
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// Response from verify reset token endpoint
export interface VerifyTokenResponse {
  valid: boolean;
  message: string;
  expiresAt?: string;
}

// ============ Wedding DTOs ============
// For creating a new wedding
export interface CreateWeddingDto {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue?: string;
  address?: string;
  budget?: number;
}

// For updating wedding details
export interface UpdateWeddingDto {
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  venue?: string;
  address?: string;
  budget?: number;
}

// Image upload response
export interface ImageUploadResponse {
  message: string;
  imageUrl: string;
  wedding: Wedding;
}

// ========================= Seating Types =========================
// Table entity
export interface Table {
  id: number;
  wedding_id: number;
  table_number: string;
  capacity: number;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

// Table assignment
export interface TableAssignment {
  id: number;
  table_id: number;
  guest_id: number;
  guest_name: string;
  number_of_guests: number;
  created_at: string;
}

// Table with assigned guests
export interface TableWithAssignments extends Table {
  assigned_count: number;
  available_seats: number;
  assignments: TableAssignment[];
}

// Unassigned guest (simplified for pool)
export interface UnassignedGuest {
  id: number;
  name: string;
  number_of_guests: number;
  group_id: number;
}

// Seating overview stats
export interface SeatingOverview {
  total_tables: number;
  total_capacity: number;
  total_assigned: number;
  total_unassigned_confirmed: number;
}

// ============ Table DTOs ============
// For creating a new table
export interface CreateTableDto {
  table_number: string;
  capacity?: 12 | 24;
  position_x?: number;
  position_y?: number;
}

// For updating a table
export interface UpdateTableDto {
  table_number?: string;
  capacity?: 12 | 24;
  position_x?: number;
  position_y?: number;
}

// For updating table position only
export interface UpdateTablePositionDto {
  position_x: number;
  position_y: number;
}

// For assigning a guest to a table
export interface AssignGuestDto {
  guest_id: number;
}