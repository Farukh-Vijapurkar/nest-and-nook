"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  IndianRupee,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

export default function Home() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]); // STEP 3

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: bookingsData } =
      await supabase
        .from("bookings")
        .select(`
          *,
          guests (
            full_name,
            phone,
            email,
            document_url
          )
        `);

    const { data: expensesData } =
      await supabase
        .from("expenses")
        .select("*");

    // STEP 3 — fetch guests
    const { data: guestsData } =
      await supabase
        .from("guests")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    setBookings(bookingsData || []);
    setExpenses(expensesData || []);
    setGuests(guestsData || []); // STEP 3
  }

  const revenue =
    bookings.reduce(
      (sum, booking) =>
        sum + Number(booking.total_amount || 0),
      0
    );

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const profit =
    revenue - totalExpenses;

  // STEP 1 — sum guest_count instead of using bookings.length
  const totalGuests =
    bookings.reduce(
      (sum, booking) =>
        sum + Number(booking.guest_count || 1),
      0
    );

  const chartData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 7000 },
    { month: "Mar", revenue: 10000 },
    { month: "Apr", revenue: 18000 },
    { month: "May", revenue: 13500 },
    { month: "Jun", revenue: 22000 },
  ];

  return (
    <div className="p-10 space-y-8">

      {/* HERO */}

      <div
        className="
          rounded-3xl
          bg-gradient-to-r
          from-violet-600
          via-purple-600
          to-indigo-600
          p-8
          text-white
          shadow-xl
        "
      >
        <h1 className="text-5xl font-bold">
          Welcome back, Farukh! 👋
        </h1>

        <p className="mt-3 text-violet-100 text-lg">
          Here's what's happening at Nest & Nook today.
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid gap-6 md:grid-cols-4">

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-muted-foreground">
                  Total Revenue
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  ₹{revenue}
                </h2>

              </div>

              <div className="bg-violet-100 p-4 rounded-2xl">
                <IndianRupee
                  className="text-violet-600"
                  size={28}
                />
              </div>

            </div>

          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-muted-foreground">
                  Bookings
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {bookings.length}
                </h2>

              </div>

              <div className="bg-blue-100 p-4 rounded-2xl">
                <CalendarDays
                  className="text-blue-600"
                  size={28}
                />
              </div>

            </div>

          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-muted-foreground">
                  Profit
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  ₹{profit}
                </h2>

              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <TrendingUp
                  className="text-green-600"
                  size={28}
                />
              </div>

            </div>

          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-muted-foreground">
                  Guests
                </p>

                {/* STEP 1 — use totalGuests */}
                <h2 className="text-4xl font-bold mt-2">
                  {totalGuests}
                </h2>

              </div>

              <div className="bg-orange-100 p-4 rounded-2xl">
                <Users
                  className="text-orange-600"
                  size={28}
                />
              </div>

            </div>

          </CardContent>
        </Card>

      </div>

      {/* CHART + OCCUPANCY */}

      <div className="grid md:grid-cols-3 gap-6">

        <Card className="md:col-span-2 shadow-lg">

          <CardHeader>
            <CardTitle>
              Revenue Overview
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="h-[320px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.5}
                      />

                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <XAxis dataKey="month" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="url(#revenueGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </CardContent>

        </Card>

        <Card className="shadow-lg">

          <CardHeader>
            <CardTitle>
              Occupancy
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="text-center">

              <div className="text-7xl font-bold text-violet-600">
                84%
              </div>

              <p className="mt-4 text-muted-foreground">
                Average occupancy rate
              </p>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* CHECKINS / CHECKOUTS */}

      <div className="grid md:grid-cols-2 gap-6">

        <Card className="shadow-lg">

          <CardHeader>
            <CardTitle>
              Upcoming Check-ins
            </CardTitle>
          </CardHeader>

          <CardContent>

            {bookings.slice(0, 5).map((booking) => (

              <div
                key={booking.id}
                className="border-b py-4"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="font-semibold">
                      {booking.guests?.full_name ??
                        "Guest"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Check-in
                    </p>

                  </div>

                  <p className="font-medium">
                    {booking.check_in}
                  </p>

                </div>

              </div>

            ))}

          </CardContent>

        </Card>

        <Card className="shadow-lg">

          <CardHeader>
            <CardTitle>
              Upcoming Check-outs
            </CardTitle>
          </CardHeader>

          <CardContent>

            {bookings.slice(0, 5).map((booking) => (

              <div
                key={booking.id}
                className="border-b py-4"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="font-semibold">
                      {booking.guests?.full_name ??
                        "Guest"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Check-out
                    </p>

                  </div>

                  <p className="font-medium">
                    {booking.check_out}
                  </p>

                </div>

              </div>

            ))}

          </CardContent>

        </Card>

      </div>

      {/* STEP 2 — Recent Bookings */}

      <Card className="shadow-lg">

        <CardHeader>
          <CardTitle>
            Recent Bookings
          </CardTitle>
        </CardHeader>

        <CardContent>

          {bookings.slice(0, 5).map((booking) => (

            <div
              key={booking.id}
              className="border-b py-4"
            >

              <div className="flex justify-between">

                <div>

                  <Link
                    href={`/bookings/${booking.id}`}
                    className="
                      font-semibold
                      hover:text-blue-600
                      transition
                    "
                  >
                    {booking.guests?.full_name}
                  </Link>

                  <p className="text-sm text-muted-foreground">
                    ₹{booking.total_amount}
                  </p>

                </div>

                <span
                  className={`
                    px-3 py-1 rounded-full text-xs

                    ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "checked_in"
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "checked_out"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {booking.status}
                </span>

              </div>

            </div>

          ))}

        </CardContent>

      </Card>

      {/* STEP 3 — Recent Guests */}

      <Card className="shadow-lg">

        <CardHeader>
          <CardTitle>
            Recent Guests
          </CardTitle>
        </CardHeader>

        <CardContent>

          {guests.slice(0, 5).map((guest) => (

            <div
              key={guest.id}
              className="border-b py-4"
            >

              <div className="flex justify-between">

                <div>

                  <Link
                    href={`/guests/${guest.id}`}
                    className="
                      font-semibold
                      hover:text-blue-600
                      transition
                    "
                  >
                    {guest.full_name}
                  </Link>

                  <p className="text-sm text-muted-foreground">
                    {guest.phone}
                  </p>

                </div>

                <span>

                  {guest.document_url
                    ? "📄"
                    : "—"}

                </span>

              </div>

            </div>

          ))}

        </CardContent>

      </Card>

    </div>
  );
}