import { z } from 'zod';

/**
 * Category Validation Schemas
 */
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם לקטגוריה')
    .max(100, 'שם הקטגוריה ארוך מדי (מקסימום 100 תווים)')
    .trim(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Group Validation Schemas
 */
export const groupSchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם לקבוצה')
    .max(100, 'שם הקבוצה ארוך מדי (מקסימום 100 תווים)')
    .trim(),
});

export type GroupFormData = z.infer<typeof groupSchema>;

/**
 * Expense Validation Schemas
 */
export const expenseSchema = z.object({
  category_id: z.number()
    .int()
    .positive('יש לבחור קטגוריה'),

  name: z.string()
    .min(1, 'יש להזין שם להוצאה')
    .max(200, 'שם ההוצאה ארוך מדי (מקסימום 200 תווים)')
    .trim(),

  price_per_unit: z.number()
    .nonnegative('המחיר ליחידה חייב להיות חיובי')
    .finite('יש להזין מחיר תקין'),

  quantity: z.number()
    .int('הכמות חייבת להיות מספר שלם')
    .positive('יש להזין כמות של לפחות 1'),

  amount_paid: z.number()
    .nonnegative('הסכום ששולם חייב להיות חיובי')
    .finite('יש להזין סכום תקין'),
}).refine(
  (data) => {
    const totalCost = data.price_per_unit * data.quantity;
    return data.amount_paid <= totalCost;
  },
  {
    message: 'הסכום ששולם לא יכול לעלות על העלות הכוללת',
    path: ['amount_paid'],
  }
);

export type ExpenseFormData = z.infer<typeof expenseSchema>;

/**
 * Guest Validation Schemas
 */

// RSVP status enum
export const rsvpStatusEnum = z.enum(['pending', 'confirmed', 'declined', 'maybe'], {
  message: 'סטטוס RSVP לא תקין',
});

// Phone number regex - Israeli phone format
const phoneRegex = /^(\+972|0)(5[0-9])-?[0-9]{3}-?[0-9]{4}$/;

export const guestSchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם אורח')
    .max(200, 'שם האורח ארוך מדי (מקסימום 200 תווים)')
    .trim(),

  phone_number: z.string()
    .min(1, 'יש להזין מספר טלפון')
    .regex(phoneRegex, 'מספר הטלפון לא תקין. נא להזין מספר כגון: 050-123-4567')
    .trim(),

  group_id: z.number()
    .int()
    .positive('יש לבחור קבוצה'),

  number_of_guests: z.number()
    .int('מספר האורחים חייב להיות מספר שלם')
    .min(1, 'יש להזין לפחות אורח אחד')
    .max(20, 'מספר האורחים לא יכול לעלות על 20'),

  rsvp_status: rsvpStatusEnum,

  notes: z.string()
    .max(500, 'ההערות ארוכות מדי (מקסימום 500 תווים)')
    .optional(),
});

export type GuestFormData = z.infer<typeof guestSchema>;

/**
 * Partial schema for updating guests (all fields optional except those being updated)
 */
export const updateGuestSchema = guestSchema.partial();

export type UpdateGuestFormData = z.infer<typeof updateGuestSchema>;
