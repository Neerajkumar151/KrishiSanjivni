import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Download, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_status: string;
  payment_date: string;
  transaction_id: string;
  type: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
}

const PaymentHistory: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: t('payment.errorTitle'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (payment: Payment) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('KrishiSanjivni – Payment Invoice', 20, 20);

  doc.setFontSize(11);
  doc.text(`Invoice ID: ${payment.transaction_id}`, 20, 35);
  doc.text(`Payment Date: ${format(new Date(payment.payment_date), 'PPP')}`, 20, 45);
  doc.text(`Payment Status: ${payment.payment_status}`, 20, 55);

  doc.line(20, 60, 190, 60);

  doc.text(`Booking Type: ${payment.type}`, 20, 75);
  doc.text(`Booking ID: ${payment.booking_id}`, 20, 85);
  doc.text(`Razorpay Payment ID: ${payment.razorpay_payment_id}`, 20, 95);
  doc.text(`Razorpay Order ID: ${payment.razorpay_order_id}`, 20, 105);

  doc.line(20, 115, 190, 115);

  doc.setFontSize(14);
  doc.text(`Total Amount Paid: ₹${payment.amount}`, 20, 130);

  doc.setFontSize(10);
  doc.text(
    'This is a system generated invoice. No signature required.',
    20,
    160
  );

  doc.save(`invoice-${payment.transaction_id}.pdf`);
};


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Receipt className="w-8 h-8" />
          <h1 className="text-4xl font-bold">{t('payment.title')}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">{t('payment.loading')}</div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">{t('payment.noHistory')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {payment.type}
                    </CardTitle>
                    <Badge variant="default">{payment.payment_status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('payment.transactionId')}</p>
                      <p className="font-mono text-sm">{payment.transaction_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('payment.amount')}</p>
                      <p className="text-2xl font-bold">₹{payment.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('payment.date')}</p>
                      <p className="text-sm">{format(new Date(payment.payment_date), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('payment.razorpayOrderId')}</p>
                      <p className="font-mono text-sm">{payment.razorpay_order_id}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(payment)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('payment.downloadInvoice')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentHistory;
