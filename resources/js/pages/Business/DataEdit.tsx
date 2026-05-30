import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Check, X, ArrowLeft } from 'lucide-react';

export default function DataEdit({ business, staff, ingredients, products }: any) {
    return (
        <AppLayout>
            <Head title={`Manage Data | ${business.business_name}`} />
            
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={route('business.dashboard', business.id)}>
                            <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black">{business.business_name}</h1>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                Data Management Layer / {business.industry_type}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="staff" className="space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="staff" className="px-8 font-black text-xs uppercase">Staff MRI</TabsTrigger>
                        {business.industry_type === 'Restaurant' && (
                            <TabsTrigger value="ingredients" className="px-8 font-black text-xs uppercase">Ingredients</TabsTrigger>
                        )}
                        {business.industry_type === 'E-commerce' && (
                            <TabsTrigger value="products" className="px-8 font-black text-xs uppercase">Products</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="staff">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {staff.map((member: any) => (
                                <StaffCard key={member.id} member={member} businessId={business.id} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="ingredients">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ingredients.map((item: any) => (
                                <IngredientCard key={item.id} item={item} businessId={business.id} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="products">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product: any) => (
                                <ProductCard key={product.id} product={product} businessId={business.id} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function StaffCard({ member, businessId }: any) {
    const [editing, setEditing] = React.useState(false);
    const { data, setData, put, delete: destroy, processing } = useForm({
        name: member.name,
        role: member.role,
        base_quality_rating: member.base_quality_rating,
    });

    const submit = (e: any) => {
        e.preventDefault();
        put(route('business.staff.update', { business: businessId, staff: member.id }), {
            onSuccess: () => setEditing(false),
        });
    };

    if (editing) {
        return (
            <Card className="border-2 border-indigo-500 shadow-xl">
                <CardContent className="pt-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name" />
                        <Input value={data.role} onChange={e => setData('role', e.target.value)} placeholder="Role" />
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase">Quality Rating (0-5)</Label>
                            <Input type="number" step="0.1" value={data.base_quality_rating} onChange={e => setData('base_quality_rating', e.target.value)} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1 bg-indigo-600" disabled={processing}><Check size={14} className="mr-1" /> Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X size={14} /></Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-black">{member.name}</CardTitle>
                    <CardDescription className="font-bold text-xs uppercase">{member.role}</CardDescription>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setEditing(true)}>
                        <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => destroy(route('business.staff.destroy', { business: businessId, staff: member.id }))}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Rating</span>
                    <Badge variant="outline" className="font-mono text-indigo-600 border-indigo-200">{member.base_quality_rating}/5.0</Badge>
                </div>
            </CardContent>
        </Card>
    );
}

function IngredientCard({ item, businessId }: any) {
    const [editing, setEditing] = React.useState(false);
    const { data, setData, put, delete: destroy, processing } = useForm({
        name: item.name,
        unit_cost: item.unit_cost,
        unit_type: item.unit_type,
        min_stock_threshold: item.min_stock_threshold,
    });

    const submit = (e: any) => {
        e.preventDefault();
        put(route('business.ingredients.update', { business: businessId, ingredient: item.id }), {
            onSuccess: () => setEditing(false),
        });
    };

    if (editing) {
        return (
            <Card className="border-2 border-indigo-500 shadow-xl">
                <CardContent className="pt-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name" />
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="number" value={data.unit_cost} onChange={e => setData('unit_cost', e.target.value)} placeholder="Cost" />
                            <Input value={data.unit_type} onChange={e => setData('unit_type', e.target.value)} placeholder="Unit" />
                        </div>
                        <Input type="number" value={data.min_stock_threshold} onChange={e => setData('min_stock_threshold', e.target.value)} placeholder="Threshold" />
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1 bg-indigo-600" disabled={processing}><Check size={14} className="mr-1" /> Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X size={14} /></Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-black">{item.name}</CardTitle>
                    <CardDescription className="font-bold text-xs uppercase">Unit: {item.unit_type}</CardDescription>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setEditing(true)}>
                        <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => destroy(route('business.ingredients.destroy', { business: businessId, ingredient: item.id }))}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Unit Cost</span>
                    <span className="text-slate-900 font-mono">Rs. {item.unit_cost}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Min Stock</span>
                    <span className="text-slate-900 font-mono">{item.min_stock_threshold}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ProductCard({ product, businessId }: any) {
    const [editing, setEditing] = React.useState(false);
    const { data, setData, put, delete: destroy, processing } = useForm({
        name: product.name,
        category: product.category,
        customer_rating: product.customer_rating,
    });

    const submit = (e: any) => {
        e.preventDefault();
        put(route('business.products.update', { business: businessId, product: product.id }), {
            onSuccess: () => setEditing(false),
        });
    };

    if (editing) {
        return (
            <Card className="border-2 border-indigo-500 shadow-xl">
                <CardContent className="pt-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name" />
                        <Input value={data.category} onChange={e => setData('category', e.target.value)} placeholder="Category" />
                        <Input type="number" step="0.1" value={data.customer_rating} onChange={e => setData('customer_rating', e.target.value)} placeholder="Rating" />
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1 bg-indigo-600" disabled={processing}><Check size={14} className="mr-1" /> Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X size={14} /></Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-black">{product.name}</CardTitle>
                    <CardDescription className="font-bold text-xs uppercase">{product.category}</CardDescription>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setEditing(true)}>
                        <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => destroy(route('business.products.destroy', { business: businessId, product: product.id }))}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Rating</span>
                    <Badge variant="outline" className="font-mono text-amber-600 border-amber-200">★ {product.customer_rating}</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
