import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Eye, Check, X } from 'lucide-react';

interface WarehouseBooking {
  id: string;
  user_id: string;
  warehouse_storage_option_id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  space_sqft: number;
  contact_phone?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  warehouse_storage_options: {
    storage_type: string;
    warehouses: {
      name: string;
      location: string;
    };
  };
  profiles: {
    full_name: string;
  };
}

const AdminWarehouseBookings: React.FC = () => {
  const { loading } = useAdminCheck();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<WarehouseBooking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_bookings')
        .select(`
          *,
          warehouse_storage_options (
            storage_type,
            warehouses (name, location)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', booking.user_id)
            .maybeSingle();
          
          return {
            ...booking,
            profiles: profile || { full_name: 'N/A' }
          };
        })
      );

      setBookings(bookingsWithProfiles as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateBookingStatus = async (id: string, status: string, rejection_reason?: string) => {
    try {
      const { error } = await supabase
        .from('warehouse_bookings')
        .update({ status, rejection_reason })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Booking ${status} successfully`
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAccept = async (id: string) => {
    await updateBookingStatus(id, 'accepted');
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive'
      });
      return;
    }

    await updateBookingStatus(selectedBooking.id, 'rejected', rejectionReason);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      accepted: 'default',
      rejected: 'destructive',
      paid: 'default',
      completed: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Warehouse Bookings</h1>
        <span className="text-muted-foreground">{bookings.length} total bookings</span>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No warehouse bookings yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{format(new Date(booking.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{booking.profiles?.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.warehouse_storage_options?.warehouses?.name}</div>
                    <div className="text-sm text-muted-foreground">{booking.warehouse_storage_options?.warehouses?.location}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{booking.space_sqft} sq ft</TableCell>
                <TableCell>₹{booking.total_cost}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAccept(booking.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information about this warehouse booking</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Warehouse</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.warehouse_storage_options?.warehouses?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.warehouse_storage_options?.warehouses?.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.profiles?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.contact_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Storage Type</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedBooking.warehouse_storage_options?.storage_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Space Required</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.space_sqft} sq ft</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Storage Period</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedBooking.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedBooking.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-lg font-bold">₹{selectedBooking.total_cost}</p>
                </div>
                {selectedBooking.rejection_reason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. The customer will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Warehouse space not available for the selected dates, Maintenance work scheduled"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWarehouseBookings;
