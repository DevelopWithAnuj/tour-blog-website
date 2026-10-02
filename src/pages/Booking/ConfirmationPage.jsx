import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2 } from 'lucide-react';
import { formatBookingId } from '../../utils/formatBookingId.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ConfirmationPage() {
  const id = useSearchParams()[0].get('id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/v1/bookings/${id}`)
      .then((res) => setBooking(res.data.data.booking))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/tours" replace />;
  if (loading) return <section className="confirmation-page">Loading…</section>;
  if (!booking)
    return <section className="confirmation-page">Booking not found.</section>;
  if (booking.paymentStatus !== 'paid')
    return <Navigate to={`/booking/payment?id=${id}`} replace />;

  const rows = [
    ['Booking ID', formatBookingId(booking._id)],
    ['Tour', booking.tour?.title],
    ['Travel date', new Date(booking.date).toLocaleDateString()],
    ['Guests', booking.guestCount],
    ['Amount', `₹${booking.totalAmount.toLocaleString('en-IN')}`],
  ];

  return (
    <section className="confirmation-page mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-emerald-700">
            <CheckCircle2 className="h-6 w-6" /> Booking received
          </CardTitle>
          <CardDescription>
            Status stays pending until an admin confirms it.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2">
            <Badge variant="secondary" className="capitalize">
              Payment: {booking.paymentStatus}
            </Badge>
            <Badge className="bg-amber-100 capitalize text-amber-700 hover:bg-amber-100">
              {booking.status}
            </Badge>
          </div>

          <Separator className="my-4" />

          <dl className="space-y-3 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="break-all font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard">View dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tours">Browse more tours</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
