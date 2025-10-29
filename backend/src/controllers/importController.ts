import { Request, Response } from 'express';
import prisma from '../config/db';
import { parseExcelFile, ParsedGuest } from '../utils/excelParser';
import { AppError } from '../errors/customErrors';

/**
 * Preview/Analyze uploaded Excel file
 * POST /api/import/preview
 * 
 * This endpoint:
 * 1. Receives an Excel file (via multer middleware)
 * 2. Parses and validates the file
 * 3. Checks for duplicates against existing guests in DB
 * 4. Returns categorized results (valid, duplicates, errors)
 * 
 * IMPORTANT: This does NOT save any data to DB!
 * It's only for preview/analysis before user confirms import.
 */
export const previewImport = async (req: Request, res: Response) => {
  try {
    // Step 1: Check if file was uploaded
    if (!req.file) {
      throw new AppError('לא הועלה קובץ', 400);
    }

    // Step 2: Parse the Excel file
    // req.file.buffer contains the file data (thanks to memoryStorage)
    const { guests, errors } = parseExcelFile(req.file.buffer);

    // Step 3: Check for duplicates
    // We need to check if any phone numbers already exist in DB
    const phoneNumbers = guests.map(g => g.phoneNumber);

    // Query DB for existing guests with these phone numbers
    const existingGuests = await prisma.guest.findMany({
      where: {
        phoneNumber: {
          in: phoneNumbers,
        },
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        numberOfGuests: true,
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create a Set of existing phone numbers for fast lookup
    const existingPhoneSet = new Set(
      existingGuests.map(g => g.phoneNumber)
    );

    // Separate guests into valid (new) and duplicates
    const validGuests: ParsedGuest[] = [];
    const duplicates: Array<{
      newGuest: ParsedGuest;
      existingGuest: typeof existingGuests[0];
    }> = [];

    guests.forEach(guest => {
      if (existingPhoneSet.has(guest.phoneNumber)) {
        // This is a duplicate!
        const existing = existingGuests.find(
          eg => eg.phoneNumber === guest.phoneNumber
        );
        if (existing) {
          duplicates.push({
            newGuest: guest,
            existingGuest: existing,
          });
        }
      } else {
        // This is a new guest
        validGuests.push(guest);
      }
    });

    // Step 4: Return results
    res.json({
      summary: {
        total: guests.length + errors.length,
        valid: validGuests.length,
        duplicates: duplicates.length,
        errors: errors.length,
      },
      valid: validGuests,
      duplicates,
      errors,
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle multer errors
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        throw new AppError('הקובץ גדול מדי - מקסימום 5MB', 400);
      }
      if (error.message.includes('רק קבצי Excel')) {
        throw new AppError(error.message, 400);
      }
      throw new AppError(`שגיאה בעיבוד הקובץ: ${error.message}`, 500);
    }

    throw new AppError('שגיאה לא צפויה בעיבוד הקובץ', 500);
  }
};

/**
 * Interface for guest data coming from frontend after user confirms
 */
interface GuestToImport {
  groupName: string;
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
}

/**
 * Confirm and execute the import
 * POST /api/import/confirm
 * 
 * This endpoint:
 * 1. Receives a list of guests to import (after user reviewed and confirmed)
 * 2. Creates groups if they don't exist
 * 3. Creates/updates guests in DB
 * 4. Returns success/failure results
 * 
 * Body: { guests: GuestToImport[], replaceExisting: boolean }
 */
export const confirmImport = async (req: Request, res: Response) => {
  try {
    const { guests, replaceExisting = false } = req.body as {
      guests: GuestToImport[];
      replaceExisting?: boolean;
    };

    // Validate input
    if (!Array.isArray(guests) || guests.length === 0) {
      throw new AppError('לא נשלחו מוזמנים לייבוא', 400);
    }

    // Step 1: Get or create groups
    // Extract unique group names
    const uniqueGroupNames = Array.from(
      new Set(guests.map(g => g.groupName))
    );

    // Find existing groups
    const existingGroups = await prisma.group.findMany({
      where: {
        name: {
          in: uniqueGroupNames,
        },
      },
    });

    // Create a map for quick lookup: groupName -> groupId
    const groupMap = new Map(
      existingGroups.map(g => [g.name, g.id])
    );

    // Create missing groups
    const groupsToCreate = uniqueGroupNames.filter(
      name => !groupMap.has(name)
    );

    if (groupsToCreate.length > 0) {
      // Create all missing groups in one transaction
      const createdGroups = await Promise.all(
        groupsToCreate.map(name =>
          prisma.group.create({
            data: { name },
          })
        )
      );

      // Add newly created groups to the map
      createdGroups.forEach(g => groupMap.set(g.name, g.id));
    }

    // Step 2: Import guests
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ guest: string; error: string }>,
    };

    // Process each guest
    for (const guest of guests) {
      try {
        const groupId = groupMap.get(guest.groupName);
        
        if (!groupId) {
          throw new Error('לא נמצאה קבוצה');
        }

        // Check if guest exists
        const existing = await prisma.guest.findFirst({
          where: { phoneNumber: guest.phoneNumber },
        });

        if (existing) {
          if (replaceExisting) {
            // Update existing guest
            await prisma.guest.update({
              where: { id: existing.id },
              data: {
                name: guest.name,
                groupId,
                numberOfGuests: guest.numberOfGuests,
              },
            });
            results.updated++;
          } else {
            // Skip duplicate
            results.failed++;
            results.errors.push({
              guest: guest.name,
              error: 'כבר קיים במערכת',
            });
          }
        } else {
          // Create new guest
          await prisma.guest.create({
            data: {
              name: guest.name,
              phoneNumber: guest.phoneNumber,
              groupId,
              numberOfGuests: guest.numberOfGuests,
              rsvpStatus: 'pending',
            },
          });
          results.created++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          guest: guest.name,
          error: error instanceof Error ? error.message : 'שגיאה לא ידועה',
        });
      }
    }

    res.json({
      success: true,
      message: `ייבוא הושלם: ${results.created} נוצרו, ${results.updated} עודכנו, ${results.failed} נכשלו`,
      results,
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      error instanceof Error ? error.message : 'שגיאה בייבוא המוזמנים',
      500
    );
  }
};