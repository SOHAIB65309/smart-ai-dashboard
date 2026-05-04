// Enums matching Laravel Migration Schema
export type IndustryType = 'Restaurant' | 'E-commerce' | 'Staffing';
export type ErrorType = 'Expired' | 'Overcooked' | 'Size Mismatch' | 'Defective' | 'Prep Error';
export type OrderStatus = 'Completed' | 'Returned' | 'Cancelled';

// Dashboard Specific Types
export interface DynamicInsight {
    id: number;
    title: string;
    suggestion: string;
    context: string;
    isRejected: boolean;
    reason: string;
    proof: string;
    type: string;
}

export interface IndustryMetrics {
    totalLoss: number;
    averageFatigue: number;
    anomalyCount: number;
}

// Core Business Models
export interface BusinessProfile {
    id: number;
    user_id: number;
    business_name: string;
    industry_type: IndustryType;
    created_at: string;
    updated_at: string;
    
    // Relationships (Loaded via Controller)
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
    base_quality_rating: number; 
    created_at: string;
    updated_at: string;

    // Relationships
    performance_logs?: DailyPerformanceLog[];
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

export interface Product {
    id: number;
    business_id: number;
    name: string;
    category: string;
    attributes: Record<string, any>; // JSON column
    customer_rating: number;
    created_at: string;
    updated_at: string;

    // Relationships
    orders?: Order[];
    waste_logs?: ErrorWasteLog[]; // Trace product-specific defects/returns
}

export interface Order {
    id: number;
    business_id: number;
    product_id: number;
    staff_id: number;
    status: OrderStatus;
    total_price: number;
    customer_feedback: string | null;
    created_at: string;
    updated_at: string;
}

// Log and Detail Models
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
    staff_id: number;
    // Polymorphic keys based on Industry
    ingredient_id: number | null; 
    product_id: number | null; 
    
    error_type: ErrorType;
    waste_qty: number;
    financial_loss: number;
    system_reasoning: string;
    created_at: string;
    updated_at: string;
}

// Support Structures
export interface Recipe {
    id: number;
    product_name: string;
    attributes: Record<string, any>;
    sale_price: number;
    created_at: string;
    updated_at: string;
    details?: RecipeDetail[];
}

export interface RecipeDetail {
    id: number;
    recipe_id: number;
    ingredient_id: number;
    required_qty: number;
}