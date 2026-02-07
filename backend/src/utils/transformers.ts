import { Decimal } from '@prisma/client/runtime/library';
import type { Decimal as DecimalType } from '@prisma/client/runtime/library';
import type { Category as PrismaCategory, Expense as PrismaExpense, Group as PrismaGroup, Guest as PrismaGuest, Wedding as PrismaWedding, Table as PrismaTable, TableAssignment as PrismaTableAssignment } from '@prisma/client';

/**
 * Utility functions to transform Prisma models (camelCase) to API responses (snake_case)
 * This ensures compatibility with the frontend which expects snake_case field names
 */

// ============= CATEGORY TRANSFORMERS =============

export interface CategoryResponse {
  id: number;
  name: string;
  created_at: string;
}

export function transformCategory(category: PrismaCategory): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    created_at: category.createdAt.toISOString(),
  };
}

export function transformCategories(categories: PrismaCategory[]): CategoryResponse[] {
  return categories.map(transformCategory);
}

// ============= GROUP TRANSFORMERS =============

export interface GroupResponse {
  id: number;
  name: string;
  created_at: string;
}

export function transformGroup(group: PrismaGroup): GroupResponse {
  return {
    id: group.id,
    name: group.name,
    created_at: group.createdAt.toISOString(),
  };
}

export function transformGroups(groups: PrismaGroup[]): GroupResponse[] {
  return groups.map(transformGroup);
}

// ============= EXPENSE TRANSFORMERS =============

export interface ExpenseResponse {
  id: number;
  category_id: number;
  name: string;
  price_per_unit: number;
  quantity: number;
  amount_paid: number;
  created_at: string;
  // Calculated fields
  total_cost: number;
  remaining_amount: number;
}

export function transformExpense(expense: PrismaExpense): ExpenseResponse {
  const pricePerUnit = expense.pricePerUnit instanceof Decimal
    ? expense.pricePerUnit.toNumber()
    : Number(expense.pricePerUnit);

  const amountPaid = expense.amountPaid instanceof Decimal
    ? expense.amountPaid.toNumber()
    : Number(expense.amountPaid);

  const totalCost = pricePerUnit * expense.quantity;
  const remainingAmount = totalCost - amountPaid;

  return {
    id: expense.id,
    category_id: expense.categoryId,
    name: expense.name,
    price_per_unit: pricePerUnit,
    quantity: expense.quantity,
    amount_paid: amountPaid,
    created_at: expense.createdAt.toISOString(),
    total_cost: totalCost,
    remaining_amount: remainingAmount,
  };
}

export function transformExpenses(expenses: PrismaExpense[]): ExpenseResponse[] {
  return expenses.map(transformExpense);
}

// ============= GUEST TRANSFORMERS =============

export interface GuestResponse {
  id: number;
  name: string;
  phone_number: string;
  group_id: number;
  number_of_guests: number;
  rsvp_status: string;
  invitation_sent_at: string | null;
  reminder_sent_at: string | null;
  notes: string | null;
  gift_amount: number;
  created_at: string;
}

export function transformGuest(guest: PrismaGuest): GuestResponse {
  // Convert Decimal gift amount to number
  const giftAmount = guest.giftAmount instanceof Decimal
    ? guest.giftAmount.toNumber()
    : guest.giftAmount ? Number(guest.giftAmount) : 0;

  return {
    id: guest.id,
    name: guest.name,
    phone_number: guest.phoneNumber,
    group_id: guest.groupId,
    number_of_guests: guest.numberOfGuests,
    rsvp_status: guest.rsvpStatus,
    invitation_sent_at: guest.invitationSentAt ? guest.invitationSentAt.toISOString() : null,
    reminder_sent_at: guest.reminderSentAt ? guest.reminderSentAt.toISOString() : null,
    notes: guest.notes,
    gift_amount: giftAmount,
    created_at: guest.createdAt.toISOString(),
  };
}

export function transformGuests(guests: PrismaGuest[]): GuestResponse[] {
  return guests.map(transformGuest);
}

// ============= GUEST STATS TRANSFORMERS =============

export interface GuestStatsResponse {
  total_guests: number;
  total_attendees: number;
  confirmed_guests: number;
  confirmed_attendees: number;
  declined_guests: number;
  pending_guests: number;
  invitations_sent: number;
  total_gifts: number;
}

export function transformGuestStats(stats: {
  total_guests: number;
  total_attendees: number;
  confirmed_guests: number;
  confirmed_attendees: number;
  declined_guests: number;
  pending_guests: number;
  invitations_sent: number;
  total_gifts: number;
}): GuestStatsResponse {
  return {
    total_guests: stats.total_guests,
    total_attendees: stats.total_attendees,
    confirmed_guests: stats.confirmed_guests,
    confirmed_attendees: stats.confirmed_attendees,
    declined_guests: stats.declined_guests,
    pending_guests: stats.pending_guests,
    invitations_sent: stats.invitations_sent,
    total_gifts: stats.total_gifts,
  };
}

// ============= WEDDING TRANSFORMERS =============

export interface WeddingResponse {
  id: number;
  user_id: number;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue: string | null;
  address: string | null;
  budget: number | null;
  invitation_image_url: string | null;
  created_at: string;
}

export function transformWedding(wedding: PrismaWedding): WeddingResponse {
  const budget = wedding.budget instanceof Decimal
    ? wedding.budget.toNumber()
    : wedding.budget ? Number(wedding.budget) : null;

  return {
    id: wedding.id,
    user_id: wedding.userId,
    bride_name: wedding.brideName,
    groom_name: wedding.groomName,
    wedding_date: wedding.weddingDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    venue: wedding.venue,
    address: wedding.address,
    budget: budget,
    invitation_image_url: wedding.invitationImageUrl,
    created_at: wedding.createdAt.toISOString(),
  };
}

// ============= TABLE TRANSFORMERS =============

export interface TableResponse {
  id: number;
  wedding_id: number;
  table_number: string;
  capacity: number;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface TableAssignmentResponse {
  id: number;
  table_id: number;
  guest_id: number;
  guest_name: string;
  number_of_guests: number;
  created_at: string;
}

export interface TableWithAssignmentsResponse extends TableResponse {
  assigned_count: number;
  available_seats: number;
  assignments: TableAssignmentResponse[];
}

export interface UnassignedGuestResponse {
  id: number;
  name: string;
  number_of_guests: number;
  group_id: number;
}

export interface SeatingOverviewResponse {
  total_tables: number;
  total_capacity: number;
  total_assigned: number;
  total_unassigned_confirmed: number;
}

export function transformTable(table: PrismaTable): TableResponse {
  return {
    id: table.id,
    wedding_id: table.weddingId,
    table_number: table.tableNumber,
    capacity: table.capacity,
    position_x: table.positionX,
    position_y: table.positionY,
    created_at: table.createdAt.toISOString(),
    updated_at: table.updatedAt.toISOString(),
  };
}

export function transformTables(tables: PrismaTable[]): TableResponse[] {
  return tables.map(transformTable);
}

/**
 * Transform a table with its assignments
 * The input should include the assignments relation with guest data
 */
export function transformTableWithAssignments(
  table: PrismaTable & {
    assignments: (PrismaTableAssignment & {
      guest: { id: number; name: string; numberOfGuests: number };
    })[];
  }
): TableWithAssignmentsResponse {
  const assignments = table.assignments.map((a) => ({
    id: a.id,
    table_id: a.tableId,
    guest_id: a.guestId,
    guest_name: a.guest.name,
    number_of_guests: a.guest.numberOfGuests,
    created_at: a.createdAt.toISOString(),
  }));

  const assignedCount = assignments.reduce((sum, a) => sum + a.number_of_guests, 0);

  return {
    ...transformTable(table),
    assigned_count: assignedCount,
    available_seats: table.capacity - assignedCount,
    assignments,
  };
}

export function transformTablesWithAssignments(
  tables: (PrismaTable & {
    assignments: (PrismaTableAssignment & {
      guest: { id: number; name: string; numberOfGuests: number };
    })[];
  })[]
): TableWithAssignmentsResponse[] {
  return tables.map(transformTableWithAssignments);
}

export function transformUnassignedGuest(guest: PrismaGuest): UnassignedGuestResponse {
  return {
    id: guest.id,
    name: guest.name,
    number_of_guests: guest.numberOfGuests,
    group_id: guest.groupId,
  };
}

export function transformUnassignedGuests(guests: PrismaGuest[]): UnassignedGuestResponse[] {
  return guests.map(transformUnassignedGuest);
}
