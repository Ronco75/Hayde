import { Decimal } from '@prisma/client/runtime/library';
import type { Category as PrismaCategory, Expense as PrismaExpense, Group as PrismaGroup, Guest as PrismaGuest } from '@prisma/client';

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
  created_at: string;
}

export function transformGuest(guest: PrismaGuest): GuestResponse {
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
}

export function transformGuestStats(stats: {
  total_guests: number;
  total_attendees: number;
  confirmed_guests: number;
  confirmed_attendees: number;
  declined_guests: number;
  pending_guests: number;
  invitations_sent: number;
}): GuestStatsResponse {
  return {
    total_guests: stats.total_guests,
    total_attendees: stats.total_attendees,
    confirmed_guests: stats.confirmed_guests,
    confirmed_attendees: stats.confirmed_attendees,
    declined_guests: stats.declined_guests,
    pending_guests: stats.pending_guests,
    invitations_sent: stats.invitations_sent,
  };
}
