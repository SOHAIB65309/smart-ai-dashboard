import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider'; // You might need to check if you have Slider, otherwise use Input range

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        industry_type: '',
        seed_data: false,
        seeding_params: {
            staff_count: 3,
            performance_range: [70, 95],
            fatigue_range: [0, 4],
            waste_intensity: 50,
        }
    });

    const updateParam = (key: string, value: any) => {
        setData('seeding_params', {
            ...data.seeding_params,
            [key]: value
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('business.store'));
    };

    return (
        <AppLayout>
            <Head title="Add New Business" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="mx-auto w-full max-w-2xl">
                    <Card className="border-slate-200 shadow-xl">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl">
                            <CardTitle className="text-2xl font-black">Register Business</CardTitle>
                            <CardDescription className="font-bold text-slate-500">Initialize your multi-tenant environment with controlled seeding.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name" className="text-xs font-black uppercase tracking-widest text-slate-400">Business Name</Label>
                                        <Input
                                            id="business_name"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder="e.g. Karachi Executive Grill"
                                            className="font-bold"
                                        />
                                        {errors.business_name && <p className="text-xs text-red-500 font-bold">{errors.business_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industry_type" className="text-xs font-black uppercase tracking-widest text-slate-400">Industry Type</Label>
                                        <Select onValueChange={(value) => setData('industry_type', value)}>
                                            <SelectTrigger className="font-bold">
                                                <SelectValue placeholder="Select Industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Restaurant" className="font-bold">Restaurant</SelectItem>
                                                <SelectItem value="E-commerce" className="font-bold">E-commerce Clothing</SelectItem>
                                                <SelectItem value="Staffing" className="font-bold">Staffing / Human Resources</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.industry_type && <p className="text-xs text-red-500 font-bold">{errors.industry_type}</p>}
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox 
                                            id="seed_data" 
                                            checked={data.seed_data} 
                                            onCheckedChange={(checked) => setData('seed_data', !!checked)} 
                                        />
                                        <Label htmlFor="seed_data" className="font-black text-sm uppercase tracking-tight">Enable Advanced Synthetic Seeding</Label>
                                    </div>

                                    {data.seed_data && (
                                        <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] font-black uppercase text-slate-500">Staff Count</Label>
                                                        <span className="text-xs font-mono font-bold">{data.seeding_params.staff_count}</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="1" max="10" 
                                                        value={data.seeding_params.staff_count} 
                                                        onChange={e => updateParam('staff_count', parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] font-black uppercase text-slate-500">Performance Range (0-100%)</Label>
                                                        <span className="text-xs font-mono font-bold">{data.seeding_params.performance_range[0]}% - {data.seeding_params.performance_range[1]}%</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            type="number" className="h-8 font-mono text-xs" 
                                                            value={data.seeding_params.performance_range[0]} 
                                                            onChange={e => updateParam('performance_range', [parseInt(e.target.value), data.seeding_params.performance_range[1]])}
                                                        />
                                                        <Input 
                                                            type="number" className="h-8 font-mono text-xs" 
                                                            value={data.seeding_params.performance_range[1]} 
                                                            onChange={e => updateParam('performance_range', [data.seeding_params.performance_range[0], parseInt(e.target.value)])}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] font-black uppercase text-slate-500">Fatigue/OT Range (0-24h)</Label>
                                                        <span className="text-xs font-mono font-bold">{data.seeding_params.fatigue_range[0]}h - {data.seeding_params.fatigue_range[1]}h</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            type="number" className="h-8 font-mono text-xs" 
                                                            value={data.seeding_params.fatigue_range[0]} 
                                                            onChange={e => updateParam('fatigue_range', [parseFloat(e.target.value), data.seeding_params.fatigue_range[1]])}
                                                        />
                                                        <Input 
                                                            type="number" className="h-8 font-mono text-xs" 
                                                            value={data.seeding_params.fatigue_range[1]} 
                                                            onChange={e => updateParam('fatigue_range', [data.seeding_params.fatigue_range[0], parseFloat(e.target.value)])}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] font-black uppercase text-slate-500">Waste Incident Intensity</Label>
                                                        <span className="text-xs font-mono font-bold">{data.seeding_params.waste_intensity}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max="100" 
                                                        value={data.seeding_params.waste_intensity} 
                                                        onChange={e => updateParam('waste_intensity', parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20" type="submit" disabled={processing}>
                                    {processing ? 'Formalizing State...' : 'Initialize & Seed'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
