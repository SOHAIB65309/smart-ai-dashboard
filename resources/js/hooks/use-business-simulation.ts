import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';

interface BusinessData {
    id: number;
    staff: Array<{ id: number; base_quality_rating: number; fatigue?: number; performance_logs?: any[] }>;
    ingredients: Array<{ id: number; unit_cost: number; waste_logs?: any[] }>;
    products: Array<{ id: number; error_logs_count?: number; waste_logs?: any[] }>;
    industry_type: string;
}

export const useBusinessSimulation = (business: BusinessData) => {
    // 1. Initialize Inertia form with the delta variables
    const { data, setData, post, processing } = useForm({
        business_id: business.id,
        variable_cost_delta: 0,    // Range: -5 to +20
        labor_allocation_delta: 0, // Range: -10 to +10
    });

    // 2. Dynamic Computation (The Simulation Engine)
    const simulation = useMemo(() => {
        const isStaffing = business.industry_type === 'Staffing';
        
        // Base Metrics Calculation
        const allWasteLogs = business.staff?.flatMap(s => s.waste_logs || []) || [];
        const baseTotalLogs = isStaffing 
            ? business.staff?.reduce((a, b) => a + (b.performance_logs?.reduce((x, y) => x + y.tasks_failed, 0) || 0), 0) || 0
            : allWasteLogs.length;

        const allPerformance = business.staff?.flatMap(s => s.performance_logs || []) || [];
        const baseAvgFatigue = allPerformance.avg('overtime_hours') ?? 0;

        // Apply Deltas
        const projectedLogs = Math.max(0, baseTotalLogs * (1 + (data.variable_cost_delta || 0) / 100));
        const projectedFatigue = Math.max(0, baseAvgFatigue * (1 - (data.labor_allocation_delta || 0) / 100));

        // System Reliability Score Formula: 100 - (totalLogs * 2) - (avgFatigue * 5)
        const penalty = isStaffing ? (projectedFatigue * 8) : (projectedLogs * 2) + (projectedFatigue * 5);
        const score = isNaN(penalty) ? 0 : 100 - penalty;

        return {
            totalLogs: (projectedLogs || 0).toFixed(1),
            avgFatigue: (projectedFatigue || 0).toFixed(1),
            score: Math.max(0, Math.min(100, score || 0)).toFixed(2),
            status: score > 75 ? 'Optimal' : score > 40 ? 'Warning' : 'Critical'
        };
    }, [data.variable_cost_delta, data.labor_allocation_delta, business]);

    // 3. Perfect Safe Payload Submission
    const verifyConfiguration = () => {
        post(route('business.verify', { business: business.id }), {
            preserveState: true,
        });
    };

    return { data, setData, simulation, verifyConfiguration, processing };
};

// Helper for avg
if (!Array.prototype.avg) {
    Object.defineProperty(Array.prototype, 'avg', {
        value: function(key: string) {
            if (this.length === 0) return 0;
            return this.reduce((sum, item) => sum + (item[key] || 0), 0) / this.length;
        }
    });
}
