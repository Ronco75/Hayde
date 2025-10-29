import * as XLSX from 'xlsx';

/**
 * Interface for a raw row from the Excel file
 * This represents the structure we expect in the uploaded Excel
 * 
 * Hebrew column names (as they appear in Excel):
 * - שם קבוצה (Group Name)
 * - שם (Guest Name)  
 * - טלפון (Phone Number)
 * - מספר מוזמנים (Number of Guests)
 */
export interface ExcelGuestRow {
  'שם קבוצה': string;
  'שם': string;
  'טלפון': string;
  'מספר מוזמנים': number;
}

/**
 * Interface for parsed guest data after processing
 * This is the clean, normalized format we'll work with
 */
export interface ParsedGuest {
  groupName: string;
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  rowNumber: number; // Track row number for error reporting
}

/**
 * Result of parsing the Excel file
 */
export interface ParseResult {
  guests: ParsedGuest[];
  errors: Array<{
    row: number;
    field: string;
    value: any;
    message: string;
  }>;
}

/**
 * Parse Excel file buffer and extract guest data
 * 
 * This function:
 * 1. Reads the Excel file from a Buffer (provided by multer)
 * 2. Extracts the first sheet
 * 3. Converts sheet data to JSON
 * 4. Validates and normalizes each row
 * 5. Returns both valid guests and any errors found
 * 
 * @param buffer - The Excel file as a Buffer (from multer's memoryStorage)
 * @returns ParseResult with valid guests and any errors
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
  try {
    // Step 1: Read the workbook from buffer
    // XLSX.read() can handle various formats (xlsx, xls, etc.)
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Step 2: Get the first sheet
    // workbook.SheetNames is an array of sheet names
    const firstSheetName = workbook.SheetNames[0];
    
    if (!firstSheetName) {
      throw new Error('קובץ האקסל ריק - אין גליונות');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Step 3: Convert sheet to JSON
    // XLSX.utils.sheet_to_json() converts the sheet to an array of objects
    // Each row becomes an object with column headers as keys
    const rawData = XLSX.utils.sheet_to_json<ExcelGuestRow>(worksheet);

    if (rawData.length === 0) {
      throw new Error('קובץ האקסל ריק - אין שורות נתונים');
    }

    // Step 4: Parse and validate each row
    const guests: ParsedGuest[] = [];
    const errors: ParseResult['errors'] = [];

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have a header row

      // Validate and normalize the row
      const parsedGuest = validateAndNormalizeRow(row, rowNumber);

      if (parsedGuest.isValid) {
        guests.push(parsedGuest.guest!);
      } else {
        errors.push(...parsedGuest.errors);
      }
    });

    return { guests, errors };

  } catch (error) {
    // If XLSX itself fails to read the file
    if (error instanceof Error) {
      throw new Error(`שגיאה בקריאת קובץ האקסל: ${error.message}`);
    }
    throw new Error('שגיאה לא צפויה בקריאת קובץ האקסל');
  }
}

/**
 * Validate and normalize a single row from the Excel file
 * 
 * This function checks:
 * - All required fields are present and not empty
 * - Phone number format is valid
 * - Number of guests is a positive integer
 * 
 * @param row - Raw row data from Excel
 * @param rowNumber - Row number for error reporting
 * @returns Object with validation result
 */
function validateAndNormalizeRow(
  row: ExcelGuestRow,
  rowNumber: number
): {
  isValid: boolean;
  guest?: ParsedGuest;
  errors: ParseResult['errors'];
} {
  const errors: ParseResult['errors'] = [];

  // Extract and trim values
  const groupName = String(row['שם קבוצה'] || '').trim();
  const name = String(row['שם'] || '').trim();
  const phoneNumber = String(row['טלפון'] || '').trim();
  const numberOfGuests = row['מספר מוזמנים'];

  // Validate group name
  if (!groupName) {
    errors.push({
      row: rowNumber,
      field: 'שם קבוצה',
      value: row['שם קבוצה'],
      message: 'שם הקבוצה חסר',
    });
  }

  // Validate guest name
  if (!name) {
    errors.push({
      row: rowNumber,
      field: 'שם',
      value: row['שם'],
      message: 'שם האורח חסר',
    });
  }

  // Validate phone number
  if (!phoneNumber) {
    errors.push({
      row: rowNumber,
      field: 'טלפון',
      value: row['טלפון'],
      message: 'מספר הטלפון חסר',
    });
  } else if (!isValidIsraeliPhone(phoneNumber)) {
    errors.push({
      row: rowNumber,
      field: 'טלפון',
      value: phoneNumber,
      message: 'מספר טלפון לא תקין (צריך להיות בפורמט: 050-123-4567)',
    });
  }

  // Validate number of guests
  if (numberOfGuests === undefined || numberOfGuests === null) {
    errors.push({
      row: rowNumber,
      field: 'מספר מוזמנים',
      value: row['מספר מוזמנים'],
      message: 'מספר המוזמנים חסר',
    });
  } else if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1) {
    errors.push({
      row: rowNumber,
      field: 'מספר מוזמנים',
      value: numberOfGuests,
      message: 'מספר המוזמנים חייב להיות מספר שלם חיובי',
    });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // All validations passed - return the normalized guest
  return {
    isValid: true,
    guest: {
      groupName,
      name,
      phoneNumber: normalizePhoneNumber(phoneNumber),
      numberOfGuests,
      rowNumber,
    },
    errors: [],
  };
}

/**
 * Validate Israeli phone number format
 * 
 * Accepts formats like:
 * - 050-123-4567
 * - 0501234567
 * - +972-50-123-4567
 * - +972501234567
 * 
 * @param phone - Phone number string
 * @returns true if valid format
 */
function isValidIsraeliPhone(phone: string): boolean {
  // Remove all spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it matches Israeli phone patterns
  const patterns = [
    /^0(5[0-9])[0-9]{7}$/, // 05XXXXXXXX
    /^\+972(5[0-9])[0-9]{7}$/, // +97205XXXXXXXX
  ];

  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Normalize phone number to consistent format: 050-123-4567
 * 
 * Takes various formats and converts to standard format
 * 
 * @param phone - Phone number string
 * @returns Normalized phone number
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');

  // Convert +972 to 0
  if (cleaned.startsWith('+972')) {
    cleaned = '0' + cleaned.substring(4);
  }

  // Format as XXX-XXX-XXXX
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  // If we can't normalize, return as-is (validation should catch this)
  return phone;
}