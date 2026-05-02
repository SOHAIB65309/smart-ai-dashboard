
export type IndustryType = 'Restaurant' | 'E-commerce' | 'Staffing';
export type ErrorType = 'Expired' | 'Overcooked' | 'Size Mismatch' | 'Defective';
export type OrderStatus = 'Completed' | 'Returned' | 'Cancelled';

export interface BusinessProfile {
    id: number;
    user_id: number;
    business_name: string;
    industry_type: IndustryType;
    created_at: string;
    updated_at: string;
    
    // Relationships
    staff?: StaffMri[];
    ingredients?: Ingredient[];
    products?: Product[];
    orders?: Order[];
}

export interface StaffMri {
    id: number;
    business_id: number;
    name: string;
    role: string;
    base_quality_rating: number; // Decimal comes through as number in TS
    created_at: string;
    updated_at: string;

    // Relationships
    daily_performance_logs?: DailyPerformanceLog[];
    waste_logs?: ErrorWasteLog[];
    orders?: Order[];
}

export interface Ingredient {
    id: number;
    business_id: number;
    name: string;
    unit_cost: number;
    unit_type: string;
    min_stock_threshold: number;
    created_at: string;
    updated_at: string;

    // Relationships
    waste_logs?: ErrorWasteLog[];
}

export interface Recipe {
    id: number;
    product_name: string;
    attributes: Record<string, unknown>; // JSON column
    sale_price: number;
    created_at: string;
    updated_at: string;

    // Relationships
    details?: RecipeDetail[];
}

export interface RecipeDetail {
    id: number;
    recipe_id: number;
    ingredient_id: number;
    required_qty: number;
}

export interface DailyPerformanceLog {
    id: number;
    staff_id: number;
    tasks_started: number;
    tasks_failed: number;
    overtime_hours: number;
    created_at: string;
    updated_at: string;
}

export interface ErrorWasteLog {
    id: number;
    ingredient_id: number | null; // Nullable
    staff_id: number;
    error_type: ErrorType;
    waste_qty: number;
    financial_loss: number;
    system_reasoning: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    business_id: number;
    name: string;
    category: string;
    attributes: Record<string, unknown>; // JSON column
    customer_rating: number;
    created_at: string;
    updated_at: string;

    // Relationships
    orders?: Order[];
}

export interface Order {
    id: number;
    business_id: number;
    product_id: number;
    staff_id: number;
    status: OrderStatus;
    total_price: number;
    customer_feedback: string | null; // Nullable
    created_at: string;
    updated_at: string;
}