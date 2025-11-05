import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Warehouse as WarehouseIcon, Loader2 } from 'lucide-react';
import { WarehouseBookingDialog } from '@/components/booking/WarehouseBookingDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { ChatBot } from '@/components/ChatBot';
import { Bot } from 'lucide-react';

// --- Shared Types and Utilities ---
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
}

const getStorageTypes = (warehouse: Warehouse): string => {
  if (!warehouse.storage_options || warehouse.storage_options.length === 0) return 'N/A';
  const types = [...new Set(warehouse.storage_options.map(opt => opt.storage_type))];
  return types.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ');
};

const getMinPrice = (warehouse: Warehouse): number => {
  if (!warehouse.storage_options || warehouse.storage_options.length === 0) return 0;
  return Math.min(...warehouse.storage_options.map(opt => opt.price_per_sqft_day));
};

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Warehouse: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedStorageType, setSelectedStorageType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('warehouses')
        .select(`
          *,
          storage_options:warehouse_storage_options(id, storage_type, price_per_sqft_day, price_per_sqft_month)
        `)
        .eq('availability', true)
        .gt('available_space_sqft', 0)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const fetchedData = data as Warehouse[] || [];
      setWarehouses(fetchedData);
      const uniqueLocations = Array.from(new Set(fetchedData.map(w => w.location).filter(Boolean)));
      setLocations(uniqueLocations);

    } catch (e: any) {
      console.error('Error fetching warehouses:', e);
      setError(e.message || t('warehouse.errorLoad', { defaultValue: 'Failed to load warehouses.' }));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { 
    fetchWarehouses(); 
    
    // Setup realtime subscription
    const channel = supabase
      .channel('warehouse-public-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouses'
        },
        () => {
          fetchWarehouses();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouse_storage_options'
        },
        () => {
          fetchWarehouses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWarehouses]);

  const filteredWarehouses = useMemo(() => {
    let filtered = warehouses;
    if (selectedStorageType !== 'all')
      filtered = filtered.filter(w => w.storage_options?.some(opt => opt.storage_type === selectedStorageType));
    if (selectedLocation !== 'all')
      filtered = filtered.filter(w => w.location === selectedLocation);
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(term) ||
        w.location.toLowerCase().includes(term) ||
        w.description?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [warehouses, selectedStorageType, selectedLocation, debouncedSearchTerm]);

  const handleBookClick = (warehouse: Warehouse) => {
    if (!user) {
      toast({
        title: t('warehouse.loginRequiredTitle', { defaultValue: 'Login Required' }),
        description: t('warehouse.loginRequiredDesc', { defaultValue: 'Please log in to book a warehouse.' }),
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    setSelectedWarehouse(warehouse);
    setBookingDialogOpen(true);
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center text-xl text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          {t('warehouse.loading', { defaultValue: 'Loading available warehouses...' })}
        </div>
        <Footer />
      </Layout>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <Button onClick={fetchWarehouses}>{t('warehouse.reload', { defaultValue: 'Try Reloading Data' })}</Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 flex items-center justify-center gap-3 rounded-full shadow-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 z-50 px-7 py-7"
        >
          <Bot className="text-white" style={{ width: '30px', height: '30px' }} />
          <span className="text-white font-semibold text-2xl">{t('common1.ai', { defaultValue: 'AI' })}</span>
        </Button>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {t('warehouse.title', { defaultValue: 'Available Warehouses' })}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('warehouse.subtitle', { defaultValue: 'Find the perfect storage solution for your needs.' })}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('warehouse.searchPlaceholder', { defaultValue: 'Search warehouses by name, location...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg shadow-sm focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 md:w-64">
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                {t('warehouse.storageType', { defaultValue: 'Storage Type' })}
              </label>
              <Select value={selectedStorageType} onValueChange={setSelectedStorageType}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder={t('warehouse.allStorage', { defaultValue: 'All Storage Types' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('warehouse.allStorage', { defaultValue: 'All Storage Types' })}</SelectItem>
                  <SelectItem value="cold">{t('warehouse.cold', { defaultValue: 'Cold Storage' })}</SelectItem>
                  <SelectItem value="hot">{t('warehouse.hot', { defaultValue: 'Hot Storage' })}</SelectItem>
                  <SelectItem value="normal">{t('warehouse.normal', { defaultValue: 'Normal Storage' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-1/2 md:w-64">
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                {t('warehouse.location', { defaultValue: 'Location' })}
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder={t('warehouse.allLocations', { defaultValue: 'All Locations' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('warehouse.allLocations', { defaultValue: 'All Locations' })}</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWarehouses.map(warehouse => (
            <Card key={warehouse.id} className="flex flex-col hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="p-0">
                <img
                  src={warehouse.image_url || 'https://placehold.co/600x400/1e293b/f8fafc?text=Warehouse'}
                  alt={warehouse.name}
                  onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400/1e293b/f8fafc?text=Warehouse'}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <CardTitle className="text-lg line-clamp-1">{warehouse.name}</CardTitle>
                <Badge variant="outline" className="mb-2 bg-slate-100 text-slate-700">{getStorageTypes(warehouse)}</Badge>
                <CardDescription className="line-clamp-2 mb-4 h-10 text-sm">
                  {warehouse.description || t('warehouse.noDescription', { defaultValue: 'No description available' })}
                </CardDescription>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <WarehouseIcon className="h-4 w-4 text-primary" />
                    <span className="truncate">{warehouse.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('warehouse.available', { defaultValue: 'Available:' })}</span>
                    <span className="font-semibold text-black">
                      {warehouse.available_space_sqft.toLocaleString('en-IN')} {t('warehouse.sqft', { defaultValue: 'sqft' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('warehouse.from', { defaultValue: 'From:' })}</span>
                    <span className="font-bold text-black">
                      ₹{getMinPrice(warehouse).toFixed(2)}/{t('warehouse.perSqftDay', { defaultValue: 'sqft/day' })}
                    </span>
                  </div>

                  {warehouse.features?.length > 0 && (
                    <div className="pt-2 border-t mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t('warehouse.features', { defaultValue: 'Features:' })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {warehouse.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-gray-200">
                            {feature}
                          </Badge>
                        ))}
                        {warehouse.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-300">
                            +{warehouse.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleBookClick(warehouse)}>
                  {t('warehouse.bookNow', { defaultValue: 'Book Now' })}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredWarehouses.length === 0 && !isLoading && (
          <div className="text-center py-12 border border-dashed rounded-lg mt-8">
            <p className="text-muted-foreground text-lg">
              {t('warehouse.noResults', { defaultValue: 'No warehouses found matching your criteria' })}
            </p>
            <p className="text-sm text-gray-400">
              {t('warehouse.tryAdjust', { defaultValue: 'Try adjusting your filters or search term.' })}
            </p>
          </div>
        )}
      </div>

      {selectedWarehouse && (
        <WarehouseBookingDialog
          warehouse={selectedWarehouse}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
        />
      )}

      <Footer />
    </Layout>
  );
};

export default Warehouse;
