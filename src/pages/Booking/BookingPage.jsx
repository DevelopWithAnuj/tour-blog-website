import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, format } from 'date-fns';
import { CalendarIcon, Minus, Plus } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from '../../context/ToastContext.jsx';

const schema = z.object({
  date: z
    .date()
    .nullable()
    .refine((d) => d !== null, 'Pick a travel date'),
  guestCount: z.number().int().min(1).max(20),
  travelerName: z.string().trim().min(1, 'Name is required'),
  travelerEmail: z.string().trim().email('Valid email is required'),
  travelerPhone: z.string().trim().max(20, 'Max 20 characters').optional(),
  specialRequests: z.string().trim().max(500, 'Max 500 characters').optional(),
});

function FieldError({ error }) {
  return error ? (
    <p className="mt-1 text-xs text-red-600">{error.message}</p>
  ) : null;
}

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tour = useLocation().state?.tour;
  const [dateOpen, setDateOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: null,
      guestCount: 1,
      travelerName: user?.fullName || '',
      travelerEmail: user?.email || '',
      travelerPhone: '',
      specialRequests: '',
    },
  });

  if (!tour) return <Navigate to="/tours" replace />;

  const guests = watch('guestCount');
  const total = tour.price * guests;

  const onSubmit = async (values) => {
    try {
      const res = await axios.post('/api/v1/bookings', {
        ...values,
        date: values.date.toISOString(),
        tourId: tour._id,
      });
      navigate(`/booking/payment?id=${res.data.data.booking._id}`);
    } catch (err) {
      const first = err.response?.data?.errors?.[0];
      toast(
        (first && Object.values(first)[0]) ||
          err.response?.data?.message ||
          'Could not create booking.',
        { type: 'error' }
      );
    }
  };

  return (
    <section className="booking-page mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book: {tour.title}</CardTitle>
          <CardDescription>
            ₹{Number(tour.price).toLocaleString('en-IN')} per guest
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {/* Date picker */}
            <div>
              <Label>Travel date</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-1 w-full justify-start font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={(d) => {
                          field.onChange(d ?? null);
                          setDateOpen(false);
                        }}
                        disabled={{ before: addDays(new Date(), 1) }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError error={errors.date} />
            </div>

            {/* Guest stepper */}
            <div>
              <Label>Guests</Label>
              <Controller
                control={control}
                name="guestCount"
                render={({ field }) => (
                  <div className="mt-1 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={field.value <= 1}
                      onClick={() => field.onChange(field.value - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {field.value}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={field.value >= 20}
                      onClick={() => field.onChange(field.value + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            </div>

            <div>
              <Label htmlFor="travelerName">Full name</Label>
              <Input
                id="travelerName"
                className="mt-1"
                {...register('travelerName')}
              />
              <FieldError error={errors.travelerName} />
            </div>

            <div>
              <Label htmlFor="travelerEmail">Email</Label>
              <Input
                id="travelerEmail"
                type="email"
                className="mt-1"
                {...register('travelerEmail')}
              />
              <FieldError error={errors.travelerEmail} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="travelerPhone">Phone (optional)</Label>
              <Input
                id="travelerPhone"
                className="mt-1"
                {...register('travelerPhone')}
              />
              <FieldError error={errors.travelerPhone} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="specialRequests">
                Special requests (optional)
              </Label>
              <Textarea
                id="specialRequests"
                rows={3}
                className="mt-1"
                {...register('specialRequests')}
              />
              <FieldError error={errors.specialRequests} />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white sm:col-span-2">
              <span className="text-sm text-slate-300">Estimated total</span>
              <span className="text-xl font-bold text-amber-400">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 text-white hover:bg-amber-600 sm:col-span-2"
            >
              {isSubmitting ? 'Creating booking…' : 'Continue to payment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
