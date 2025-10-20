export interface Category {
    id: number;
    name: string;
    created_at: string;
  }
  
  export interface Expense {
    id: number;
    category_id: number;
    name: string;
    price_per_unit: string;
    quantity: number;
    amount_paid: string;
    created_at: string;
    total_cost: string;
    remaining_amount: string;
  }

  export interface CategoryTotals {
    category_id: number;
    total_cost: string;
    amount_paid: string;
    remaining_amount: string;
  }