export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export interface Guest {
    id: number;
    name: string;
    phone_number: string;
    group_id: number;
    number_of_guests: number;
    rsvp_status: RsvpStatus;
    invitation_sent_at?: Date | null;
    reminder_sent_at?: Date | null;
    notes?: string | null;
    created_at: Date;
}