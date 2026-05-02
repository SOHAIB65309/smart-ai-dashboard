import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Ensure you have this shadcn component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        industry_type: '',
        seed_data: false,
        record_count: 100,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('business.store'));
    };

    return (
        <AppLayout>
            <Head title="Add New Business" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="mx-auto w-full max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle>Register Business</CardTitle>
                            <CardDescription>Initialize your multi-tenant environment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="business_name">Business Name</Label>
                                    <Input
                                        id="business_name"
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="e.g. Karachi Executive Grill"
                                    />
                                    {errors.business_name && <p className="text-sm text-red-500">{errors.business_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry_type">Industry Type</Label>
                                    <Select onValueChange={(value) => setData('industry_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Restaurant">Restaurant</SelectItem>
                                            <SelectItem value="E-commerce">E-commerce Clothing</SelectItem>
                                            <SelectItem value="Staffing">Staffing / Human Resources</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.industry_type && <p className="text-sm text-red-500">{errors.industry_type}</p>}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="seed_data" 
                                        checked={data.seed_data} 
                                        onCheckedChange={(checked) => setData('seed_data', !!checked)} 
                                    />
                                    <Label htmlFor="seed_data">Seed with Default Synthetic Data</Label>
                                </div>

                                {data.seed_data && (
                                    <div className="space-y-2">
                                        <Label htmlFor="record_count">Number of Records (MRI Logs)</Label>
                                        <Input
                                            id="record_count"
                                            type="number"
                                            value={data.record_count}
                                            onChange={(e) => setData('record_count', parseInt(e.target.value))}
                                            min="10"
                                            max="1000"
                                        />
                                    </div>
                                )}

                                <Button className="w-full" type="submit" disabled={processing}>
                                    {processing ? 'Processing...' : 'Initialize & Seed'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}