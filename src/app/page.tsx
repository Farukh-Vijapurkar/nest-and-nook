"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PropertyStatus from "@/components/dashboard/PropertyStatus";
import UpcomingReservations from "@/components/dashboard/UpcomingReservations";
import FinancialSnapshot from "@/components/dashboard/FinancialSnapshot";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function Home() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name
        )
      `)
      .order("check_in", { ascending: false });

    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    setBookings(bookingsData || []);
    setExpenses(expensesData || []);
  }

  const revenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const profit = revenue - totalExpenses;

  const totalGuests = bookings.reduce(
    (sum, booking) => sum + Number(booking.guest_count || 1),
    0
  );

  const today = new Date().toISOString().split("T")[0];

  const currentBooking =
    bookings.find(
      (booking) =>
        booking.status === "checked_in" ||
        (booking.check_in <= today &&
          booking.check_out > today)
    ) || null;

  const todayRevenue = bookings
    .filter((booking) => booking.check_in === today)
    .reduce(
      (sum, booking) =>
        sum + Number(booking.total_amount || 0),
      0
    );

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8 space-y-8">

      <DashboardHeader />

      <StatsCards
        revenue={revenue}
        bookings={bookings.length}
        guests={totalGuests}
        profit={profit}
      />

      <PropertyStatus
        currentBooking={currentBooking}
      />

      <UpcomingReservations
        bookings={bookings}
      />

      <FinancialSnapshot
        todayRevenue={todayRevenue}
        monthRevenue={revenue}
        expenses={totalExpenses}
        profit={profit}
        bookings={bookings.length}
      />

      <QuickActions />

      <RecentActivity
        bookings={bookings}
        expenses={expenses}
      />

    </div>
  );
}