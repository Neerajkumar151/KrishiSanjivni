import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Package, Warehouse, ClipboardList } from 'lucide-react';

/* -------------------- Types -------------------- */
interface ToolBooking {
  id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  rental_type: string;
  rejection_reason?: string;
  tools: { name: string; category: string };
}

interface WarehouseBooking {
  id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  space_sqft: number;
  rejection_reason?: string;
  warehouse_storage_options: {
    storage_type: string;
    warehouses: { name: string; location: string };
  };
}

interface SoilCheck {
  id: string;
  location: string | null;
  primary_crop: string | null;
  status: string;
  created_at: string;
  recommendations: string | null;
}

/* -------------------- Component -------------------- */
const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [toolBookings, setToolBookings] = useState<ToolBooking[]>([]);
  const [warehouseBookings, setWarehouseBookings] = useState<WarehouseBooking[]>([]);
  const [soilChecks, setSoilChecks] = useState<SoilCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  /* ---------- Load Razorpay ONCE ---------- */
  useEffect(() => {
    if (document.getElementById('razorpay-script')) return;
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(s);
  }, []);

  /* ---------- Fetch Data ---------- */
  const fetchAll = async () => {
  setLoading(true);

  const [tools, warehouses, soil] = await Promise.all([
    supabase
      .from('tool_bookings')
      .select('*, tools(name, category)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('warehouse_bookings')
      .select('*, warehouse_storage_options(storage_type, warehouses(name, location))')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('soil_checks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false }),
  ]);

  setToolBookings(tools.data || []);
  setWarehouseBookings(warehouses.data || []);
  setSoilChecks(soil.data || []);
  setLoading(false);
};


  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  /* ---------- Status Badge ---------- */
  const badge = (s: string) => (
    <Badge variant={s === 'paid' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary'}>
      {s.toUpperCase()}
    </Badge>
  );

  /* ---------- Payment ---------- */
  const handlePayment = async (
  bookingId: string,
  amount: number,
  bookingType: 'Tool Booking' | 'Warehouse Booking'
) => {
  try {
    setPayingId(bookingId);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const orderRes = await fetch(
      'https://xfeeizryotmnopvgevmf.functions.supabase.co/create-razorpay-order',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, amount }),
      }
    );

    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || 'Order creation failed');

    const rzp = new (window as any).Razorpay({
      key: 'rzp_test_RU7Ssjpxs3pyhT',
      order_id: order.id,
      currency: order.currency,

      handler: async (response: any) => {
        try {
          if (
            !response?.razorpay_payment_id ||
            !response?.razorpay_order_id ||
            !response?.razorpay_signature
          ) {
            throw new Error('Invalid Razorpay response');
          }

          const recordRes = await fetch(
            'https://xfeeizryotmnopvgevmf.functions.supabase.co/record-payment',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId,
                bookingType: bookingType === 'Tool Booking' ? 'tool' : 'warehouse',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              }),
            }
          );

          const recordData = await recordRes.json();

          if (!recordRes.ok || !recordData.success) {
            throw new Error(recordData.error || 'Payment recording failed');
          }

          toast({
            title: 'Payment Successful',
            description: 'Your booking has been confirmed.',
          });

          await fetchAll(); // ✅ correct refresh
        } catch (err: any) {
          toast({
            title: 'Payment Failed',
            description: err.message,
            variant: 'destructive',
          });
        } finally {
          setPayingId(null);
        }
      },

      modal: {
        ondismiss: () => setPayingId(null),
      },
    });

    rzp.open();
  } catch (err: any) {
    setPayingId(null);
    toast({
      title: 'Payment Error',
      description: err.message,
      variant: 'destructive',
    });
  }
};



  /* -------------------- UI -------------------- */
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground mb-6">
          Welcome back, {profile?.full_name || user?.email}
        </p>

        <Tabs defaultValue="tools">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="tools"><Package className="w-4 h-4 mr-1" />Tools</TabsTrigger>
            <TabsTrigger value="warehouses"><Warehouse className="w-4 h-4 mr-1" />Warehouses</TabsTrigger>
            <TabsTrigger value="soil"><ClipboardList className="w-4 h-4 mr-1" />Soil</TabsTrigger>
          </TabsList>

          {/* TOOL BOOKINGS */}
          <TabsContent value="tools">
            <div className="max-w-4xl max-h-2xl mx-auto">
            {toolBookings.map(b => (
              <Card key={b.id} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between">

                  <div>
                    <CardTitle>{b.tools.name}</CardTitle>
                    <CardDescription>{b.tools.category}</CardDescription>
                  </div>
                  {badge(b.status)}
                </CardHeader>
                <CardContent className="px-3 py-3 text-base space-y-1">
  <div className="flex items-center gap-1">
    <Calendar className="w-3 h-3" />
    {format(new Date(b.start_date), 'PPP')} – {format(new Date(b.end_date), 'PPP')}
  </div>

  <div>₹{b.total_cost}</div>

  {b.status === 'accepted' && (
    <Button
      size="lg"
      className="h-9 w-full text-base mt-2"
      disabled={payingId === b.id}
      onClick={() => handlePayment(b.id, b.total_cost, 'Tool Booking')}
    >
      {payingId === b.id ? 'Processing…' : `Pay ₹${b.total_cost}`}
    </Button>
  )}
</CardContent>


              </Card>
            ))}
            </div>
          </TabsContent>

          {/* WAREHOUSE BOOKINGS */}
          <TabsContent value="warehouses">
            <div className="max-w-4xl mx-auto">
            {warehouseBookings.map(b => (
              <Card key={b.id} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{b.warehouse_storage_options.warehouses.name}</CardTitle>
                    <CardDescription>{b.warehouse_storage_options.warehouses.location}</CardDescription>
                  </div>
                  {badge(b.status)}
                </CardHeader>
                <CardContent className="px-3 py-3 text-base space-y-1">
  <div className="flex items-center gap-1">
    <Calendar className="w-3 h-3" />
    {format(new Date(b.start_date), 'PPP')} – {format(new Date(b.end_date), 'PPP')}
  </div>

  <div>₹{b.total_cost}</div>

  {b.status === 'accepted' && (
    <div className="flex justify-center mt-2">
    <Button
      size="lg"
      className="h-9 w-full text-base mt-2"
      disabled={payingId === b.id}
      onClick={() => handlePayment(b.id, b.total_cost, 'Warehouse Booking')}
    >
      {payingId === b.id ? 'Processing…' : `Pay ₹${b.total_cost}`}
    </Button>
    </div>
  )}
</CardContent>

              </Card>
            ))}
            </div>
          </TabsContent>

          {/* SOIL */}
          <TabsContent value="soil">
            <div className="max-w-4xl mx-auto">
            {soilChecks.map(s => (
              <Card key={s.id} className="mb-4">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>{s.location || 'Unknown Location'}</CardTitle>
    {badge(s.status)}
  </CardHeader>

  <CardContent className="px-3 py-3 text-base space-y-1">
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      {format(new Date(s.created_at), 'PPP')}
    </div>

    <div>{s.recommendations}</div>
  </CardContent>
</Card>

            ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
