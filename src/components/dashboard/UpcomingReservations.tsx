"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users } from "lucide-react";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_amount: number;
  status: string;
  guests?: {
    full_name: string;
  };
}

interface Props {
  bookings: Booking[];
}

export default function UpcomingReservations({
  bookings,
}: Props) {
  const upcomingBookings = bookings
    .filter((booking) => {
      const today = new Date().toISOString().split("T")[0];
      return booking.check_in >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.check_in).getTime() -
        new Date(b.check_in).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="rounded-3xl border-0 shadow-sm bg-white">

      <CardContent className="p-8">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-2xl font-bold">
              Upcoming Reservations
            </h2>

            <p className="text-zinc-500 mt-1">
              Next scheduled guests
            </p>

          </div>

          <CalendarDays
            className="text-[#C8A96A]"
            size={28}
          />

        </div>

        {upcomingBookings.length === 0 ? (

          <div className="text-center py-10">

            <CalendarDays
              size={56}
              className="mx-auto text-zinc-300"
            />

            <p className="mt-4 text-zinc-500">
              No upcoming reservations.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {upcomingBookings.map((booking) => (

              <div
                key={booking.id}
                className="
                  flex
                  items-center
                  justify-between
                  border
                  rounded-2xl
                  p-5
                  hover:bg-zinc-50
                  transition
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      h-12
                      w-12
                      rounded-full
                      bg-[#F8F4EB]
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <Users
                      className="text-[#C8A96A]"
                      size={22}
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-lg">
                      {booking.guests?.full_name}
                    </h3>

                    <p className="text-sm text-zinc-500">
                      {booking.guest_count} Guest(s)
                    </p>

                  </div>

                </div>

                <div className="text-center">

                  <p className="text-sm text-zinc-500">
                    Check In
                  </p>

                  <p className="font-semibold">
                    {new Date(
                      booking.check_in
                    ).toLocaleDateString("en-GB")}
                  </p>

                </div>

                <div className="text-center">

                  <p className="text-sm text-zinc-500">
                    Check Out
                  </p>

                  <p className="font-semibold">
                    {new Date(
                      booking.check_out
                    ).toLocaleDateString("en-GB")}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-sm text-zinc-500">
                    Amount
                  </p>

                  <p className="font-bold text-lg">
                    ₹{Number(
                      booking.total_amount
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </CardContent>

    </Card>
  );
}