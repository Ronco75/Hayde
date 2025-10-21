export interface Expense {
    id: number;
    category_id: number;
    name: string;
    price_per_unit: number;
    quantity: number;
    amount_paid: number;
    created_at: Date;
    
    // Calculated fields (returned by API)
    total_cost?: number;
    remaining_amount?: number;
}