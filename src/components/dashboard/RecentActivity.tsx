"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  Wallet,
  UserCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Booking {
  id: string;
  total_amount: number;
  created_at: string;
  guests?: {
    full_name: string;
  };
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  created_at: string;
}

interface Props {
  bookings: Booking[];
  expenses: Expense[];
}

export default function RecentActivity({
  bookings,
  expenses,
}: Props) {

  const bookingActivity = bookings.map((booking) => ({
    id: booking.id,
    type: "booking",
    title: "New Booking",
    name: booking.guests?.full_name ?? "Guest",
    amount: booking.total_amount,
    date: booking.created_at,
  }));

  const expenseActivity = expenses.map((expense) => ({
    id: expense.id,
    type: "expense",
    title: "Expense Added",
    name: expense.title,
    amount: expense.amount,
    date: expense.created_at,
  }));

  const activities = [
    ...bookingActivity,
    ...expenseActivity,
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 8);

  return (

    <Card className="rounded-3xl border-0 shadow-sm">

      <CardContent className="p-8">

        <div className="mb-8">

          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <p className="text-zinc-500">
            Latest updates from your property
          </p>

        </div>

        <div className="space-y-6">

          {activities.length === 0 ? (

            <div className="text-center py-12">

              <UserCheck
                className="mx-auto text-zinc-300"
                size={60}
              />

              <p className="mt-5 text-zinc-500">
                No recent activity.
              </p>

            </div>

          ) : (

            activities.map((activity) => (

              <div
                key={`${activity.type}-${activity.id}`}
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  pb-5
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`
                      h-12
                      w-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center

                      ${
                        activity.type === "booking"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }
                    `}
                  >

                    {activity.type === "booking" ? (

                      <CalendarCheck2
                        className="text-green-600"
                        size={22}
                      />

                    ) : (

                      <Wallet
                        className="text-red-600"
                        size={22}
                      />

                    )}

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      {activity.title}

                    </h3>

                    <p className="text-zinc-500 text-sm">

                      {activity.name}

                    </p>

                    <p className="text-xs text-zinc-400 mt-1">

                      {new Date(
                        activity.date
                      ).toLocaleString("en-IN")}

                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="font-bold">

                    ₹{Number(
                      activity.amount
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}

                  </p>

                  {activity.type === "booking" && (

                    <Link
                      href={`/bookings/${activity.id}`}
                      className="
                        text-blue-600
                        text-sm
                        hover:underline
                      "
                    >
                      View
                    </Link>

                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </CardContent>

    </Card>

  );

}