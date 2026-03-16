import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Warehouse as WarehouseIcon, MapPin, Ruler, ShieldCheck, Zap, Info, Ban, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StorageOption {
    id: string;
    storage_type: 'normal' | 'cold' | 'hot';
    price_per_sqft_day: number;
    price_per_sqft_month: number;
}

interface Warehouse {
    id: string;
    name: string;
    description: string | null;
    location: string;
    image_url: string | null;
    total_space_sqft: number;
    available_space_sqft: number;
    features: string[] | null;
    storage_options: StorageOption[];
    availability: boolean;
}

interface WarehouseDetailsDialogProps {
    warehouse: Warehouse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookClick: (warehouse: Warehouse) => void;
    locationKeyMap: Record<string, string>;
}

export const WarehouseDetailsDialog: React.FC<WarehouseDetailsDialogProps> = ({
    warehouse,
    open,
    onOpenChange,
    onBookClick,
    locationKeyMap
}) => {
    const { t } = useTranslation();

    if (!warehouse) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl border-none">
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        src={warehouse.image_url || 'https://placehold.co/800x600/1e293b/f8fafc?text=Warehouse'}
                        alt={`${warehouse.name} warehouse storage facility`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                        <Badge variant={warehouse.availability ? 'default' : 'secondary'} className="px-3 py-1 text-sm shadow-lg">
                            {warehouse.availability ? (
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t('warehouse.available_status', { defaultValue: 'Available' })}</span>
                            ) : (
                                <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> {t('warehouse.full_status', { defaultValue: 'Full' })}</span>
                            )}
                        </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h2 className="text-3xl font-bold mb-2">{warehouse.name}</h2>
                        <div className="flex items-center gap-2 opacity-90">
                            <MapPin className="h-4 w-4" />
                            <span>{locationKeyMap[warehouse.location] ? t(locationKeyMap[warehouse.location]) : warehouse.location}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Description Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                            <Info className="h-5 w-5" />
                            <h3>{t('warehouse.details.description', { defaultValue: 'About this Warehouse' })}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {warehouse.description || t('warehouse.noDescription', { defaultValue: 'No description available' })}
                        </p>
                    </section>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card variant="stat" icon={<WarehouseIcon className="h-5 w-5" />} label={t('warehouse.available_space', { defaultValue: 'Available Space' })} value={`${warehouse.available_space_sqft.toLocaleString('en-IN')} sqft`} />
                        <Card variant="stat" icon={<Ruler className="h-5 w-5" />} label={t('warehouse.total_capacity', { defaultValue: 'Total Capacity' })} value={`${warehouse.total_space_sqft.toLocaleString('en-IN')} sqft`} />
                    </div>

                    {/* Features Section */}
                    {warehouse.features && warehouse.features.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                                <ShieldCheck className="h-5 w-5" />
                                <h3>{t('warehouse.details.features', { defaultValue: 'Facilities & Safety' })}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {warehouse.features.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1 bg-green-50 text-green-700 border-green-100">
                                        <Zap className="h-3 w-3 mr-1" />
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Pricing Options */}
                    <section>
                        <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                            <span className="text-lg">💰</span>
                            <h3>{t('warehouse.details.pricing', { defaultValue: 'Available Storage Plans' })}</h3>
                        </div>
                        <div className="grid gap-3">
                            {warehouse.storage_options.map((option) => (
                                <div key={option.id} className="flex items-center justify-between p-4 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div>
                                        <span className="font-bold text-lg capitalize">{option.storage_type} {t('warehouse.storage', { defaultValue: 'Storage' })}</span>
                                        <p className="text-sm text-muted-foreground">{t('warehouse.pricing_sub', { defaultValue: 'Flexible per sqft rates' })}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-primary font-bold text-lg">₹{option.price_per_sqft_day.toFixed(2)} /sqft/day</div>
                                        <div className="text-xs text-muted-foreground">₹{option.price_per_sqft_month.toFixed(2)} /sqft/month</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Action Footer */}
                    <div className="pt-4 flex gap-3">
                        <Button
                            className="flex-1 py-6 text-lg rounded-xl shadow-lg shadow-green-200"
                            disabled={!warehouse.availability}
                            onClick={() => { onOpenChange(false); onBookClick(warehouse); }}
                        >
                            {warehouse.availability ? (
                                t('warehouse.bookNow', { defaultValue: 'Proceed to Booking' })
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Ban className="h-5 w-5" />
                                    {t('warehouse.sold', { defaultValue: 'Sold' })}
                                </span>
                            )}
                        </Button>
                        <Button variant="outline" className="py-6 rounded-xl" onClick={() => onOpenChange(false)}>
                            {t('common.close', { defaultValue: 'Close' })}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Internal Helper UI component
const Card = ({ icon, label, value, variant }: { icon: any, label: string, value: string, variant: 'stat' }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
        </div>
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);
