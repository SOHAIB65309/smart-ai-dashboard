import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Cpu,
    Database,
    ArrowRight,
    Activity,
    Briefcase,
    Utensils,
    ShoppingBag
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Beyond Visualization — Neuro-Symbolic Verification Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#F3F0DF] text-[#1E293B] font-['Instrument_Sans',_sans-serif] selection:bg-[#11CAA0] selection:text-white">

                {/* Header Navigation */}
                <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-[#005088]/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#005088] p-2 rounded-xl text-white">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base leading-none tracking-tight text-[#005088]">IndusStream</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI Dashboards</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 bg-[#005088] hover:bg-[#003d69] text-[#F3F0DF] px-5 h-11 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-200"
                            >
                                Enter Console <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-semibold text-[#005088] hover:text-[#11CAA0] transition-colors">
                                    Sign In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center bg-[#11CAA0] hover:bg-[#0ea885] text-white px-5 h-11 rounded-xl text-sm font-semibold transition-all"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Framework Intro Section */}
                <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 bg-[#005088]/5 border border-[#005088]/10 px-3 py-1.5 rounded-full">
                            <Activity className="size-4 text-[#11CAA0]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#005088]">Formal Methods AI Framework</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#005088] leading-[1.1]">
                            Beyond Visualization: Trust Through Proof.
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            Closing the reliability gap in prescriptive dashboards[cite: 1, 4]. We pass stochastic AI operations through a deterministic Python-driven Z3 SMT logic gate before execution[cite: 8, 9, 10].
                        </p>
                        <div className="pt-4 flex items-center gap-4">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="inline-flex items-center gap-2 bg-[#005088] hover:bg-[#003d69] text-white px-6 h-12 rounded-xl text-base font-semibold transition-all"
                            >
                                Launch Verification Engine <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Neuro-Symbolic Layer Representation Grid */}
                    <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#11CAA0]/10 p-3 rounded-xl text-[#11CAA0]">
                                    <Database className="size-6" />
                                </div>
                                <h3 className="font-bold text-lg text-[#005088]">Relational Core Layer</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Managed securely within the IndusStream Core utilizing strict multi-tenant schema invariants[cite: 7, 10]. Handles high-fidelity data trees for precise state serialization.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#005088]/10 p-3 rounded-xl text-[#005088]">
                                    <Cpu className="size-6" />
                                </div>
                                <h3 className="font-bold text-lg text-[#005088]">Symbolic Guard Mechanism</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                A Python validation subprocess utilizing the Z3 SMT Solver[cite: 8]. Enforces mathematical boundary proofs ($\sum f(l) \leq 50k$) to structurally eliminate hallucinations[cite: 10].
                            </p>
                        </div>
                    </div>
                </main>

                {/* Polymorphic Domain Coverage Section */}
                <section className="bg-white border-t border-slate-200 py-20">
                    <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tight text-[#005088]">Polymorphic Invariant Ingestion</h2>
                            <p className="text-slate-500 max-w-xl mx-auto">
                                The engine dynamically switches mathematical logic checking boundaries based on tenant industry definitions.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="border border-slate-200 p-8 rounded-2xl text-left space-y-4">
                                <Utensils className="size-8 text-[#005088]" />
                                <h4 className="font-bold text-xl text-[#005088]">Restaurants</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Monitors uncompressed telemetry logs, tracking ingredient waste, storage lifecycles, and financial leakages against absolute limits.
                                </p>
                            </div>
                            <div className="border border-slate-200 p-8 rounded-2xl text-left space-y-4">
                                <ShoppingBag className="size-8 text-[#11CAA0]" />
                                <h4 className="font-bold text-xl text-[#005088]">E-commerce</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Traces transaction histories, cancellation reasons, and product return vectors using polymorphic relational mapping models.
                                </p>
                            </div>
                            <div className="border border-slate-200 p-8 rounded-2xl text-left space-y-4">
                                <Briefcase className="size-8 text-[#005088]" />
                                <h4 className="font-bold text-xl text-[#005088]">Staffing Profiles</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Evaluates employee fatigue metrics against intersecting bounds (Average Overtime $\le$ 12h & Task Failure Rate $\le$ 15%).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}