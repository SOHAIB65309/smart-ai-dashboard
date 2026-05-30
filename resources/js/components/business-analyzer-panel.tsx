import { BusinessProfile } from '@/types/buisness';
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function BusinessAnalyzerPanel({ business, onVerify, onChange }: { 
    business: BusinessProfile; 
    onVerify: (data: any) => Promise<void>;
    onChange: (modifiers: any) => void;
}) {
    const [modifiers, setModifiers] = useState({
        anomaly_delta: 0,       // -50 to +50
        fatigue_delta: 0,       // -50 to +50
        loss_mitigation: 0      // 0 to 100
    });
    const [processing, setProcessing] = useState(false);

    const simulation = useMemo(() => {
        const isStaffing = business.industry_type === 'Staffing';
        
        const allWasteLogs = business.staff?.flatMap(s => s.waste_logs || []) || [];
        const baseTotalLogs = isStaffing 
            ? business.staff?.reduce((a, b) => a + (b.performance_logs?.reduce((x, y) => x + y.tasks_failed, 0) || 0), 0) || 0
            : allWasteLogs.length;

        const allPerformance = business.staff?.flatMap(s => s.performance_logs || []) || [];
        const baseAvgFatigue = allPerformance.length > 0 
            ? allPerformance.reduce((sum, l) => sum + (l.overtime_hours || 0), 0) / allPerformance.length 
            : 0;

        // Apply Modifiers
        const projectedLogs = Math.max(0, baseTotalLogs * (1 + modifiers.anomaly_delta / 100));
        const projectedFatigue = Math.max(0, baseAvgFatigue * (1 + modifiers.fatigue_delta / 100));
        const mitigationFactor = 1 - (modifiers.loss_mitigation / 100);

        const penalty = isStaffing 
            ? (projectedFatigue * 8) 
            : ((projectedLogs * 2) + (projectedFatigue * 5)) * mitigationFactor;
            
        const score = isNaN(penalty) ? 0 : 100 - penalty;

        return {
            totalLogs: (projectedLogs || 0).toFixed(1),
            avgFatigue: (projectedFatigue || 0).toFixed(1),
            score: Math.max(0, Math.min(100, score || 0)).toFixed(2),
            status: score > 75 ? 'Optimal' : score > 40 ? 'Warning' : 'Critical'
        };
    }, [modifiers, business]);

    // Requirement: Instant sync with dashboard visualizers
    React.useEffect(() => {
        onChange(modifiers);
    }, [modifiers]);

    const handleVerify = async () => {
        setProcessing(true);
        // Requirement: Pack exact slider states into 'modifiers' object
        await onVerify({ modifiers }); 
        setProcessing(false);
    };

    const chartData = [
        { name: 'Reliability', value: parseFloat(simulation.score) || 0 },
        { name: 'System Loss', value: Math.max(0, 100 - (parseFloat(simulation.score) || 0)) },
    ];

    const COLORS = [
        simulation.status === 'Optimal' ? '#10b981' : simulation.status === 'Warning' ? '#f59e0b' : '#ef4444',
        '#1e293b'
    ];

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-slate-200 shadow-2xl w-full">
            <header className="mb-8">
                <h3 className="text-xl font-black tracking-tight text-white">Operational Simulator</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Neuro-Symbolic Simulation Layer</p>
            </header>

            {/* Score Visualization */}
            <div className="relative h-56 w-full mb-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <span className="text-5xl font-black text-white">{Math.round(parseFloat(simulation.score))}%</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full mt-2 ${
                        simulation.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-500' : 
                        simulation.status === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                        {simulation.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-8">
                {/* Slider 1: Anomaly Delta */}
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <label>Anomaly Rate Delta</label>
                        <span className="font-mono text-blue-400">{modifiers.anomaly_delta > 0 ? '+' : ''}{modifiers.anomaly_delta}%</span>
                    </div>
                    <input 
                        type="range" min="-50" max="50" step="1"
                        value={modifiers.anomaly_delta}
                        onChange={e => setModifiers(prev => ({ ...prev, anomaly_delta: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-800"
                    />
                </div>

                {/* Slider 2: Fatigue Delta */}
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <label>Shift Fatigue Delta</label>
                        <span className="font-mono text-emerald-400">{modifiers.fatigue_delta > 0 ? '+' : ''}{modifiers.fatigue_delta}%</span>
                    </div>
                    <input 
                        type="range" min="-50" max="50" step="1"
                        value={modifiers.fatigue_delta}
                        onChange={e => setModifiers(prev => ({ ...prev, fatigue_delta: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
                    />
                </div>

                {/* Slider 3: Loss Mitigation */}
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <label>Target Loss Mitigation</label>
                        <span className="font-mono text-rose-400">{modifiers.loss_mitigation}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" step="1"
                        value={modifiers.loss_mitigation}
                        onChange={e => setModifiers(prev => ({ ...prev, loss_mitigation: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500 border border-slate-800"
                    />
                </div>
            </div>

            {/* Projected Stats Block */}
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-800 pt-8">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Projected Logs</p>
                    <p className="text-2xl font-black text-white">{simulation.totalLogs}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Avg Fatigue</p>
                    <p className="text-2xl font-black text-white">{simulation.avgFatigue}h</p>
                </div>
            </div>

            <button
                onClick={handleVerify}
                disabled={processing}
                className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-indigo-600/20 text-sm uppercase tracking-widest"
            >
                {processing ? 'Formalizing Constraints...' : 'Verify Invariants'}
            </button>
        </div>
    );
}
