import React, { useState, useMemo } from 'react';
import {
    BrainCircuit, TrendingDown, Users, AlertTriangle,
    CheckCircle2, XCircle, Info, Activity, ShoppingBag,
    Utensils, UserCheck, Search, ShieldCheck, Clock,
    Gauge, Zap, ArrowUpRight, BarChart3, RefreshCw, Loader2
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import axios from 'axios'; // Ensure axios is installed
import { BusinessProfile, ErrorWasteLog, StaffMri } from '@/types/buisness';
interface IndustryMetrics {
    totalLoss: number;
    averageFatigue?: number;
}

interface DynamicInsight {
    id: number;
    title: string;
    suggestion: string;
    context: string;
    isRejected: boolean;
    reason: string;
    proof: string;
    type: string;
}
export default function App({ business, industryMetrics }: { business: BusinessProfile; industryMetrics: IndustryMetrics }) {
    const [verifying, setVerifying] = useState(false);
    
    // Replace <any[]> with <DynamicInsight[]>
    const [dynamicInsights, setDynamicInsights] = useState<DynamicInsight[]>([]);
        console.log(business)
    // Industry Icon Resolver
    const stats = useMemo(() => {
        const staff = business.staff || [];
        const logs = staff.flatMap((s: StaffMri) => s.waste_logs || []);
        return {
            totalWasteCount: logs.length,
            industryIcon: business.industry_type === 'Restaurant' ? Utensils :
                business.industry_type === 'E-commerce' ? ShoppingBag : UserCheck,
            healthScore: industryMetrics.averageFatigue > 12 ? 68 : 94
        };
    }, [business, industryMetrics]);

    // FETCH REAL DATA FROM PYTHON LOGIC GATE
    const runVerification = async () => {
        setVerifying(true);
        try {
            const response = await axios.post(route('business.verify', business.id));
            // Expecting an array or object from your BusinessController verify method
            const result = response.data;
            setDynamicInsights([
                {
                    id: Date.now(),
                    title: result.title,
                    suggestion: result.suggestion,
                    context: result.context, // Python now provides the perfectly formatted sentence
                    isRejected: result.status === 'REJECTED',
                    reason: result.reason,
                    proof: result.proof,
                    type: 'Formal AI Verification'
                }
            ]);
        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <AppLayout>
            <Head title={`${business.business_name} | MRI Analysis`} />

            <div className="min-h-screen  p-6 md:p-10 text-slate-900">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
                            <stats.industryIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black tracking-tighter">{business.business_name}</h1>
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{business.industry_type}</Badge>
                            </div>
                            <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span className={`h-2 w-2 rounded-full ${stats.healthScore > 80 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                Formal Logic: {stats.healthScore > 80 ? 'Optimal' : 'Violation Risk'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={runVerification}
                            disabled={verifying}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg transition-all disabled:opacity-50"
                        >
                            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                            {verifying ? 'Solving Invariants...' : 'Run Z3 Logic Check'}
                        </button>
                    </div>
                </div>

                {/* Analytical Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="border-l-[6px] border-l-rose-500 shadow-sm border-0">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-slate-400">Total MRI Loss</CardTitle>
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">Rs. {industryMetrics.totalLoss.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-[6px] border-l-amber-500 shadow-sm border-0">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-slate-400">Fatigue Index</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{industryMetrics.averageFatigue?.toFixed(1)}h</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-[6px] border-l-indigo-500 shadow-sm border-0">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-slate-400">Reliability</CardTitle>
                            <Gauge className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{stats.healthScore}%</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-0 shadow-xl text-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-slate-400 text-xs font-black">Engine Status</CardTitle>
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black uppercase italic text-emerald-400">Verifiable</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <Card className="border-0 shadow-lg dark:bg-gray-800 overflow-hidden min-h-[400px]">
                            <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                                <h2 className="flex items-center gap-3 text-xl font-black">
                                    <BrainCircuit className="h-6 w-6 text-indigo-600" />
                                    AI Verification Engine
                                </h2>
                                {dynamicInsights.length > 0 && <Badge variant="outline" className="font-black text-[10px]">LIVE DATA</Badge>}
                            </div>
                            <div className="p-8 space-y-6">
                                {dynamicInsights.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-4  rounded-full mb-4">
                                            <Activity className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-slate-900 font-bold">No Active Analysis</h3>
                                        <p className="text-slate-400 text-sm max-w-xs">Click "Run Z3 Logic Check" to verify current AI insights against formal invariants.</p>
                                    </div>
                                ) : (
                                    
                                        dynamicInsights.map((insight) => (
                                            <div key={insight.id} className="p-6 rounded-2xl border-2 border-indigo-600 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <Badge variant="outline" className="dark:bg-white text-gray-800">{insight.type}</Badge>
                                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${insight.isRejected ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {insight.isRejected ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                                        {insight.isRejected ? 'Hallucination Blocked' : 'Formal Proof Matched'}
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-black">{insight.title}</h4>
                                                <p className="text-sm text-slate-600 mt-2 font-medium italic leading-relaxed">{insight.context}</p>

                                                {/* 👇 THIS IS THE LINE YOU WERE MISSING 👇 */}
                                                <p className="text-base text-slate-900 mt-4 font-semibold leading-relaxed">
                                                    {insight.suggestion}
                                                </p>
                                                {/* 👆 ================================== 👆 */}

                                                <div className={`mt-6 p-5 rounded-2xl flex items-start gap-4 border ${insight.isRejected ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                                                    <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">Z3 Reasoning Logic</p>
                                                        <p className="text-sm leading-relaxed font-bold">{insight.reason}</p>
                                                        <div className="mt-4 text-[10px] font-mono opacity-50">Proof: {insight.proof}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <TabsPrimitive.Root defaultValue="anomalies">
                            <TabsPrimitive.List className="flex p-1.5 bg-slate-200/50 rounded-2xl mb-6 shadow-inner">
                                <TabsPrimitive.Trigger value="anomalies" className="flex-1 text-[11px] font-black py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500">ANOMALIES</TabsPrimitive.Trigger>
                                <TabsPrimitive.Trigger value="staff" className="flex-1 text-[11px] font-black py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500">STAFF</TabsPrimitive.Trigger>
                            </TabsPrimitive.List>
                            <TabsPrimitive.Content value="anomalies" className="space-y-4 outline-none">
                                {business.staff?.flatMap((member: StaffMri) => (
                                    member.waste_logs?.map((log: ErrorWasteLog, idx: number) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{log.id} Trace</span>
                                                <span className="text-xs font-black text-rose-600">Rs.{log.financial_loss}</span>
                                            </div>
                                            <p className="font-black text-sm uppercase mb-1">{log.error_type}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{member.name}: {log.system_reasoning}</p>
                                        </div>
                                    ))
                                ))}
                            </TabsPrimitive.Content>
                        </TabsPrimitive.Root>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}