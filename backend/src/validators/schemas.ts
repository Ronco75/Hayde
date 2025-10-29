import { z } from 'zod';

/**
 * Category Validation Schemas
 */

// Base category schema
const categoryBaseSchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם לקטגוריה')
    .max(100, 'שם הקטגוריה ארוך מדי (מקסימום 100 תווים)')
    .trim(),
});

export const createCategorySchema = categoryBaseSchema;

export const updateCategorySchema = categoryBaseSchema.partial();

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive('מזהה הקטגוריה לא תקין'),
});

/**
 * Group Validation Schemas
 */

// Base group schema
const groupBaseSchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם לקבוצה')
    .max(100, 'שם הקבוצה ארוך מדי (מקסימום 100 תווים)')
    .trim(),
});

export const createGroupSchema = groupBaseSchema;

export const updateGroupSchema = groupBaseSchema.partial();

export const groupIdSchema = z.object({
  id: z.coerce.number().int().positive('מזהה הקבוצה לא תקין'),
});

/**
 * Expense Validation Schemas
 */

// Base expense schema
const expenseBaseSchema = z.object({
  category_id: z.number().int().positive('יש לבחור קטגוריה'),
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
});

// Create expense schema with refinement to check amount_paid doesn't exceed total cost
export const createExpenseSchema = expenseBaseSchema.refine(
  (data) => {
    const totalCost = data.price_per_unit * data.quantity;
    return data.amount_paid <= totalCost;
  },
  {
    message: 'הסכום ששולם לא יכול לעלות על העלות הכוללת',
    path: ['amount_paid'],
  }
);

export const updateExpenseSchema = expenseBaseSchema.partial().refine(
  (data) => {
    // Only validate if all necessary fields are present
    if (data.price_per_unit !== undefined && data.quantity !== undefined && data.amount_paid !== undefined) {
      const totalCost = data.price_per_unit * data.quantity;
      return data.amount_paid <= totalCost;
    }
    return true;
  },
  {
    message: 'הסכום ששולם לא יכול לעלות על העלות הכוללת',
    path: ['amount_paid'],
  }
);

export const expenseIdSchema = z.object({
  id: z.coerce.number().int().positive('מזהה ההוצאה לא תקין'),
});

/**
 * Guest Validation Schemas
 */

// RSVP status enum
export const rsvpStatusSchema = z.enum(['pending', 'confirmed', 'declined', 'maybe']);

// Phone number regex - Israeli phone format (supports 05X-XXXX-XXX and international +972)
const phoneRegex = /^(\+972|0)(5[0-9])-?[0-9]{3}-?[0-9]{4}$/;

// Base guest schema
const guestBaseSchema = z.object({
  name: z.string()
    .min(1, 'יש להזין שם אורח')
    .max(200, 'שם האורח ארוך מדי (מקסימום 200 תווים)')
    .trim(),
  phone_number: z.string()
    .min(1, 'יש להזין מספר טלפון')
    .regex(phoneRegex, 'מספר הטלפון לא תקין. נא להזין מספר כגון: 050-123-4567')
    .trim(),
  group_id: z.number().int().positive('יש לבחור קבוצה'),
  number_of_guests: z.number()
    .int('מספר האורחים חייב להיות מספר שלם')
    .min(1, 'יש להזין לפחות אורח אחד')
    .max(20, 'מספר האורחים לא יכול לעלות על 20'), // Reasonable limit for a party
  rsvp_status: rsvpStatusSchema,
  notes: z.string().max(500, 'ההערות ארוכות מדי (מקסימום 500 תווים)').optional().nullable(),
});

export const createGuestSchema = guestBaseSchema;

export const updateGuestSchema = guestBaseSchema.partial();

export const guestIdSchema = z.object({
  id: z.coerce.number().int().positive('מזהה האורח לא תקין'),
});

// RSVP status update schema (for PATCH /guests/:id/rsvp)
export const updateRsvpStatusSchema = z.object({
  rsvp_status: rsvpStatusSchema,
});

// ============= IMPORT SCHEMAS =============

/**
 * Schema for a single guest in the import confirmation request
 */
const importGuestSchema = z.object({
  groupName: z.string()
    .min(1, 'שם הקבוצה חסר')
    .max(255, 'שם הקבוצה ארוך מדי'),
  name: z.string()
    .min(1, 'שם האורח חסר')
    .max(255, 'שם האורח ארוך מדי'),
  phoneNumber: z.string()
    .min(1, 'מספר טלפון חסר')
    .regex(phoneRegex, 'מספר טלפון לא תקין'),
  numberOfGuests: z.number()
    .int('מספר האורחים חייב להיות מספר שלם')
    .min(1, 'יש להזין לפחות אורח אחד')
    .max(20, 'מספר האורחים לא יכול לעלות על 20'),
});

/**
 * Schema for the import confirmation request body
 */
export const confirmImportSchema = z.object({
  guests: z.array(importGuestSchema)
    .min(1, 'יש לשלוח לפחות מוזמן אחד'),
  replaceExisting: z.boolean().optional().default(false),
});

export type ConfirmImportInput = z.infer<typeof confirmImportSchema>;

/**
 * Type exports for use in controllers
 * These infer TypeScript types from the Zod schemas
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;
