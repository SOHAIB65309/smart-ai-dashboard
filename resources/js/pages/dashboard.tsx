import React from 'react';
import { Activity, Database, Bot, Users, Link as LinkIcon, CheckCircle2, AlertCircle, LayoutDashboard, Clock, TrendingDown, ShieldCheck, PieChart as PieChartIcon, BarChart3, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

interface DashboardProps {
    stats: {
        totalBusinesses: number;
        totalLoss: number;
        avgFatigue: number;
        reliabilityScore: number;
    };
    recentBusinesses: Array<{
        id: number;
        name: string;
        type: string;
        loss: number;
        status: string;
    }>;
    industryDistribution: Record<string, number>;
}

export default function Dashboard({ stats, recentBusinesses, industryDistribution }: DashboardProps) {
    return (
        <AppLayout className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col">
            <Head title="Global Dashboard" />
            
            {/* --- Standalone App Header --- */}
            <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <LayoutDashboard className="size-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none text-neutral-900 dark:text-neutral-100">IndusStream AI Dashboards</h1>
                        <p className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-widest">Global Overview / Analytics</p>
                    </div>
                </div>
                <Link href={route('business.create')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    + New Business
                </Link>
            </header>

            {/* --- Main Dashboard Content --- */}
            <main className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
                
                {/* --- Top Metrics Row --- */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    
                    {/* Metric 1: Total Businesses */}
                    <div className="bg-white dark:bg-neutral-900 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4">
                            <h3 className="text-sm font-black uppercase text-neutral-500 dark:text-neutral-400">Total Businesses</h3>
                            <Database className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{stats.totalBusinesses}</span>
                            <span className="text-xs text-neutral-500 font-medium">Active Profiles</span>
                        </div>
                    </div>

                    {/* Metric 2: Global Loss */}
                    <div className="bg-white dark:bg-neutral-900 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4">
                            <h3 className="text-sm font-black uppercase text-neutral-500 dark:text-neutral-400">Aggregated Loss</h3>
                            <TrendingDown className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50">Rs. {stats.totalLoss.toLocaleString()}</span>
                            <span className="text-xs text-rose-600 dark:text-rose-400 font-black tracking-tight">Across all nodes</span>
                        </div>
                    </div>

                    {/* Metric 3: Avg Fatigue */}
                    <div className="bg-white dark:bg-neutral-900 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4">
                            <h3 className="text-sm font-black uppercase text-neutral-500 dark:text-neutral-400">Avg Fatigue Index</h3>
                            <Activity className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{stats.avgFatigue}h</span>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-black tracking-tight">Mean Overtime</span>
                        </div>
                    </div>

                    {/* Metric 4: Reliability Score */}
                    <div className="bg-white dark:bg-neutral-900 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4">
                            <h3 className="text-sm font-black uppercase text-neutral-500 dark:text-neutral-400">Global Reliability</h3>
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{stats.reliabilityScore}%</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black tracking-tight">System health index</span>
                        </div>
                    </div>
                </div>

                {/* --- Distribution and Overview --- */}
                <div className="grid gap-6 lg:grid-cols-2">
                    
                    {/* Industry Distribution */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Industry Distribution</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Business diversification across sectors</p>
                        </div>
                        
                        <div className="space-y-6">
                            {Object.entries(industryDistribution).map(([industry, count]) => {
                                const percentage = stats.totalBusinesses > 0 ? (count / stats.totalBusinesses) * 100 : 0;
                                return (
                                    <div key={industry} className="space-y-2">
                                        <div className="flex justify-between text-sm font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                                            <span>{industry}</span>
                                            <span>{count} Units ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${
                                                    industry === 'Restaurant' ? 'bg-indigo-500' :
                                                    industry === 'E-commerce' ? 'bg-emerald-500' : 'bg-amber-500'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-2xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Bot size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Neuro-Symbolic Oversight</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                The formal verification engine is currently monitoring <span className="text-indigo-400 font-black">{stats.totalBusinesses}</span> independent operational nodes. 
                                Aggregate data confirms a global stability index of <span className="text-emerald-400 font-black">{stats.reliabilityScore}%</span>.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="size-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Z3 Multi-tenant Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Recent Businesses Table --- */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Monitored Businesses</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Real-time telemetry per profile</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Business Name</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Industry</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Calculated Loss</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Solver Status</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {recentBusinesses.map((b) => (
                                    <tr key={b.id} className="text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 font-black tracking-tight">{b.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                                {b.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-rose-600 dark:text-rose-400">Rs. {b.loss.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                b.status === 'Stable' 
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                            }`}>
                                                {b.status === 'Stable' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                href={route('business.dashboard', { business: b.id })}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-black text-xs uppercase flex items-center gap-1 group"
                                            >
                                                Deep Trace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {recentBusinesses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-bold italic">
                                            No businesses found. Start by creating a new profile.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </AppLayout>
    );
}
