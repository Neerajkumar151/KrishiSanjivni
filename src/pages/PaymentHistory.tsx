import React, { useEffect, useState, useRef } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Download, Receipt, ArrowLeft, CheckCircle2, Clock, XCircle, Eye, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- Types ---
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
  item_name?: string; 
  booked_sqft?: number; // Added field for warehouse space
}

// --- Invoice Component ---

const InvoicePreview = ({ data, userEmail, onBack }: { data: any, userEmail: string | undefined, onBack: () => void }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM do, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      Paid: {
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 border-green-200', 
        text: 'Paid',
      },
      Pending: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        text: 'Pending',
      },
      Failed: {
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200',
        text: 'Failed',
      },
    };
    return configs[status] || configs.Paid;
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const statusConfig = getStatusConfig(data.paymentStatus);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-wrapper, .invoice-print-wrapper * { visibility: visible; }
          .invoice-print-wrapper {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; z-index: 9999;
          }
          @page { margin: 0mm; size: auto; }
          body { -webkit-print-color-adjust: exact !important; print-color-scheme: light; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300 print:p-0 print:m-0 print:bg-white">
        <div className="max-w-4xl mx-auto print:w-full print:max-w-none">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 no-print print:hidden">
            <Button variant="outline" onClick={onBack} className="hover:shadow-md transition-all bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
            <Button onClick={handleDownloadPDF} data-download-btn className="shadow-lg hover:shadow-xl transition-all">
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
          </div>

          {/* Invoice Card */}
          <div className="invoice-print-wrapper">
            <Card ref={invoiceRef} className="invoice-page shadow-xl overflow-hidden border-none bg-white print:shadow-none print:rounded-none">
              {/* 1. BRAND HEADER */}
              <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-10 text-white print:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Receipt className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight">KrishiSanjivni</h1>
                    </div>
                    <p className="text-blue-200 text-sm ml-1">Empowering Farmers, Enabling Growth</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Invoice Number</p>
                    <p className="text-xl font-mono font-bold break-all opacity-95">#{data.invoiceId || 'N/A'}</p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 print:border-gray-300">
                      <Clock className="h-3 w-3 text-blue-200" />
                      <p className="text-xs font-medium text-blue-100">{formatDate(data.paymentDate)}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5"><Receipt className="h-64 w-64" /></div>
              </div>

              <div className="p-8 sm:p-12 bg-white print:p-6">
                {/* 2. ADDRESS SECTION */}
                <div className="flex flex-col md:flex-row gap-12 mb-12 print:gap-4 print:mb-6">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Billed From</p>
                    <h3 className="font-bold text-gray-900 mb-1">KrishiSanjivni Inc.</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span>123 AgriTech Park, Sector 62</span></div>
                      <p className="pl-5">Noida, UP 201301, India</p>
                      <div className="flex items-center gap-2 mt-2"><Mail className="h-3 w-3" /><span>billing@krishisanjivni.in</span></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Billed To</p>
                    <h3 className="font-bold text-gray-900 mb-1">Valued Customer</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><span>{userEmail || 'customer@example.com'}</span></div>
                      <div className="flex items-center gap-2"><Globe className="h-3 w-3" /><span>Online Payment</span></div>
                    </div>
                  </div>
                </div>

                {/* 3. ORDER SUMMARY TABLE */}
                <div className="mb-10 print:mb-6">
                  <p className="text-lg font-bold text-gray-900 mb-4">Order Summary</p>
                  <div className="border rounded-lg overflow-hidden print:border-gray-300">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium border-b print:bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 w-1/2 print:px-4 print:py-2">Description</th>
                          <th className="px-6 py-4 text-center print:px-4 print:py-2">Qty</th>
                          <th className="px-6 py-4 text-right print:px-4 print:py-2">Price</th>
                          <th className="px-6 py-4 text-right print:px-4 print:py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-6 py-4 print:px-4 print:py-2">
                            <p className="font-semibold text-gray-900 text-base">
                              {data.itemName || data.bookingType}
                            </p>
                            
                            {/* --- CONDITIONAL DISPLAY FOR WAREHOUSE SQFT --- */}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                {data.itemName && (
                                  <>
                                    <span className="font-medium">{data.bookingType}</span>
                                    <span className="hidden sm:inline">•</span>
                                  </>
                                )}
                                <span className="font-mono">Ref: {data.bookingId}</span>
                                
                                {/* Only show this span if bookedSqft exists (Warehouse Booking) */}
                                {data.bookedSqft && (
                                  <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                      Size: {data.bookedSqft} sq ft
                                    </span>
                                  </>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 print:px-4 print:py-2">1</td>
                          <td className="px-6 py-4 text-right text-gray-600 print:px-4 print:py-2">{formatAmount(data.totalAmount)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 print:px-4 print:py-2">{formatAmount(data.totalAmount)}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50/50 print:bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-500 print:px-4 print:py-2">Subtotal</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 print:px-4 print:py-2">{formatAmount(data.totalAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-6 py-2 text-right font-medium text-gray-500 border-none print:px-4 print:py-1">Tax (0%)</td>
                          <td className="px-6 py-2 text-right text-gray-600 border-none print:px-4 print:py-1">₹0.00</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900 text-lg border-t print:px-4 print:py-2">Total</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-700 text-lg border-t print:px-4 print:py-2">{formatAmount(data.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* 4. PAYMENT & TECHNICAL DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 print:gap-4 print:mb-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 print:p-4 print:bg-white print:border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Payment Information</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><Badge className={`${statusConfig.className} px-2.5 py-0.5 text-xs font-semibold shadow-none border-0`}><span className="leading-none pb-[1px]">{statusConfig.text}</span></Badge></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="font-medium text-gray-900">Razorpay Secure</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{formatDate(data.paymentDate)}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 print:p-4 print:bg-white print:border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Transaction Reference</p>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1"><span className="text-xs text-gray-500 uppercase">Payment ID</span><span className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border break-all">{data.razorpayPaymentId}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-xs text-gray-500 uppercase">Order ID</span><span className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border break-all">{data.razorpayOrderId}</span></div>
                    </div>
                  </div>
                </div>

                {/* 5. FOOTER & TERMS */}
                <div className="border-t pt-8 avoid-break print:pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-2">Terms & Conditions</p>
                      <p className="text-xs text-gray-500 leading-relaxed">This invoice is electronically generated and valid without a signature. Payments are non-refundable once services are rendered. Please quote the invoice number in all future correspondence.</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold text-gray-900 text-sm mb-2">Thank you for your business!</p>
                      <p className="text-xs text-gray-500">For support, please contact us at:<br/><span className="text-blue-600">support@krishisanjivni.in</span><br/>+91 1800-123-4567</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-dashed border-gray-200 text-center print:mt-4 print:pt-2">
                    <p className="text-[10px] text-gray-400">KrishiSanjivni © {new Date().getFullYear()} | Registered Office: Greater Noida, India</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Main Page Component ---

const PaymentHistory: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      // Selecting from updated VIEW
      const { data, error } = await supabase
        .from('payment_history_view') 
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

  if (selectedPayment) {
    const invoiceData = {
      invoiceId: selectedPayment.transaction_id,
      paymentDate: selectedPayment.payment_date,
      paymentStatus: selectedPayment.payment_status,
      bookingType: selectedPayment.type,
      bookingId: selectedPayment.booking_id,
      razorpayPaymentId: selectedPayment.razorpay_payment_id,
      razorpayOrderId: selectedPayment.razorpay_order_id,
      totalAmount: selectedPayment.amount,
      itemName: selectedPayment.item_name,
      bookedSqft: selectedPayment.booked_sqft // Passing the new data
    };

    return (
      <Layout>
        <InvoicePreview 
          data={invoiceData} 
          userEmail={user?.email}
          onBack={() => setSelectedPayment(null)} 
        />
      </Layout>
    );
  }

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
                      {payment.item_name || payment.type} 
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
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View & Download Invoice
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