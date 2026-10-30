"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  User,
  CalendarDays,
  Users,
} from "lucide-react";

interface Booking {
  guests?: {
    full_name: string;
  };
  check_in: string;
  check_out: string;
  guest_count: number;
}

interface Props {
  currentBooking?: Booking | null;
}

export default function PropertyStatus({
  currentBooking,
}: Props) {

  const occupied = !!currentBooking;

  return (
    <Card className="rounded-3xl border-0 shadow-sm bg-white">

      <CardContent className="p-8">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-zinc-500">
              Property Status
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {occupied ? "Occupied" : "Available"}
            </h2>

          </div>

          <div
            className={`
              px-5
              py-2
              rounded-full
              text-sm
              font-semibold

              ${
                occupied
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }
            `}
          >
            {occupied ? "Occupied" : "Available"}
          </div>

        </div>

        {occupied ? (

          <div className="grid md:grid-cols-4 gap-6 mt-8">

            <div>

              <div className="flex items-center gap-2">

                <User size={18} />

                <span className="text-zinc-500">
                  Guest
                </span>

              </div>

              <p className="font-semibold mt-2">
                {currentBooking.guests?.full_name}
              </p>

            </div>

            <div>

              <div className="flex items-center gap-2">

                <CalendarDays size={18} />

                <span className="text-zinc-500">
                  Check In
                </span>

              </div>

              <p className="font-semibold mt-2">
                {new Date(
                  currentBooking.check_in
                ).toLocaleDateString("en-IN")}
              </p>

            </div>

            <div>

              <div className="flex items-center gap-2">

                <CalendarDays size={18} />

                <span className="text-zinc-500">
                  Check Out
                </span>

              </div>

              <p className="font-semibold mt-2">
                {new Date(
                  currentBooking.check_out
                ).toLocaleDateString("en-IN")}
              </p>

            </div>

            <div>

              <div className="flex items-center gap-2">

                <Users size={18} />

                <span className="text-zinc-500">
                  Guests
                </span>

              </div>

              <p className="font-semibold mt-2">
                {currentBooking.guest_count}
              </p>

            </div>

          </div>

        ) : (

          <div className="text-center py-14">

            <Home
              size={64}
              className="mx-auto text-green-500"
            />

            <h3 className="text-2xl font-semibold mt-5">
              Property Available
            </h3>

            <p className="text-zinc-500 mt-2">
              No guests are currently staying.
            </p>

          </div>

        )}

      </CardContent>

    </Card>
  );
}