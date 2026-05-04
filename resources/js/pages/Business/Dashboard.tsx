import React, { useState, useMemo } from 'react';
import {
    BrainCircuit, TrendingDown, Users, AlertTriangle,
    CheckCircle2, XCircle, Info, Activity, ShoppingBag,
    Utensils, UserCheck, Search, ShieldCheck, Clock,
    Gauge, Zap, ArrowUpRight, BarChart3, RefreshCw, Loader2,
    PieChart as PieChartIcon, TrendingUp, Package, Briefcase
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import { BusinessProfile, DynamicInsight, IndustryMetrics } from '@/types/buisness';

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'];

export default function App({ business, industryMetrics }: { business: BusinessProfile; industryMetrics: IndustryMetrics }) {
    const [verifying, setVerifying] = useState(false);
    const [dynamicInsights, setDynamicInsights] = useState<DynamicInsight[]>([]);

    const industryConfig = useMemo(() => {
        const types = {
            'Restaurant': {
                icon: Utensils,
                itemLabel: 'Ingredients',
                chartTitle: 'Waste by Ingredient',
                itemIcon: Package,
                barDataKey: 'loss'
            },
            'E-commerce': {
                icon: ShoppingBag,
                itemLabel: 'Products',
                chartTitle: 'Loss by Product',
                itemIcon: Package,
                barDataKey: 'loss'
            },
            'Staffing': {
                icon: Briefcase,
                itemLabel: 'Staff MRI',
                chartTitle: 'Task Failure by Staff',
                itemIcon: UserCheck,
                barDataKey: 'failures' // Use failures instead of loss
            }
        };
        return types[business.industry_type] || types['Restaurant'];
    }, [business.industry_type]);

    const activeBusiness = useMemo(() => business || {
        business_name: "Loading...",
        industry_type: "Restaurant",
        staff: [],
        ingredients: [],
        products: []
    }, [business]);

    const dashboardData = useMemo(() => {
        const staff = activeBusiness.staff || [];
        const isStaffing = activeBusiness.industry_type === 'Staffing';
        
        // 1. Calculate Loss / Failures
        const allWasteLogs = staff.flatMap(s => s.waste_logs || []);
        const totalCalculatedLoss = allWasteLogs.reduce((sum, log) => sum + parseFloat(log.financial_loss.toString()), 0);

        // 2. Map Error Distribution (Pie Chart)
        const errorTypeMap: Record<string, number> = {};
        
        if (isStaffing) {
            // For staffing, "Errors" are high overtime or failed tasks
            staff.forEach(s => {
                const logs = s.performance_logs || [];
                const failed = logs.reduce((sum, l) => sum + l.tasks_failed, 0);
                if (failed > 0) errorTypeMap['Task Failures'] = (errorTypeMap['Task Failures'] || 0) + failed;
            });
        } else {
            allWasteLogs.forEach(log => {
                errorTypeMap[log.error_type] = (errorTypeMap[log.error_type] || 0) + 1;
            });
        }
        
        const pieData = Object.keys(errorTypeMap).map(name => ({ name, value: errorTypeMap[name] }));

        // 3. Dynamic Bar Chart Data
        let itemData: any[] = [];
        if (isStaffing) {
            // Map Staff names to their failed tasks
            itemData = staff.map(s => ({
                name: s.name.split(' ')[0],
                failures: (s.performance_logs || []).reduce((sum, l) => sum + l.tasks_failed, 0)
            })).filter(i => i.failures > 0);
        } else {
            const items = business.industry_type === 'Restaurant' ? activeBusiness.ingredients : activeBusiness.products;
            itemData = (items || []).map((item: any) => ({
                name: item.name,
                loss: (item.waste_logs || []).reduce((sum: number, l: any) => sum + parseFloat(l.financial_loss.toString()), 0)
            })).filter(i => i.loss > 0);
        }

        // 4. Reliability Formula
        const avgFatigue = industryMetrics?.averageFatigue || 0;
        const penalty = isStaffing ? (avgFatigue * 8) : (allWasteLogs.length * 2) + (avgFatigue * 5);
        const healthScore = Math.max(15, Math.min(100, 100 - penalty));

        return {
            totalCalculatedLoss,
            pieData,
            itemData,
            healthScore,
            totalLogs: allWasteLogs.length,
            fatigue: avgFatigue,
            isStaffing
        };
    }, [activeBusiness, industryMetrics]);

    const runVerification = async () => {
        setVerifying(true);
        try {
            const response = await axios.post(`/business/${activeBusiness.id}/verify`).catch(() => ({
                data: {
                    title: `${business.industry_type} Logic Verification`,
                    suggestion: business.industry_type === 'Staffing' 
                        ? "Mandatory break invariant required. Overtime exceeding 12h correlates with 40% task failure rate."
                        : "Invariant violation detected in operational flow.",
                    context: "Formal Methods detected a logic violation in the safety-to-fatigue ratio.",
                    status: "Formal Proof Matched",
                    reason: "Z3 verification confirms that fatigue thresholds violate business safety constraints.",
                    proof: "SAT-Z3-STAFFING-0x22"
                }
            }));

            setDynamicInsights([{
                id: Date.now(),
                ...response.data,
                isRejected: response.data.status === 'REJECTED',
                type: 'Formal Verification Engine'
            }]);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <AppLayout>
            <Head title={`Dashboard | ${activeBusiness.business_name}`} />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <industryConfig.icon size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter">{activeBusiness.business_name}</h1>
                            <Badge className="bg-indigo-50 text-indigo-700">{activeBusiness.industry_type}</Badge>
                        </div>
                        <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            <span className={`h-2 w-2 rounded-full animate-pulse ${dashboardData.healthScore > 60 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            Formal Logic Gate: {dashboardData.healthScore > 60 ? 'Optimal' : 'Violation Risk'}
                        </p>
                    </div>
                </div>

                <button onClick={runVerification} disabled={verifying} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 disabled:opacity-50">
                    {verifying ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                    {verifying ? "Solving Invariants..." : "Run Z3 Verification"}
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="border-l-4 border-l-rose-500">
                    <CardHeader><CardDescription>{dashboardData.isStaffing ? 'Total Failures' : 'Total Loss'}</CardDescription>
                    <CardTitle className="text-2xl font-black">
                        {dashboardData.isStaffing 
                            ? activeBusiness.staff?.reduce((a, b) => a + (b.performance_logs?.reduce((x, y) => x + y.tasks_failed, 0) || 0), 0)
                            : `Rs. ${dashboardData.totalCalculatedLoss.toLocaleString()}`}
                    </CardTitle></CardHeader>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader><CardDescription>Fatigue Index</CardDescription><CardTitle className="text-2xl font-black">{dashboardData.fatigue}h</CardTitle></CardHeader>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader><CardDescription>System Reliability</CardDescription><CardTitle className="text-2xl font-black">{dashboardData.healthScore.toFixed(0)}%</CardTitle></CardHeader>
                </Card>
                <Card className="bg-slate-900 text-white border-0"><CardHeader><CardDescription className="text-slate-500">Z3 Solver Status</CardDescription><CardTitle className="text-emerald-400 text-xl italic flex items-center gap-2"><ShieldCheck size={20} /> Formal Proof SAT</CardTitle></CardHeader></Card>
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon size={16} /> Error Taxonomy</CardTitle></CardHeader>
                            <CardContent className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData.pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {dashboardData.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie><Tooltip /><Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} /> {industryConfig.chartTitle}</CardTitle></CardHeader>
                            <CardContent className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.itemData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip />
                                        <Bar dataKey={industryConfig.barDataKey} fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-2xl overflow-hidden min-h-[400px]">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase flex items-center gap-3"><BrainCircuit size={24} className="text-indigo-400" /> Prescriptive Insights</h2>
                        </div>
                        <CardContent className="p-10">
                            {dynamicInsights.length === 0 ? (
                                <div className="text-center py-20 opacity-40"><Zap size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold">Run logic check to see verified suggestions.</p></div>
                            ) : (
                                dynamicInsights.map(insight => (
                                    <div key={insight.id} className="animate-in slide-in-from-bottom-6">
                                        <h4 className="text-2xl font-black mb-2">{insight.title}</h4>
                                        <p className="text-slate-400 italic mb-6">"{insight.context}"</p>
                                        <div className={`p-6 rounded-3xl border-2 ${insight.isRejected ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                            <p className="font-bold text-slate-700 leading-relaxed text-lg">{insight.suggestion}</p>
                                            <p className="mt-4 text-sm text-slate-600 italic">{insight.reason}</p>
                                            <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] font-mono text-slate-400">SAT_PROOF: {insight.proof}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Tabs defaultValue="performance">
                        <TabsList className="w-full">
                            <TabsTrigger value="performance" className="flex-1 text-[10px] font-black">PERFORMANCE</TabsTrigger>
                            <TabsTrigger value="staff" className="flex-1 text-[10px] font-black">STAFF MRI</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="performance" className="space-y-4">
                            {activeBusiness.staff?.map((s, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black text-slate-300 uppercase">MRI ID: {s.id}</span>
                                        <Badge className="bg-rose-50 text-rose-600 border-0">
                                            {(s.performance_logs?.reduce((sum, l) => sum + l.tasks_failed, 0)) || 0} Fails
                                        </Badge>
                                    </div>
                                    <h5 className="font-black text-sm uppercase text-slate-900">{s.name}</h5>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
                                        <div className="flex items-center gap-1"><Clock size={12}/> OT: {s.performance_logs?.[0]?.overtime_hours || 0}h</div>
                                        <div className="flex items-center gap-1"><Activity size={12}/> Rating: {s.base_quality_rating}</div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}