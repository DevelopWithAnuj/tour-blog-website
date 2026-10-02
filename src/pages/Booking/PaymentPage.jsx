import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Smartphone } from 'lucide-react';
import { formatBookingId } from '../../utils/formatBookingId.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '../../context/ToastContext.jsx';

export default function PaymentPage() {
  const id = useSearchParams()[0].get('id');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/v1/bookings/${id}`)
      .then((res) => setBooking(res.data.data.booking))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/tours" replace />;
  if (loading) return <section className="payment-page">Loading…</section>;
  if (!booking)
    return <section className="payment-page">Booking not found.</section>;
  if (booking.paymentStatus === 'paid')
    return <Navigate to={`/booking/confirmation?id=${id}`} replace />;

  const amount = `₹${booking.totalAmount.toLocaleString('en-IN')}`;

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await axios.post(`/api/v1/bookings/${id}/pay`, { method, cardNumber });
      toast('Payment successful', { type: 'success' });
      navigate(`/booking/confirmation?id=${id}`);
    } catch (err) {
      const first = err.response?.data?.errors?.[0];
      toast(
        (first && Object.values(first)[0]) ||
          err.response?.data?.message ||
          'Payment failed.',
        { type: 'error' }
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <section className="payment-page mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="font-semibold">{booking.tour?.title}</p>
            <p className="text-slate-500">
              {new Date(booking.date).toLocaleDateString(undefined, {
                timeZone: 'UTC',
              })}{' '}
              · {booking.guestCount} guest(s)
            </p>
            <p className="text-xs text-slate-400">
              Booking {formatBookingId(booking._id)}
            </p>
            <p className="mt-2 text-lg font-bold text-amber-600">{amount}</p>
          </div>

          <Separator className="my-5" />

          <form onSubmit={handlePay}>
            <Tabs value={method} onValueChange={setMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="upi">
                  <Smartphone className="mr-2 h-4 w-4" />
                  UPI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                <Label htmlFor="card">Card number (mock)</Label>
                <Input
                  id="card"
                  inputMode="numeric"
                  maxLength={19}
                  required={method === 'card'}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Test mode: a card ending in 0000 is declined.
                </p>
              </TabsContent>

              <TabsContent value="upi" className="mt-4 text-sm text-slate-500">
                Mock UPI: no details needed.
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              disabled={paying}
              className="mt-6 w-full bg-amber-500 text-white hover:bg-amber-600"
            >
              {paying ? 'Processing…' : `Pay ${amount}`}
            </Button>
          </form>

          <Link
            to="/dashboard"
            className="mt-5 inline-block text-sm text-slate-500 hover:text-slate-900"
          >
            Pay later from dashboard
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
