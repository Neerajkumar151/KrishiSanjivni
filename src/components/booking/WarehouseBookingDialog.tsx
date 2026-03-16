import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface StorageOption {
  id: string;
  storage_type: 'normal' | 'cold' | 'hot';
  price_per_sqft_day: number;
  price_per_sqft_month: number;
}

interface WarehouseBookingDialogProps {
  warehouse: {
    id: string;
    name: string;
    available_space_sqft: number;
    storage_options?: StorageOption[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WarehouseBookingDialog: React.FC<WarehouseBookingDialogProps> = ({ 
  warehouse, 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStorageOption, setSelectedStorageOption] = useState<string>('');
  const [spaceSqft, setSpaceSqft] = useState<string>('100');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const getSelectedOption = () => {
    return warehouse.storage_options?.find(opt => opt.id === selectedStorageOption);
  };

  const calculateTotalCost = () => {
    if (!startDate || !endDate || !selectedStorageOption) return 0;
    const option = getSelectedOption();
    if (!option) return 0;

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days <= 30) {
      return (parseInt(spaceSqft) || 0) * option.price_per_sqft_day * days;
    } else {
      const months = Math.ceil(days / 30);
      return (parseInt(spaceSqft) || 0) * option.price_per_sqft_month * months;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to book a warehouse',
        variant: 'destructive'
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select start and end dates',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedStorageOption) {
      toast({
        title: 'Error',
        description: 'Please select a storage type',
        variant: 'destructive'
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      });
      return;
    }

    const spaceValue = parseInt(spaceSqft) || 0;
    if (spaceValue > warehouse.available_space_sqft) {
      toast({
        title: 'Error',
        description: `Only ${warehouse.available_space_sqft} sqft available`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('warehouse_bookings')
        .insert({
          warehouse_storage_option_id: selectedStorageOption,
          user_id: user.id,
          space_sqft: spaceValue,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          total_cost: calculateTotalCost(),
          contact_phone: contactPhone,
          notes: notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking request submitted successfully! Check your profile for updates.'
      });

      onOpenChange(false);
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setContactPhone('');
      setNotes('');
      setSpaceSqft('100');
      setSelectedStorageOption('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit booking',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {warehouse.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storage-type">Storage Type *</Label>
            <Select value={selectedStorageOption} onValueChange={setSelectedStorageOption}>
              <SelectTrigger>
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                {warehouse.storage_options?.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.storage_type.charAt(0).toUpperCase() + option.storage_type.slice(1)} Storage
                    (₹{option.price_per_sqft_day}/sqft/day)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-sqft">Space Required (sqft) *</Label>
            <Input
              id="space-sqft"
              type="number"
              required
              min="1"
              max={warehouse.available_space_sqft}
              value={spaceSqft}
              onChange={(e) => setSpaceSqft(e.target.value)}
              placeholder="Enter space in sqft"
            />
            <p className="text-sm text-muted-foreground">
              Available: {warehouse.available_space_sqft.toLocaleString('en-IN')} sqft
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => { setStartDate(date); setStartDateOpen(false); }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => { setEndDate(date); setEndDateOpen(false); }}
                    disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact Phone *</Label>
            <Input
              id="contact-phone"
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Your contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes"
              rows={3}
            />
          </div>

          {startDate && endDate && selectedStorageOption && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Cost:</span>
                <span className="text-2xl font-bold">₹{calculateTotalCost().toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
