import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Info, Tag, Calendar, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Tool {
    id: string;
    name: string;
    description: string | null;
    category: string;
    image_url: string | null;
    price_per_day: number;
    price_per_month: number;
    price_per_season: number;
    availability: boolean;
    location: string | null;
}

interface ToolDetailsDialogProps {
    tool: Tool | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRentClick: (tool: Tool) => void;
    categoryKeyMap: Record<string, string>;
}

export const ToolDetailsDialog: React.FC<ToolDetailsDialogProps> = ({
    tool,
    open,
    onOpenChange,
    onRentClick,
    categoryKeyMap
}) => {
    const { t } = useTranslation();

    if (!tool) return null;

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl border-none">
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        src={tool.image_url || '/placeholder.svg'}
                        alt={`${tool.name} - ${tool.category} farming equipment`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                        <Badge variant={tool.availability ? 'default' : 'secondary'} className="px-3 py-1 text-sm shadow-lg">
                            {tool.availability ? (
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t('tools.availability', { defaultValue: 'Available' })}</span>
                            ) : (
                                <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> {t('tools.outOfStock', { defaultValue: 'Out of Stock' })}</span>
                            )}
                        </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="bg-white/20 backdrop-blur-md text-white border-white/30">
                                {t(categoryKeyMap[tool.category] || tool.category)}
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-bold">{tool.name}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Main Info Grid */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-6">
                            {/* Description */}
                            <section>
                                <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                                    <Info className="h-5 w-5" />
                                    <h3>{t('tools.details.description', { defaultValue: 'Description & Specifications' })}</h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {tool.description || t('tools.noDescription', { defaultValue: 'No description available' })}
                                </p>
                            </section>

                            {/* Location */}
                            {tool.location && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                                        <MapPin className="h-5 w-5" />
                                        <h3>{t('tools.details.location', { defaultValue: 'Location' })}</h3>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 border flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md shadow-sm">
                                            <MapPin className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{tool.location}</span>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Pricing Card */}
                        <div className="w-full md:w-72">
                            <div className="p-5 rounded-xl border bg-slate-50/50 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Tag className="h-4 w-4" />
                                    <span>{t('tools.details.rental_rates', { defaultValue: 'Rental Rates' })}</span>
                                </div>

                                <div className="space-y-3">
                                    <PriceRow label={t('tools.daily', { defaultValue: 'Daily' })} value={formatCurrency(tool.price_per_day)} />
                                    <PriceRow label={t('tools.monthly', { defaultValue: 'Monthly' })} value={formatCurrency(tool.price_per_month)} />
                                    <PriceRow label={t('tools.seasonal', { defaultValue: 'Seasonal' })} value={formatCurrency(tool.price_per_season)} />
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-xs text-muted-foreground text-center mb-4">
                                        {t('tools.pricing_disclaimer', { defaultValue: 'Prices may vary based on duration and season.' })}
                                    </p>
                                    <Button
                                        className="w-full py-6 text-lg rounded-xl shadow-lg shadow-green-100"
                                        disabled={!tool.availability}
                                        onClick={() => { onOpenChange(false); onRentClick(tool); }}
                                    >
                                        {tool.availability ? (
                                            t('tools.rentNow', { defaultValue: 'Rent Now' })
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Ban className="h-4 w-4" />
                                                {t('tools.sold', { defaultValue: 'Sold' })}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};

const PriceRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center group">
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}:</span>
        <span className="font-bold text-lg">{value}</span>
    </div>
);
